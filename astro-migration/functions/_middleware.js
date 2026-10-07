// Cloudflare Pages Middleware: Article Access Gate
// Runs on ALL requests, but only intercepts /articles/* paths
// Checks sb-auth-token cookie, validates with Supabase
// Strips article content for unauthorized users

export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // FAST PATH: Only intercept /articles/* routes
  if (!url.pathname.startsWith('/articles/')) {
    return context.next();
  }
  
  // Extract slug
  const slugMatch = url.pathname.match(/^\/articles\/([a-z0-9-]+?)(?:\.html)?$/);
  if (!slugMatch) {
    return context.next(); // Not a valid article path (e.g. /articles/ or /articles/)
  }
  
  const slug = slugMatch[1];
  const token = getCookie(context.request, 'sb-auth-token');

  // === AUTHORIZED: User has token + article is unlocked ===
  if (token) {
    try {
      const result = await checkArticleAccess(context.env, token, slug);
      if (result.access) {
        const response = await context.next();
        const html = await response.text();
        const modified = html.replace(
          '<head>',
          '<head>\n<meta name="article:server-gated" content="false">'
        );
        const resp = new Response(modified, response);
        resp.headers.set('X-Article-Gate', 'authorized');
        return resp;
      }

      // Has token but NOT unlocked → show token gate
      const response = await context.next();
      const html = await response.text();
      const final = applyGate(html, 'token', slug, result.tokens);
      const resp = new Response(final, response);
      resp.headers.set('X-Article-Gate', 'token-gate');
      return resp;
    } catch (e) {
      // Supabase error → fall through
    }
  }

  // === UNAUTHORIZED: No valid token ===
  const response = await context.next();
  const html = await response.text();
  const isFree = html.includes('class="difficulty pemula"');
  const gateType = isFree ? 'free' : 'login';
  const final = applyGate(html, gateType, slug, 0);
  const resp = new Response(final, response);
  resp.headers.set('X-Article-Gate', isFree ? 'free-gate' : 'login-gate');
  return resp;
}

// === HTML Gate Templates ===

function applyGate(html, gateType, slug, tokens) {
  let gateHtml;
  if (gateType === 'free') gateHtml = getFreeGateHtml();
  else if (gateType === 'login') gateHtml = getLoginGateHtml();
  else if (gateType === 'token') gateHtml = getTokenGateHtml(tokens, slug);
  else gateHtml = getLoginGateHtml();

  // Replace article content with gate
  const stripped = html.replace(
    /<article[^>]*>[\s\S]*?<\/article>/,
    `<article class="article-content"><div class="container">${gateHtml}</div></article>`
  );

  // Mark as server-gated
  const final = stripped.replace(
    '<head>',
    '<head>\n<meta name="article:server-gated" content="true">'
  );

  // Remove noscript that reveals content when JS disabled
  return final.replace(
    /<noscript><style>[^<]*\.article-content[^<]*<\/style><\/noscript>/g,
    ''
  );
}

function getLoginGateHtml() {
  return `<div style="text-align:center;padding:60px 20px;"><div style="font-size:4rem;margin-bottom:16px;">\u{1F512}</div><div style="display:inline-block;background:rgba(251,146,60,0.15);border:1px solid rgba(251,146,60,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:#fb923c;margin-bottom:16px;">Login Diperlukan</div><h2 style="color:var(--text,#10231F);margin-bottom:8px;">Login untuk Membaca</h2><p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Artikel ini memerlukan login. Buat akun gratis dan dapatkan <strong>5 token</strong> untuk membuka artikel premium.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><button onclick="AuthSystem.showModal()" class="btn-primary" style="margin:0 8px;">\u{1F464} Login / Daftar</button><a href="/pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">\u{1F4B0} Beli Token</a></div></div>`;
}

function getFreeGateHtml() {
  return `<div style="text-align:center;padding:60px 20px;"><div style="font-size:4rem;margin-bottom:16px;">\u{1F4DD}</div><div style="display:inline-block;background:rgba(62,207,142,0.15);border:1px solid rgba(62,207,142,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:#3ecf8e;margin-bottom:16px;">\u2728 Artikel Gratis</div><h2 style="color:var(--text,#10231F);margin-bottom:8px;">Login untuk Membaca</h2><p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Artikel ini <strong>gratis</strong> tapi kamu perlu login dulu. Buat akun gratis dan dapatkan akses ke semua artikel pemula.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><button onclick="AuthSystem.showModal()" class="btn-primary" style="margin:0 8px;">\u{1F464} Login / Daftar</button><a href="/pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">\u{1F4B0} Lihat Paket Token</a></div></div>`;
}

function getTokenGateHtml(tokens, slug) {
  const safeSlug = (slug || '').replace(/[^a-zA-Z0-9\-_]/g, '');
  const badgeText = tokens > 0 ? `${tokens} Token Tersisa` : 'Token Habis';
  const badgeColor = tokens > 0 ? '#39D9C4' : '#f43f5e';
  const badgeBg = tokens > 0 ? 'rgba(57,217,196,0.15)' : 'rgba(244,63,94,0.15)';
  const badgeBorder = tokens > 0 ? 'rgba(57,217,196,0.3)' : 'rgba(244,63,94,0.3)';

  if (tokens <= 0) {
    return `<div style="text-align:center;padding:60px 20px;"><div style="font-size:4rem;margin-bottom:16px;">\u{1F512}</div><div style="display:inline-block;background:${badgeBg};border:1px solid ${badgeBorder};border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:${badgeColor};margin-bottom:16px;">${badgeText}</div><h2 style="color:var(--text,#10231F);margin-bottom:8px;">Token Habis</h2><p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Token gratis kamu sudah habis. Beli token tambahan untuk membuka lebih banyak artikel.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><a href="/pricing.html" class="btn-primary" style="margin:0 8px;text-decoration:none;">\u{1F4B0} Beli Token</a></div></div>`;
  }

  return `<div style="text-align:center;padding:60px 20px;"><div style="font-size:4rem;margin-bottom:16px;">\u{1F512}</div><div style="display:inline-block;background:${badgeBg};border:1px solid ${badgeBorder};border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:${badgeColor};margin-bottom:16px;">${badgeText}</div><h2 style="color:var(--text,#10231F);margin-bottom:8px;">Artikel Premium</h2><p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">Gunakan <strong>1 token</strong> untuk membuka artikel ini. Token disimpan di server.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><button onclick="PaywallSystem.unlockWithToken('${safeSlug}')" class="btn-primary server-unlock-btn" style="margin:0 8px;">\u{1F511} Gunakan 1 Token</button><a href="/pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">\u{1F4B0} Beli Token</a></div></div>`;
}

// === Helpers ===

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

async function checkArticleAccess(env, token, slug) {
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  if (!SUPABASE_URL || !SUPABASE_KEY) return { access: false, tokens: 0 };

  const encodedToken = encodeURIComponent(token);
  const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
    `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
  if (!sessions || sessions.length === 0) return { access: false, tokens: 0 };
  if (new Date(sessions[0].expires_at) < new Date()) return { access: false, tokens: 0 };

  const userId = sessions[0].user_id;
  const encodedUserId = encodeURIComponent(userId);
  const encodedSlug = encodeURIComponent(slug);

  const unlocks = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
    `?user_id=eq.${encodedUserId}&article_slug=eq.${encodedSlug}&select=id`);
  const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
    `?id=eq.${encodedUserId}&select=tokens`);

  if (unlocks && unlocks.length > 0) {
    return { access: true, tokens: users?.[0]?.tokens || 0 };
  }
  return { access: false, tokens: users?.[0]?.tokens || 0 };
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  params = params || '';
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
