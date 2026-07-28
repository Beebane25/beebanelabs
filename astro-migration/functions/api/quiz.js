// Cloudflare Pages Function: Quiz Results
// URL: /api/quiz
// Actions: save, history, stats

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const { token, action, articleSlug, quizId, score, total, percent, passed, answers } = body;

    if (!token || typeof token !== 'string') {
      return cors(400, { error: 'Token required' }, origin);
    }

    // Get session
    const encodedToken = encodeURIComponent(token);
    const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
      `?token=eq.${encodedToken}&select=id,user_id,expires_at`);

    if (!sessions || sessions.length === 0 || new Date(sessions[0].expires_at) < new Date()) {
      return cors(200, { success: false, reason: 'no_session' }, origin);
    }

    const userId = sessions[0].user_id;
    const encodedUserId = encodeURIComponent(userId);

    // === ACTION: SAVE ===
    if (action === 'save') {
      if (!articleSlug || !quizId || score === undefined || !total) {
        return cors(400, { error: 'Missing required fields: articleSlug, quizId, score, total' }, origin);
      }

      // Validate score
      if (score < 0 || score > total || total < 1) {
        return cors(400, { error: 'Invalid score or total' }, origin);
      }

      const calculatedPercent = Math.round((score / total) * 100);
      const calculatedPassed = calculatedPercent >= 60;

      // Check existing result
      const encodedSlug = encodeURIComponent(articleSlug);
      const encodedQuizId = encodeURIComponent(quizId);
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results',
        `?user_id=eq.${encodedUserId}&article_slug=eq.${encodedSlug}&quiz_id=eq.${encodedQuizId}&select=id,score,percent`);

      if (existing && existing.length > 0) {
        // Update existing (keep best score)
        const existingResult = existing[0];
        const bestScore = Math.max(existingResult.score, score);
        const bestPercent = Math.max(parseFloat(existingResult.percent), calculatedPercent);

        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results',
          `?id=eq.${existing[0].id}`, 'PATCH', {
            score: bestScore,
            total: total,
            percent: bestPercent,
            passed: bestPercent >= 60,
            answers: answers || [],
            completed_at: new Date().toISOString()
          });

        return cors(200, {
          success: true,
          action: 'updated',
          bestScore,
          bestPercent,
          passed: bestPercent >= 60,
          isNewRecord: bestScore > existingResult.score
        }, origin);
      } else {
        // Insert new result
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results', '', 'POST', {
          user_id: userId,
          article_slug: articleSlug,
          quiz_id: quizId,
          score: score,
          total: total,
          percent: calculatedPercent,
          passed: calculatedPassed,
          answers: answers || []
        });

        // Log activity
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'user_activity', '', 'POST', {
          user_id: userId,
          activity_type: 'read',
          description: `Quiz ${quizId} diselesaikan: ${score}/${total} (${calculatedPercent}%)`,
          metadata: { quiz_id: quizId, article_slug: articleSlug, score, total, percent: calculatedPercent, passed: calculatedPassed }
        });

        return cors(200, {
          success: true,
          action: 'created',
          score,
          total,
          percent: calculatedPercent,
          passed: calculatedPassed
        }, origin);
      }
    }

    // === ACTION: HISTORY ===
    if (action === 'history') {
      const history = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results',
        `?user_id=eq.${encodedUserId}&select=article_slug,quiz_id,score,total,percent,passed,completed_at&order=completed_at.desc`);

      return cors(200, { success: true, history: history || [] }, origin);
    }

    // === ACTION: STATS ===
    if (action === 'stats') {
      const allResults = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results',
        `?user_id=eq.${encodedUserId}&select=article_slug,quiz_id,score,total,percent,passed`);

      const totalQuizzes = allResults ? allResults.length : 0;
      const passedQuizzes = allResults ? allResults.filter(r => r.passed).length : 0;
      const avgPercent = totalQuizzes > 0
        ? Math.round(allResults.reduce((sum, r) => sum + parseFloat(r.percent), 0) / totalQuizzes)
        : 0;
      const uniqueArticles = allResults ? [...new Set(allResults.map(r => r.article_slug))].length : 0;

      return cors(200, {
        success: true,
        stats: {
          totalQuizzes,
          passedQuizzes,
          failedQuizzes: totalQuizzes - passedQuizzes,
          avgPercent,
          uniqueArticles,
          passRate: totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0
        }
      }, origin);
    }

    // === ACTION: CHECK ===
    if (action === 'check') {
      if (!articleSlug || !quizId) {
        return cors(400, { error: 'Missing articleSlug or quizId' }, origin);
      }

      const encodedSlug = encodeURIComponent(articleSlug);
      const encodedQuizId = encodeURIComponent(quizId);
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results',
        `?user_id=eq.${encodedUserId}&article_slug=eq.${encodedSlug}&quiz_id=eq.${encodedQuizId}&select=score,total,percent,passed,completed_at`);

      if (existing && existing.length > 0) {
        return cors(200, {
          success: true,
          hasCompleted: true,
          result: existing[0]
        }, origin);
      }

      return cors(200, { success: true, hasCompleted: false }, origin);
    }

    return cors(400, { error: 'Invalid action. Use: save, history, stats, check' }, origin);

  } catch (err) {
    return cors(500, { error: 'Internal server error' }, origin);
  }
}

// CORS helper
function cors(status, data, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}

// Supabase query helper
async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  params = params || '';  // defensive guard against null
  const fetchUrl = `${url}/rest/v1/${table}${params}`;
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=representation'
  };

  const options = { method, headers };
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(fetchUrl, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
