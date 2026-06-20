
import json
import os
import hashlib
import hmac
import csv

def handler(event, context):
    """Midtrans payment notification webhook"""
    if event['httpMethod'] != 'POST':
        return {"statusCode": 405, "body": "Method not allowed"}

    try:
        body = json.loads(event['body'])

        # Verify notification (optional but recommended)
        server_key = os.environ.get('MIDTRANS_SERVER_KEY', '')

        order_id = body.get('order_id', '')
        status_code = body.get('status_code', '')
        transaction_status = body.get('transaction_status', '')
        email = body.get('customer_details', {}).get('email', '')

        print(f"Payment notification: order={order_id} status={transaction_status} email={email}")

        # Process payment result
        if transaction_status == 'capture' or transaction_status == 'settlement':
            # Payment successful → activate premium
            upgrade_user(email, 'yearly')
            print(f"PREMIUM ACTIVATED for {email}")

        elif transaction_status == 'pending':
            print(f"Payment pending for {email}")

        elif transaction_status == 'expire':
            print(f"Payment expired for {email}")

        elif transaction_status == 'cancel':
            print(f"Payment cancelled for {email}")

        # Midtrans expects 200 OK
        return {"statusCode": 200, "body": "OK"}

    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {"statusCode": 200, "body": "OK"}  # Always return 200 to Midtrans


def upgrade_user(email, plan):
    """Update user plan in CSV"""
    users_file = os.path.join(os.path.dirname(__file__), '..', '..', 'users.csv')

    if not os.path.exists(users_file):
        print(f"Users file not found: {users_file}")
        return

    rows = []
    with open(users_file, 'r', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    headers = list(rows[0].keys()) if rows else []
    for row in rows:
        if row.get('email', '').lower() == email.lower():
            row['plan'] = plan
            row['plan_expires'] = 'lifetime'

    if headers:
        with open(users_file, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=headers)
            w.writeheader()
            w.writerows(rows)
