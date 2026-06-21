// Cloudflare Pages Function: Create Payment (Midtrans)
// URL: /api/create-payment
// Security-hardened: input validation, CORS whitelist, no info leakage

const ALLOWED_ORIGINS = ['https://iothub.pages.dev', 'https://iothub.id', 'http://localhost:3000', 'http://localhost:8788'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const MIDTRANS_SERVER_KEY = env.MIDTRANS_SERVER_KEY || '';
  const MIDTRANS_IS_PROD = env.MIDTRANS_IS_PRODUCTION === 'true';
  const SNAP_API = MIDTRANS_IS_PROD ? 'https://api.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1';
  const PLAN_PRICES = { token5: 50000, token10: 90000 };
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const plan = body.plan;

    // Input validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return cors(400, { error: 'Email tidak valid' }, origin);
    if (email.length > 254) return cors(400, { error: 'Email terlalu panjang' }, origin);
    if (!plan || !PLAN_PRICES[plan]) return cors(400, { error: 'Plan tidak valid. Pilih: token5 atau token10' }, origin);
    if (!MIDTRANS_SERVER_KEY) return cors(500, { error: 'Payment gateway tidak terkonfigurasi' }, origin);

    // Better order ID with more randomness (8 bytes = 64 bits)
    const orderId = `IOHUB-${Date.now()}-${Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    const amount = PLAN_PRICES[plan];
    const safeItemName = plan === 'token10' ? 'IoTHub 10 Token' : 'IoTHub 5 Token';

    const payload = {
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { email },
      item_details: [{ id: plan, price: amount, quantity: 1, name: safeItemName }],
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
      return cors(200, { success: true, token: result.token, order_id: orderId, redirect_url: result.redirect_url }, origin);
    }
    // FIX: Don't leak Midtrans error details
    console.error('Midtrans error:', result.status_code, result.status_message);
    return cors(500, { error: 'Gagal membuat transaksi' }, origin);
  } catch (e) {
    console.error('Payment error:', e.message || e);
    return cors(500, { error: 'Internal server error' }, origin);
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('origin') || '';
  return cors(200, '', origin);
}

function cors(status, data, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
