// Netlify Function: Check User Access/Subscription

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const HEADERS = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

async function supabaseQuery(table, params) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers: HEADERS });
  return await r.json();
}

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
    const { email, token } = body;

    if (!token) return cors(400, { error: 'Token required' });

    const sessions = await supabaseQuery('sessions', `?token=eq.${token}&select=id,user_id,expires_at`);
    if (!sessions || sessions.length === 0) return cors(200, { access: false, plan: 'free' });

    const session = sessions[0];
    if (new Date(session.expires_at) < new Date()) {
      await supabaseQuery('sessions', `?token=eq.${token}`);
      return cors(200, { access: false, plan: 'free', reason: 'expired' });
    }

    const users = await supabaseQuery('users', `?id=eq.${session.user_id}&select=email,plan,is_active,plan_expires`);
    if (!users || users.length === 0 || !users[0].is_active) return cors(200, { access: false, plan: 'free' });

    const user = users[0];
    if (email && user.email !== email.toLowerCase()) return cors(403, { error: 'Unauthorized' });

    return cors(200, { access: true, plan: user.plan, expires: user.plan_expires });
  } catch (e) {
    console.error('Check access error:', e);
    return cors(500, { error: 'Internal server error' });
  }
};
