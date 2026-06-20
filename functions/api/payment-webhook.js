// Cloudflare Pages Function: Payment Webhook (Midtrans)
// URL: /api/payment-webhook

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const MIDTRANS_SERVER_KEY = env.MIDTRANS_SERVER_KEY || '';

  try {
    const body = await request.json();
    const { order_id, gross_amount, transaction_status, customer_details } = body;

    // Verify signature
    if (MIDTRANS_SERVER_KEY) {
      const str = (body.order_id || '') + (body.status_code || '') + (body.gross_amount || '') + (body.transaction_status || '') + MIDTRANS_SERVER_KEY;
      const encoder = new TextEncoder();
      const keyData = encoder.encode(MIDTRANS_SERVER_KEY);
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(str));
      const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (sigHex !== (body.signature_key || '')) {
        console.log('INVALID SIGNATURE:', order_id);
        return new Response('OK', { status: 200 });
      }
    }

    console.log(`Webhook: order=${order_id} status=${transaction_status}`);

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      const email = customer_details?.email;
      if (!email) return new Response('OK', { status: 200 });

      // Check idempotency
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'payments', `?order_id=eq.${order_id}&select=id`);
      if (existing && existing.length > 0) return new Response('OK', { status: 200 });

      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${email}&select=id,plan`);
      if (users && users.length > 0) {
        const plan = gross_amount >= 90000 ? 'token10' : 'token5';
        const expires = '2099-12-31T23:59:59+00:00';
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${users[0].id}`, 'PATCH', { plan, plan_expires: expires });
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'payments', null, 'POST', {
          user_id: users[0].id, order_id, amount: gross_amount,
          currency: 'IDR', plan, provider: 'midtrans', status: transaction_status,
          paid_at: new Date().toISOString()
        });
        console.log(`PAYMENT SUCCESS: ${email} upgraded to ${plan}`);
      }
    }
    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('OK', { status: 200 });
  }
}

export async function onRequestOptions() {
  return new Response('', { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  const fetchUrl = `${url}/rest/v1/${table}${params}`;
  const opts = { method, headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' } };
  if (data) opts.body = JSON.stringify(data);
  const resp = await fetch(fetchUrl, opts);
  return await resp.json();
}
