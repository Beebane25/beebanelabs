#!/usr/bin/env python3
"""
Netlify Function: Check Access
Endpoint: /.netlify/functions/check-access
Method: POST
Body: {"email": "USER_EMAIL", "token": "SESSION_TOKEN"}
Email is validated against the session owner to prevent IDOR.
"""
import json
import os
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

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
            "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token",
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
        email = body.get('email', '').strip().lower()
        token = body.get('token', '').strip()

        # Validation
        if not email or '@' not in email:
            return cors_response(400, {"error": "Email tidak valid"})
        if not token:
            return cors_response(400, {"error": "Token harus diisi"})

        # Validate session token
        sessions = supabase_query(
            "sessions",
            params=f"?token=eq.{token}&select=id,user_id,expires_at"
        )

        if not sessions:
            return cors_response(401, {
                "access": False,
                "plan": "free",
                "error": "Token tidak valid"
            })

        session = sessions[0]

        # IDOR FIX: Verify that the session's user_id matches the email provided
        # Derive user from session's user_id, not from the email parameter
        session_user_id = session.get('user_id')
        if not session_user_id:
            return cors_response(401, {
                "access": False,
                "plan": "free",
                "error": "Token tidak valid"
            })

        # Look up the user that owns this session by user_id (not by email)
        session_owner = supabase_query(
            "users",
            params=f"?id=eq.{session_user_id}&select=id,plan,is_active,plan_expires"
        )

        if not session_owner:
            return cors_response(401, {
                "access": False,
                "plan": "free",
                "error": "User tidak ditemukan"
            })

        user = session_owner[0]

        # IDOR FIX: Verify that the email in the request matches the session owner's email
        owner_email = user.get('email', '').strip().lower()
        if owner_email != email:
            # Email doesn't match session owner — reject (potential IDOR attack)
            return cors_response(403, {
                "access": False,
                "plan": "free",
                "error": "Akses ditolak"
            })

        # Check if session has expired
        expires_at = session.get('expires_at', '')
        if expires_at:
            # Parse expiry and compare with current time
            try:
                # Handle both Z and +00:00 formats
                exp_str = expires_at.replace('Z', '+00:00')
                if '+' not in exp_str and '-' not in exp_str[10:]:
                    exp_str += '+00:00'
                exp_ts = time.mktime(time.strptime(exp_str[:19], "%Y-%m-%dT%H:%M:%S"))
                if time.time() > exp_ts:
                    return cors_response(401, {
                        "access": False,
                        "plan": "free",
                        "error": "Sesi telah berakhir"
                    })
            except (ValueError, OverflowError):
                # If we can't parse expiry, treat as expired
                return cors_response(401, {
                    "access": False,
                    "plan": "free",
                    "error": "Format expiry tidak valid"
                })

        # Check if user account is active
        if not user.get('is_active'):
            return cors_response(403, {
                "access": False,
                "plan": "free",
                "error": "Akun tidak aktif"
            })

        plan = user.get('plan', 'free')
        plan_expires = user.get('plan_expires', None)

        # Check if paid plan has expired
        if plan in ('monthly', 'yearly') and plan_expires:
            try:
                exp_str = plan_expires.replace('Z', '+00:00')
                if '+' not in exp_str and '-' not in exp_str[10:]:
                    exp_str += '+00:00'
                exp_ts = time.mktime(time.strptime(exp_str[:19], "%Y-%m-%dT%H:%M:%S"))
                if time.time() > exp_ts:
                    # Plan expired, downgrade to free
                    supabase_query(
                        "users",
                        "PATCH",
                        {"plan": "free"},
                        params=f"?id=eq.{session_user_id}"
                    )
                    plan = "free"
                    plan_expires = None
            except (ValueError, OverflowError):
                pass

        # Determine access level
        access = plan in ('monthly', 'yearly')

        return cors_response(200, {
            "access": access,
            "plan": plan,
            "expires": plan_expires
        })

    except HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        print(f"HTTP Error: {e.code} - {error_body}")
        return cors_response(500, {"error": "Server error"})
    except Exception as e:
        print(f"Error: {str(e)}")
        return cors_response(500, {"error": "Internal server error"})
