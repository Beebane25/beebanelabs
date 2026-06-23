// Cloudflare Pages Function: Token Operations
// URL: /api/tokens
// Security-hardened: CORS whitelist, input validation, URL encoding

const ALLOWED_ORIGINS = ['https://iothub.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const action = body.action;

    // === CHECK ACCESS ===
    if (action === 'check-access') {
      const { token, articleSlug } = body;
      if (!token || typeof token !== 'string' || token.length > 128) return cors(400, { error: 'Invalid token' }, origin);
      if (!articleSlug || typeof articleSlug !== 'string' || articleSlug.length > 100) return cors(400, { error: 'Invalid article' }, origin);
      if (!/^[a-z0-9-]+$/.test(articleSlug)) return cors(400, { error: 'Invalid article slug' }, origin);

      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
        `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(200, { access: false, reason: 'no_session' }, origin);
      if (new Date(sessions[0].expires_at) < new Date()) return cors(200, { access: false, reason: 'expired' }, origin);

      const encodedUserId = encodeURIComponent(sessions[0].user_id);
      const encodedSlug = encodeURIComponent(articleSlug);
      const unlocks = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
        `?user_id=eq.${encodedUserId}&article_slug=eq.${encodedSlug}&select=id`);
      if (unlocks && unlocks.length > 0) {
        const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
          `?id=eq.${encodedUserId}&select=tokens,plan`);
        return cors(200, { access: true, reason: 'unlocked', tokens: users?.[0]?.tokens || 0, plan: users?.[0]?.plan || 'free' }, origin);
      }

      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${encodedUserId}&select=tokens,plan`);
      return cors(200, { access: false, reason: 'locked', tokens: users?.[0]?.tokens || 0, plan: users?.[0]?.plan || 'free' }, origin);
    }

    // === USE TOKEN TO UNLOCK ===
    if (action === 'use-token') {
      const { token, articleSlug } = body;
      if (!token || typeof token !== 'string' || token.length > 128) return cors(400, { error: 'Invalid token' }, origin);
      if (!articleSlug || typeof articleSlug !== 'string' || articleSlug.length > 100) return cors(400, { error: 'Invalid article' }, origin);
      if (!/^[a-z0-9-]+$/.test(articleSlug)) return cors(400, { error: 'Invalid article slug' }, origin);

      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
        `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(401, { error: 'Session tidak valid' }, origin);
      if (new Date(sessions[0].expires_at) < new Date()) return cors(401, { error: 'Session expired' }, origin);

      const userId = sessions[0].user_id;
      const encodedUserId = encodeURIComponent(userId);
      const encodedSlug = encodeURIComponent(articleSlug);

      // Check if already unlocked (idempotent)
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
        `?user_id=eq.${encodedUserId}&article_slug=eq.${encodedSlug}&select=id`);
      if (existing && existing.length > 0) {
        const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
          `?id=eq.${encodedUserId}&select=tokens`);
        return cors(200, { success: true, message: 'Artikel sudah diunlock', tokens: users?.[0]?.tokens || 0 }, origin);
      }

      // Get current token balance
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${encodedUserId}&select=tokens,plan`);
      if (!users || users.length === 0) return cors(404, { error: 'User tidak ditemukan' }, origin);

      const user = users[0];
      if (user.plan !== 'free' && user.plan !== 'tokens') {
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks', '', 'POST', {
          user_id: userId, article_slug: articleSlug
        });
        return cors(200, { success: true, message: 'Premium access', tokens: user.tokens, premium: true }, origin);
      }

      if (user.tokens <= 0) return cors(403, { error: 'Token habis. Beli token tambahan.', tokens: 0 }, origin);

      // Atomic token deduction (read-then-write with idempotency)
      const newTokens = user.tokens - 1;
      const patchResult = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${encodedUserId}&tokens=eq.${user.tokens}`, 'PATCH', { tokens: newTokens });

      // If patch affected 0 rows (race condition), re-read and retry once
      if (!patchResult || patchResult.length === 0) {
        const retryUsers = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
          `?id=eq.${encodedUserId}&select=tokens`);
        if (retryUsers && retryUsers.length > 0 && retryUsers[0].tokens > 0) {
          const retryNew = retryUsers[0].tokens - 1;
          await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
            `?id=eq.${encodedUserId}&tokens=eq.${retryUsers[0].tokens}`, 'PATCH', { tokens: retryNew });
          await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks', '', 'POST', {
            user_id: userId, article_slug: articleSlug
          });
          return cors(200, { success: true, message: 'Artikel dibuka! Token tersisa: ' + retryNew, tokens: retryNew }, origin);
        }
        return cors(409, { error: 'Token sudah dikurangi oleh request lain' }, origin);
      }

      // Record unlock
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks', '', 'POST', {
        user_id: userId, article_slug: articleSlug
      });

      return cors(200, { success: true, message: 'Artikel dibuka! Token tersisa: ' + newTokens, tokens: newTokens }, origin);
    }

    // === GET TOKEN BALANCE ===
    if (action === 'balance') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128) return cors(200, { tokens: 0, plan: 'free' }, origin);

      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
        `?token=eq.${encodedToken}&select=user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(200, { tokens: 0, plan: 'free' }, origin);
      if (new Date(sessions[0].expires_at) < new Date()) return cors(200, { tokens: 0, plan: 'free', reason: 'expired' }, origin);

      const encodedUserId = encodeURIComponent(sessions[0].user_id);
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${encodedUserId}&select=tokens,plan`);
      if (!users || users.length === 0) return cors(200, { tokens: 0, plan: 'free' }, origin);

      return cors(200, { tokens: users[0].tokens, plan: users[0].plan }, origin);
    }

    // === ADD TOKENS (INTERNAL ONLY - called by payment webhook) ===
    // CRITICAL FIX: Requires internal API key, NOT user-accessible
    if (action === 'add-tokens') {
      const internalKey = body._internalKey;
      const validInternalKey = env.INTERNAL_API_KEY || env.SUPABASE_SERVICE_KEY; // fallback to service key
      if (!internalKey || internalKey !== validInternalKey) {
        return cors(403, { error: 'Akses ditolak' }, origin);
      }

      const { userId, count, orderId } = body;
      if (!userId || typeof userId !== 'string' || !count || typeof count !== 'number' || count <= 0 || count > 100) {
        return cors(400, { error: 'Invalid parameters' }, origin);
      }

      const encodedUserId = encodeURIComponent(userId);
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${encodedUserId}&select=tokens`);
      if (!users || users.length === 0) return cors(404, { error: 'User not found' }, origin);

      const newTokens = (users[0].tokens || 0) + count;
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${encodedUserId}`, 'PATCH', { tokens: newTokens, plan: 'tokens' });

      return cors(200, { success: true, tokens: newTokens }, origin);
    }

    return cors(400, { error: 'Action tidak valid' }, origin);
  } catch (e) {
    // Error logged for debugging
    console.error('Token error:', e.message || e);
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
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
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
