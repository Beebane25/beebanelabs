// Cloudflare Pages Function: Profile
// URL: /api/profile
// Handles: bookmarks, reading progress, preferences, achievements, certificates,
//          login history, data export (GDPR), logout-all, and more.

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

// Valid certificate categories
const CERT_CATEGORIES = {
  'iot': 'IoT & Embedded',
  'networking': 'Networking (MikroTik)',
  'programming': 'Programming',
  'security': 'Cybersecurity',
  'dashboard': 'Dashboard & Cloud'
};

// Achievement definitions
const ACHIEVEMENT_DEFS = [
  { id: 'first_article', name: 'First Step', desc: 'Unlock your first article', icon: '🔓', check: (s) => s.articlesUnlocked >= 1 },
  { id: 'article_5', name: 'Curious Learner', desc: 'Unlock 5 articles', icon: '📚', check: (s) => s.articlesUnlocked >= 5 },
  { id: 'article_10', name: 'Knowledge Seeker', desc: 'Unlock 10 articles', icon: '🎓', check: (s) => s.articlesUnlocked >= 10 },
  { id: 'article_25', name: 'Master Scholar', desc: 'Unlock 25 articles', icon: '🏆', check: (s) => s.articlesUnlocked >= 25 },
  { id: 'first_quiz', name: 'Quiz Rookie', desc: 'Complete your first quiz', icon: '✏️', check: (s) => s.quizzesCompleted >= 1 },
  { id: 'quiz_5', name: 'Quiz Enthusiast', desc: 'Complete 5 quizzes', icon: '📝', check: (s) => s.quizzesCompleted >= 5 },
  { id: 'quiz_perfect', name: 'Perfect Score', desc: 'Get 100% on any quiz', icon: '💯', check: (s) => s.hasPerfectQuiz },
  { id: 'streak_3', name: 'Consistent Learner', desc: '3-day learning streak', icon: '🔥', check: (s) => s.streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day learning streak', icon: '⚡', check: (s) => s.streak >= 7 },
  { id: 'category_master', name: 'Category Master', desc: 'Complete all articles in a category', icon: '👑', check: (s) => s.hasCategoryComplete }
];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const action = body.action;

    if (!action) return cors(400, { error: 'Action diperlukan' }, origin);

    // ================================================================
    // SAVE BOOKMARKS
    // ================================================================
    if (action === 'save-bookmarks') {
      const { token, bookmarks } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);
      if (!Array.isArray(bookmarks))
        return cors(400, { error: 'Bookmarks harus berupa array' }, origin);
      if (bookmarks.length > 500)
        return cors(400, { error: 'Maksimal 500 bookmark' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      // Sanitize bookmarks
      const sanitized = bookmarks.slice(0, 500).map(b => ({
        slug: String(b.slug || '').substring(0, 200),
        title: String(b.title || '').substring(0, 300),
        category: String(b.category || '').substring(0, 50),
        saved_at: b.saved_at || new Date().toISOString()
      }));

      // Try saving to user_preferences as key-value
      await savePref(SUPABASE_URL, SUPABASE_KEY, userId, 'bookmarks', sanitized);

      return cors(200, { success: true, bookmarks: sanitized }, origin);
    }

    // ================================================================
    // GET BOOKMARKS
    // ================================================================
    if (action === 'get-bookmarks') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const bookmarks = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'bookmarks');
      return cors(200, { success: true, bookmarks: bookmarks || [] }, origin);
    }

    // ================================================================
    // SAVE PROGRESS
    // ================================================================
    if (action === 'save-progress') {
      const { token, articleSlug, status, position } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);
      if (!articleSlug || typeof articleSlug !== 'string')
        return cors(400, { error: 'articleSlug diperlukan' }, origin);
      if (!['opened', 'completed'].includes(status))
        return cors(400, { error: 'Status harus opened atau completed' }, origin);

      const posNum = Math.max(0, Math.min(100, parseInt(position) || 0));

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      // Load existing progress
      const allProgress = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'reading_progress') || {};

      const slug = articleSlug.substring(0, 200);
      const existing = allProgress[slug] || {};
      allProgress[slug] = {
        slug,
        status: status === 'completed' ? 'completed' : existing.status === 'completed' ? 'completed' : status,
        position: Math.max(existing.position || 0, posNum),
        updated_at: new Date().toISOString(),
        opened_at: existing.opened_at || new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : existing.completed_at || null
      };

      await savePref(SUPABASE_URL, SUPABASE_KEY, userId, 'reading_progress', allProgress);

      return cors(200, { success: true, progress: allProgress[slug] }, origin);
    }

    // ================================================================
    // GET PROGRESS
    // ================================================================
    if (action === 'get-progress') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const progress = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'reading_progress');
      return cors(200, { success: true, progress: progress || {} }, origin);
    }

    // ================================================================
    // SAVE PREFERENCES
    // ================================================================
    if (action === 'save-preferences') {
      const { token, theme, newsletterCategories } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const prefs = {};
      if (theme && ['light', 'dark', 'system'].includes(theme)) {
        prefs.theme = theme;
      }
      if (Array.isArray(newsletterCategories)) {
        prefs.newsletterCategories = newsletterCategories
          .filter(c => CERT_CATEGORIES[c])
          .slice(0, 10);
      }
      prefs.updated_at = new Date().toISOString();

      // Save individual keys
      if (prefs.theme) await savePref(SUPABASE_URL, SUPABASE_KEY, userId, 'theme', prefs.theme);
      if (prefs.newsletterCategories) await savePref(SUPABASE_URL, SUPABASE_KEY, userId, 'newsletter_categories', prefs.newsletterCategories);

      // Also try updating the users table directly
      try {
        const encodedUserId = encodeURIComponent(userId);
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}`, 'PATCH', {
          preferences: prefs
        });
      } catch (e) {
        // Column may not exist, continue
      }

      return cors(200, { success: true, preferences: prefs }, origin);
    }

    // ================================================================
    // GET PREFERENCES
    // ================================================================
    if (action === 'get-preferences') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const theme = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'theme');
      const newsletterCategories = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'newsletter_categories');

      // Also try reading from users table
      let userPrefs = null;
      try {
        const encodedUserId = encodeURIComponent(userId);
        const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=preferences`);
        if (users && users[0] && users[0].preferences) userPrefs = users[0].preferences;
      } catch (e) {
        // Column may not exist
      }

      return cors(200, {
        success: true,
        preferences: {
          theme: theme || (userPrefs && userPrefs.theme) || 'system',
          newsletterCategories: newsletterCategories || (userPrefs && userPrefs.newsletterCategories) || []
        }
      }, origin);
    }

    // ================================================================
    // LOGOUT ALL SESSIONS
    // ================================================================
    if (action === 'logout-all') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0)
        return cors(401, { error: 'Session tidak valid' }, origin);
      if (new Date(sessions[0].expires_at) < new Date())
        return cors(401, { error: 'Session expired' }, origin);

      const userId = sessions[0].user_id;
      const encodedUserId = encodeURIComponent(userId);

      // Delete all sessions for this user except the current token
      const deleted = await supabaseQuery(
        SUPABASE_URL, SUPABASE_KEY, 'sessions',
        `?user_id=eq.${encodedUserId}&token=neq.${encodedToken}`, 'DELETE'
      );

      return cors(200, {
        success: true,
        message: 'Semua session lain berhasil dihapus',
        deletedCount: Array.isArray(deleted) ? deleted.length : 0
      }, origin);
    }

    // ================================================================
    // EXPORT DATA (GDPR)
    // ================================================================
    if (action === 'export-data') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const encodedUserId = encodeURIComponent(userId);

      // Gather all user data in parallel
      const [users, bookmarks, progress, achievements, unlocked, quizResults, activity, loginHistory] = await Promise.all([
        // User profile
        supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=id,email,name,plan,dob,created_at,last_login,auth_provider`)
          .catch(() => []),
        // Bookmarks from preferences
        getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'bookmarks').catch(() => []),
        // Reading progress
        getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'reading_progress').catch(() => ({})),
        // Achievements
        getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'achievements').catch(() => []),
        // Unlocked articles
        supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks', `?user_id=eq.${encodedUserId}&select=article_slug,unlocked_at`)
          .catch(() => []),
        // Quiz results
        supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results', `?user_id=eq.${encodedUserId}&select=article_slug,score,total,completed_at`)
          .catch(() => []),
        // User activity
        supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'user_activity', `?user_id=eq.${encodedUserId}&select=action,created_at&order=created_at.desc&limit=100`)
          .catch(() => []),
        // Login history
        supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'login_history', `?user_id=eq.${encodedUserId}&select=ip,user_agent,logged_in_at&order=logged_in_at.desc&limit=10`)
          .catch(() => [])
      ]);

      const profile = (Array.isArray(users) && users[0]) ? users[0] : {};

      return cors(200, {
        success: true,
        exportDate: new Date().toISOString(),
        data: {
          profile: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            plan: profile.plan,
            dob: profile.dob,
            created_at: profile.created_at,
            last_login: profile.last_login,
            auth_provider: profile.auth_provider
          },
          bookmarks: bookmarks || [],
          readingProgress: progress || {},
          achievements: achievements || [],
          unlockedArticles: Array.isArray(unlocked) ? unlocked : [],
          quizResults: Array.isArray(quizResults) ? quizResults : [],
          recentActivity: Array.isArray(activity) ? activity : [],
          loginHistory: Array.isArray(loginHistory) ? loginHistory : []
        }
      }, origin);
    }

    // ================================================================
    // LOGIN HISTORY
    // ================================================================
    if (action === 'login-history') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const encodedUserId = encodeURIComponent(userId);

      // Try login_history table; if it doesn't exist, return empty
      let history = [];
      try {
        const result = await supabaseQuery(
          SUPABASE_URL, SUPABASE_KEY, 'login_history',
          `?user_id=eq.${encodedUserId}&select=ip,user_agent,logged_in_at&order=logged_in_at.desc&limit=10`
        );
        if (Array.isArray(result)) {
          history = result;
        }
      } catch (e) {
        // Table doesn't exist, return empty
      }

      // Also get active sessions as fallback context
      let activeSessions = [];
      try {
        const now = new Date().toISOString();
        const sessions = await supabaseQuery(
          SUPABASE_URL, SUPABASE_KEY, 'sessions',
          `?user_id=eq.${encodedUserId}&expires_at=gte.${now}&select=id,created_at,expires_at&order=created_at.desc`
        );
        if (Array.isArray(sessions)) activeSessions = sessions;
      } catch (e) {
        // Ignore
      }

      return cors(200, {
        success: true,
        loginHistory: history,
        activeSessions: activeSessions.length
      }, origin);
    }

    // ================================================================
    // AWARD ACHIEVEMENTS (check + persist)
    // ================================================================
    if (action === 'award-achievement') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const stats = await gatherUserStats(SUPABASE_URL, SUPABASE_KEY, userId);
      const existingAchievements = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'achievements') || [];
      const existingIds = new Set(existingAchievements.map(a => a.id));

      const newlyEarned = [];
      const allEarned = [...existingAchievements];

      for (const def of ACHIEVEMENT_DEFS) {
        if (!existingIds.has(def.id) && def.check(stats)) {
          const entry = {
            id: def.id,
            name: def.name,
            desc: def.desc,
            icon: def.icon,
            earned_at: new Date().toISOString()
          };
          newlyEarned.push(entry);
          allEarned.push(entry);
        }
      }

      if (newlyEarned.length > 0) {
        await savePref(SUPABASE_URL, SUPABASE_KEY, userId, 'achievements', allEarned);
      }

      return cors(200, {
        success: true,
        newAchievements: newlyEarned,
        allAchievements: allEarned
      }, origin);
    }

    // ================================================================
    // GET ACHIEVEMENTS
    // ================================================================
    if (action === 'get-achievements') {
      const { token } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const achievements = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'achievements') || [];

      // Also return possible achievements with unlock status
      const earnedIds = new Set(achievements.map(a => a.id));
      const allDefs = ACHIEVEMENT_DEFS.map(d => ({
        id: d.id,
        name: d.name,
        desc: d.desc,
        icon: d.icon,
        earned: earnedIds.has(d.id),
        earned_at: achievements.find(a => a.id === d.id)?.earned_at || null
      }));

      return cors(200, { success: true, achievements: allDefs, earnedCount: achievements.length }, origin);
    }

    // ================================================================
    // GENERATE CERTIFICATE
    // ================================================================
    if (action === 'generate-certificate') {
      const { token, category } = body;
      if (!token || typeof token !== 'string' || token.length > 128)
        return cors(400, { error: 'Token tidak valid' }, origin);
      if (!category || !CERT_CATEGORIES[category])
        return cors(400, { error: `Kategori tidak valid. Pilih: ${Object.keys(CERT_CATEGORIES).join(', ')}` }, origin);

      const userId = await validateSession(SUPABASE_URL, SUPABASE_KEY, token);
      if (!userId) return cors(401, { error: 'Session tidak valid atau expired' }, origin);

      const encodedUserId = encodeURIComponent(userId);

      // Get user profile for certificate name
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=name,email`);
      if (!users || !users[0]) return cors(404, { error: 'User tidak ditemukan' }, origin);
      const userName = users[0].name || users[0].email;

      // Check unlocked articles for this category
      let unlocked = [];
      try {
        const result = await supabaseQuery(
          SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
          `?user_id=eq.${encodedUserId}&select=article_slug&limit=500`
        );
        if (Array.isArray(result)) unlocked = result;
      } catch (e) {
        // Table may not exist
      }

      // Also check reading progress for completed articles in this category
      const progress = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'reading_progress') || {};
      const completedSlugs = Object.entries(progress)
        .filter(([slug, p]) => p.status === 'completed' && slug.startsWith(category))
        .map(([slug]) => slug);

      const unlockedInCategory = unlocked
        .filter(u => u.article_slug && u.article_slug.startsWith(category))
        .map(u => u.article_slug);

      // Combine unique completed/unlocked articles for this category
      const allArticles = new Set([...unlockedInCategory, ...completedSlugs]);

      // Minimum 3 articles completed in category to earn certificate
      const MIN_ARTICLES = 3;
      if (allArticles.size < MIN_ARTICLES) {
        return cors(200, {
          success: false,
          error: `Anda perlu menyelesaikan minimal ${MIN_ARTICLES} artikel di kategori ${CERT_CATEGORIES[category]}`,
          current: allArticles.size,
          required: MIN_ARTICLES
        }, origin);
      }

      // Generate certificate ID
      const certIdBytes = crypto.getRandomValues(new Uint8Array(8));
      const certId = `CERT-${category.toUpperCase()}-${Array.from(certIdBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

      const certificate = {
        certificateId: certId,
        recipientName: userName,
        category,
        categoryLabel: CERT_CATEGORIES[category],
        articlesCompleted: allArticles.size,
        issuedAt: new Date().toISOString(),
        verificationUrl: `https://beebanelabs.id/verify/${certId}`
      };

      // Save certificate record
      const existingCerts = await getPref(SUPABASE_URL, SUPABASE_KEY, userId, 'certificates') || [];
      existingCerts.push(certificate);
      await savePref(SUPABASE_URL, SUPABASE_KEY, userId, 'certificates', existingCerts);

      return cors(200, { success: true, certificate }, origin);
    }

    // ================================================================
    // INVALID ACTION
    // ================================================================
    return cors(400, { error: 'Action tidak valid' }, origin);

  } catch (e) {
    console.error('Profile error:', e.message || e);
    return cors(500, { error: 'Internal server error' }, origin);
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('origin') || '';
  return cors(200, '', origin);
}

// ================================================================
// HELPERS
// ================================================================

/**
 * Validate a session token. Returns user_id or null.
 */
async function validateSession(supabaseUrl, supabaseKey, token) {
  try {
    const encodedToken = encodeURIComponent(token);
    const sessions = await supabaseQuery(
      supabaseUrl, supabaseKey, 'sessions',
      `?token=eq.${encodedToken}&select=user_id,expires_at`
    );
    if (!sessions || sessions.length === 0) return null;
    if (new Date(sessions[0].expires_at) < new Date()) return null;
    return sessions[0].user_id;
  } catch (e) {
    return null;
  }
}

/**
 * Save a key-value preference to user_preferences table.
 * Silently ignores errors (table may not exist).
 */
async function savePref(url, key, userId, prefKey, prefValue) {
  try {
    const encodedUserId = encodeURIComponent(userId);
    const encodedKey = encodeURIComponent(prefKey);
    const valueStr = JSON.stringify(prefValue);

    // Check if entry exists
    const existing = await supabaseQuery(
      url, key, 'user_preferences',
      `?user_id=eq.${encodedUserId}&key=eq.${encodedKey}&select=id`
    );

    if (Array.isArray(existing) && existing.length > 0) {
      // Update
      await supabaseQuery(
        url, key, 'user_preferences',
        `?id=eq.${encodeURIComponent(existing[0].id)}`, 'PATCH',
        { value: valueStr, updated_at: new Date().toISOString() }
      );
    } else if (Array.isArray(existing)) {
      // Insert
      await supabaseQuery(
        url, key, 'user_preferences', '', 'POST',
        { user_id: userId, key: prefKey, value: valueStr, updated_at: new Date().toISOString() }
      );
    }
  } catch (e) {
    // Table might not exist, silently continue
  }
}

/**
 * Get a preference value from user_preferences table.
 * Returns parsed JSON value, or null.
 */
async function getPref(url, key, userId, prefKey) {
  try {
    const encodedUserId = encodeURIComponent(userId);
    const encodedKey = encodeURIComponent(prefKey);
    const result = await supabaseQuery(
      url, key, 'user_preferences',
      `?user_id=eq.${encodedUserId}&key=eq.${encodedKey}&select=value&limit=1`
    );
    if (Array.isArray(result) && result.length > 0 && result[0].value) {
      try {
        return JSON.parse(result[0].value);
      } catch (e) {
        return result[0].value;
      }
    }
  } catch (e) {
    // Table might not exist
  }
  return null;
}

/**
 * Gather user statistics for achievement checking.
 */
async function gatherUserStats(url, key, userId) {
  const encodedUserId = encodeURIComponent(userId);
  const stats = {
    articlesUnlocked: 0,
    quizzesCompleted: 0,
    hasPerfectQuiz: false,
    streak: 0,
    hasCategoryComplete: false
  };

  // Count unlocked articles
  try {
    const unlocked = await supabaseQuery(
      url, key, 'article_unlocks',
      `?user_id=eq.${encodedUserId}&select=article_slug&limit=1000`
    );
    if (Array.isArray(unlocked)) stats.articlesUnlocked = unlocked.length;
  } catch (e) { /* table may not exist */ }

  // Count quiz results
  try {
    const quizzes = await supabaseQuery(
      url, key, 'quiz_results',
      `?user_id=eq.${encodedUserId}&select=score,total&limit=500`
    );
    if (Array.isArray(quizzes)) {
      stats.quizzesCompleted = quizzes.length;
      stats.hasPerfectQuiz = quizzes.some(q => q.score > 0 && q.total > 0 && q.score === q.total);
    }
  } catch (e) { /* table may not exist */ }

  // Calculate streak from user_activity
  try {
    const activity = await supabaseQuery(
      url, key, 'user_activity',
      `?user_id=eq.${encodedUserId}&select=created_at&order=created_at.desc&limit=100`
    );
    if (Array.isArray(activity) && activity.length > 0) {
      stats.streak = calculateStreak(activity.map(a => a.created_at));
    }
  } catch (e) { /* table may not exist */ }

  // Check category completion
  try {
    const progress = await getPref(url, key, userId, 'reading_progress') || {};
    const categoryCounts = {};
    for (const [slug, p] of Object.entries(progress)) {
      for (const cat of Object.keys(CERT_CATEGORIES)) {
        if (slug.startsWith(cat)) {
          if (!categoryCounts[cat]) categoryCounts[cat] = { total: 0, completed: 0 };
          categoryCounts[cat].total++;
          if (p.status === 'completed') categoryCounts[cat].completed++;
        }
      }
    }
    // A category is "complete" if at least 3 articles completed
    stats.hasCategoryComplete = Object.values(categoryCounts).some(c => c.completed >= 3);
  } catch (e) { /* ignore */ }

  return stats;
}

/**
 * Calculate consecutive-day streak from an array of ISO date strings (newest first).
 */
function calculateStreak(dateStrings) {
  if (!dateStrings || dateStrings.length === 0) return 0;

  const daySet = new Set();
  for (const ds of dateStrings) {
    const d = new Date(ds);
    if (!isNaN(d)) {
      daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  }

  const days = [...daySet].sort().reverse();
  if (days.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const [y1, m1, d1] = days[i - 1].split('-').map(Number);
    const [y2, m2, d2] = days[i].split('-').map(Number);
    const prev = new Date(y1, m1, d1);
    const curr = new Date(y2, m2, d2);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function cors(status, data, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });
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
  const result = await resp.json();
  if (!resp.ok) {
    console.error('Supabase error:', resp.status, JSON.stringify(result).substring(0, 200));
  }
  return result;
}
