"""
IoTHub Newsletter Subscribe Server
Simple backend for handling newsletter subscriptions.
Run: python server.py
Access: http://localhost:8080
"""

import http.server
import json
import os
import re
import csv
import time
from collections import defaultdict
from datetime import datetime
from urllib.parse import parse_qs, urlparse
import hashlib

PORT = 8080
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
SUBSCRIBERS_FILE = os.path.join(DATA_DIR, 'subscribers.csv')

# Allowed origins for CORS (add your domain here)
ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# Ensure CSV file exists with header
if not os.path.exists(SUBSCRIBERS_FILE):
    with open(SUBSCRIBERS_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['email', 'subscribed_at', 'ip_hash', 'status'])


class NewsletterHandler(http.server.SimpleHTTPRequestHandler):
    """Handle static files + newsletter API"""

    # Rate limiting: {ip: [timestamp, ...]}
    _rate_limit = defaultdict(list)
    RATE_LIMIT_MAX = 10  # max requests per minute
    RATE_LIMIT_WINDOW = 60  # seconds

    def _check_rate_limit(self):
        """Check if the client IP has exceeded rate limit. Returns True if OK."""
        ip = self.client_address[0]
        now = time.time()
        # Remove timestamps outside the window
        self._rate_limit[ip] = [t for t in self._rate_limit[ip] if now - t < self.RATE_LIMIT_WINDOW]
        if len(self._rate_limit[ip]) >= self.RATE_LIMIT_MAX:
            return False
        self._rate_limit[ip].append(now)
        return True

    def _get_allowed_origin(self):
        """Return the allowed origin header value, or None if origin is not allowed."""
        origin = self.headers.get('Origin', '')
        if origin in ALLOWED_ORIGINS:
            return origin
        # Fallback to first allowed origin for same-origin requests
        return ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else None

    def do_GET(self):
        # Serve static files from current directory
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            # Default: serve files from current directory
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/subscribe':
            # Rate limiting check
            if not self._check_rate_limit():
                self.send_json(429, {'error': 'Terlalu banyak permintaan. Coba lagi nanti.'})
                return
            self.handle_subscribe()
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        allowed_origin = self._get_allowed_origin()
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', allowed_origin)
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def handle_subscribe(self):
        """Handle newsletter subscription"""
        content_length = int(self.headers.get('Content-Length', 0))

        # Body size limit: max 1KB
        if content_length > 1024:
            self.send_json(413, {'error': 'Payload terlalu besar'})
            return

        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
            email = data.get('email', '').strip()

            # Validate email with proper regex
            if not email or not EMAIL_REGEX.match(email):
                self.send_json(400, {'error': 'Email tidak valid'})
                return

            # Check for duplicate
            if self.is_subscribed(email):
                self.send_json(200, {
                    'success': True,
                    'message': 'Email sudah terdaftar sebelumnya!'
                })
                return

            # Save subscriber
            self.save_subscriber(email)

            self.send_json(200, {
                'success': True,
                'message': f'Terima kasih! Email berhasil terdaftar.'
            })

        except json.JSONDecodeError:
            self.send_json(400, {'error': 'Format data tidak valid'})
        except Exception:
            # Hide exception details from client
            self.send_json(500, {'error': 'Kesalahan server internal'})

    def handle_api_get(self):
        """Handle GET API requests"""
        if self.path == '/api/stats':
            if not self._check_rate_limit():
                self.send_json(429, {'error': 'Terlalu banyak permintaan. Coba lagi nanti.'})
                return
            count = self.get_subscriber_count()
            self.send_json(200, {
                'total_subscribers': count,
                'status': 'active'
            })
        else:
            self.send_error(404)

    def is_subscribed(self, email):
        """Check if email is already subscribed"""
        if not os.path.exists(SUBSCRIBERS_FILE):
            return False
        email_lower = email.lower()
        with open(SUBSCRIBERS_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['email'].lower() == email_lower and row['status'] == 'active':
                    return True
        return False

    def _sanitize_for_csv(self, value):
        """Sanitize a value before writing to CSV to prevent CSV injection."""
        # Characters that could be dangerous in CSV contexts
        dangerous_chars = ['=', '+', '-', '@', '\t', '\r', '\n']
        value = str(value).strip()
        for ch in dangerous_chars:
            if value.startswith(ch):
                value = "'" + value
                break
        return value

    def save_subscriber(self, email):
        """Save subscriber to CSV"""
        ip = self.client_address[0]
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()[:16]

        # Sanitize email for CSV
        safe_email = self._sanitize_for_csv(email)

        with open(SUBSCRIBERS_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                safe_email,
                datetime.now().isoformat(),
                ip_hash,
                'active'
            ])
        # Don't log full email to stdout for privacy
        masked = email[:2] + '***' + email.split('@')[-1] if '@' in email else '***'
        print(f"[+] New subscriber: {masked}")

    def get_subscriber_count(self):
        """Count active subscribers"""
        if not os.path.exists(SUBSCRIBERS_FILE):
            return 0
        count = 0
        with open(SUBSCRIBERS_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['status'] == 'active':
                    count += 1
        return count

    def send_json(self, status_code, data):
        """Send JSON response"""
        response = json.dumps(data)
        allowed_origin = self._get_allowed_origin()
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', allowed_origin)
        self.end_headers()
        self.wfile.write(response.encode())

    def end_headers(self):
        """Add CORS headers to all responses"""
        if not hasattr(self, '_headers_sent'):
            allowed_origin = self._get_allowed_origin()
            self.send_header('Access-Control-Allow-Origin', allowed_origin)
        super().end_headers()

    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")


if __name__ == '__main__':
    print(f"""
╔══════════════════════════════════════════╗
║     IoTHub Newsletter Server             ║
║     http://localhost:{PORT}               ║
║                                          ║
║     Subscribers: {SUBSCRIBERS_FILE}      ║
╚══════════════════════════════════════════╝
    """)

    # Bind to 127.0.0.1 for security (localhost only)
    server = http.server.HTTPServer(('127.0.0.1', PORT), NewsletterHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server stopped.")
        server.server_close()
