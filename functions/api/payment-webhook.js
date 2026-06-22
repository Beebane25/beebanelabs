// Cloudflare Pages Function: Payment Webhook (Midtrans)
// URL: /api/payment-webhook
// Security-hardened: signature mandatory, no CORS wildcard, proper error responses

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const MIDTRANS_SERVER_KEY = env.MIDTRANS_SERVER_KEY || '';

  try {
    // CRITICAL FIX: Reject if MIDTRANS_SERVER_KEY not configured
    if (!MIDTRANS_SERVER_KEY) {
      // Error logged for debugging
    console.error('Webhook rejected: MIDTRANS_SERVER_KEY not configured');
      return new Response('Service unavailable', { status: 503 });
    }

    const body = await request.json();
    const { order_id, gross_amount, transaction_status, customer_details } = body;

    // Verify signature (ALWAYS required)
    const str = (body.order_id || '') + (body.status_code || '') + (body.gross_amount || '') + (body.transaction_status || '') + MIDTRANS_SERVER_KEY;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(MIDTRANS_SERVER_KEY);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(str));
    const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    // FIX: Constant-time comparison + proper error response
    if (!body.signature_key || !constantTimeCompare(sigHex, body.signature_key)) {
      console.log('INVALID SIGNATURE:', order_id);
      return new Response('Invalid signature', { status: 401 });
    }

    console.log(`Webhook: order=${order_id} status=${transaction_status}`);

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      const email = customer_details?.email;
      if (!email || typeof email !== 'string') return new Response('OK', { status: 200 });

      // Check idempotency
      const encodedOrderId = encodeURIComponent(order_id);
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'payments', `?order_id=eq.${encodedOrderId}&select=id`);
      if (existing && existing.length > 0) return new Response('OK', { status: 200 });

      const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${encodedEmail}&select=id,tokens`);
      if (users && users.length > 0) {
        // Determine token count from amount
        const tokenCount = gross_amount >= 90000 ? 10 : 5;

        // Add tokens to user
        const newTokens = (users[0].tokens || 0) + tokenCount;
        const encodedUserId = encodeURIComponent(users[0].id);
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}`, 'PATCH', {
          tokens: newTokens, plan: 'tokens'
        });

        // FIX: Save payment record (was null → ' paymentsnull')
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'payments', '', 'POST', {
          user_id: users[0].id, order_id, amount: gross_amount,
          token_count: tokenCount, currency: 'IDR', provider: 'midtrans',
          status: transaction_status, paid_at: new Date().toISOString()
        });

        console.log(`PAYMENT SUCCESS: ${email} +${tokenCount} tokens (total: ${newTokens})`);
      }
    }
    return new Response('OK', { status: 200 });
  } catch (e) {
    // Error logged for debugging
    console.error('Webhook error:', e.message || e);
    return new Response('OK', { status: 200 }); // Midtrans expects 200
  }
}

export async function onRequestOptions() {
  return new Response('', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://api.midtrans.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    let r = 0;
    for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ (i < b.length ? b.charCodeAt(i) : 0);
    return false;
  }
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  const fetchUrl = `${url}/rest/v1/${table}${params}`;
  const opts = {
    method,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  if (data) opts.body = JSON.stringify(data);
  const resp = await fetch(fetchUrl, opts);
  const result = await resp.json();
  if (!resp.ok) // Error logged for debugging
    console.error('Supabase error:', resp.status);
  return result;
}
