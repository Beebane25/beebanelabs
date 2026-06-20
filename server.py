"""
IoTHub Newsletter Subscribe Server
Simple backend for handling newsletter subscriptions.
Run: python server.py
Access: http://localhost:8080
"""

import http.server
import json
import os
import csv
from datetime import datetime
from urllib.parse import parse_qs, urlparse
import hashlib

PORT = 8080
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
SUBSCRIBERS_FILE = os.path.join(DATA_DIR, 'subscribers.csv')

# Ensure CSV file exists with header
if not os.path.exists(SUBSCRIBERS_FILE):
    with open(SUBSCRIBERS_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['email', 'subscribed_at', 'ip_hash', 'status'])

class NewsletterHandler(http.server.SimpleHTTPRequestHandler):
    """Handle static files + newsletter API"""

    def do_GET(self):
        # Serve static files from current directory
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            # Default: serve files from current directory
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/subscribe':
            self.handle_subscribe()
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def handle_subscribe(self):
        """Handle newsletter subscription"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
            email = data.get('email', '').strip()

            # Validate email
            if not email or '@' not in email or '.' not in email:
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
                'message': f'Terima kasih! {email} berhasil terdaftar.'
            })

        except json.JSONDecodeError:
            self.send_json(400, {'error': 'Format data tidak valid'})
        except Exception as e:
            self.send_json(500, {'error': f'Kesalahan server: {str(e)}'})

    def handle_api_get(self):
        """Handle GET API requests"""
        if self.path == '/api/stats':
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

    def save_subscriber(self, email):
        """Save subscriber to CSV"""
        ip = self.client_address[0]
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()[:16]

        with open(SUBSCRIBERS_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                email,
                datetime.now().isoformat(),
                ip_hash,
                'active'
            ])
        print(f"[+] New subscriber: {email}")

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
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(response.encode())

    def end_headers(self):
        """Add CORS headers to all responses"""
        if not hasattr(self, '_headers_sent'):
            self.send_header('Access-Control-Allow-Origin', '*')
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

    server = http.server.HTTPServer(('0.0.0.0', PORT), NewsletterHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server stopped.")
        server.server_close()
