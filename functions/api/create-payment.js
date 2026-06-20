// Cloudflare Pages Function: Create Payment (Midtrans)
// URL: /api/create-payment

export async function onRequestPost(context) {
  const { request, env } = context;
  const MIDTRANS_SERVER_KEY = env.MIDTRANS_SERVER_KEY || '';
  const MIDTRANS_IS_PROD = env.MIDTRANS_IS_PRODUCTION === 'true';
  const SNAP_API = MIDTRANS_IS_PROD ? 'https://api.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1';
  const PLAN_PRICES = { token5: 50000, token10: 90000 };

  try {
    const body = await request.json();
    const email = (body.email || '').trim();
    const plan = body.plan;
    const itemName = body.item_name || 'IoTHub Token';

    if (!email || !email.includes('@')) return cors(400, { error: 'Email tidak valid' });
    if (!plan || !PLAN_PRICES[plan]) return cors(400, { error: 'Plan tidak valid' });

    const amount = PLAN_PRICES[plan];
    if (!MIDTRANS_SERVER_KEY) return cors(500, { error: 'Payment gateway tidak terkonfigurasi' });

    const orderId = `IOHUB-${Date.now()}-${crypto.getRandomValues(new Uint8Array(4)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '')}`;

    const payload = {
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { email },
      item_details: [{ id: plan, price: amount, quantity: 1, name: itemName }],
      callbacks: { finish: new URL(request.url).origin + '/pricing.html' }
    };

    const auth = btoa(MIDTRANS_SERVER_KEY + ':');
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
}

export async function onRequestOptions() { return cors(200, ''); }

function cors(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}
