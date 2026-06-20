"""
Netlify Function: Auth (Register & Login)
Endpoint: /.netlify/functions/auth
Method: POST
Body: {"action": "register"|"login", "email": "...", "password": "...", "name": "..."}
"""
import json
import os
import hashlib
import hmac
import secrets
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Rate limiting state (in-memory, per Lambda instance)
_login_attempts = {}  # {ip: [(timestamp, ...), ...]}
_RATE_LIMIT_MAX = 5
_RATE_LIMIT_WINDOW = 300  # 5 minutes in seconds

def _check_rate_limit(ip):
    """Check if IP has exceeded login rate limit. Returns True if blocked."""
    now = time.time()
    if ip not in _login_attempts:
        _login_attempts[ip] = []
    # Prune old entries
    _login_attempts[ip] = [t for t in _login_attempts[ip] if now - t < _RATE_LIMIT_WINDOW]
    if len(_login_attempts[ip]) >= _RATE_LIMIT_MAX:
        return True
    return False

def _record_failed_attempt(ip):
    """Record a failed login attempt for rate limiting."""
    _login_attempts.setdefault(ip, []).append(time.time())

SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def supabase_query(table, method='GET', data=None, params=''):
    url = f"{SUPABASE_URL}/rest/v1/{table}{params}"
    body = json.dumps(data).encode() if data else None
    req = Request(url, data=body, headers=HEADERS, method=method)
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

def cors_response(status, data):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://iothub25.netlify.app",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(data)
    }

def handler(event, context):
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return cors_response(200, "")

    if event.get('httpMethod') != 'POST':
        return cors_response(405, {"error": "Method not allowed"})

    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', '')

        # === REGISTER ===
        if action == 'register':
            email = body.get('email', '').strip().lower()
            name = body.get('name', '').strip()
            password = body.get('password', '')

            # Validation
            if not email or '@' not in email:
                return cors_response(400, {"error": "Email tidak valid"})
            if not name:
                return cors_response(400, {"error": "Nama harus diisi"})
            if len(password) < 8:
                return cors_response(400, {"error": "Password minimal 8 karakter"})
            if not any(c.isupper() for c in password):
                return cors_response(400, {"error": "Password harus mengandung huruf besar"})
            if not any(c.isdigit() for c in password):
                return cors_response(400, {"error": "Password harus mengandung angka"})

            # Check if email exists
            existing = supabase_query("users", params=f"?email=eq.{email}&select=id")
            if existing:
                return cors_response(400, {"error": "Email sudah terdaftar. Silakan login."})

            # Hash password with PBKDF2
            salt = secrets.token_hex(16)
            pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
            stored_hash = f"{salt}:{pw_hash}"

            # Create user
            users = supabase_query("users", "POST", {
                "email": email,
                "name": name,
                "password_hash": stored_hash,
                "plan": "free",
                "is_active": True,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime())
            })

            if users and len(users) > 0:
                user = users[0]
                # Create session
                token = secrets.token_hex(32)
                expires = time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime(time.time() + 86400 * 7))
                supabase_query("sessions", "POST", {
                    "user_id": user['id'],
                    "token": token,
                    "expires_at": expires,
                    "ip_address": event.get('requestContext', {}).get('identity', {}).get('sourceIp', ''),
                })

                return cors_response(200, {
                    "success": True,
                    "message": "Registrasi berhasil!",
                    "token": token,
                    "user": {"email": email, "name": name, "plan": "free"}
                })

            return cors_response(500, {"error": "Gagal membuat akun"})

        # === LOGIN ===
        elif action == 'login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not email or not password:
                return cors_response(400, {"error": "Email dan password harus diisi"})

            # Rate limiting
            client_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
            if _check_rate_limit(client_ip):
                return cors_response(429, {"error": "Terlalu banyak percobaan login. Coba lagi dalam 5 menit."})

            # Find user
            users = supabase_query("users", params=f"?email=eq.{email}&select=id,email,name,password_hash,plan,is_active")
            if not users:
                # Run dummy hash to prevent timing attack
                hashlib.pbkdf2_hmac('sha256', b'dummy', b'dummy', 100000)
                _record_failed_attempt(client_ip)
                return cors_response(401, {"error": "Email atau password salah"})

            user = users[0]

            if not user.get('is_active'):
                _record_failed_attempt(client_ip)
                return cors_response(403, {"error": "Akun tidak aktif"})

            # Verify password with timing-safe comparison
            stored = user['password_hash']
            if ':' in stored:
                salt, pw_hash = stored.split(':', 1)
                check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
                if not hmac.compare_digest(check, pw_hash):
                    _record_failed_attempt(client_ip)
                    return cors_response(401, {"error": "Email atau password salah"})
            else:
                # Legacy SHA-256 fallback — rehash with PBKDF2 on successful login
                check = hashlib.sha256(password.encode()).hexdigest()
                if not hmac.compare_digest(check, stored):
                    _record_failed_attempt(client_ip)
                    return cors_response(401, {"error": "Email atau password salah"})
                # Rehash legacy password to PBKDF2
                new_salt = secrets.token_hex(16)
                new_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), new_salt.encode(), 100000).hex()
                try:
                    supabase_query("users", "PATCH", {
                        "password_hash": f"{new_salt}:{new_hash}"
                    }, params=f"?id=eq.{user['id']}")
                except Exception:
                    pass  # Non-critical, continue with login

            # Create session
            token = secrets.token_hex(32)
            expires = time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime(time.time() + 86400 * 7))
            supabase_query("sessions", "POST", {
                "user_id": user['id'],
                "token": token,
                "expires_at": expires,
                "ip_address": event.get('requestContext', {}).get('identity', {}).get('sourceIp', ''),
            })

            # Update last login
            supabase_query("users", "PATCH", {
                "last_login": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime())
            }, params=f"?email=eq.{email}")

            return cors_response(200, {
                "success": True,
                "message": "Login berhasil!",
                "token": token,
                "user": {
                    "email": email,
                    "name": user['name'],
                    "plan": user.get('plan', 'free')
                }
            })

        return cors_response(400, {"error": "Action tidak valid"})

    except HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        print(f"HTTP Error: {e.code} - {error_body}")
        return cors_response(500, {"error": "Server error"})
    except Exception as e:
        print(f"Error: {str(e)}")
        return cors_response(500, {"error": "Internal server error"})
