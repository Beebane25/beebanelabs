#!/usr/bin/env python3
"""
Netlify Function: Create Payment (Midtrans Snap)
Endpoint: /.netlify/functions/create-payment
Method: POST
Body: {"email": "...", "plan": "monthly"|"yearly", "amount": 49000, "item_name": "..."}
"""
import json
import os
import time
import secrets
import hashlib
import base64
from urllib.request import Request, urlopen
from urllib.error import HTTPError

MIDTRANS_SERVER_KEY = os.environ.get('MIDTRANS_SERVER_KEY', '')
MIDTRANS_IS_PROD = os.environ.get('MIDTRANS_IS_PRODUCTION', 'false') == 'true'

if MIDTRANS_IS_PROD:
    MIDTRANS_API = 'https://api.midtrans.com/v2'
    SNAP_API = 'https://api.midtrans.com/snap/v1'
else:
    MIDTRANS_API = 'https://api.sandbox.midtrans.com/v2'
    SNAP_API = 'https://app.sandbox.midtrans.com/snap/v1'

def cors_response(status, data):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://iothub25.netlify.app",
            "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(data)
    }

def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return cors_response(200, "")

    if event.get('httpMethod') != 'POST':
        return cors_response(405, {"error": "Method not allowed"})

    try:
        # CSRF protection: custom headers can't be set by cross-origin forms
        csrf_token = event.get('headers', {}).get('x-csrf-token', '')
        if not csrf_token or len(csrf_token) < 16:
            return cors_response(403, {"error": "CSRF token tidak valid"})

        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').strip()
        plan = body.get('plan', '')
        item_name = body.get('item_name', 'IoTHub Premium')
        # Server-side price derivation — never trust client-sent amounts
        PLAN_PRICES = {'monthly': 49000, 'yearly': 399000}
        amount = PLAN_PRICES.get(plan, 0)

        # Validation
        if not email or '@' not in email:
            return cors_response(400, {"error": "Email tidak valid"})
        if plan not in ('monthly', 'yearly'):
            return cors_response(400, {"error": "Plan tidak valid"})
        if not amount:
            return cors_response(400, {"error": "Plan tidak valid"})

        if not MIDTRANS_SERVER_KEY:
            return cors_response(500, {"error": "Payment gateway tidak terkonfigurasi"})

        # Generate unique order ID
        order_id = f"IOHUB-{int(time.time())}-{secrets.token_hex(4)}"

        # Build Midtrans Snap payload
        payload = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": amount
            },
            "customer_details": {
                "email": email
            },
            "item_details": [{
                "id": plan,
                "price": amount,
                "quantity": 1,
                "name": item_name
            }],
            "callbacks": {
                "finish": "https://beebane25.github.io/iothub/pricing.html"
            }
        }

        # Call Midtrans Snap API
        auth = base64.b64encode(f"{MIDTRANS_SERVER_KEY}:".encode()).decode()
        api_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {auth}'
        }

        req = Request(
            f"{SNAP_API}/transactions",
            data=json.dumps(payload).encode('utf-8'),
            headers=api_headers,
            method='POST'
        )

        with urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())

        if 'token' in result:
            return cors_response(200, {
                "success": True,
                "token": result['token'],
                "order_id": order_id,
                "redirect_url": result.get('redirect_url', '')
            })
        else:
            return cors_response(500, {"error": "Gagal membuat transaksi"})

    except HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        print(f"Midtrans Error: {e.code} - {error_body}")
        return cors_response(502, {"error": "Payment gateway error", "code": e.code})
    except Exception as e:
        print(f"Error: {str(e)}")
        return cors_response(500, {"error": "Internal server error"})
