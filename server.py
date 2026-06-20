"""
IoTHub Newsletter & Auth Server
Backend untuk newsletter, login, register, view tracking, dan subscription.
Run: python server.py
Access: http://localhost:8080
"""

import http.server
import json
import os
import csv
import hashlib
import re
import secrets
import time
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse
from collections import defaultdict

PORT = 8080
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
SUBSCRIBERS_FILE = os.path.join(DATA_DIR, 'subscribers.csv')
USERS_FILE = os.path.join(DATA_DIR, 'users.csv')
VIEWS_FILE = os.path.join(DATA_DIR, 'views.csv')
FREE_VIEWS_LIMIT = 5

# --- Security Configuration ---
ALLOWED_ORIGIN = 'https://yourusername.github.io'  # Change to your GitHub Pages domain
PBKDF2_ITERATIONS = 100000
TOKEN_EXPIRY_HOURS = 24
RATE_LIMIT_WINDOW = 60       # seconds
RATE_LIMIT_MAX_REQUESTS = 10  # max requests per window per IP per endpoint
PASSWORD_MIN_LENGTH = 8

# Ensure CSV files exist with headers
for filepath, headers in [
    (SUBSCRIBERS_FILE, ['email', 'subscribed_at', 'ip_hash', 'status']),
    (USERS_FILE, ['email', 'password_hash', 'password_salt', 'name', 'created_at', 'plan', 'plan_expires', 'is_active']),
    (VIEWS_FILE, ['session_id', 'article', 'viewed_at', 'ip_hash'])
]:
    if not os.path.exists(filepath):
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            csv.writer(f).writerow(headers)


class NewsletterHandler(http.server.SimpleHTTPRequestHandler):

    # --- Class-level token store ---
    _tokens = {}   # {token_str: {'email': str, 'expires': datetime}}
    # --- Class-level rate limit store ---
    _rate_limit = {}  # {f'{endpoint}:{ip}': {'count': int, 'window_start': float}}

    # === ROUTING ===
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/subscribe':
            self.handle_subscribe()
        elif self.path == '/api/register':
            self.handle_register()
        elif self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/view':
            self.handle_view()
        elif self.path == '/api/check-access':
            self.handle_check_access()
        elif self.path == '/api/upgrade':
            self.handle_upgrade()
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    # === SUBSCRIBE ===
    def handle_subscribe(self):
        data = self.read_body()
        if not data:
            return
        email = data.get('email', '').strip()
        if not self.is_valid_email(email):
            self.send_json(400, {'error': 'Email tidak valid'})
            return
        if self.csv_exists(SUBSCRIBERS_FILE, email):
            self.send_json(200, {'success': True, 'message': 'Email sudah terdaftar!'})
            return
        self.csv_append(SUBSCRIBERS_FILE, [
            email, datetime.now().isoformat(),
            self.hash_ip(self.client_address[0]), 'active'
        ])
        self.send_json(200, {'success': True, 'message': f'Terima kasih! {email} berhasil terdaftar.'})

    # === REGISTER ===
    def handle_register(self):
        # Rate limit check
        if not self.check_rate_limit('register'):
            self.send_json(429, {'error': 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.'})
            return

        data = self.read_body()
        if not data:
            return
        email = data.get('email', '').strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()

        if not self.is_valid_email(email):
            self.send_json(400, {'error': 'Email tidak valid'})
            return

        # Strengthened password policy
        pwd_error = self.validate_password_strength(password)
        if pwd_error:
            self.send_json(400, {'error': pwd_error})
            return

        if not name:
            self.send_json(400, {'error': 'Nama harus diisi'})
            return
        if self.csv_exists(USERS_FILE, email):
            self.send_json(409, {'error': 'Email sudah terdaftar. Silakan login.'})
            return

        # PBKDF2 hashing with random salt
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac(
            'sha256', password.encode(), salt.encode(), PBKDF2_ITERATIONS
        ).hex()

        self.csv_append(USERS_FILE, [
            email, password_hash, salt, name,
            datetime.now().isoformat(), 'free', '', 'true'
        ])

        token = self._store_token(email)
        self.send_json(200, {
            'success': True,
            'message': 'Registrasi berhasil!',
            'token': token,
            'user': {'email': email, 'name': name, 'plan': 'free'}
        })

    # === LOGIN ===
    def handle_login(self):
        # Rate limit check
        if not self.check_rate_limit('login'):
            self.send_json(429, {'error': 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.'})
            return

        data = self.read_body()
        if not data:
            return
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not email or not password:
            self.send_json(400, {'error': 'Email dan password harus diisi'})
            return

        user = self.csv_find(USERS_FILE, email)

        # Prevent user enumeration: same error for missing user or wrong password
        if not user:
            # Still run dummy hash to prevent timing attacks
            hashlib.pbkdf2_hmac('sha256', b'dummy', b'dummy', PBKDF2_ITERATIONS)
            self.send_json(401, {'error': 'Email atau password salah'})
            return

        # Verify password - support both PBKDF2 (new) and SHA-256 (legacy)
        stored_hash = user.get('password_hash', '')
        salt = user.get('password_salt', '')

        if salt:
            # New PBKDF2 password
            computed_hash = hashlib.pbkdf2_hmac(
                'sha256', password.encode(), salt.encode(), PBKDF2_ITERATIONS
            ).hex()
        else:
            # Legacy SHA-256 password (backward compatibility)
            computed_hash = hashlib.sha256(password.encode()).hexdigest()

        if not secrets.compare_digest(stored_hash, computed_hash):
            self.send_json(401, {'error': 'Email atau password salah'})
            return

        if user.get('is_active') != 'true':
            self.send_json(403, {'error': 'Akun tidak aktif'})
            return

        token = self._store_token(email)
        self.send_json(200, {
            'success': True,
            'message': 'Login berhasil!',
            'token': token,
            'user': {
                'email': user['email'],
                'name': user['name'],
                'plan': user.get('plan', 'free'),
                'plan_expires': user.get('plan_expires', '')
            }
        })

    # === VIEW TRACKING ===
    def handle_view(self):
        data = self.read_body()
        if not data:
            return
        session_id = data.get('session_id', '')
        article = data.get('article', '')

        if not session_id or not article:
            self.send_json(400, {'error': 'session_id dan article harus diisi'})
            return

        # Count views for this session
        views = self.count_views(session_id)
        if views >= FREE_VIEWS_LIMIT:
            self.send_json(403, {
                'error': 'Batas viewing tercapai',
                'views': views,
                'limit': FREE_VIEWS_LIMIT,
                'message': f'Anda sudah melihat {FREE_VIEWS_LIMIT} artikel. Login atau subscribe untuk melanjutkan.'
            })
            return

        # Record view
        self.csv_append(VIEWS_FILE, [
            session_id, article,
            datetime.now().isoformat(),
            self.hash_ip(self.client_address[0])
        ])

        self.send_json(200, {
            'success': True,
            'views': views + 1,
            'limit': FREE_VIEWS_LIMIT,
            'remaining': FREE_VIEWS_LIMIT - views - 1
        })

    # === CHECK ACCESS ===
    def handle_check_access(self):
        data = self.read_body()
        if not data:
            return

        session_id = data.get('session_id', '')
        article = data.get('article', '')
        user_email = data.get('user_email', '')

        # Check if user has paid subscription
        if user_email:
            user = self.csv_find(USERS_FILE, user_email)
            if user and user.get('plan') in ('monthly', 'yearly'):
                expires = user.get('plan_expires', '')
                if expires:
                    try:
                        exp_date = datetime.fromisoformat(expires)
                        if exp_date > datetime.now():
                            self.send_json(200, {'access': True, 'reason': 'paid_subscription'})
                            return
                    except ValueError:
                        pass
                # Check lifetime
                if user.get('plan') == 'yearly':
                    self.send_json(200, {'access': True, 'reason': 'lifetime'})
                    return

        # Check free article
        FREE_ARTICLES = [
            'esp32-fundamentals.html', 'mqtt-protocol.html',
            'mikrotik-routing.html', 'lora-communication.html',
            'esp8266-nodemcu.html'
        ]
        if article in FREE_ARTICLES:
            self.send_json(200, {'access': True, 'reason': 'free_article'})
            return

        # Check view limit
        if session_id:
            views = self.count_views(session_id)
            if views < FREE_VIEWS_LIMIT:
                self.send_json(200, {'access': True, 'reason': 'free_views', 'remaining': FREE_VIEWS_LIMIT - views})
                return

        self.send_json(403, {'access': False, 'reason': 'limit_reached'})

    # === UPGRADE PLAN ===
    def handle_upgrade(self):
        # Require authentication via token
        email = self._validate_token()
        if not email:
            self.send_json(401, {'error': 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.'})
            return

        data = self.read_body()
        if not data:
            return

        plan = data.get('plan', 'monthly')

        if plan not in ('monthly', 'yearly'):
            self.send_json(400, {'error': 'Plan tidak valid'})
            return

        user = self.csv_find(USERS_FILE, email)
        if not user:
            self.send_json(404, {'error': 'User tidak ditemukan'})
            return

        # Set expiry
        if plan == 'monthly':
            expires = (datetime.now() + timedelta(days=30)).isoformat()
        else:
            expires = (datetime.now() + timedelta(days=365)).isoformat()

        # Update user in CSV
        self.csv_update(USERS_FILE, email, {'plan': plan, 'plan_expires': expires})

        self.send_json(200, {
            'success': True,
            'message': f'Plan {plan} aktif!',
            'plan': plan,
            'expires': expires
        })

    # === HELPER METHODS ===
    def handle_api_get(self):
        if self.path == '/api/stats':
            count = self.csv_count(SUBSCRIBERS_FILE, 'active')
            users = self.csv_count_rows(USERS_FILE)
            self.send_json(200, {'subscribers': count, 'users': users, 'status': 'active'})
        else:
            self.send_error(404)

    def read_body(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            if length > 4096:
                self.send_json(413, {'error': 'Payload terlalu besar'})
                return None
            body = self.rfile.read(length)
            return json.loads(body) if body else {}
        except Exception:
            self.send_json(400, {'error': 'Invalid JSON'})
            return None

    def send_json(self, status, data):
        resp = json.dumps(data)
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
        self.end_headers()
        self.wfile.write(resp.encode())

    def is_valid_email(self, email):
        return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email))

    def hash_ip(self, ip):
        return hashlib.sha256(ip.encode()).hexdigest()[:16]

    def sanitize_csv(self, val):
        val = str(val)
        if val and val[0] in ('=', '+', '-', '@', '\t', '\r', '\n'):
            val = "'" + val
        return val

    # === TOKEN MANAGEMENT ===
    def _store_token(self, email):
        """Generate a token, store it with expiry, return the token string."""
        token = secrets.token_hex(32)
        NewsletterHandler._tokens[token] = {
            'email': email,
            'expires': datetime.now() + timedelta(hours=TOKEN_EXPIRY_HOURS)
        }
        # Prune expired tokens periodically
        self._prune_tokens()
        return token

    def _validate_token(self):
        """Validate token from Authorization header. Returns email or None."""
        auth_header = self.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header[7:].strip()
        if not token:
            return None
        token_data = NewsletterHandler._tokens.get(token)
        if not token_data:
            return None
        if datetime.now() > token_data['expires']:
            del NewsletterHandler._tokens[token]
            return None
        return token_data['email']

    def _prune_tokens(self):
        """Remove expired tokens to prevent memory leak."""
        now = datetime.now()
        expired = [t for t, d in NewsletterHandler._tokens.items() if now > d['expires']]
        for t in expired:
            del NewsletterHandler._tokens[t]

    # === RATE LIMITING ===
    def check_rate_limit(self, endpoint):
        """Simple sliding-window rate limiter. Returns True if allowed."""
        ip = self.client_address[0]
        key = f'{endpoint}:{ip}'
        now = time.time()

        entry = NewsletterHandler._rate_limit.get(key)
        if entry is None:
            NewsletterHandler._rate_limit[key] = {'count': 1, 'window_start': now}
            return True

        # Reset window if expired
        if now - entry['window_start'] > RATE_LIMIT_WINDOW:
            NewsletterHandler._rate_limit[key] = {'count': 1, 'window_start': now}
            return True

        # Within window
        if entry['count'] >= RATE_LIMIT_MAX_REQUESTS:
            return False

        entry['count'] += 1
        return True

    # === PASSWORD VALIDATION ===
    def validate_password_strength(self, password):
        """Validate password policy. Returns error message or None if valid."""
        if len(password) < PASSWORD_MIN_LENGTH:
            return f'Password minimal {PASSWORD_MIN_LENGTH} karakter'
        if not re.search(r'[A-Z]', password):
            return 'Password harus mengandung huruf besar (A-Z)'
        if not re.search(r'[a-z]', password):
            return 'Password harus mengandung huruf kecil (a-z)'
        if not re.search(r'[0-9]', password):
            return 'Password harus mengandung angka (0-9)'
        return None

    # === CSV HELPERS ===
    def csv_exists(self, filepath, key):
        if not os.path.exists(filepath):
            return False
        with open(filepath, 'r', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                if row.get('email', '').lower() == key.lower():
                    return True
        return False

    def csv_find(self, filepath, key):
        if not os.path.exists(filepath):
            return None
        with open(filepath, 'r', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                if row.get('email', '').lower() == key.lower():
                    return row
        return None

    def csv_append(self, filepath, row):
        with open(filepath, 'a', newline='', encoding='utf-8') as f:
            csv.writer(f).writerow([self.sanitize_csv(str(c)) for c in row])

    def csv_update(self, filepath, key, updates):
        rows = []
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                rows = list(csv.DictReader(f))
        headers = list(rows[0].keys()) if rows else []
        for row in rows:
            if row.get('email', '').lower() == key.lower():
                for k, v in updates.items():
                    if k in row:
                        row[k] = v
        if headers:
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                w = csv.DictWriter(f, fieldnames=headers)
                w.writeheader()
                w.writerows(rows)

    def count_views(self, session_id):
        count = 0
        if os.path.exists(VIEWS_FILE):
            with open(VIEWS_FILE, 'r', encoding='utf-8') as f:
                for row in csv.DictReader(f):
                    if row.get('session_id') == session_id:
                        count += 1
        return count

    def csv_count(self, filepath, status):
        count = 0
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                for row in csv.DictReader(f):
                    if row.get('status') == status:
                        count += 1
        return count

    def csv_count_rows(self, filepath):
        if not os.path.exists(filepath):
            return 0
        with open(filepath, 'r', encoding='utf-8') as f:
            return sum(1 for _ in csv.DictReader(f))

    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")


if __name__ == '__main__':
    print(f"""
╔═════════════════════════════════════════════╗
║     IoTHub Server v2.1 (Secured)           ║
║     http://localhost:{PORT}                    ║
║                                               ║
║     Features:                                 ║
║     - Newsletter Subscribe                    ║
║     - User Register/Login (PBKDF2)           ║
║     - View Tracking (5 free views)           ║
║     - Subscription Management                ║
║     - Token-based Auth for Upgrade           ║
║     - Rate Limiting & CORS Hardening         ║
╚═════════════════════════════════════════════╝
    """)

    server = http.server.HTTPServer(('127.0.0.1', PORT), NewsletterHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server stopped.")
        server.server_close()
