// Netlify Function: Create Payment (Midtrans Snap)

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_IS_PROD = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SNAP_API = MIDTRANS_IS_PROD ? 'https://api.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1';
const PLAN_PRICES = { monthly: 49000, yearly: 399000 };

function cors(status, data) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://iothub25.netlify.app',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(data)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors(200, '');
  if (event.httpMethod !== 'POST') return cors(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const email = (body.email || '').trim();
    const plan = body.plan;
    const itemName = body.item_name || 'IoTHub Premium';

    if (!email || !email.includes('@')) return cors(400, { error: 'Email tidak valid' });
    if (!plan || !PLAN_PRICES[plan]) return cors(400, { error: 'Plan tidak valid' });

    const amount = PLAN_PRICES[plan];
    if (!MIDTRANS_SERVER_KEY) return cors(500, { error: 'Payment gateway tidak terkonfigurasi' });

    const orderId = `IOHUB-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const payload = {
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { email },
      item_details: [{ id: plan, price: amount, quantity: 1, name: itemName }],
      callbacks: { finish: 'https://iothub25.netlify.app/pricing.html' }
    };

    const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
    const resp = await fetch(`${SNAP_API}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify(payload)
    });
    const result = await resp.json();

    if (result.token) {
      return cors(200, { success: true, token: result.token, order_id: orderId, redirect_url: result.redirect_url });
    }
    return cors(500, { error: 'Gagal membuat transaksi', detail: result });
  } catch (e) {
    console.error('Payment error:', e);
    return cors(500, { error: 'Internal server error' });
  }
};
