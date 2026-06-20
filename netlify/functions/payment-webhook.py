"""
Netlify Function: Payment Webhook (Midtrans Notification)
Endpoint: /.netlify/functions/payment-webhook
Method: POST
Called by Midtrans when payment status changes
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

def handler(event, context):
    # Midtrans always expects 200 OK
    try:
        if event.get('httpMethod') != 'POST':
            return {"statusCode": 200, "body": "OK"}

        body = json.loads(event.get('body', '{}'))

        order_id = body.get('order_id', '')
        status_code = body.get('status_code', '')
        transaction_status = body.get('transaction_status', '')
        email = body.get('customer_details', {}).get('email', '')
        gross_amount = body.get('gross_amount', 0)

        print(f"Webhook: order={order_id} status={transaction_status} email={email}")

        # Handle successful payment
        if transaction_status in ('capture', 'settlement'):
            # Payment successful!
            # 1. Find user by email
            users = supabase_query("users", params=f"?email=eq.{email}&select=id,plan")
            if users:
                user = users[0]

                # 2. Determine plan from amount
                plan = 'yearly' if gross_amount >= 399000 else 'monthly'

                # 3. Update user plan
                supabase_query("users", "PATCH", {
                    "plan": plan,
                    "plan_expires": "lifetime"
                }, params=f"?id=eq.{user['id']}")

                # 4. Record payment
                supabase_query("payments", "POST", {
                    "user_id": user['id'],
                    "order_id": order_id,
                    "amount": gross_amount,
                    "currency": "IDR",
                    "plan": plan,
                    "provider": "midtrans",
                    "status": transaction_status,
                    "paid_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime())
                })

                print(f"PAYMENT SUCCESS: {email} upgraded to {plan}")

            else:
                print(f"User not found for email: {email}")

        elif transaction_status == 'pending':
            print(f"Payment pending: {order_id}")

        elif transaction_status == 'expire':
            print(f"Payment expired: {order_id}")

        elif transaction_status == 'cancel':
            print(f"Payment cancelled: {order_id}")

        # Always return 200 to Midtrans
        return {"statusCode": 200, "body": "OK"}

    except Exception as e:
        print(f"Webhook error: {str(e)}")
        # Still return 200 to prevent Midtrans from retrying
        return {"statusCode": 200, "body": "OK"}
