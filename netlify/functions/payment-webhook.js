// Netlify Function: Payment Webhook (Midtrans Notification)

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';

const HEADERS = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

async function supabaseQuery(table, method, data, params) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params || ''}`;
  const opts = { method, headers: HEADERS };
  if (data) opts.body = JSON.stringify(data);
  const r = await fetch(url, opts);
  return await r.json();
}

function verifySignature(body) {
  try {
    const str = body.order_id + body.status_code + body.gross_amount + body.transaction_status + MIDTRANS_SERVER_KEY;
    const sig = crypto.createHash('sha512').update(str).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(body.signature_key || ''));
  } catch { return false; }
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'OK' };
    const body = JSON.parse(event.body || '{}');
    const { order_id, status, gross_amount, transaction_status, customer_details } = body;

    if (MIDTRANS_SERVER_KEY && !verifySignature(body)) {
      console.log('INVALID SIGNATURE:', order_id);
      return { statusCode: 200, body: 'OK' };
    }

    console.log(`Webhook: order=${order_id} status=${transaction_status}`);

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      const email = customer_details?.email;
      if (!email) return { statusCode: 200, body: 'OK' };

      const existing = await supabaseQuery('payments', 'GET', null, `?order_id=eq.${order_id}&select=id`);
      if (existing && existing.length > 0) return { statusCode: 200, body: 'Already processed' };

      const users = await supabaseQuery('users', 'GET', null, `?email=eq.${email}&select=id,plan`);
      if (users && users.length > 0) {
        const plan = gross_amount >= 80000 ? 'token8' : 'token5';
        const expires = '2099-12-31T23:59:59+00:00';
        await supabaseQuery('users', 'PATCH', { plan, plan_expires: expires }, `?id=eq.${users[0].id}`);
        await supabaseQuery('payments', 'POST', {
          user_id: users[0].id, order_id, amount: gross_amount,
          currency: 'IDR', plan, provider: 'midtrans', status: transaction_status,
          paid_at: new Date().toISOString()
        });
        console.log(`PAYMENT SUCCESS: ${email} upgraded to ${plan}`);
      }
    }
    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    console.error('Webhook error:', e);
    return { statusCode: 200, body: 'OK' };
  }
};
