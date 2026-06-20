
import json
import os
import time
import urllib.request
import urllib.error

def handler(event, context):
    """Create Midtrans Snap transaction"""
    if event['httpMethod'] != 'POST':
        return {"statusCode": 405, "body": json.dumps({"error": "Method not allowed"})}

    try:
        body = json.loads(event['body'])
        email = body.get('email', '')
        plan = body.get('plan', 'monthly')
        amount = body.get('amount', 49000)
        item_name = body.get('item_name', 'IoTHub Premium')

        if not email or plan not in ('monthly', 'yearly'):
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid data"})}

        # Midtrans Snap API
        server_key = os.environ.get('MIDTRANS_SERVER_KEY', '')
        client_key = os.environ.get('MIDTRANS_CLIENT_KEY', '')

        if not server_key:
            return {"statusCode": 500, "body": json.dumps({"error": "Server key not configured"})}

        order_id = f"IOHUB-{int(time.time())}-{email.split('@')[0]}"

        # Build request
        payload = json.dumps({
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
                "finish": f"https://beebane25.github.io/iothub/pricing.html?status=success&order={order_id}"
            }
        }).encode('utf-8')

        # Call Midtrans Snap API
        req = urllib.request.Request(
            'https://app.sandbox.midtrans.com/snap/v1/transactions',
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Basic {__import__("base64").b64encode(f"{server_key}:".encode()).decode()}'
            },
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "token": result.get("token", ""),
                "order_id": order_id,
                "redirect_url": result.get("redirect_url", "")
            })
        })

    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        print(f"Midtrans error: {e.code} - {error_body}")
        return {"statusCode": 502, "body": json.dumps({"error": "Payment gateway error", "detail": str(e.code)})}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error"})}
