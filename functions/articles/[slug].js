// Cloudflare Pages Function: Article Access Gate
// Intercepts all /articles/* requests
// Checks sb-auth-token cookie, validates with Supabase
// Strips article content for unauthorized users
//
// SECURITY: This prevents content leak via curl / View Source / disable JS
// Previously: 42,541 chars of article content visible in HTML source

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequest(context) {
  const { request, env, params } = context;
  let slug = (params.slug || '').replace(/\.html$/, '');

  if (!slug || slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
    // Fallback: serve static file for invalid slugs
    return env.ASSETS.fetch(request);
  }

  // Read auth token from cookie
  const token = getCookie(request, 'sb-auth-token');

  // Get original HTML from static assets (no recursion — ASSETS serves directly)
  const assetResp = await env.ASSETS.fetch(request);
  const html = await assetResp.text();

  // Check article access
  let hasAccess = false;
  let userTokens = 0;

  if (token) {
    try {
      const result = await checkArticleAccess(env, token, slug);
      hasAccess = result.access;
      userTokens = result.tokens;
    } catch (e) {
      console.error('Access check error:', e.message || e);
    }
  }

  if (hasAccess) {
    // User has access — serve full HTML with meta tag
    const modified = html.replace(
      '<head>',
      '<head>\n<meta name="article:server-gated" content="false">'
    );
    return new Response(modified, { headers: assetResp.headers });
  }

  // === UNAUTHORIZED: Strip article content ===
  // Check if this is a free (pemula) article
  const isFree = html.includes('class="difficulty pemula"');

  // Check content freshness date (articles older than 90 days might be free)
  // NOT used for now — rely on difficulty badge

  let gateHtml;
  if (!token) {
    // No auth at all
    gateHtml = getLoginGateHtml(isFree);
  } else {
    // Has auth but no access — show token gate
    gateHtml = getTokenGateHtml(userTokens, slug);
  }

  // Replace article content with gate
  const stripped = html.replace(
    /<article[^>]*>[\s\S]*?<\/article>/,
    `<article class="article-content"><div class="container">${gateHtml}</div></article>`
  );

  // Add meta tag so client JS knows server handled the gate
  const final = stripped.replace(
    '<head>',
    '<head>\n<meta name="article:server-gated" content="true">'
  );

  // Also remove the early-content-gate noscript (it shows content when JS disabled!)
  const cleaned = final.replace(
    /<noscript><style>[^<]*\.article-content[^<]*<\/style><\/noscript>/g,
    ''
  );

  return new Response(cleaned, { headers: assetResp.headers });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

async function checkArticleAccess(env, token, slug) {
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_KEY) return { access: false, tokens: 0 };

  // Validate session
  const encodedToken = encodeURIComponent(token);
  const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
    `?token=eq.${encodedToken}&select=id,user_id,expires_at`);

  if (!sessions || sessions.length === 0) return { access: false, tokens: 0 };
  if (new Date(sessions[0].expires_at) < new Date()) return { access: false, tokens: 0 };

  const userId = sessions[0].user_id;
  const encodedUserId = encodeURIComponent(userId);
  const encodedSlug = encodeURIComponent(slug);

  // Check if article is already unlocked
  const unlocks = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
    `?user_id=eq.${encodedUserId}&article_slug=eq.${encodedSlug}&select=id`);

  if (unlocks && unlocks.length > 0) {
    // Get current token balance
    const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
      `?id=eq.${encodedUserId}&select=tokens`);
    return { access: true, tokens: users?.[0]?.tokens || 0 };
  }

  // Not unlocked — get token balance for the gate display
  const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
    `?id=eq.${encodedUserId}&select=tokens`);
  return { access: false, tokens: users?.[0]?.tokens || 0 };
}

function getLoginGateHtml(isFree) {
  if (isFree) {
    return `<div style="text-align:center;padding:60px 20px;">
<div style="font-size:4rem;margin-bottom:16px;">📝</div>
<div style="display:inline-block;background:rgba(62,207,142,0.15);border:1px solid rgba(62,207,142,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:#3ecf8e;margin-bottom:16px;">✨ Artikel Gratis</div>
<h2 style="color:var(--text,#10231F);margin-bottom:8px;">Login untuk Membaca</h2>
<p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Artikel ini <strong>gratis</strong> tapi kamu perlu login dulu. Buat akun gratis dan dapatkan akses ke semua artikel pemula.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<button onclick="AuthSystem.showModal()" class="btn-primary" style="margin:0 8px;">👤 Login / Daftar</button>
<a href="/pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">💰 Lihat Paket Token</a>
</div></div>`;
  }

  return `<div style="text-align:center;padding:60px 20px;">
<div style="font-size:4rem;margin-bottom:16px;">🔒</div>
<div style="display:inline-block;background:rgba(251,146,60,0.15);border:1px solid rgba(251,146,60,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:#fb923c;margin-bottom:16px;">Login Diperlukan</div>
<h2 style="color:var(--text,#10231F);margin-bottom:8px;">Login untuk Membaca</h2>
<p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Artikel ini memerlukan login. Buat akun gratis dan dapatkan <strong>5 token</strong> untuk membuka artikel premium.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<button onclick="AuthSystem.showModal()" class="btn-primary" style="margin:0 8px;">👤 Login / Daftar</button>
<a href="/pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">💰 Beli Token</a>
</div></div>`;
}

function getTokenGateHtml(tokens, slug) {
  const safeSlug = (slug || '').replace(/[^a-zA-Z0-9\-_]/g, '');
  const badgeText = tokens > 0 ? `${tokens} Token Tersisa` : 'Token Habis';
  const badgeColor = tokens > 0 ? '#39D9C4' : '#f43f5e';
  const badgeBg = tokens > 0 ? 'rgba(57,217,196,0.15)' : 'rgba(244,63,94,0.15)';
  const badgeBorder = tokens > 0 ? 'rgba(57,217,196,0.3)' : 'rgba(244,63,94,0.3)';

  if (tokens <= 0) {
    return `<div style="text-align:center;padding:60px 20px;">
<div style="font-size:4rem;margin-bottom:16px;">🔒</div>
<div style="display:inline-block;background:${badgeBg};border:1px solid ${badgeBorder};border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:${badgeColor};margin-bottom:16px;">${badgeText}</div>
<h2 style="color:var(--text,#10231F);margin-bottom:8px;">Token Habis</h2>
<p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Token gratis kamu sudah habis. Beli token tambahan untuk membuka lebih banyak artikel.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<a href="/pricing.html" class="btn-primary" style="margin:0 8px;text-decoration:none;">💰 Beli Token</a>
</div></div>`;
  }

  return `<div style="text-align:center;padding:60px 20px;">
<div style="font-size:4rem;margin-bottom:16px;">🔒</div>
<div style="display:inline-block;background:${badgeBg};border:1px solid ${badgeBorder};border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:${badgeColor};margin-bottom:16px;">${badgeText}</div>
<h2 style="color:var(--text,#10231F);margin-bottom:8px;">Artikel Premium</h2>
<p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Gunakan <strong>1 token</strong> untuk membuka artikel ini. Token disimpan di server.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<button onclick="PaywallSystem.unlockWithToken('${safeSlug}')" class="btn-primary server-unlock-btn" style="margin:0 8px;">🔑 Gunakan 1 Token</button>
<a href="/pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">💰 Beli Token</a>
</div></div>`;
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  params = params || '';  // defensive guard against null
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
  if (!resp.ok) {
    console.error('Supabase error:', resp.status, 'on', table);
    return null;
  }
  return resp.json();
}
