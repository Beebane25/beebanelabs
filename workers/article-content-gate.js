// Cloudflare Worker: Article Content Gate
// Deploy this as a Worker with route: beebanelabs.pages.dev/articles/*
// This runs BEFORE the static asset is served, preventing unauthorized access.
//
// SETUP:
// 1. Go to Cloudflare Dashboard → Workers & Pages → Create Application → Create Worker
// 2. Name: article-content-gate
// 3. Paste this code
// 4. Add Environment Variables:
//    - SUPABASE_URL: https://nbungbznljbiddlwyvbd.supabase.co
//    - SUPABASE_SERVICE_KEY: (your service role key)
// 5. Add Route: beebanelabs.pages.dev/articles/*

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only gate article pages (HTML, not assets like images/CSS/JS)
    if (!url.pathname.startsWith('/articles/') || !url.pathname.endsWith('.html')) {
      return fetch(request); // Pass through non-article requests
    }
    
    // Extract article slug from URL
    const slug = url.pathname.split('/').pop().replace('.html', '');
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return fetch(request); // Invalid slug, pass through
    }
    
    // Check for session token in cookies or Authorization header
    const cookieHeader = request.headers.get('Cookie') || '';
    const sessionToken = extractSessionToken(cookieHeader);
    
    if (!sessionToken) {
      // No session → serve paywall page (no article content)
      return servePaywallPage(slug, url);
    }
    
    // Verify access via Supabase
    try {
      const hasAccess = await verifyArticleAccess(env, sessionToken, slug);
      if (hasAccess) {
        // User has access → serve original article
        return fetch(request);
      } else {
        // User logged in but no access → serve paywall with token info
        return servePaywallPage(slug, url, true);
      }
    } catch (e) {
      // On error, serve paywall (fail-secure)
      console.error('Content gate error:', e.message);
      return servePaywallPage(slug, url);
    }
  }
};

// Extract session token from cookies
function extractSessionToken(cookieHeader) {
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=');
    if (name === 'bb_session' || name === 'beebanelabs_session') {
      return valueParts.join('=');
    }
  }
  // Also check localStorage-style token from request body or header
  return null;
}

// Verify if user can access the article
async function verifyArticleAccess(env, sessionToken, articleSlug) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) return false;
  
  // 1. Validate session
  const sessionResp = await fetch(
    `${supabaseUrl}/rest/v1/sessions?token=eq.${encodeURIComponent(sessionToken)}&select=user_id,expires_at`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  const sessions = await sessionResp.json();
  
  if (!sessions || sessions.length === 0) return false;
  if (new Date(sessions[0].expires_at) < new Date()) return false;
  
  const userId = sessions[0].user_id;
  
  // 2. Check if article is already unlocked
  const unlockResp = await fetch(
    `${supabaseUrl}/rest/v1/article_unlocks?user_id=eq.${encodeURIComponent(userId)}&article_slug=eq.${encodeURIComponent(articleSlug)}&select=id`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  const unlocks = await unlockResp.json();
  
  if (unlocks && unlocks.length > 0) return true;
  
  // 3. Check if user has premium plan
  const userResp = await fetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=plan,tokens`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  const users = await userResp.json();
  
  if (!users || users.length === 0) return false;
  
  const user = users[0];
  if (user.plan && user.plan !== 'free' && user.plan !== 'tokens') return true; // Premium user
  
  return false; // Needs to use token
}

// Serve a paywall page instead of the article
function servePaywallPage(slug, url, isLoggedIn = false) {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artikel Terkunci - BeebaneLabs</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, sans-serif;
      background: #08090a; color: #e4e4e7;
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
    }
    .gate { text-align: center; max-width: 480px; padding: 40px 20px; }
    .icon { font-size: 4rem; margin-bottom: 16px; }
    .badge { 
      display: inline-block; background: rgba(251,146,60,0.15);
      border: 1px solid rgba(251,146,60,0.3); border-radius: 20px;
      padding: 4px 14px; font-size: 0.75rem; font-weight: 600; color: #fb923c;
      margin-bottom: 16px;
    }
    h1 { font-size: 1.5rem; margin-bottom: 12px; }
    p { color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
    .btn { 
      display: inline-block; padding: 12px 24px; border-radius: 8px;
      font-weight: 600; text-decoration: none; margin: 0 8px;
      transition: all 0.2s;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #27272a; color: #e4e4e7; border: 1px solid #3f3f46; }
    .btn-secondary:hover { background: #3f3f46; }
    .back { margin-top: 24px; }
    .back a { color: #60a5fa; text-decoration: none; font-size: 0.875rem; }
    .back a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="gate">
    <div class="icon">🔒</div>
    <div class="badge">Artikel Terkunci</div>
    <h1>Konten Premium</h1>
    <p>Artikel ini memerlukan token untuk dibuka. ${isLoggedIn ? 'Gunakan 1 token untuk membuka, atau beli token tambahan.' : 'Login untuk menggunakan token gratis kamu.'}</p>
    <div>
      ${isLoggedIn 
        ? '<a href="/pricing.html" class="btn btn-primary">🔑 Beli Token</a>' 
        : '<a href="#" onclick="window.location.href=\'/\'; return false;" class="btn btn-primary">🔑 Login</a>'}
      <a href="/" class="btn btn-secondary">🏠 Beranda</a>
    </div>
    <div class="back">
      <a href="/">← Kembali ke BeebaneLabs</a>
    </div>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}
