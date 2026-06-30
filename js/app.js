/* v18.0.0 - Full Article Sync + Category Fix */
// === EARLY CONTENT GATE (runs before DOM renders) ===
// Prevents "flash of content" on article pages before paywall check
(function earlyContentGate() {
  if (!window.location.pathname.includes('/articles/')) return;
  
  // Check if user has a session token (quick localStorage check)
  let hasSession = false;
  try {
    const raw = localStorage.getItem('beebanelabs_auth');
    if (raw) {
      const session = JSON.parse(raw);
      hasSession = !!(session && session.token && session.user);
    }
  } catch(e) {}
  
  // If no session, hide article content immediately via injected style
  if (!hasSession) {
    const style = document.createElement('style');
    style.id = 'early-content-gate';
    style.textContent = '.article-content{visibility:hidden!important;position:relative}.article-content::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:var(--bg-primary,#08090a);z-index:1;visibility:visible}';
    (document.head || document.documentElement).appendChild(style);
    
    // Also set a flag for the paywall system to check
    window.__earlyGateActive = true;
  }
})();

/* ============================================
   BeebaneLabs - Main JavaScript
   ============================================ */
'use strict';

// === Search Data ===
// Search articles are derived from ALL_ARTICLES below (avoids duplicate data)
let articles = [];

// === Debounce utility ===
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// === Navbar Scroll Effect + Back to Top ===
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', debounce(() => {
  const currentScroll = window.pageYOffset;
  if (navbar) navbar.classList.toggle('scrolled', currentScroll > 50);
  if (backToTop) backToTop.classList.toggle('visible', currentScroll > 400);
}, 16), { passive: true });

// === Mobile Menu Toggle ===
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when link clicked
  for (const link of navLinks.querySelectorAll('a')) {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// === Search Overlay ===
const searchTrigger = document.getElementById('searchTrigger');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function openSearch() {
  if (!searchOverlay || !searchInput) return;
  searchOverlay.classList.add('active');
  searchInput.focus();
}

function closeSearch() {
  if (!searchOverlay || !searchInput || !searchResults) return;
  searchOverlay.classList.remove('active');
  searchInput.value = '';
  searchResults.innerHTML = '<div class="search-hint">Ketik untuk mencari</div>';
}

if (searchTrigger) {
  searchTrigger.addEventListener('click', openSearch);
}

if (searchOverlay) {
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && searchOverlay && !searchOverlay.classList.contains('active') && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    openSearch();
  }
  if (e.key === 'Escape') {
    closeSearch();
  }
});

// Search functionality
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      searchResults.innerHTML = '<div class="search-hint">Ketik minimal 2 karakter untuk mencari</div>';
      return;
    }

    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.desc.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      const safeQuery = query.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      searchResults.innerHTML = '<div class="search-hint">Tidak ada hasil ditemukan untuk "' + safeQuery + '"</div>';
      return;
    }

    searchResults.innerHTML = filtered.map(a => `
      <a href="${a.url}" class="search-result-item">
        <span class="icon">${a.icon}</span>
        <div class="text">
          <h4>${a.title}</h4>
          <p>${a.category} — ${a.desc}</p>
        </div>
      </a>
    `).join('');
  });
}

// Back to top click handler
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// === Scroll Animations ===
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }
}, observerOptions);

for (const el of document.querySelectorAll('.fade-in')) {
  observer.observe(el);
}

// Safety: force all fade-in elements visible after 3s max
// Prevents invisible content if observer fails or user has reduced motion
setTimeout(() => {
  for (const el of document.querySelectorAll('.fade-in:not(.visible)')) {
    el.classList.add('visible');
  }
}, 3000);

// Also handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const el of document.querySelectorAll('.fade-in')) {
    el.classList.add('visible');
  }
}

// === Newsletter Subscribe ===
async function handleSubscribe(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input');
  const btn = form.querySelector('button');
  const email = input.value.trim();

  if (!email || !email.includes('@')) {
    btn.textContent = '❌ Email tidak valid';
    btn.style.background = '#ef4444';
    setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.background = ''; }, 2000);
    return;
  }

  // Disable button and show loading
  btn.disabled = true;
  btn.classList.add('btn-loading');
  const origText = btn.textContent;
  btn.textContent = '⏳ Mengirim...';

  try {
    const API_BASE = window.location.origin;
    const res = await fetch(API_BASE + '/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Server error' }));
      throw new Error(data.error || 'Server error');
    }
    const data = await res.json();
    if (data.success) {
      btn.textContent = '✓ ' + (data.message || 'Tersubscribe!');
      btn.style.background = '#10b981';
      input.value = '';
      if (typeof Toast !== 'undefined') Toast.show('Berhasil subscribe!', 'success');
    } else {
      throw new Error(data.error || 'Server error');
    }
  } catch (err) {
    btn.textContent = '✓ Tersubscribe!';
    btn.style.background = '#10b981';
    input.value = '';
  } finally {
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
      btn.disabled = false;
      btn.classList.remove('btn-loading');
    }, 3500);
  }
}

// === Code Copy Button ===
for (const btn of document.querySelectorAll('.code-copy')) {
  btn.addEventListener('click', () => {
    const code = btn.closest('.code-block').querySelector('pre').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }).catch(() => {
      // Clipboard access denied - fallback
      if (typeof Toast !== 'undefined') Toast.show('Gagal menyalin kode', 'error');
    });
  });
}

// === Copy to clipboard utility ===
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// === Quiz System ===
// QuizManager: handles quiz validation, server-side save, retry, and best score tracking
const QuizManager = {
  STORAGE_KEY: 'beebanelabs_quiz_cache',

  // Get cached quiz results from localStorage
  getCache() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch { return {}; }
  },

  // Save to localStorage cache
  saveCache(articleSlug, quizId, result) {
    try {
      const cache = this.getCache();
      const key = `${articleSlug}:${quizId}`;
      if (!cache[key] || result.score > cache[key].score) {
        cache[key] = result;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
      }
    } catch (e) {}
  },

  // Get cached result for a quiz
  getCachedResult(articleSlug, quizId) {
    const cache = this.getCache();
    return cache[`${articleSlug}:${quizId}`] || null;
  },

  // Save quiz result to server
  async saveToServer(articleSlug, quizId, score, total, percent, passed, answers) {
    try {
      const sessionToken = AuthSystem.getSessionToken ? AuthSystem.getSessionToken() :
        (JSON.parse(localStorage.getItem('beebanelabs_auth') || '{}').token);
      if (!sessionToken) return { success: false, reason: 'no_session' };

      const resp = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          action: 'save',
          articleSlug,
          quizId,
          score,
          total,
          percent,
          passed,
          answers
        })
      });
      return await resp.json();
    } catch (e) {
      return { success: false, reason: 'network_error' };
    }
  },

  // Check if quiz already completed on server
  async checkServer(articleSlug, quizId) {
    try {
      const sessionToken = AuthSystem.getSessionToken ? AuthSystem.getSessionToken() :
        (JSON.parse(localStorage.getItem('beebanelabs_auth') || '{}').token);
      if (!sessionToken) return null;

      const resp = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          action: 'check',
          articleSlug,
          quizId
        })
      });
      const data = await resp.json();
      return data.hasCompleted ? data.result : null;
    } catch { return null; }
  },

  // Get article slug from current URL
  getArticleSlug() {
    const path = window.location.pathname;
    const match = path.match(/articles\/([^/.]+)\.html/);
    return match ? match[1] : path.split('/').pop().replace('.html', '');
  }
};

function initQuiz(quizId, answers) {
  const container = document.getElementById(quizId);
  if (!container) return;

  const articleSlug = QuizManager.getArticleSlug();
  let score = 0;
  let answered = 0;
  const total = answers.length;
  const options = container.querySelectorAll('.quiz-option');
  const resultEl = container.querySelector('.quiz-result');
  const submitBtn = container.querySelector('.quiz-btn');
  const selected = {};

  // Standardize button text
  if (submitBtn) {
    submitBtn.textContent = '📝 Periksa Jawaban';
  }

  // Add retry button (hidden initially)
  let retryBtn = container.querySelector('.quiz-retry-btn');
  if (!retryBtn && submitBtn) {
    retryBtn = document.createElement('button');
    retryBtn.className = 'quiz-retry-btn quiz-btn';
    retryBtn.textContent = '🔄 Coba Lagi';
    retryBtn.style.display = 'none';
    retryBtn.style.marginLeft = '10px';
    submitBtn.parentNode.insertBefore(retryBtn, submitBtn.nextSibling);
  }

  // Add best score indicator
  let bestScoreEl = container.querySelector('.quiz-best-score');
  if (!bestScoreEl) {
    bestScoreEl = document.createElement('div');
    bestScoreEl.className = 'quiz-best-score';
    bestScoreEl.style.cssText = 'text-align:center;margin-top:8px;font-size:0.85em;color:var(--text-subtle,#80848b);';
    if (resultEl) resultEl.parentNode.insertBefore(bestScoreEl, resultEl);
  }

  // Check cached result and show best score
  const cached = QuizManager.getCachedResult(articleSlug, quizId);
  if (cached) {
    bestScoreEl.textContent = `🏆 Skor terbaik: ${cached.score}/${cached.total} (${cached.percent}%)`;
    if (cached.passed) {
      bestScoreEl.style.color = '#22c55e';
    }
  }

  // Check server for completion (async, non-blocking)
  QuizManager.checkServer(articleSlug, quizId).then(serverResult => {
    if (serverResult) {
      const srvScore = serverResult.score;
      const srvTotal = serverResult.total;
      const srvPercent = Math.round(parseFloat(serverResult.percent));
      bestScoreEl.textContent = `🏆 Skor terbaik: ${srvScore}/${srvTotal} (${srvPercent}%)`;
      if (serverResult.passed) {
        bestScoreEl.style.color = '#22c55e';
      }
      // Also update local cache
      QuizManager.saveCache(articleSlug, quizId, {
        score: srvScore, total: srvTotal, percent: srvPercent, passed: serverResult.passed
      });
    }
  });

  // Option click handler
  for (const opt of options) {
    opt.addEventListener('click', () => {
      const qIndex = opt.dataset.question;
      for (const o of container.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`)) {
        o.classList.remove('selected');
      }
      opt.classList.add('selected');
      selected[qIndex] = opt.dataset.answer;
    });
  }

  // Reset quiz function
  function resetQuiz() {
    score = 0;
    answered = 0;
    for (const k in selected) delete selected[k];

    for (const o of options) {
      o.classList.remove('selected', 'correct', 'wrong');
      o.style.pointerEvents = '';
    }

    resultEl.className = 'quiz-result';
    resultEl.innerHTML = '';
    submitBtn.style.display = '';
    if (retryBtn) retryBtn.style.display = 'none';
  }

  // Retry button handler
  if (retryBtn) {
    retryBtn.addEventListener('click', resetQuiz);
  }

  // Submit button handler
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (Object.keys(selected).length < total) {
        Toast.show('Silakan jawab semua pertanyaan terlebih dahulu!', 'warning');
        return;
      }

      // Calculate score
      score = 0;
      const userAnswers = [];
      for (let i = 0; i < answers.length; i++) {
        const correct = answers[i];
        for (const o of container.querySelectorAll(`.quiz-option[data-question="${i}"]`)) {
          o.classList.remove('selected');
          if (o.dataset.answer === correct) {
            o.classList.add('correct');
          } else if (selected[i] === o.dataset.answer && o.dataset.answer !== correct) {
            o.classList.add('wrong');
          }
          o.style.pointerEvents = 'none';
        }
        if (selected[i] === correct) score++;
        userAnswers.push({ question: i, selected: selected[i], correct });
      }

      const percent = Math.round((score / total) * 100);
      const passed = percent >= 60;

      // Show result
      if (passed) {
        resultEl.className = 'quiz-result pass';
        resultEl.innerHTML = `🎉 Selamat! Kamu menjawab benar ${score}/${total} (${percent}%). Quiz: LOLOS!`;
      } else {
        resultEl.className = 'quiz-result fail';
        resultEl.innerHTML = `😢 Kamu menjawab benar ${score}/${total} (${percent}%). Coba baca ulang materinya ya!`;
      }

      // Hide submit, show retry
      submitBtn.style.display = 'none';
      if (retryBtn) retryBtn.style.display = '';

      // Save to localStorage cache
      QuizManager.saveCache(articleSlug, quizId, { score, total, percent, passed });

      // Update best score display
      const currentBest = QuizManager.getCachedResult(articleSlug, quizId);
      if (currentBest) {
        bestScoreEl.textContent = `🏆 Skor terbaik: ${currentBest.score}/${currentBest.total} (${currentBest.percent}%)`;
        bestScoreEl.style.color = currentBest.passed ? '#22c55e' : '';
      }

      // Save to server (async, non-blocking)
      const serverResult = await QuizManager.saveToServer(
        articleSlug, quizId, score, total, percent, passed, userAnswers
      );

      if (serverResult.success) {
        if (serverResult.isNewRecord) {
          Toast.show('🏆 Rekor baru! Skor terbaik tercatat.', 'success');
        }
        // Update best score from server
        if (serverResult.bestScore !== undefined) {
          bestScoreEl.textContent = `🏆 Skor terbaik: ${serverResult.bestScore}/${total} (${serverResult.bestPercent}%)`;
          bestScoreEl.style.color = serverResult.passed ? '#22c55e' : '';
        }
      } else if (serverResult.reason === 'no_session') {
        // Not logged in - only local save
      }
    });
  }
}

// === Tab System ===
function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tabs = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      for (const t of tabs) t.classList.remove('active');
      for (const p of panels) p.classList.remove('active');

      tab.classList.add('active');
      const target = container.querySelector(`#${tab.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  }
}

// === SCROLL REVEAL ANIMATION ===
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  for (const el of revealElements) observer.observe(el);

  // Fallback: force all .reveal to .active after 1.5s
  // (IntersectionObserver can miss elements on some browsers/devices)
  setTimeout(() => {
    for (const el of document.querySelectorAll('.reveal:not(.active)')) {
      el.classList.add('active');
    }
  }, 1500);
}

// === ADD REVEAL CLASSES TO SECTIONS ===
function addRevealClasses() {
  // Add reveal class to main sections
  const sections = document.querySelectorAll('.categories-section, .articles-section, .newsletter-section, .tags-section');
  let idx = 0;
  for (const section of sections) {
    section.classList.add('reveal');
    if (idx > 0) section.classList.add(`reveal-delay-${Math.min(idx, 5)}`);
    idx++;
  }

  // Add reveal to category cards with stagger
  idx = 0;
  for (const card of document.querySelectorAll('.category-card')) {
    card.classList.add('reveal', `reveal-delay-${(idx % 5) + 1}`);
    idx++;
  }

  // Add reveal to article cards with stagger
  idx = 0;
  for (const card of document.querySelectorAll('.article-card')) {
    card.classList.add('reveal', `reveal-delay-${(idx % 3) + 1}`);
    idx++;
  }
}

// === PARTICLE EFFECT (Global - covers entire page) ===
function initParticles() {
  // Create a fixed-position particle container for the ENTIRE page
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'global-particles';
  particlesContainer.setAttribute('aria-hidden', 'true');

  // Create 15 particles with random positions
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'global-particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${15 + Math.random() * 25}s`;
    particle.style.animationDelay = `${-Math.random() * 20}s`;
    particlesContainer.appendChild(particle);
  }

  // Insert as first child of body so it's behind everything
  document.body.insertBefore(particlesContainer, document.body.firstChild);
}

// === COUNTER ANIMATION ===
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  for (const counter of counters) {
    const target = parseInt(counter.textContent.replace(/\D/g, ''));
    const suffix = counter.textContent.replace(/\d/g, '');
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target + suffix;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current) + suffix;
      }
    }, 30);
  }
}

// === PREMIUM VISUAL ENHANCEMENTS (v8.0) ===

// Mouse-Follow Glow on Category Cards
function initMouseGlow() {
  for (const card of document.querySelectorAll('.category-card')) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  }
}

// Section Dividers (auto-insert between major sections)
function initSectionDividers() {
  const sections = document.querySelectorAll('.categories-section, .articles-section, .newsletter-section');
  for (const section of sections) {
    if (!section.previousElementSibling?.classList.contains('section-divider')) {
      const hr = document.createElement('hr');
      hr.className = 'section-divider';
      section.parentNode.insertBefore(hr, section);
    }
  }
}

// === v9.7 PREMIUM FEATURES ===

// Reading Progress Bar (article pages only)
function initReadingProgressBar() {
  const articleContent = document.querySelector('.article-content');
  if (!articleContent) return;
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.id = 'readingProgress';
  document.body.prepend(bar);
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Reading Time Estimate (article pages)
function initReadingTimeEstimate() {
  const articleContent = document.querySelector('.article-content');
  if (!articleContent) return;
  const totalWords = articleContent.textContent.split(/\s+/).filter(w => w.length > 0).length;
  const totalMinutes = Math.max(1, Math.ceil(totalWords / 200));
  // Add badge near article title
  const badge = document.createElement('span');
  badge.className = 'reading-time-badge';
  badge.textContent = '⏱ ~' + totalMinutes + ' menit baca';
  const h1 = document.querySelector('.article-content h1') || document.querySelector('article h1') || document.querySelector('h1');
  if (h1) {
    h1.insertAdjacentElement('afterend', badge);
  }
  // Also keep the floating "menit tersisa" indicator
  const indicator = document.createElement('div');
  indicator.className = 'reading-time-remaining';
  indicator.textContent = totalMinutes + ' menit tersisa';
  document.body.appendChild(indicator);
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        const remaining = Math.max(1, Math.ceil(totalMinutes * (1 - progress)));
        indicator.textContent = remaining + ' menit tersisa';
        indicator.classList.toggle('visible', scrollTop > 300 && scrollTop < docHeight - 200);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Syntax Highlighting with Prism.js (article pages)
function initSyntaxHighlighting() {
  const articleContent = document.querySelector('.article-content');
  if (!articleContent) return;
  // Auto-detect language for unlabeled code blocks
  document.querySelectorAll('.article-content pre code').forEach(block => {
    if (!block.className.match(/language-/)) {
      const text = block.textContent;
      if (text.match(/^(import |from |def |class |print\(|if __name__|#!\/)/m) || text.match(/pip install/)) {
        block.classList.add('language-python');
      } else if (text.match(/^(const |let |var |function |=>|document\.|console\.|require\(|import .* from)/m)) {
        block.classList.add('language-javascript');
      } else if (text.match(/^(#include|void setup|void loop|digitalWrite|analogRead|Serial\.)/m)) {
        block.classList.add('language-c');
      } else if (text.match(/^(SELECT |INSERT |UPDATE |DELETE |CREATE TABLE|ALTER )/im)) {
        block.classList.add('language-sql');
      } else if (text.match(/^(sudo |apt |npm |yarn |git |curl |wget |cd |ls |mkdir |echo )/m)) {
        block.classList.add('language-bash');
      } else if (text.match(/^\s*[{\[]/) && text.match(/["':]/)) {
        block.classList.add('language-json');
      } else if (text.match(/^(---|\.\.\.|[\w-]+:)/m) && !text.match(/[{}();]/)) {
        block.classList.add('language-yaml');
      }
    }
  });
  // Load Prism CSS theme
  if (!document.querySelector('link[href*="prism"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-okaidia.min.css';
    document.head.appendChild(link);
  }
  // Load Prism core
  const prismUrl = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js';
  if (document.querySelector('script[src="' + prismUrl + '"]')) {
    if (typeof Prism !== 'undefined') Prism.highlightAll();
    return;
  }
  const script = document.createElement('script');
  script.src = prismUrl;
  script.async = true;
  script.onload = () => {
    const langComponents = [
      'python', 'c', 'cpp', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown'
    ];
    let loaded = 0;
    const total = langComponents.length;
    langComponents.forEach(lang => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-' + lang + '.min.js';
      s.async = true;
      s.onload = () => {
        loaded++;
        if (loaded === total && typeof Prism !== 'undefined') {
          Prism.highlightAll();
        }
      };
      document.head.appendChild(s);
    });
    // Also highlight after core loads (for javascript which is in core)
    if (typeof Prism !== 'undefined') Prism.highlightAll();
  };
  document.head.appendChild(script);
}

// Service Worker Registration
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// === CONFIGURATION ===
const SITE_CONFIG = {
  API_BASE: window.location.origin,
  APP_VERSION: '18.0',
  TOKEN_PRICE: 10000,
  INITIAL_TOKENS: 5
};

// === PATH HELPER (fix relative links in subdirectories) ===
function getBasePath() {
  const path = window.location.pathname;
  // If in /articles/ or /kategori/ subdirectory, go up one level
  if (path.includes('/articles/') || path.includes('/kategori/')) {
    return '../';
  }
  return '';
}

function getAbsolutePage(page) {
  return getBasePath() + page;
}

// === CSRF TOKEN (double-submit pattern) ===
const CSRF = {
  _KEY: 'beebanelabs_csrf',
  getToken() {
    let token = sessionStorage.getItem(this._KEY);
    if (!token) {
      token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem(this._KEY, token);
    }
    return token;
  },
  // Returns headers object with X-CSRF-Token for fetch calls
  getHeaders() {
    return { 'Content-Type': 'application/json', 'X-CSRF-Token': this.getToken() };
  }
};

// === PAYWALL SYSTEM (SERVER-ONLY DATA) ===
const PaywallSystem = {
  TOKEN_ENDPOINT: '/api/tokens',
  UNLOCKED_ENDPOINT: '/api/unlocked-articles',
  // In-memory cache (NOT localStorage - server is source of truth)
  _serverTokens: null,
  _unlockedCache: null,
  _lastSyncTime: 0,
  _syncCooldown: 5000, // 5 seconds cooldown between syncs

  hasPaidAccess() {
    // No premium plan - all access is via tokens
    return false;
  },

  // Free article rules: all Pemula + all IT Career
  isArticleFree(slug) {
    const article = typeof ALL_ARTICLES !== 'undefined' ? ALL_ARTICLES.find(a => a.slug === slug) : null;
    if (article) {
      if (article.diff === 'pemula') return true;
      if (article.cat === 'IT Career') return true;
    }
    // Fallback: check category page difficulty badge for articles not in ALL_ARTICLES
    const diffBadge = document.querySelector('.difficulty');
    if (diffBadge && diffBadge.classList.contains('pemula')) return true;
    // Check if IT Career page
    const articleSection = document.querySelector('meta[name="article:section"], meta[property="article:section"]');
    if (articleSection && articleSection.content === 'IT Career') return true;
    return false;
  },

  getTokens() {
    if (this._serverTokens !== null) return this._serverTokens;
    return SITE_CONFIG.INITIAL_TOKENS;
  },

  // Check if article is unlocked (from memory cache)
  isUnlocked(slug) {
    if (!this._unlockedCache) return false;
    return this._unlockedCache.includes(slug);
  },

  // Get all unlocked articles (from memory cache)
  getUnlocked() {
    return this._unlockedCache || [];
  },

  // Sync from server - ONLY place that updates cache
  async syncFromServer() {
    const now = Date.now();
    if (now - this._lastSyncTime < this._syncCooldown) return;
    
    const session = (typeof AuthSystem !== 'undefined') ? AuthSystem.getSession() : null;
    if (!session || !session.token) {
      this._unlockedCache = [];
      this._serverTokens = null;
      return;
    }
    
    try {
      const res = await fetch(this.UNLOCKED_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.token })
      });
      if (!res.ok) return;
      const data = await res.json();
      
      if (data.articles) {
        this._unlockedCache = data.articles.map(a => a.slug);
      }
      
      if (data.tokens !== undefined) {
        this._serverTokens = data.tokens;
      }
      
      this._lastSyncTime = Date.now();
      
      // Update navbar
      if (typeof AuthSystem !== 'undefined' && AuthSystem.updateNavbar) {
        AuthSystem.updateNavbar();
      }
      
      // Re-render articles if on homepage
      if (typeof renderGroupedArticles === 'function') {
        renderGroupedArticles('all');
      }
    } catch(e) {
      console.error('Sync from server failed:', e);
    }
  },

  // Force refresh from server
  async forceRefresh() {
    this._lastSyncTime = 0;
    await this.syncFromServer();
  },

  async serverCheckAccess(articleSlug) {
    const session = (typeof AuthSystem !== 'undefined') ? AuthSystem.getSession() : null;
    if (!session || !session.token) return { access: false, tokens: this.getTokens(), plan: 'free' };
    try {
      const res = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-access', token: session.token, articleSlug })
      });
      if (!res.ok) return { access: this.isUnlocked(articleSlug), tokens: this.getTokens(), plan: 'free' };
      const data = await res.json();
      if (data.tokens !== undefined) this._serverTokens = data.tokens;
      return data;
    } catch(e) {
      return { access: this.isUnlocked(articleSlug), tokens: this.getTokens(), plan: 'free' };
    }
  },

  async serverUseToken(articleSlug) {
    const session = (typeof AuthSystem !== 'undefined') ? AuthSystem.getSession() : null;
    if (!session || !session.token) return { success: false, error: 'Login diperlukan' };
    try {
      const res = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'use-token', token: session.token, articleSlug })
      });
      if (!res.ok) return { success: false, error: 'Server error' };
      const data = await res.json();
      if (data.success) {
        if (data.tokens !== undefined) this._serverTokens = data.tokens;
        // Add to local cache immediately
        if (!this._unlockedCache) this._unlockedCache = [];
        if (!this._unlockedCache.includes(articleSlug)) {
          this._unlockedCache.push(articleSlug);
        }
        if (typeof AuthSystem !== 'undefined' && AuthSystem.updateNavbar) AuthSystem.updateNavbar();
      }
      return data;
    } catch(e) {
      return { success: false, error: 'Gagal terhubung ke server' };
    }
  },

  isAccessible(f) {
    if (this.hasPaidAccess()) return true;
    return this.isUnlocked(f);
  },

  init() {
    const p = window.location.pathname;
    if (!p.includes('/articles/')) return;
    const f = p.split('/').pop();
    this._checkAndRender(f);
  },

  async _checkAndRender(slug) {
    // Skip paywall for free articles (Pemula + IT Career)
    if (this.isArticleFree(slug)) {
      const gateStyle = document.getElementById('early-content-gate');
      if (gateStyle) gateStyle.remove();
      return;
    }
    const logged = typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn();
    if (!logged) {
      const localUnlocked = this.isUnlocked(slug);
      if (localUnlocked || this.hasPaidAccess()) {
        // Remove early content gate
        const gateStyle = document.getElementById('early-content-gate');
        if (gateStyle) gateStyle.remove();
        return;
      }
      this.showTokenGate(slug, this.getTokens(), false);
      return;
    }
    const result = await this.serverCheckAccess(slug);
    if (result.access) {
      // Remove early content gate - user has access
      const gateStyle = document.getElementById('early-content-gate');
      if (gateStyle) gateStyle.remove();
      return;
    }
    this.showTokenGate(slug, result.tokens || 0, true);
    if (typeof AuthSystem !== 'undefined' && AuthSystem.updateNavbar) AuthSystem.updateNavbar();
  },

  showTokenGate(f, tokens, logged) {
    // FIX: Remove early-content-gate so lock screen is visible (v18.1)
    const earlyGate = document.getElementById('early-content-gate');
    if (earlyGate) earlyGate.remove();
    // Security: Sanitize slug to prevent DOM XSS (CWE-79)
    f = String(f || '').replace(/[^a-zA-Z0-9\-\_\.]/g, '');
    const a = document.querySelector('.article-content');
    if (!a) return;
    const t = tokens !== undefined ? tokens : this.getTokens();
    while (a.firstChild) a.removeChild(a.firstChild);

    let icon, badge, msg, btns;
    if (t <= 0 && !logged) {
      icon = '\u{1f512}'; badge = 'Token Habis';
      msg = 'Token gratis kamu sudah habis. Login atau beli token untuk membuka artikel.';
      btns = '<button onclick="AuthSystem.showModal()" class="btn-primary" style="margin:0 8px;">\u{1f464} Login</button><a href="../pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">\u{1f4b0} Beli Token</a>';
    } else if (t <= 0 && logged) {
      icon = '\u{1f512}'; badge = 'Token Habis';
      msg = 'Token sudah habis. Beli token tambahan untuk membuka lebih banyak artikel.';
      btns = '<a href="../pricing.html" class="btn-primary" style="text-decoration:none;">\u{1f4b0} Beli Token</a>';
    } else {
      icon = '\u{1f513}'; badge = t + ' Token Tersisa';
      msg = logged
        ? 'Gunakan 1 token untuk membuka artikel ini. Token disimpan di server.'
        : 'Login untuk menggunakan token. Token disimpan di server.';
      if (logged) {
        btns = '<button onclick="PaywallSystem.unlockWithToken(\'' + f + '\')" class="btn-primary" style="margin:0 8px;">\u{1f511} Gunakan 1 Token</button><a href="../pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">\u{1f4b0} Beli Token</a>';
      } else {
        btns = '<button onclick="AuthSystem.showModal()" class="btn-primary" style="margin:0 8px;">\u{1f464} Login untuk Unlock</button><a href="../pricing.html" class="btn-secondary" style="margin:0 8px;text-decoration:none;">\u{1f4b0} Beli Token</a>';
      }
    }
    a.innerHTML = '<div style="text-align:center;padding:60px 20px;"><div style="font-size:4rem;margin-bottom:16px;">' + icon + '</div><div style="display:inline-block;background:rgba(251,146,60,0.15);border:1px solid rgba(251,146,60,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-weight:600;color:#fb923c;margin-bottom:16px;">' + badge + '</div><h2 style="color:var(--text-primary);margin-bottom:8px;">Artikel Terkunci</h2><p style="color:var(--text-muted);max-width:480px;margin:0 auto 24px;line-height:1.6;">' + msg + '</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' + btns + '</div></div>';
  },

  async unlockWithToken(f) {
    const logged = typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn();
    if (!logged) { AuthSystem.showModal(); return; }
    // FIX: Show loading state on the unlock button
    const btn = document.querySelector('.btn-primary[onclick*="unlockWithToken"]');
    if (btn) { btn.classList.add('btn-loading'); btn.disabled = true; }
    try {
      const result = await this.serverUseToken(f);
      if (result.success) {
        Toast.show(result.message || 'Artikel dibuka!', 'success');
        window.location.reload();
      } else {
        Toast.show(result.error || 'Gagal membuka artikel', 'error');
      }
    } finally {
      if (btn) { btn.classList.remove('btn-loading'); btn.disabled = false; }
    }
  },
};
// === AUTH SYSTEM ===
// === SUPABASE CLIENT FOR GOOGLE AUTH ===
// Replace these with your actual Supabase project values
const SUPABASE_URL = 'https://nbungbznljbiddlwyvbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idW5nYnpubGpiaWRkbHd5dmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjM3NTksImV4cCI6MjA5NzUzOTc1OX0.FGe3OLY0iQ5DJuWU9kGcEt2JQH2TQARdShqfftMrgwk';

let supabaseClient = null;
function getSupabaseClient() {
  // Try multiple global names (UMD builds vary)
  const sb = window.supabase || window.Supabase || null;
  const factory = sb && (sb.createClient || sb.create_client || null);
  if (!supabaseClient && factory) {
    supabaseClient = factory(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
  }
  return supabaseClient;
}

// Handle OAuth redirect callback on page load
(async function handleOAuthCallback() {
  // Check URL for OAuth indicators
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const queryParams = new URLSearchParams(window.location.search);
  const hasAccessToken = hashParams.has('access_token');
  const hasCode = queryParams.has('code');
  
  // Only proceed if this is an OAuth callback
  if (!hasAccessToken && !hasCode) return;
  
  // Wait for Supabase JS to load (up to 5 seconds)
  let attempts = 0;
  while (!window.supabase && attempts < 50) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  
  const client = getSupabaseClient();
  if (!client) {
    console.error('Supabase client not available after waiting');
    return;
  }
  
  try {
    // Supabase JS handles the OAuth callback automatically with detectSessionInUrl
    const { data: { session }, error } = await client.auth.getSession();
    if (session && session.user) {
      await handleGoogleAuthSuccess(session);
      // Clean URL (remove hash/query fragments)
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('OAuth session error:', error);
    }
  } catch (err) {
    console.error('OAuth callback error:', err);
  }
})();

// Handle successful Google authentication
async function handleGoogleAuthSuccess(session) {
  const user = session.user;
  const email = user.email;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
  const avatar = user.user_metadata?.avatar_url || '';
  
  // Call our backend to create/link user and get session token
  try {
    const response = await fetch('/api/google-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        name: name,
        avatar: avatar,
        google_id: user.id,
        supabase_token: session.access_token
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.session) {
      // Save session using existing AuthSystem
      AuthSystem.saveSession(result.session);
      AuthSystem.updateNavbar();
      
      // Show success message
      if (typeof Toast !== 'undefined') {
        Toast.show('Berhasil login dengan Google!', 'success');
      }
      
      // Reload after short delay
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.error('Google auth backend error:', result.error);
      if (typeof Toast !== 'undefined') {
        Toast.show('Gagal login: ' + (result.error || 'Terjadi kesalahan'), 'error');
      }
    }
  } catch (err) {
    console.error('Google auth fetch error:', err);
    if (typeof Toast !== 'undefined') {
      Toast.show('Gagal terhubung ke server', 'error');
    }
  }
}

const AuthSystem = {
  API_BASE: window.location.origin,
  AUTH_ENDPOINT: '/api/auth',
  STORAGE_KEY: 'beebanelabs_auth',
  VIEW_KEY: 'beebanelabs_views',
  INITIAL_TOKENS: 5,

  // Email obfuscation - never store plain email in localStorage
  _obfuscateEmail(email) {
    // Store as base64 reversed + split to prevent casual reading
    return btoa(email.split('').reverse().join(''));
  },

  _deobfuscateEmail(encoded) {
    try { return atob(encoded).split('').reverse().join(''); }
    catch(e) { return ''; }
  },

  _maskEmail(email) {
    // Show as u***@domain.com for display
    if (!email || !email.includes('@')) return '***';
    const [user, domain] = email.split('@');
    return user[0] + '***@' + domain;
  },

  init() {
    // === AGGRESSIVE CLEANUP: Remove ALL old/insecure localStorage data ===
    // Remove legacy user data (insecure plaintext auth from old versions)
    try {
      localStorage.removeItem('beebanelabs_users');
    } catch(e) {}

    // Version-based cleanup: if app version changed, clear ALL old data
    try {
      const storedVersion = localStorage.getItem('beebanelabs_app_version');
      if (storedVersion !== SITE_CONFIG.APP_VERSION) {
        // New version detected — clear stale auth and cache data
        const keysToKeep = new Set(['beebanelabs_auth', 'beebanelabs_session_id', 'beebanelabs_viewed', 'beebanelabs_csrf', 'beebanelabs_tokens']);
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          allKeys.push(localStorage.key(i));
        }
        for (const key of allKeys) {
          if (key && key.startsWith('beebanelabs_') && !keysToKeep.has(key)) {
            localStorage.removeItem(key);
          }
        }
        localStorage.setItem('beebanelabs_app_version', SITE_CONFIG.APP_VERSION);
      }
    } catch(e) {}

    // Force logout if session is older than 7 days
    this._enforceSessionExpiry();

    this.checkSession();
    this.createLoginModal();
    this.updateNavbar();
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const dd = document.getElementById('userDropdown');
      if (dd && !dd.contains(e.target)) dd.classList.remove('open');
    });
  },

  getSession() {
    const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null');
    if (raw && raw.user && raw.user.email) {
      // Deobfuscate email for internal use
      raw.user.email = this._deobfuscateEmail(raw.user.email);
    }
    return raw;
  },

  saveSession(data) {
    // Obfuscate email before storing
    const safe = JSON.parse(JSON.stringify(data));
    if (safe.user && safe.user.email) {
      safe.user.email = this._obfuscateEmail(safe.user.email);
    }
    // Add login timestamp for session expiry enforcement
    if (!safe._createdAt) {
      safe._createdAt = new Date().toISOString();
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safe));
    // Sync unlocked articles from server after login
    if (typeof PaywallSystem !== 'undefined' && PaywallSystem.syncFromServer) {
      setTimeout(() => PaywallSystem.syncFromServer(), 500);
    }
  },

  checkSession() {
    const session = this.getSession();
    if (session && session.user) {
      // Sync server token balance to memory cache (NOT localStorage)
      if (session.user.tokens !== undefined && typeof PaywallSystem !== 'undefined') {
        PaywallSystem._serverTokens = session.user.tokens;
      }
      return true;
    }
    return false;
  },

  _enforceSessionExpiry() {
    // Force logout if session is older than 7 days
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      // Check if session has a created_at or login timestamp
      const sessionTime = session._createdAt || session.loginAt || null;
      if (sessionTime) {
        const ageMs = Date.now() - new Date(sessionTime).getTime();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        if (ageMs > SEVEN_DAYS_MS) {
          // Session expired — clear it silently
          localStorage.removeItem(this.STORAGE_KEY);
          localStorage.removeItem('beebanelabs_access');
          // Also invalidate server-side session (fire-and-forget)
          if (session.token) {
            try {
              fetch(this.AUTH_ENDPOINT, {
                method: 'POST',
                headers: typeof CSRF !== 'undefined' ? CSRF.getHeaders() : { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout', token: session.token })
              }).catch(function() {});
            } catch(e) {}
          }
        }
      }
    } catch(e) {}
  },

  isLoggedIn() {
    const s = this.getSession();
    return s && s.user && s.user.email;
  },

  getUser() {
    const s = this.getSession();
    return s ? s.user : null;
  },

  async logout() {
    // Get session data before clearing, to notify server
    const session = this.getSession();
    // Server-side session invalidation (fire-and-forget)
    if (session && session.token) {
      try {
        fetch(this.AUTH_ENDPOINT, {
          method: 'POST',
          headers: typeof CSRF !== 'undefined' ? CSRF.getHeaders() : { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout', token: session.token })
        }).catch(function() {});
      } catch (e) {
        // Server unavailable — local session already cleared
      }
    }
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('beebanelabs_access');
    // Clear in-memory cache (NOT localStorage)
    if (typeof PaywallSystem !== 'undefined') {
      PaywallSystem._serverTokens = null;
      PaywallSystem._unlockedCache = null;
      PaywallSystem._lastSyncTime = 0;
    }
    this.updateNavbar();
    window.location.reload();
  },

  async loginWithGoogle() {
    const btn = document.getElementById('googleLoginBtn');
    if (btn) {
      btn.classList.add('loading');
      btn.querySelector('.google-text').textContent = 'Menghubungkan...';
    }
    
    const client = getSupabaseClient();
    if (!client) {
      if (typeof Toast !== 'undefined') {
        Toast.show('Supabase belum dikonfigurasi. Hubungi admin.', 'error');
      }
      if (btn) {
        btn.classList.remove('loading');
        btn.querySelector('.google-text').textContent = 'Masuk dengan Google';
      }
      return;
    }
    
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        if (typeof Toast !== 'undefined') {
          Toast.show('Gagal login Google: ' + error.message, 'error');
        }
        if (btn) {
          btn.classList.remove('loading');
          btn.querySelector('.google-text').textContent = 'Masuk dengan Google';
        }
      }
      // If success, user will be redirected to Google
    } catch (err) {
      console.error('Google login error:', err);
      if (btn) {
        btn.classList.remove('loading');
        btn.querySelector('.google-text').textContent = 'Masuk dengan Google';
      }
    }
  },

  createLoginModal() {
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Masuk atau Daftar');
    modal.innerHTML = `
      <div class="auth-modal">
        <button class="auth-close" aria-label="Tutup dialog masuk" onclick="AuthSystem.closeModal()">&times;</button>
        <div style="text-align:center; margin-bottom:20px;">
          <div style="font-size:2.5rem; margin-bottom:8px;">⚡</div>
          <h2 style="margin-bottom:4px;">Selamat Datang di BeebaneLabs</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">Masuk atau daftar untuk melanjutkan</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" onclick="AuthSystem.switchTab('login')">Masuk</button>
          <button class="auth-tab" onclick="AuthSystem.switchTab('register')">Daftar</button>
        </div>

        <!-- Google Login Button -->
        <button type="button" class="google-login-btn" id="googleLoginBtn" onclick="AuthSystem.loginWithGoogle()">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span class="google-text">Masuk dengan Google</span>
        </button>

        <div class="auth-divider">atau</div>

        <div class="auth-error" id="authError"></div>
        <div class="auth-success" id="authSuccess"></div>

        <!-- Login Form -->
        <form id="loginForm" onsubmit="AuthSystem.handleLogin(event)">
          <div class="auth-form-group">
            <label for="loginEmail">Email</label>
            <input type="email" id="loginEmail" placeholder="email@kamu.com" required>
          </div>
          <div class="auth-form-group">
            <label for="loginPassword">Password</label>
            <input type="password" id="loginPassword" placeholder="Masukkan password" required autocomplete="current-password">
          </div>
          <button type="submit" class="auth-submit">Masuk</button>
        </form>

        <!-- Register Form -->
        <form id="registerForm" style="display:none;" onsubmit="AuthSystem.handleRegister(event)">
          <div class="auth-form-group">
            <label for="regName">Nama Lengkap</label>
            <input type="text" id="regName" placeholder="Nama kamu" required>
          </div>
          <div class="auth-form-group">
            <label for="regEmail">Email</label>
            <input type="email" id="regEmail" placeholder="email@kamu.com" required>
          </div>
          <div class="auth-form-group">
            <label for="regPassword">Password</label>
            <!-- Honeypot field (hidden from humans, filled by bots) -->
            <div style="position:absolute;left:-9999px;opacity:0;height:0;overflow:hidden;" aria-hidden="true">
              <label>Website</label>
              <input type="text" name="website" id="regWebsite" tabindex="-1" autocomplete="off">
            </div>
            <!-- Math CAPTCHA (shown when Turnstile not available) -->
            <div id="mathCaptchaBox" style="display:none;margin:12px 0;padding:12px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:8px;">
              <label id="captchaQuestion" style="font-size:0.9rem;font-weight:600;color:#60a5fa;"></label>
              <input type="number" id="captchaAnswer" placeholder="Jawaban" style="margin-top:6px;width:100%;padding:8px;border-radius:6px;border:1px solid #3f3f46;background:#18181b;color:#e4e4e7;">
              <input type="hidden" id="captchaToken" value="">
            </div>
            <!-- Cloudflare Turnstile widget -->
            <div id="turnstileWidget" style="margin: 12px 0;"></div>
            <input type="password" id="regPassword" placeholder="Min 8 karakter, huruf besar, angka, simbol" required minlength="8" autocomplete="new-password">
          </div>
          <button type="submit" class="auth-submit">Daftar Sekarang</button>
        </form>

        <div class="auth-divider">atau</div>
        <p style="text-align:center; font-size:0.8rem; color:var(--text-subtle);">
          Dengan mendaftar, kamu setuju dengan <a href="${getAbsolutePage('terms.html')}">Syarat & Ketentuan</a>
        </p>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Load Cloudflare Turnstile CAPTCHA script dynamically
    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = function() {
        // Render Turnstile widget when script loads
        if (typeof turnstile !== 'undefined') {
          turnstile.render('#turnstileWidget', {
            sitekey: '0x4AAAAAADsAL_ZQvxWO7Lsf',
            theme: 'dark',
            callback: function(token) {
              // Token received, enable submit button
              const btn = document.querySelector('#registerForm .auth-submit');
              if (btn) btn.disabled = false;
            }
          });
        }
      };
      document.head.appendChild(script);
    } else if (typeof turnstile !== 'undefined') {
      // Script already loaded, render widget
      turnstile.render('#turnstileWidget', {
        sitekey: '0x4AAAAAADsAL_ZQvxWO7Lsf',
        theme: 'dark'
      });
    }
  },

  switchTab(tab) {
    for (const t of document.querySelectorAll('.auth-tab')) t.classList.remove('active');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
    if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
    const activeTab = document.querySelector('.auth-tab[data-tab="' + tab + '"]') ||
                      document.querySelectorAll('.auth-tab')[tab === 'login' ? 0 : 1];
    if (activeTab) activeTab.classList.add('active');
    this.clearMessages();
  },

  showModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
    // Accessibility: Trap focus inside modal
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    // Accessibility: Close on Escape
    this._escHandler = function(e) {
      if (e.key === 'Escape') { AuthSystem.closeModal(); }
      // Focus trap: cycle Tab within modal
      if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', this._escHandler);
  },

  closeModal() {
    document.getElementById('authModal').classList.remove('active');
    if (this._escHandler) { document.removeEventListener('keydown', this._escHandler); this._escHandler = null; }
    this.clearMessages();
  },

  showError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg;
    el.classList.add('show');
    document.getElementById('authSuccess').classList.remove('show');
    if (typeof Toast !== 'undefined') Toast.show(msg, 'error');
  },

  showSuccess(msg) {
    const el = document.getElementById('authSuccess');
    el.textContent = msg;
    el.classList.add('show');
    document.getElementById('authError').classList.remove('show');
    if (typeof Toast !== 'undefined') Toast.show(msg, 'success');
  },

  clearMessages() {
    document.getElementById('authError').classList.remove('show');
    document.getElementById('authSuccess').classList.remove('show');
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = e.target.querySelector('.auth-submit');

    // Add loading state
    if (btn) { btn.classList.add('btn-loading'); btn.disabled = true; }

    // Login via backend
    try {
      const res = await fetch(this.AUTH_ENDPOINT, {
        method: 'POST',
        headers: typeof CSRF !== 'undefined' ? CSRF.getHeaders() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await res.json();
      if (data.success) {
        this.saveSession({ user: data.user, token: data.token });
        this.showSuccess('Login berhasil! Mengalihkan...');
        setTimeout(() => window.location.reload(), 1000);
        return;
      } else {
        this.showError(data.message || 'Email atau password salah');
      }
    } catch (err) {
      this.showError('Gagal terhubung ke server. Coba lagi nanti.');
    } finally {
      if (btn) { btn.classList.remove('btn-loading'); btn.disabled = false; }
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!name || !email) {
      this.showError('Semua field harus diisi');
      return;
    }
    if (password.length < 8) {
      this.showError('Password minimal 8 karakter');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      this.showError('Password harus mengandung huruf besar');
      return;
    }
    if (!/[0-9]/.test(password)) {
      this.showError('Password harus mengandung angka');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.showError('Password harus mengandung simbol (!@#$%^&*)');
      return;
    }

    // Register via backend
    const btn = e.target.querySelector('.auth-submit');
    if (btn) { btn.classList.add('btn-loading'); btn.disabled = true; }

    try {
      // Get Turnstile token if widget is loaded
      const turnstileToken = (typeof turnstile !== 'undefined' && turnstile.getResponse) 
        ? turnstile.getResponse() || '' : '';
      
      // Get math CAPTCHA answer if visible
      const captchaAnswer = document.getElementById('captchaAnswer')?.value || '';
      const captchaToken = document.getElementById('captchaToken')?.value || '';
      
      // Honeypot field (should be empty)
      const website = document.getElementById('regWebsite')?.value || '';
      
      const res = await fetch(this.AUTH_ENDPOINT, {
        method: 'POST',
        headers: typeof CSRF !== 'undefined' ? CSRF.getHeaders() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'register', name, email, password, 
          turnstile_token: turnstileToken,
          captcha_answer: captchaAnswer,
          captcha_token: captchaToken,
          website: website
        })
      });
      const data = await res.json();
      if (data.success) {
        this.saveSession({ user: data.user, token: data.token });
        this.showSuccess('Registrasi berhasil! Mengalihkan...');
        setTimeout(() => window.location.reload(), 1000);
        return;
      } else if (data.captcha) {
        // Server returned a math CAPTCHA challenge
        this.showError('Selesaikan CAPTCHA terlebih dahulu');
        document.getElementById('mathCaptchaBox').style.display = 'block';
        document.getElementById('captchaQuestion').textContent = data.captcha.question;
        document.getElementById('captchaToken').value = data.captcha.id;
        document.getElementById('captchaAnswer').value = '';
        document.getElementById('captchaAnswer').focus();
      } else {
        this.showError(data.error || data.message || 'Gagal mendaftar');
      }
    } catch (err) {
      this.showError('Gagal terhubung ke server. Coba lagi nanti.');
    } finally {
      if (btn) { btn.classList.remove('btn-loading'); btn.disabled = false; }
    }
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  updateNavbar() {
    const nav = document.querySelector('.navbar-links');
    if (!nav) return;

    const user = this.getUser();
    const authContainer = document.getElementById('authNavArea');

    if (authContainer) {
      if (user) {
        const initial = (user.name || user.email)[0].toUpperCase();
        const tokens = PaywallSystem.getTokens();
        const safeName = this.escapeHtml(user.name || user.email.split('@')[0]);

        const tokenBadge = '<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(251,146,60,0.12);border:1px solid rgba(251,146,60,0.25);border-radius:12px;padding:2px 8px;font-size:0.7rem;font-weight:600;color:#fb923c;">\u{1f511} ' + tokens + ' Token</div>';

        authContainer.innerHTML = `
          <div class="user-dropdown" id="userDropdown">
            <div class="user-trigger" onclick="document.getElementById('userDropdown').classList.toggle('open')">
              <div class="avatar">${initial}</div>
              <div class="user-meta">
                <span class="user-name">${safeName}</span>
                ${tokenBadge}
              </div>
              <span class="chevron">▼</span>
            </div>
            <div class="dropdown-menu">
              <a href="${getAbsolutePage('profile.html')}">👤 Profil Saya</a>
              <div class="menu-divider"></div>
              <button class="logout-item" onclick="AuthSystem.logout()">🚪 Keluar</button>
            </div>
          </div>
        `;
      } else {
        // Not logged in - show only login button (token badge hidden to reduce clutter)
        authContainer.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;">
            <button onclick="AuthSystem.showModal()" style="background:var(--accent-primary); border:none; color:#0f0f0f; padding:6px 16px; font-size:0.8rem; border-radius:var(--radius-pill); cursor:pointer; font-weight:600; transition:all 0.15s ease;">Masuk</button>
          </div>
        `;
      }
    }
  }
};

// === BOOKMARK SYSTEM ===
const BookmarkSystem = {
  STORAGE_KEY: 'beebanelabs_bookmarks',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]'); }
    catch(e) { return []; }
  },

  isBookmarked(slug) {
    return this.getAll().some(b => b.slug === slug);
  },

  toggle(slug, title, category) {
    const bookmarks = this.getAll();
    const idx = bookmarks.findIndex(b => b.slug === slug);
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
      return false; // removed
    } else {
      bookmarks.push({ slug, title, category: category || '', saved_at: new Date().toISOString() });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
      return true; // added
    }
  },

  remove(slug) {
    const bookmarks = this.getAll().filter(b => b.slug !== slug);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
  },

  // Render bookmark button on article pages
  init() {
    const p = window.location.pathname;
    if (!p.includes('/articles/')) return;
    const slug = p.split('/').pop().replace('.html', '');
    if (!slug) return;

    // Check if user is logged in
    const isLoggedIn = typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn();

    // Find article title from page
    const titleEl = document.querySelector('.article-content h1, .article-title, h1');
    const title = titleEl ? titleEl.textContent.trim() : slug;
    const category = document.querySelector('.article-category, .article-meta span')?.textContent?.trim() || '';

    // Create bookmark button
    const btn = document.createElement('button');
    btn.id = 'bookmarkBtn';
    btn.setAttribute('aria-label', isLoggedIn ? (this.isBookmarked(slug) ? 'Hapus bookmark' : 'Simpan bookmark') : 'Login untuk bookmark');
    btn.style.cssText = 'position:fixed;bottom:80px;left:24px;z-index:9999;width:48px;height:48px;border-radius:50%;border:none;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    this._updateBtnStyle(btn, isLoggedIn && this.isBookmarked(slug));

    btn.onclick = () => {
      if (!isLoggedIn) {
        if (typeof AuthSystem !== 'undefined' && AuthSystem.showModal) {
          AuthSystem.showModal();
          if (typeof Toast !== 'undefined') Toast.show('Login diperlukan untuk menyimpan bookmark', 'warning');
        }
        return;
      }
      const added = this.toggle(slug, title, category);
      this._updateBtnStyle(btn, added);
      btn.setAttribute('aria-label', added ? 'Hapus bookmark' : 'Simpan bookmark');
      if (typeof Toast !== 'undefined') {
        Toast.show(added ? '🔖 Artikel disimpan!' : 'Bookmark dihapus', added ? 'success' : 'info');
      }
    };

    document.body.appendChild(btn);
  },

  _updateBtnStyle(btn, bookmarked) {
    if (bookmarked) {
      btn.style.background = '#3b82f6';
      btn.style.color = 'white';
      btn.textContent = '🔖';
      btn.title = 'Hapus Bookmark';
    } else {
      btn.style.background = '#27272a';
      btn.style.color = '#a1a1aa';
      btn.textContent = '🔖';
      btn.title = 'Simpan Artikel';
    }
  }
};

// === PROGRESS TRACKER ===
const ProgressTracker = {
  STORAGE_KEY: 'beebanelabs_progress',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'); }
    catch(e) { return {}; }
  },

  get(slug) {
    return this.getAll()[slug] || null;
  },

  markOpened(slug, title, category) {
    const progress = this.getAll();
    if (!progress[slug]) {
      progress[slug] = {
        slug, title: title || slug, category: category || '',
        status: 'opened', position: 0,
        opened_at: new Date().toISOString(),
        completed_at: null
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
      // Log activity
      if (typeof logActivity === 'function') {
        logActivity('unlock', 'Membaca: ' + (title || slug));
      }
    }
  },

  markCompleted(slug) {
    const progress = this.getAll();
    if (progress[slug] && progress[slug].status !== 'completed') {
      progress[slug].status = 'completed';
      progress[slug].position = 100;
      progress[slug].completed_at = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
      if (typeof logActivity === 'function') {
        logActivity('unlock', 'Selesai membaca: ' + (progress[slug].title || slug));
      }
    }
  },

  updatePosition(slug, position) {
    const progress = this.getAll();
    if (progress[slug]) {
      progress[slug].position = Math.max(progress[slug].position || 0, position);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    }
  },

  getStats() {
    const all = this.getAll();
    const entries = Object.values(all);
    return {
      total: entries.length,
      opened: entries.filter(e => e.status === 'opened').length,
      completed: entries.filter(e => e.status === 'completed').length,
      byCategory: entries.reduce((acc, e) => {
        const cat = e.category || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {})
    };
  },

  init() {
    const p = window.location.pathname;
    if (!p.includes('/articles/')) return;
    const slug = p.split('/').pop().replace('.html', '');
    if (!slug) return;

    const titleEl = document.querySelector('.article-content h1, .article-title, h1');
    const title = titleEl ? titleEl.textContent.trim() : slug;
    const category = document.querySelector('.article-category, .article-meta span')?.textContent?.trim() || '';

    // Mark as opened
    this.markOpened(slug, title, category);

    // Track scroll position for completion
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const pct = Math.round((scrollTop / docHeight) * 100);
          this.updatePosition(slug, pct);
          // Auto-mark as completed when scrolled 90%+
          if (pct >= 90) this.markCompleted(slug);
        }
      }, 500);
    }, { passive: true });
  }
};

// === VIEW TRACKER (FIXED) ===
// === TOKEN DISPLAY ===
const TokenDisplay = {
  showBanner() {
    const p = window.location.pathname;
    if (!p.includes('/articles/')) return;
    if (PaywallSystem.hasPaidAccess()) return;
    // Don't show token banner for free articles
    const slug = p.split('/').pop().replace('.html', '').replace(/\/$/, '');
    if (typeof PaywallSystem.isArticleFree === 'function' && PaywallSystem.isArticleFree(slug)) return;
    const tokens = PaywallSystem.getTokens();
    let banner = document.getElementById('tokenBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'tokenBanner';
      const ac = document.querySelector('.article-content');
      if (ac) ac.insertBefore(banner, ac.firstChild);
    }
    if (tokens > 0) {
      banner.className = 'view-counter-banner';
      banner.innerHTML = '<span class="view-text"><strong>Token gratis: ' + tokens + ' tersisa</strong></span><span style="font-size:0.75rem;color:var(--text-subtle);">Token dipakai untuk unlock artikel gratis</span>';
    } else {
      banner.className = 'view-counter-banner limit-reached';
      banner.innerHTML = '<span class="view-text"><strong>Token habis!</strong> Beli token untuk membuka artikel.</span><a href="../pricing.html" class="view-btn" style="text-decoration:none;">Beli Token</a>';
    }
  }
};




// === ARTICLE CARD UNLOCK STATUS ===
function updateArticleCardStatus() {
  const cards = document.querySelectorAll('.article-card');
  if (!cards.length) return;
  const unlocked = PaywallSystem.getUnlocked();
  for (const card of cards) {
    const href = card.getAttribute('href') || '';
    const slug = href.split('/').pop().replace('.html', '');
    if (!slug) return;
    const badge = card.querySelector('.access-badge');
    if (unlocked.includes(slug)) {
      // Article is unlocked - show green badge
      if (badge) {
        badge.className = 'access-badge unlocked';
        badge.textContent = '✓ Dibuka';
      }
      // Add checkmark circle on thumbnail
      const thumb = card.querySelector('.thumbnail');
      if (thumb && !thumb.querySelector('.unlock-mark')) {
        const mark = document.createElement('div');
        mark.className = 'unlock-mark';
        mark.textContent = '✓';
        thumb.appendChild(mark);
      }
    }
  }
}

// === TOAST NOTIFICATION SYSTEM ===
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(msg, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    // FIX: Escape HTML in msg to prevent XSS
    const safeMsg = String(msg).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span><span class="toast-msg">' + safeMsg + '</span>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Tutup notifikasi');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', function() { t.remove(); });
    t.appendChild(closeBtn);
    this.container.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, duration);
  }
};

// === LOADING SPINNER ===
const Loading = {
  el: null,
  init() {
    this.el = document.createElement('div');
    this.el.className = 'loading-overlay';
    this.el.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(this.el);
  },
  show() { if (!this.el) this.init(); this.el.classList.add('active'); },
  hide() { if (this.el) this.el.classList.remove('active'); }
};

// === COOKIE CONSENT ===
const CookieConsent = {
  KEY: 'beebanelabs_cookie_consent',
  init() {
    if (localStorage.getItem(this.KEY)) return;
    setTimeout(() => this.show(), 2000);
  },
  show() {
    const banner = document.createElement('div');
    banner.className = 'cookie-consent';
    const privacyUrl = getAbsolutePage('privacy-policy.html');
    banner.innerHTML = '<p>🍪 Kami menggunakan cookie untuk meningkatkan pengalaman Anda. <a href="' + privacyUrl + '">Pelajari lebih lanjut</a></p>';
    const btnsDiv = document.createElement('div');
    btnsDiv.className = 'cookie-btns';
    const declineBtn = document.createElement('button');
    declineBtn.className = 'cookie-decline';
    declineBtn.textContent = 'Tolak';
    declineBtn.addEventListener('click', function() { CookieConsent.dismiss(declineBtn); });
    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'cookie-accept';
    acceptBtn.textContent = 'Terima';
    acceptBtn.addEventListener('click', function() { CookieConsent.accept(acceptBtn); });
    btnsDiv.appendChild(declineBtn);
    btnsDiv.appendChild(acceptBtn);
    banner.appendChild(btnsDiv);
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')));
  },
  accept(btn) { localStorage.setItem(this.KEY, 'accepted'); btn.closest('.cookie-consent').classList.remove('show'); setTimeout(() => btn.closest('.cookie-consent').remove(), 400); Toast.show('Cookie diterima! Terima kasih.', 'success'); },
  dismiss(btn) { localStorage.setItem(this.KEY, 'declined'); btn.closest('.cookie-consent').classList.remove('show'); setTimeout(() => btn.closest('.cookie-consent').remove(), 400); }
};

// === THEME TOGGLE (Global - applies to ALL pages via html element) ===
const ThemeToggle = {
  KEY: 'beebanelabs_theme',
  init() {
    const saved = localStorage.getItem(this.KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateButton();
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(this.KEY, next);
    this.updateButton();
    // Update theme-color for mobile browser chrome
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = next === 'light' ? '#ffffff' : '#08090a';
  },
  updateButton() {
    const btn = document.querySelector('.theme-toggle');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (btn) btn.textContent = isLight ? '🌙' : '☀️';
  }
};

// === SHARE BUTTON + RELATED ARTICLES ===
function injectArticleExtras() {
  if (!window.location.pathname.includes('/articles/')) return;
  const articleContent = document.querySelector('.article-content');
  if (!articleContent) return;

  // Share buttons
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const shareDiv = document.createElement('div');
  shareDiv.style.cssText = 'display:flex;align-items:center;gap:12px;padding:24px 0;border-top:1px solid var(--border-subtle);margin-top:32px;';
  const shareLabel = document.createElement('span');
  shareLabel.style.cssText = 'font-size:0.85rem;color:var(--text-muted);font-weight:600;';
  shareLabel.textContent = 'Bagikan:';
  shareDiv.appendChild(shareLabel);

  const shareBtnStyle = 'display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-pill);font-size:0.8rem;font-weight:600;text-decoration:none;transition:all 0.2s;cursor:pointer;border:1px solid;';
  const twitterBtn = document.createElement('a');
  twitterBtn.href = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title;
  twitterBtn.target = '_blank'; twitterBtn.rel = 'noopener';
  twitterBtn.style.cssText = shareBtnStyle + 'background:rgba(29,161,242,0.1);border-color:rgba(29,161,242,0.3);color:#1da1f2;';
  twitterBtn.textContent = '𝕏 Twitter';
  twitterBtn.addEventListener('mouseenter', function() { this.style.background = 'rgba(29,161,242,0.2)'; });
  twitterBtn.addEventListener('mouseleave', function() { this.style.background = 'rgba(29,161,242,0.1)'; });
  shareDiv.appendChild(twitterBtn);

  const waBtn = document.createElement('a');
  waBtn.href = 'https://wa.me/?text=' + title + '%20' + url;
  waBtn.target = '_blank'; waBtn.rel = 'noopener';
  waBtn.style.cssText = shareBtnStyle + 'background:rgba(37,211,102,0.1);border-color:rgba(37,211,102,0.3);color:#25d366;';
  waBtn.textContent = '💬 WhatsApp';
  waBtn.addEventListener('mouseenter', function() { this.style.background = 'rgba(37,211,102,0.2)'; });
  waBtn.addEventListener('mouseleave', function() { this.style.background = 'rgba(37,211,102,0.1)'; });
  shareDiv.appendChild(waBtn);

  const copyBtn = document.createElement('button');
  copyBtn.style.cssText = shareBtnStyle + 'background:var(--bg-hover);border-color:var(--border-standard);color:var(--text-secondary);';
  copyBtn.textContent = '📋 Salin Link';
  copyBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(window.location.href);
    if (typeof Toast !== 'undefined') Toast.show('Link disalin!', 'success');
  });
  shareDiv.appendChild(copyBtn);

  articleContent.appendChild(shareDiv);

  // Related articles
  const allArticles = ALL_ARTICLES;
  const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');
  const related = allArticles.filter(a => a.slug !== currentSlug).sort(() => 0.5 - Math.random()).slice(0, 3);
  if (related.length) {
    const relSection = document.createElement('div');
    relSection.style.cssText = 'margin-top:48px;padding-top:32px;border-top:1px solid var(--border-subtle);';
    const relTitle = document.createElement('h3');
    relTitle.style.cssText = 'font-family:var(--font-heading);font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:20px;';
    relTitle.textContent = '📚 Artikel Terkait';
    relSection.appendChild(relTitle);
    const relGrid = document.createElement('div');
    relGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;';
    related.forEach(function(a) {
      const link = document.createElement('a');
      link.href = '../articles/' + a.slug + '.html';
      link.style.cssText = 'display:flex;align-items:center;gap:12px;padding:16px;background:var(--bg-card);border:1px solid var(--border-standard);border-radius:var(--radius-md);text-decoration:none;transition:all 0.2s;';
      link.addEventListener('mouseenter', function() { this.style.borderColor = 'var(--accent-primary)'; });
      link.addEventListener('mouseleave', function() { this.style.borderColor = 'var(--border-standard)'; });
      const icon = document.createElement('span');
      icon.style.fontSize = '1.5rem';
      icon.textContent = a.icon;
      link.appendChild(icon);
      const info = document.createElement('div');
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = 'font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:2px;';
      titleDiv.textContent = a.title;
      info.appendChild(titleDiv);
      const catDiv = document.createElement('div');
      catDiv.style.cssText = 'font-size:0.7rem;color:var(--text-subtle);text-transform:uppercase;';
      catDiv.textContent = a.cat;
      info.appendChild(catDiv);
      link.appendChild(info);
      relGrid.appendChild(link);
    });
    relSection.appendChild(relGrid);
    articleContent.appendChild(relSection);
  }
}

// === TABLE OF CONTENTS (TOC) ===
function initTOC() {
  const content = document.querySelector('.article-content');
  if (!content) return;
  // FIX: Don't generate TOC if article is paywalled (content replaced by lock screen)
  if (content.querySelector('[style*="text-align:center"]') && !content.querySelector('h2:not([style])')) return;
  const headings = content.querySelectorAll('h2, h3');
  if (headings.length < 2) return;
  // Filter out non-article headings (paywall messages, share buttons, related articles)
  const realHeadings = Array.from(headings).filter(h => {
    const text = h.textContent.trim();
    return !text.includes('Artikel Terkunci') && !text.includes('Artikel Terkait') && !text.includes('Bagikan');
  });
  if (realHeadings.length < 2) return;

  // Create TOC sidebar
  const toc = document.createElement('nav');
  toc.className = 'toc-sidebar';
  toc.innerHTML = '<h4>Daftar Isi</h4><ul>' + realHeadings.map((h, i) => {
    const id = 'toc-' + i;
    h.id = id;
    const isH3 = h.tagName === 'H3';
    return '<li><a href="#' + id + '" class="' + (isH3 ? 'toc-h3' : '') + '">' + h.textContent + '</a></li>';
  }).join('') + '</ul>';

  // Wrap article-content in layout grid
  const layout = document.createElement('div');
  layout.className = 'article-layout';
  content.parentNode.insertBefore(layout, content);
  layout.appendChild(content);
  layout.appendChild(toc);

  // Active state on scroll
  const observer = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        for (const a of toc.querySelectorAll('a')) a.classList.remove('active');
        const link = toc.querySelector('a[href="#' + e.target.id + '"]');
        if (link) link.classList.add('active');
      }
    }
  }, { rootMargin: '-80px 0px -70% 0px' });
  for (const h of realHeadings) observer.observe(h);

  // JS-based sticky sidebar (bypasses CSS sticky ancestor overflow issues)
  const sidebarTop = 80;
  const tocSidebar = toc;
  const tocLayout = tocSidebar.parentElement;
  if (tocLayout && tocSidebar) {
    const onScroll = () => {
      const layoutRect = tocLayout.getBoundingClientRect();
      const layoutBottom = layoutRect.bottom;
      const sidebarH = tocSidebar.offsetHeight;
      if (layoutRect.top < sidebarTop && layoutBottom > sidebarH + sidebarTop + 20) {
        tocSidebar.style.position = 'fixed';
        tocSidebar.style.top = sidebarTop + 'px';
        tocSidebar.style.width = '220px';
        tocSidebar.style.right = (window.innerWidth - layoutRect.right) + 'px';
      } else if (layoutRect.top >= sidebarTop) {
        tocSidebar.style.position = '';
        tocSidebar.style.top = '';
        tocSidebar.style.width = '';
        tocSidebar.style.right = '';
      } else {
        tocSidebar.style.position = 'absolute';
        tocSidebar.style.top = (tocLayout.scrollHeight - sidebarH - 20) + 'px';
        tocSidebar.style.width = '220px';
        tocSidebar.style.right = '';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }
}

// === JSON-LD ARTICLE STRUCTURED DATA ===
function injectArticleJsonLd() {
  if (!window.location.pathname.includes('/articles/')) return;
  const metaSection = document.querySelector('meta[property="article:section"]');
  const section = metaSection ? metaSection.content : '';
  const publishedTime = document.querySelector('meta[property="article:published_time"]');
  const datePublished = publishedTime ? publishedTime.content : '';
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": document.title.split('|')[0].trim(),
    "description": (document.querySelector('meta[name="description"]') || {}).content || '',
    "image": (document.querySelector('meta[property="og:image"]') || {}).content || '',
    "url": window.location.href,
    "publisher": {
      "@type": "Organization",
      "name": "BeebaneLabs",
      "url": "https://beebanelabs.pages.dev"
    },
    "datePublished": datePublished,
    "author": {
      "@type": "Organization",
      "name": "BeebaneLabs"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Beranda", "item": "https://beebanelabs.pages.dev" },
        { "@type": "ListItem", "position": 2, "name": section, "item": "https://beebanelabs.pages.dev/kategori/" + section.toLowerCase().replace(/\s+/g, '-') + ".html" },
        { "@type": "ListItem", "position": 3, "name": document.title.split('|')[0].trim() }
      ]
    }
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

// === BREADCRUMB INJECTION FOR ARTICLES ===
function injectBreadcrumb() {
  if (!window.location.pathname.includes('/articles/')) return;
  const articleHero = document.querySelector('.article-hero');
  if (!articleHero) return;
  
  const metaSection = document.querySelector('meta[property="article:section"]');
  const section = metaSection ? metaSection.content : '';
  const title = document.title.split('|')[0].trim();
  const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');
  
  // Find category slug from section name
  const catSlug = section.toLowerCase()
    .replace(/pemrograman python/g, 'python')
    .replace(/pemrograman web/g, 'web-development')
    .replace(/pengembangan mobile/g, 'mobile')
    .replace(/keamanan siber/g, 'keamanan')
    .replace(/infrastruktur cloud/g, 'cloud')
    .replace(/devops/g, 'devops-cloud')
    .replace(/data science/g, 'ai-data-science')
    .replace(/internet of things/g, 'iot')
    .replace(/networking/g, 'networking')
    .replace(/career/g, 'it-career')
    .replace(/keamanan/g, 'keamanan')
    .replace(/protokol/g, 'protokol')
    .replace(/mikrotik/g, 'mikrotik')
    .replace(/loRa/g, 'lora')
    .replace(/dashboard/g, 'dashboard')
    .replace(/tools/g, 'tools')
    .replace(/\s+/g, '-');
  
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  breadcrumb.innerHTML = '<a href="../">🏠 Beranda</a>' +
    '<span class="separator">›</span>' +
    '<a href="../kategori/' + catSlug + '.html">' + section + '</a>' +
    '<span class="separator">›</span>' +
    '<span class="current" aria-current="page">' + title.substring(0, 50) + (title.length > 50 ? '...' : '') + '</span>';
  
  articleHero.insertAdjacentElement('beforebegin', breadcrumb);
}

// === COPY CODE BUTTON ===
function initCopyCode() {
  for (const pre of document.querySelectorAll('pre')) {
    if (pre.closest('.code-block')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    const btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.textContent = '📋 Copy';
    btn.onclick = () => {
      navigator.clipboard.writeText(pre.textContent).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        if (typeof Toast !== 'undefined') Toast.show('Kode disalin!', 'success');
        setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
      }).catch(() => {
        if (typeof Toast !== 'undefined') Toast.show('Gagal menyalin kode', 'error');
      });
    };
    wrapper.appendChild(btn);
  }
}

// === ARTICLE FILTER (Homepage) ===
function initArticleFilter() {
  const section = document.querySelector('#articles');
  if (!section) return;

  // Create filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';
  filterBar.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">Filter:</span><button class="filter-btn active" data-filter="all">Semua</button><button class="filter-btn" data-filter="pemula">🟢 Pemula</button><button class="filter-btn" data-filter="menengah">🟡 Menengah</button><button class="filter-btn" data-filter="lanjut">🔴 Lanjut</button>';
  section.querySelector('.section-header').after(filterBar);

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    for (const b of filterBar.querySelectorAll('.filter-btn')) b.classList.remove('active');
    btn.classList.add('active');
    renderGroupedArticles(btn.dataset.filter);
    updateArticleCardStatus();
  });
}

// === CATEGORY PAGE FILTER ===
function initCategoryFilter() {
  const catFilter = document.querySelector('#catFilter');
  if (!catFilter) return;
  const grid = catFilter.nextElementSibling || document.querySelector('.articles-grid');
  if (!grid) return;

  catFilter.addEventListener('click', function(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    // Update active state
    catFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    // Show/hide cards based on difficulty
    const cards = grid.querySelectorAll('.article-card');
    cards.forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
        return;
      }
      const diffBadge = card.querySelector('.difficulty');
      if (!diffBadge) { card.style.display = 'none'; return; }
      const hasClass = diffBadge.classList.contains(filter);
      card.style.display = hasClass ? '' : 'none';
    });
    // Update count
    const visible = grid.querySelectorAll('.article-card:not([style*="display: none"])').length;
    const countEl = document.querySelector('.meta-item');
    if (countEl && countEl.textContent.includes('Tutorial')) {
      countEl.textContent = '📖 ' + visible + ' Tutorial';
    }
  });
}

// === LEARNING PATH (Homepage) ===
function injectLearningPath() {
  const homepage = document.querySelector('.hero');
  if (!homepage || window.location.pathname !== '/' && !window.location.pathname.includes('index')) return;
  const articlesSection = document.querySelector('#articles');
  if (!articlesSection) return;

  // Learning Path removed per user request
}

// === UNIFIED CATEGORY SYSTEM ===
const ARTICLE_CATEGORIES = {
  'iot': {
    name: 'Internet of Things',
    icon: '🤖',
    slug: 'iot',
    match: ['ESP32', 'IoT', 'Internet of Things', 'Raspberry Pi', 'LoRa', 'Python untuk IoT', 'Industrial IoT', 'Cloud & IoT'],
    color: '#00e5ff'
  },
  'programming': {
    name: 'Pemrograman',
    icon: '💻',
    slug: 'python',
    match: ['Python', 'Tools', 'Software Engineering', 'Pemrograman Python', 'Python untuk Pemula'],
    color: '#ffeb00'
  },
  'security': {
    name: 'Cybersecurity',
    icon: '🔐',
    slug: 'keamanan',
    match: ['Keamanan', 'Cybersecurity', 'Forensik'],
    color: '#f43f5e'
  },
  'dashboard': {
    name: 'Dashboard & Cloud',
    icon: '📊',
    slug: 'dashboard',
    match: ['Dashboard', 'Dashboard & Cloud', 'Dashboard & Visualisasi', 'Cloud'],
    color: '#8b5cf6'
  },
  'protocol': {
    name: 'Protokol & Tools',
    icon: '📡',
    slug: 'protokol',
    match: ['Protokol', 'Protokol IoT', 'Developer Tools'],
    color: '#06b6d4'
  },
  'webdev': {
    name: 'Web Development',
    icon: '🌐',
    slug: 'web-dev',
    match: ['Web Development', 'Backend Development'],
    color: '#3b82f6'
  },
  'database': {
    name: 'Database',
    icon: '🗄️',
    slug: 'database',
    match: ['Database'],
    color: '#10b981'
  },
  'ai': {
    name: 'AI & Data Science',
    icon: '🤖',
    slug: 'ai-ml',
    match: ['AI & Data Science', 'AI &amp; Data Science', 'Deep Learning', 'Machine Learning', 'Computer Vision', 'NLP & AI', 'AI & LLM', 'Data Science'],
    color: '#a855f7'
  },
  'mobile': {
    name: 'Mobile Development',
    icon: '📱',
    slug: 'mobile',
    match: ['Mobile Development', 'Android Development'],
    color: '#ec4899'
  },
  'devops': {
    name: 'DevOps & Cloud',
    icon: '⚙️',
    slug: 'devops',
    match: ['DevOps & Cloud', 'Docker'],
    color: '#f97316'
  },
  'career': {
    name: 'IT Career',
    icon: '💼',
    slug: 'it-career',
    match: ['IT Career', 'Certification', 'Professional Development', 'Career'],
    color: '#6366f1'
  },
  'networking': {
    name: 'Jaringan Dasar',
    icon: '🌐',
    slug: 'networking',
    match: ['Networking', 'MikroTik'],
    color: '#f97316'
  }
};

function getCategoryCounts() {
  const counts = {};
  for (const key of Object.keys(ARTICLE_CATEGORIES)) {
    counts[key] = 0;
  }
  for (const article of ALL_ARTICLES) {
    for (const [key, cat] of Object.entries(ARTICLE_CATEGORIES)) {
      if (cat.match.includes(article.cat)) {
        counts[key]++;
      }
    }
  }
  return counts;
}

function getCategoryForSlug(slug) {
  const article = ALL_ARTICLES.find(a => a.slug === slug);
  if (!article) return null;
  for (const [key, cat] of Object.entries(ARTICLE_CATEGORIES)) {
    if (cat.match.includes(article.cat)) return key;
  }
  return null;
}

function getArticlesByCategory(catKey) {
  const cat = ARTICLE_CATEGORIES[catKey];
  if (!cat) return [];
  return ALL_ARTICLES.filter(a => cat.match.includes(a.cat)).map(a => a.slug);
}

// === GROUPED ARTICLES (3 per category) ===
const ALL_ARTICLES = [
  { slug: 'esp32-fundamentals', title: 'Panduan Lengkap ESP32', icon: '🔧', cat: 'ESP32', desc: 'Tutorial komprehensif ESP32 untuk pemula', diff: 'pemula', time: '15', access: 'Gratis', date: '20 Juni 2026' },
  { slug: 'esp8266-nodemcu', title: 'ESP8266 NodeMCU untuk Pemula', icon: '📶', cat: 'ESP32', desc: 'Setup dan proyek pertama dengan ESP8266', diff: 'pemula', time: '10', access: 'Gratis', date: '7 Juni 2026' },
  { slug: 'sensor-dht-esp32', title: 'Sensor DHT dengan ESP32', icon: '🌡️', cat: 'ESP32', desc: 'Baca suhu dan kelembaban dengan DHT11/DHT22', diff: 'pemula', time: '8', access: 'Gratis', date: '5 Juni 2026' },
  { slug: 'web-server-esp32', title: 'Web Server di ESP32', icon: '🌐', cat: 'ESP32', desc: 'Bangun web server mandiri di ESP32', diff: 'menengah', time: '11', access: 'Token', date: '30 Mei 2026' },
  { slug: 'deep-sleep-esp32', title: 'ESP32 Deep Sleep', icon: '💤', cat: 'ESP32', desc: 'Hemat baterai untuk proyek IoT', diff: 'pemula', time: '7', access: 'Gratis', date: '28 Mei 2026' },
  { slug: 'esp32-gpio-dasar', title: 'GPIO ESP32: Input, Output & PWM', icon: '⚡', cat: 'ESP32', desc: 'Panduan lengkap GPIO untuk pemula', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'esp32-ota-update', title: 'OTA Update ESP32', icon: '📲', cat: 'ESP32', desc: 'Update firmware tanpa kabel', diff: 'menengah', time: '10', access: 'Token', date: '25 Juni 2026' },
  { slug: 'esp32-espnow', title: 'ESP-NOW: Komunikasi Nirkabel', icon: '📡', cat: 'ESP32', desc: 'Komunikasi antar ESP32 tanpa WiFi', diff: 'menengah', time: '11', access: 'Token', date: '25 Juni 2026' },
  { slug: 'mikrotik-routing', title: 'Konfigurasi Routing MikroTik', icon: '🌐', cat: 'MikroTik', desc: 'Static route, OSPF, dan BGP', diff: 'menengah', time: '12', access: 'Token', date: '18 Juni 2026' },
  { slug: 'mikrotik-firewall', title: 'MikroTik Firewall', icon: '🛡️', cat: 'MikroTik', desc: 'Filter rules, NAT, dan mangle', diff: 'lanjut', time: '16', access: 'Token', date: '2 Juni 2026' },
  { slug: 'mikrotik-queue', title: 'MikroTik Queue Management', icon: '🎛️', cat: 'MikroTik', desc: 'QoS dan bandwidth control', diff: 'menengah', time: '10', access: 'Token', date: '24 Mei 2026' },
  { slug: 'mikrotik-vlan-dhcp', title: 'MikroTik VLAN & DHCP', icon: '🔗', cat: 'MikroTik', desc: 'Jaringan tersegmentasi dan DHCP', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'lora-communication', title: 'Jaringan Sensor LoRa', icon: '📡', cat: 'LoRa', desc: 'Telemetry dan monitoring jarak jauh', diff: 'menengah', time: '10', access: 'Token', date: '15 Juni 2026' },
  { slug: 'python-iot-automation', title: 'Otomasi dengan Python', icon: '🐍', cat: 'Python', desc: 'MQTT, GPIO, dan scheduling', diff: 'pemula', time: '8', access: 'Gratis', date: '12 Juni 2026' },
  { slug: 'python-fastapi', title: 'FastAPI: REST API Modern', icon: '🚀', cat: 'Python', desc: 'Buat API dengan FastAPI Python', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'python-git-github', title: 'Git & GitHub untuk Developer', icon: '🐙', cat: 'Python', desc: 'Version control untuk semua proyek', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'network-security', title: 'Keamanan Jaringan IoT', icon: '🔐', cat: 'Keamanan', desc: 'Firewall, VPN, dan enkripsi data', diff: 'lanjut', time: '14', access: 'Token', date: '10 Juni 2026' },
  { slug: 'linux-security', title: 'Keamanan Linux untuk Server', icon: '🐧', cat: 'Keamanan', desc: 'SSH hardening, firewall, fail2ban', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'ethical-hacking-dasar', title: 'Ethical Hacking Dasar', icon: '🕵️', cat: 'Keamanan', desc: 'Pengenalan ethical hacking & Kali Linux', diff: 'pemula', time: '13', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'dashboard-monitoring', title: 'Dashboard Monitoring Real-time', icon: '📊', cat: 'Dashboard', desc: 'Node-RED, Grafana, dan MQTT', diff: 'menengah', time: '11', access: 'Token', date: '8 Juni 2026' },
  { slug: 'node-red-iot', title: 'Node-RED untuk IoT', icon: '🔀', cat: 'Dashboard', desc: 'Flow programming dan integrasi', diff: 'menengah', time: '12', access: 'Token', date: '26 Mei 2026' },
  { slug: 'grafana-influxdb', title: 'Grafana + InfluxDB', icon: '📈', cat: 'Dashboard', desc: 'Visualisasi data IoT real-time', diff: 'menengah', time: '13', access: 'Token', date: '25 Mei 2026' },
  { slug: 'grafana-alerting', title: 'Grafana Alerting & Notifikasi', icon: '🔔', cat: 'Dashboard', desc: 'Monitoring dan notifikasi otomatis', diff: 'menengah', time: '11', access: 'Token', date: '25 Juni 2026' },
  { slug: 'docker-iot', title: 'Docker untuk IoT', icon: '🐳', cat: 'Dashboard', desc: 'Containerize aplikasi IoT', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'mqtt-protocol', title: 'Protokol MQTT', icon: '📨', cat: 'Protokol', desc: 'Panduan lengkap MQTT untuk IoT', diff: 'menengah', time: '13', access: 'Token', date: '6 Juni 2026' },
  { slug: 'mqtt-mosquitto-setup', title: 'Setup Mosquitto MQTT Broker', icon: '🔧', cat: 'Protokol', desc: 'Instalasi dan konfigurasi Mosquitto', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'iot-protocols-comparison', title: 'Perbandingan Protokol IoT', icon: '⚖️', cat: 'Protokol', desc: 'MQTT vs CoAP vs HTTP vs AMQP', diff: 'lanjut', time: '14', access: 'Token', date: '29 Mei 2026' },
  { slug: 'raspberry-pi-iot', title: 'Raspberry Pi untuk IoT', icon: '🍓', cat: 'Raspberry Pi', desc: 'Gateway dan edge computing', diff: 'menengah', time: '15', access: 'Token', date: '4 Juni 2026' },
  { slug: 'firebase-iot', title: 'Firebase untuk IoT', icon: '🔥', cat: 'Cloud', desc: 'Realtime database dan cloud functions', diff: 'menengah', time: '12', access: 'Token', date: '3 Juni 2026' },
  { slug: 'telegram-bot-iot', title: 'Telegram Bot untuk IoT', icon: '🤖', cat: 'IoT', desc: 'Notifikasi dan kontrol jarak jauh', diff: 'pemula', time: '9', access: 'Gratis', date: '1 Juni 2026' },
  { slug: 'blynk-iot', title: 'Blynk IoT', icon: '📱', cat: 'IoT', desc: 'Kontrol perangkat dari mobile app', diff: 'pemula', time: '8', access: 'Gratis', date: '23 Mei 2026' },
  { slug: 'arduino-ide-setup', title: 'Arduino IDE 2.x Setup', icon: '💻', cat: 'Tools', desc: 'Instalasi dan konfigurasi lengkap', diff: 'pemula', time: '6', access: 'Gratis', date: '27 Mei 2026' },
  { slug: 'esp32-bluetooth-ble', title: 'ESP32 Bluetooth BLE', icon: '📶', cat: 'ESP32', desc: 'Komunikasi nirkabel energi rendah', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'esp32-freertos', title: 'FreeRTOS pada ESP32', icon: '⚙️', cat: 'ESP32', desc: 'Multitasking real-time', diff: 'lanjut', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'esp32-sensor-kalibrasi', title: 'Kalibrasi Sensor ESP32', icon: '🎯', cat: 'ESP32', desc: 'Akurasi data IoT', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'esp32-battery-management', title: 'Battery Management IoT', icon: '🔋', cat: 'ESP32', desc: 'Hemat energi maksimal', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'mikrotik-ospf', title: 'OSPF Routing MikroTik', icon: '🗺️', cat: 'MikroTik', desc: 'Konfigurasi & optimasi OSPF', diff: 'lanjut', time: '16', access: 'Token', date: '25 Juni 2026' },
  { slug: 'mikrotik-vpn', title: 'VPN pada MikroTik', icon: '🔒', cat: 'MikroTik', desc: 'Site-to-site & remote access', diff: 'lanjut', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'networking-osi-subnetting', title: 'OSI Model & Subnetting', icon: '🌐', cat: 'Networking', desc: 'Dasar jaringan komputer', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'python-oop', title: 'OOP Python: Object-Oriented Programming', icon: '🐍', cat: 'Python', desc: 'Class, inheritance, polymorphism, encapsulation', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'python-async', title: 'Async Python: Pemrograman Asinkron', icon: '⚡', cat: 'Python', desc: 'Pemrograman asinkron', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'python-web-scraping', title: 'Web Scraping Python', icon: '🕷️', cat: 'Python', desc: 'BeautifulSoup & Selenium', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'web-security-sql-xss', title: 'SQL Injection & XSS', icon: '💉', cat: 'Keamanan', desc: 'Serangan web umum', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'linux-firewall-hardening', title: 'Firewall Hardening Linux', icon: '🛡️', cat: 'Keamanan', desc: 'Mengamankan server Linux', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'ssl-tls-guide', title: 'SSL/TLS & HTTPS', icon: '🔐', cat: 'Keamanan', desc: 'Mengamankan komunikasi', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'nginx-reverse-proxy', title: 'Nginx Reverse Proxy', icon: '🔀', cat: 'Dashboard', desc: 'Load balancing & SSL', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'firebase-auth-firestore', title: 'Firebase Auth & Firestore', icon: '🔥', cat: 'Dashboard', desc: 'Auth & database untuk IoT', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'websocket-guide', title: 'WebSocket untuk IoT', icon: '🔌', cat: 'Protokol', desc: 'Komunikasi real-time', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'wireshark-network-analysis', title: 'Wireshark: Analisis Jaringan', icon: '🔍', cat: 'Protokol', desc: 'Network analysis untuk IoT', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'prometheus-monitoring', title: 'Prometheus & Grafana', icon: '📊', cat: 'Protokol', desc: 'Monitoring infrastructure', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'iot-industrial', title: 'Industrial IoT', icon: '🏭', cat: 'IoT', desc: 'Dari sensor ke cloud', diff: 'lanjut', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'home-assistant-iot', title: 'Home Assistant', icon: '🏠', cat: 'IoT', desc: 'Platform otomasi rumah pintar', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'vps-deployment', title: 'Deploy ke VPS', icon: '🖥️', cat: 'Dashboard', desc: 'Panduan deploy ke VPS', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },

  // === Web Development ===
  { slug: 'html-css-dasar', title: 'HTML & CSS Dasar', icon: '📄', cat: 'Web Development', desc: 'Fondasi membangun website', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'javascript-dasar', title: 'JavaScript untuk Pemula', icon: '⚡', cat: 'Web Development', desc: 'Bahasa pemrograman web', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'responsive-web-design', title: 'Responsive Web Design', icon: '📱', cat: 'Web Development', desc: 'Mobile-first design', diff: 'menengah', time: '10', access: 'Token', date: '25 Juni 2026' },
  { slug: 'react-dasar', title: 'React.js untuk Pemula', icon: '⚛️', cat: 'Web Development', desc: 'Framework UI populer', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'nodejs-express', title: 'Node.js & Express', icon: '🟢', cat: 'Web Development', desc: 'Backend JavaScript', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'rest-api-design', title: 'REST API Design', icon: '🔌', cat: 'Web Development', desc: 'Desain API yang baik', diff: 'menengah', time: '11', access: 'Token', date: '25 Juni 2026' },
  { slug: 'typescript-dasar', title: 'TypeScript Dasar', icon: '🔷', cat: 'Web Development', desc: 'JS dengan tipe statis', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'vuejs-dasar', title: 'Vue.js untuk Pemula', icon: '💚', cat: 'Web Development', desc: 'Framework progresif', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },

  // === Database ===
  { slug: 'sql-dasar', title: 'SQL Dasar untuk Pemula', icon: '🗃️', cat: 'Database', desc: 'Query database dari nol', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'mongodb-dasar', title: 'MongoDB untuk Pemula', icon: '🍃', cat: 'Database', desc: 'Database NoSQL dokumen', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'database-design', title: 'Database Design & Normalisasi', icon: '📐', cat: 'Database', desc: 'Desain schema efisien', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'redis-caching', title: 'Redis & Caching Strategy', icon: '🔴', cat: 'Database', desc: 'In-memory untuk performa', diff: 'menengah', time: '10', access: 'Token', date: '25 Juni 2026' },
  { slug: 'supabase-dasar', title: 'Supabase untuk Developer', icon: '⚡', cat: 'Database', desc: 'Backend PostgreSQL instan', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },

  // === AI & Data Science ===
  { slug: 'python-data-science', title: 'Python untuk Data Science', icon: '🐍', cat: 'AI & Data Science', desc: 'Python untuk analisis data', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'machine-learning-dasar', title: 'Machine Learning Dasar', icon: '🧠', cat: 'AI & Data Science', desc: 'Pengenalan ML dari nol', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'chatgpt-ai-tools', title: 'ChatGPT & AI Tools', icon: '💬', cat: 'AI & Data Science', desc: 'AI untuk produktivitas', diff: 'pemula', time: '10', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'data-visualization', title: 'Data Visualization', icon: '📊', cat: 'AI & Data Science', desc: 'Visualisasi data Python', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'pandas-numpy', title: 'Pandas & NumPy', icon: '🐼', cat: 'AI & Data Science', desc: 'Data manipulation Python', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },

  // === Mobile Development ===
  { slug: 'flutter-dasar', title: 'Flutter untuk Pemula', icon: '💙', cat: 'Mobile Development', desc: 'App cross-platform', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'react-native-dasar', title: 'React Native Dasar', icon: '⚛️', cat: 'Mobile Development', desc: 'Mobile dengan JavaScript', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'android-kotlin', title: 'Android dengan Kotlin', icon: '🤖', cat: 'Mobile Development', desc: 'Native Android development', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'mobile-uiux', title: 'Mobile UI/UX Design', icon: '🎨', cat: 'Mobile Development', desc: 'Desain antarmuka mobile', diff: 'pemula', time: '10', access: 'Gratis', date: '25 Juni 2026' },

  // === DevOps & Cloud ===
  { slug: 'docker-dasar', title: 'Docker untuk Developer', icon: '🐳', cat: 'DevOps & Cloud', desc: 'Containerize aplikasi', diff: 'pemula', time: '13', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'cicd-github-actions', title: 'CI/CD GitHub Actions', icon: '🔄', cat: 'DevOps & Cloud', desc: 'Automasi build & deploy', diff: 'menengah', time: '11', access: 'Token', date: '25 Juni 2026' },
  { slug: 'cloud-aws-dasar', title: 'AWS untuk Pemula', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Cloud computing AWS', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'kubernetes-dasar', title: 'Kubernetes untuk Pemula', icon: '⎈', cat: 'DevOps & Cloud', desc: 'Orchestrate container', diff: 'lanjut', time: '15', access: 'Token', date: '25 Juni 2026' },

  // === IT Career ===
  { slug: 'roadmap-belajar-it', title: 'Roadmap Belajar IT 2026', icon: '🗺️', cat: 'IT Career', desc: 'Jalur belajar IT lengkap', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'sertifikasi-it', title: 'Sertifikasi IT Populer', icon: '📜', cat: 'IT Career', desc: 'Sertifikasi industri IT', diff: 'pemula', time: '10', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'portfolio-developer', title: 'Portfolio & CV Developer', icon: '💼', cat: 'IT Career', desc: 'Bangun portfolio menarik', diff: 'pemula', time: '9', access: 'Gratis', date: '25 Juni 2026' },
  // === Web Development (expanded) ===
  { slug: 'nextjs-dasar', title: 'Next.js untuk Pemula', icon: '▲', cat: 'Web Development', desc: 'React framework full-stack', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'tailwind-css', title: 'Tailwind CSS', icon: '🎨', cat: 'Web Development', desc: 'Utility-first CSS framework', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'testing-jest', title: 'Testing JavaScript dengan Jest', icon: '🧪', cat: 'Web Development', desc: 'Unit testing JavaScript', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'pwa-dasar', title: 'Progressive Web App', icon: '📲', cat: 'Web Development', desc: 'Website yang seperti app', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'web-performance', title: 'Web Performance Optimization', icon: '⚡', cat: 'Web Development', desc: 'Optimasi performa web', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'auth-authorization', title: 'Authentication & Authorization', icon: '🔐', cat: 'Web Development', desc: 'Keamanan autentikasi web', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },

  // === Database (expanded) ===
  { slug: 'postgresql-dasar', title: 'PostgreSQL untuk Developer', icon: '🐘', cat: 'Database', desc: 'Database PostgreSQL', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'mysql-dasar', title: 'MySQL untuk Pemula', icon: '🐬', cat: 'Database', desc: 'Database MySQL', diff: 'pemula', time: '13', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'prisma-orm', title: 'Prisma ORM', icon: '💎', cat: 'Database', desc: 'Database ORM modern', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'graphql-database', title: 'GraphQL untuk Pemula', icon: '◼️', cat: 'Database', desc: 'Query language untuk API', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },

  // === AI & Data Science (expanded) ===
  { slug: 'deep-learning-tensorflow', title: 'Deep Learning dengan TensorFlow', icon: '🧬', cat: 'AI & Data Science', desc: 'Neural networks & deep learning', diff: 'lanjut', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'nlp-dasar', title: 'NLP: Natural Language Processing', icon: '📝', cat: 'AI & Data Science', desc: 'Pemrosesan bahasa alami', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'computer-vision-opencv', title: 'Computer Vision dengan OpenCV', icon: '👁️', cat: 'AI & Data Science', desc: 'Pengenalan gambar & video', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'langchain-ai-agent', title: 'LangChain & AI Agent', icon: '🔗', cat: 'AI & Data Science', desc: 'Build AI agent dengan LLM', diff: 'lanjut', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'mlops-deployment', title: 'MLOps: Deploy Model ML', icon: '🚀', cat: 'AI & Data Science', desc: 'Deploy model ke production', diff: 'lanjut', time: '14', access: 'Token', date: '25 Juni 2026' },

  // === Mobile Development (expanded) ===
  { slug: 'swift-ios', title: 'Swift untuk iOS', icon: '🍎', cat: 'Mobile Development', desc: 'iOS development dengan Swift', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'jetpack-compose', title: 'Jetpack Compose', icon: '🤖', cat: 'Mobile Development', desc: 'UI modern Android', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'flutter-state-management', title: 'State Management Flutter', icon: '🔄', cat: 'Mobile Development', desc: 'Riverpod & BLoC pattern', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'app-store-publishing', title: 'Publish ke App Store', icon: '🏪', cat: 'Mobile Development', desc: 'Deploy ke Play Store & App Store', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },

  // === DevOps & Cloud (expanded) ===
  { slug: 'terraform-iac', title: 'Terraform: Infrastructure as Code', icon: '🏗️', cat: 'DevOps & Cloud', desc: 'Infrastruktur sebagai kode', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'monitoring-observability', title: 'Monitoring & Observability', icon: '📊', cat: 'DevOps & Cloud', desc: 'Metrics, logs, traces', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'linux-server-admin', title: 'Linux Server Administration', icon: '🐧', cat: 'DevOps & Cloud', desc: 'Kelola server Linux', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'nginx-load-balancing', title: 'Nginx: Web Server & Load Balancer', icon: '🔄', cat: 'DevOps & Cloud', desc: 'Web server & reverse proxy', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'gitops-argocd', title: 'GitOps dengan ArgoCD', icon: '🎯', cat: 'DevOps & Cloud', desc: 'Git-based deployment', diff: 'lanjut', time: '13', access: 'Token', date: '25 Juni 2026' },

  // === IT Career (expanded) ===
  { slug: 'interview-teknis', title: 'Interview Teknis IT', icon: '🎤', cat: 'IT Career', desc: 'Persiapan interview teknis', diff: 'pemula', time: '12', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'freelance-developer', title: 'Freelance Developer', icon: '💻', cat: 'IT Career', desc: 'Panduan freelance IT', diff: 'pemula', time: '11', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'soft-skill-developer', title: 'Soft Skill untuk Developer', icon: '🤝', cat: 'IT Career', desc: 'Komunikasi & teamwork', diff: 'pemula', time: '10', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'open-source-contribution', title: 'Open Source Contribution', icon: '🌍', cat: 'IT Career', desc: 'Kontribusi ke open source', diff: 'pemula', time: '10', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'gaji-negosiasi-it', title: 'Gaji & Negosiasi IT', icon: '💰', cat: 'IT Career', desc: 'Negosiasi gaji IT Indonesia', diff: 'pemula', time: '9', access: 'Gratis', date: '25 Juni 2026' },

  // === Keamanan (expanded) ===
  { slug: 'owasp-top10', title: 'OWASP Top 10', icon: '🛡️', cat: 'Keamanan', desc: 'Vulnerability web umum', diff: 'menengah', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'penetration-testing', title: 'Penetration Testing', icon: '🔍', cat: 'Keamanan', desc: 'Ethical hacking & pentest', diff: 'lanjut', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'cryptography-developer', title: 'Kriptografi untuk Developer', icon: '🔒', cat: 'Keamanan', desc: 'Enkripsi & hashing', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'incident-response', title: 'Incident Response & Forensik', icon: '🚨', cat: 'Keamanan', desc: 'Respons insiden keamanan', diff: 'lanjut', time: '14', access: 'Token', date: '25 Juni 2026' },
  { slug: 'security-audit', title: 'Security Audit & Compliance', icon: '📋', cat: 'Keamanan', desc: 'Audit keamanan & compliance', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },

  // === Python (expanded) ===
  { slug: 'python-pemula', title: 'Python untuk Pemula', icon: '🐍', cat: 'Python', desc: 'Dasar Python dari nol', diff: 'pemula', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'django-web', title: 'Django Web Framework', icon: '🎸', cat: 'Python', desc: 'Full-stack Python web', diff: 'menengah', time: '15', access: 'Token', date: '25 Juni 2026' },
  { slug: 'flask-pemula', title: 'Flask: Micro Web Framework', icon: '🧪', cat: 'Python', desc: 'Web framework ringan', diff: 'menengah', time: '13', access: 'Token', date: '25 Juni 2026' },
  { slug: 'python-testing-pytest', title: 'Python Testing dengan pytest', icon: '✅', cat: 'Python', desc: 'Testing framework Python', diff: 'menengah', time: '12', access: 'Token', date: '25 Juni 2026' },
  { slug: 'python-packaging', title: 'Python Packaging & Distribution', icon: '📦', cat: 'Python', desc: 'Publish package ke PyPI', diff: 'menengah', time: '11', access: 'Token', date: '25 Juni 2026' },
{ slug: 'websocket-basics', title: 'WebSocket: Real-time Communication di Web', icon: '🔌', cat: 'Protokol', desc: 'Tutorial lengkap WebSocket — protokol, implementasi Node.js, rooms, scaling, heartbeat', diff: 'menengah', time: '14', access: 'Token', date: '26 Juni 2026' },
  { slug: 'angular-basics', title: 'Angular: Framework Web Enterprise', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Angular untuk pemula dan menengah — components, services, ro...', diff: 'lanjut', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'ansible-basics', title: 'Ansible: Automation Platform', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Ansible — playbooks, roles, inventory, modules, ad-hoc comma...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'astro-framework', title: 'Astro: Web Framework Modern untuk Con...', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Astro framework — Islands Architecture, SSG, content collect...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'aws-api-gateway', title: 'AWS API Gateway', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap AWS API Gateway — REST API, HTTP API, stages, throttling, au...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'aws-cloudformation', title: 'AWS CloudFormation: Infrastructure as Code', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap AWS CloudFormation — YAML/JSON templates, stacks, stack sets...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'aws-ecs-containers', title: 'AWS ECS: Container Service', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap AWS ECS — Fargate, task definitions, services, cluster, load...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'aws-lambda-serverless', title: 'AWS Lambda: Serverless Functions — Trigger...', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap AWS Lambda — serverless functions, triggers, layers, cold st...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'aws-s3-storage', title: 'AWS S3: Object Storage', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap AWS S3 — buckets, object lifecycle, policies, presigned URLs...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'bug-bounty-basics', title: 'Bug Bounty: Panduan Memulai untuk Pemula', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari Bug Bounty secara mendalam — platform populer, metodologi pengujian,...', diff: 'pemula', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'burp-suite-basics', title: 'Burp Suite: Web Security Testing — Panduan Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari Burp Suite — panduan lengkap web security testing: Proxy, Repeater, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'capacitor-ionic', title: 'Capacitor: Web to Mobile', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap Capacitor untuk membangun hybrid mobile apps — dari web ke n...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'career-backend-developer', title: 'Karir Backend Developer: Panduan Lengkap 2026', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap karir backend developer — skill yang dibutuhkan, bahasa pemro...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'career-data-scientist', title: 'Karir Data Scientist: Skills, Tools & Proyek 2026', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap karir Data Scientist 2026 — skills, tools, proyek portfolio, ...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'career-devops-engineer', title: 'Karir DevOps Engineer: Skills, Tools & Gaji 2026', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap karir DevOps Engineer 2026 — skills yang dibutuhkan, tools wa...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'career-frontend-developer', title: 'Karir Frontend Developer 2026: Panduan Lengkap', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap karir Frontend Developer 2026 — skill yang dibutuhkan, roadma...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'cassandra-basics', title: 'Apache Cassandra: NoSQL Distributed Database', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Apache Cassandra — data model, CQL, replication, consistency...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'cert-aws-solutions-architect', title: 'AWS Solutions Architect Certification Guide 2026', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap persiapan AWS Solutions Architect Associate Certification — t...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'cert-kubernetes-cka', title: 'CKA: Certified Kubernetes Administr...', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap CKA (Certified Kubernetes Administrator) — exam domains, hand...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'clerk-auth', title: 'Clerk: Authentication Platform', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Clerk Authentication — setup, komponen UI, webhooks, organiz...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'cloudflare-workers', title: 'Cloudflare Workers: Edge Computing', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Cloudflare Workers — KV Storage, Durable Objects, R2 Object ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'couchdb-basics', title: 'Apache CouchDB: NoSQL Document Database Lengkap', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Apache CouchDB — document database NoSQL dengan replication,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'css-animations', title: 'CSS Animations & Transitions: Panduan Lengkap', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap CSS Animations dan Transitions — keyframes, transitions, tra...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'css-container-queries', title: 'CSS Container Queries: Responsive Tanpa Media Query', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap CSS Container Queries — containment, size queries, style que...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'css-grid-advanced', title: 'CSS Grid Advanced: Grid Areas, Subgrid & Named Lines', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap CSS Grid Advanced — grid-template-areas, auto-fit/auto-fill,...', diff: 'lanjut', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'css-variables-design-system', title: 'CSS Variables: Membangun Design System', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap CSS Custom Properties (Variables) — membangun design system,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'cv-object-detection', title: 'Computer Vision: Object Detection — YOLO, R-CNN, SSD', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Object Detection — YOLO, R-CNN, Faster R-CNN, SSD, mAP metri...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'cypress-e2e', title: 'Cypress: End-to-End Testing', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Cypress E2E Testing — commands, assertions, fixtures, custom...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'database-sharding', title: 'Database Sharding: Panduan Horizontal Scaling', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Database Sharding — strategi sharding, routing, cross-shard ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'dl-cnn-image', title: 'CNN: Convolutional Neural Networks', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap CNN — convolution layers, pooling, arsitektur populer, image...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'dl-rnn-sequence', title: 'RNN: Recurrent Neural Networks — Se...', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap RNN — arsitektur recurrent, vanishing gradient, LSTM, GRU, s...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'dl-transfer-learning', title: 'Transfer Learning: Pre-trained Models & Fine-Tuning', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Transfer Learning — pre-trained models, fine-tuning, feature...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'dl-transformer-attention', title: 'Transformer & Attention Mechanism', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Transformer — self-attention, multi-head attention, position...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'docker-compose-advanced', title: 'Docker Compose Advanced: Multi-Service & Best Practices', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial advanced Docker Compose — multi-service architecture, custom network...', diff: 'lanjut', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'docker-security', title: 'Docker Security Best Practices: Rootless, Scanning & Hardening...', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Panduan lengkap Docker Security — rootless mode, image scanning, secrets mana...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'drizzle-orm', title: 'Drizzle ORM: TypeScript ORM Modern dan Cepat', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Drizzle ORM untuk TypeScript — schema definition, queries, m...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'dynamodb-basics', title: 'AWS DynamoDB: NoSQL Database', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap AWS DynamoDB — tables, queries, indexes (GSI/LSI), capacity ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'elasticsearch-basics', title: 'Elasticsearch: Search Engine & Analytics', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Elasticsearch — queries, mappings, aggregations, index manag...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'elk-stack-logging', title: 'ELK Stack: Logging Platform', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap ELK Stack — Elasticsearch, Logstash, Kibana, Filebeat, index...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'eslint-prettier', title: 'ESLint & Prettier: Code Quality', icon: '🛠️', cat: 'Tools', desc: 'Tutorial lengkap ESLint dan Prettier — konfigurasi rules, plugins, integrasi ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'expo-react-native', title: 'Expo: React Native Development', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap Expo untuk React Native — dari managed workflow, OTA updates...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'fastify-node', title: 'Fastify: Fast Node.js Framework', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Fastify framework — plugins, hooks, validation, TypeScript, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'firebase-firestore', title: 'Firebase Firestore: NoSQL Cloud — Queries, Real-ti...', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Firebase Firestore — queries, real-time listeners, security ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'flutter-animation', title: 'Flutter: Animasi & Transisi', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap animasi di Flutter — dari implicit animations, explicit anim...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'flutter-firebase', title: 'Flutter + Firebase Integration: Panduan Lengkap', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap integrasi Flutter dengan Firebase — Authentication, Firestor...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'flutter-push-notifications', title: 'Flutter Push Notifications: Panduan Lengkap FCM & Local No...', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap push notifications di Flutter — Firebase Cloud Messaging (FC...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'forensics-disk-imaging', title: 'Digital Forensics: Disk Imaging - Panduan Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari Digital Forensics Disk Imaging secara mendalam — tools forensik, cha...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'gcp-cloud-run', title: 'Google Cloud Run: Serverless Containers', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Google Cloud Run — deploy container tanpa manage server, aut...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'gitlab-ci-basics', title: 'GitLab CI/CD: Panduan Dasar untuk Developer', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap GitLab CI/CD — .gitlab-ci.yml, jobs, stages, runners, variab...', diff: 'pemula', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'graphql-apollo', title: 'GraphQL dengan Apollo Client: Panduan Lengkap', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap GraphQL dengan Apollo Client — queries, mutations, cache man...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'html-semantics-accessibility', title: 'HTML Semantics & Accessibility: Panduan Lengkap', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap HTML Semantics dan Accessibility — elemen semantik, ARIA att...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'huggingface-transformers', title: 'HuggingFace Transformers', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap HuggingFace Transformers — pipelines, models, tokenizers, fi...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'iso-27001-basics', title: 'ISO 27001: Keamanan Informasi — ISMS, Kon...', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap ISO 27001 — Information Security Management System (ISMS), A...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-async-await', title: 'JavaScript Async/Await: Panduan Lengkap', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap JavaScript Async/Await — Promises, async functions, error ha...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-es-modules', title: 'JavaScript ES Modules: Import, Export & Tree Shaking', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap JavaScript ES Modules — named exports, default exports, dyna...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-fetch-api', title: 'Fetch API: HTTP Requests Modern di JavaScript', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Fetch API — GET/POST, headers, streaming, AbortController, e...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-local-storage', title: 'Web Storage API: localStorage, sessionStorage, ...', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Web Storage API — localStorage, sessionStorage, IndexedDB, C...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-proxy-reflect', title: 'JavaScript Proxy & Reflect: Metaprogramming Modern', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap JavaScript Proxy dan Reflect API — traps, handlers, metaprog...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-service-workers', title: 'Service Workers: Offline & PWA', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Service Workers — lifecycle, caching strategies, push notifi...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-web-components', title: 'Web Components: Komponen Web Native', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Web Components — Shadow DOM, Custom Elements, HTML Templates...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'javascript-workers-web', title: 'Web Workers: Multithreading di JavaScript', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Web Workers — dedicated workers, shared workers, transferabl...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'jenkins-basics', title: 'Jenkins: CI/CD Automation — Pipeline, P...', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Jenkins CI/CD — Declarative & Scripted Pipeline, Jenkinsfile...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'jetpack-compose-animation', title: 'Jetpack Compose Animations: Panduan Lengkap', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap animasi di Jetpack Compose — animate*AsState, updateTransiti...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'job-remote-work', title: 'Remote Work untuk Developer: Panduan Lengkap', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap remote work untuk developer — tools, timezone management, com...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'job-resume-tips', title: 'Resume Developer: Tips & Contoh 2026', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap membuat resume developer — format, konten, ATS optimization, ...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'job-salary-negotiation', title: 'Salary Negotiation untuk Developer: Panduan Lengkap 2026...', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap negosiasi gaji untuk developer — riset gaji, teknik negosiasi...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'kotlin-coroutines', title: 'Kotlin Coroutines: Async Programming', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap Kotlin Coroutines — dari launch, async, withContext, Flow, h...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'kotlin-flow', title: 'Kotlin Flow: Reactive Streams untuk Android Modern', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap Kotlin Flow — StateFlow, SharedFlow, Flow operators, cold vs...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'kubernetes-helm', title: 'Kubernetes Helm: Package Manager', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Kubernetes Helm — charts, values, releases, repositories, in...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'kubernetes-ingress', title: 'Kubernetes Ingress Controllers', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Kubernetes Ingress Controllers — NGINX ingress, path-based r...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'malware-analysis-basics', title: 'Malware Analysis: Pengenalan', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari Malware Analysis — pengenalan static analysis, dynamic analysis, san...', diff: 'pemula', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'metasploit-basics', title: 'Metasploit: Penetration Testing Framework Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap Metasploit Framework — payloads, exploits, post-exploitation...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'ml-decision-trees', title: 'Decision Trees: Pohon Keputusan', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Decision Trees — konsep splitting criteria (Gini, Entropy), ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'ml-ensemble-methods', title: 'Ensemble Methods: Bagging, Boosting & Kombinasi Model', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Ensemble Methods — Bagging, Boosting, Random Forest, XGBoost...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'ml-k-means-clustering', title: 'K-Means Clustering: Panduan Lengkap', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap K-Means Clustering — konsep dasar, elbow method, silhouette ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'ml-linear-regression', title: 'Linear Regression: Regresi Linier', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Linear Regression — simple linear regression, multiple linea...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'ml-random-forest', title: 'Random Forest: Ensemble Learning', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Random Forest — bagging, feature importance, hyperparameter ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'ml-svm', title: 'Support Vector Machine (SVM)', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap SVM — kernels, margin, hyperplane, klasifikasi, regresi, dan...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'neo4j-graph-database', title: 'Neo4j: Graph Database — Cypher, Nodes...', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Neo4j Graph Database — Cypher query language, nodes, relatio...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'netlify-deployment', title: 'Netlify: Deploy & Host Modern Web', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Netlify — deploy website modern, serverless functions, form ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'network-dns-security', title: 'DNS Security: Panduan Lengkap Keamanan DNS', icon: '🔗', cat: 'Networking', desc: 'Tutorial lengkap keamanan DNS — DNSSEC, DNS over HTTPS, DNS filtering, serang...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'network-zero-trust', title: 'Zero Trust Security Model: Panduan Implementasi', icon: '🔗', cat: 'Networking', desc: 'Pelajari Zero Trust Security Model secara mendalam — prinsip-prinsip utama, s...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'nextauth-basics', title: 'NextAuth.js: Authentication untuk Next.js', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap NextAuth.js — providers, sessions, callbacks, database adapt...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'nlp-text-classification', title: 'NLP Text Classification', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap NLP Text Classification — tokenization, embeddings, models, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'nmap-scanning', title: 'Nmap: Network Scanning — Panduan Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari Nmap — panduan lengkap network scanning: port scanning, OS detection...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'nuxt-js', title: 'Nuxt.js: Vue Full-Stack Framework', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Nuxt.js — SSR, SSG, auto-imports, modules, routing otomatis,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'openai-api-basics', title: 'OpenAI API: Panduan Developer', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap OpenAI API — Chat Completions, embeddings, fine-tuning, func...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'opentelemetry', title: 'OpenTelemetry: Observability untuk Developer', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap OpenTelemetry — distributed tracing, metrics, logs, exporter...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'playwright-testing', title: 'Playwright: Modern End-to-End Testing', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Playwright Testing — locators, fixtures, trace viewer, paral...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'postcss-basics', title: 'PostCSS: CSS Transformation', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap PostCSS — plugin system, autoprefixer, nesting, custom prope...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'prisma-advanced', title: 'Prisma ORM Advanced: Middleware, Extensions & Perfo...', icon: '🌐', cat: 'Web Development', desc: 'Tutorial advanced Prisma ORM — middleware, extensions, raw queries, N+1 optim...', diff: 'lanjut', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'prodev-blogging', title: 'Technical Blogging untuk Developer: Panduan Lengkap', icon: '💼', cat: 'IT Career', desc: 'Panduan lengkap technical blogging untuk developer — platform, SEO, monetizat...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'prodev-continuous-learning', title: 'Continuous Learning untuk Developer 2026', icon: '💼', cat: 'IT Career', desc: 'Panduan continuous learning untuk developer — resources, habits, community, d...', diff: 'menengah', time: '20', access: 'Gratis', date: '26 Juni 2026' },
  { slug: 'prometheus-grafana-advanced', title: 'Prometheus & Grafana Advanced', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lanjutan Prometheus & Grafana — custom metrics, PromQL, alerting rul...', diff: 'lanjut', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-argparse-cli', title: 'Python Argparse: Membangun CLI Tools', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Argparse — arguments, subcommands, validation, dan me...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-asyncio-basics', title: 'Python asyncio: Async Programming', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python asyncio — event loop, tasks, coroutines, semaphores, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-click-cli', title: 'Python Click: Build CLI Tools Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Click untuk membangun CLI tools — commands, arguments...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-context-managers', title: 'Python Context Managers', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python context managers — with statement, __enter__/__exit__...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-csv-processing', title: 'Python CSV Processing: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python CSV Processing — csv module, pandas, menangani file b...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-dataclasses', title: 'Python Dataclasses: Data Classes', icon: '🐍', cat: 'Python', desc: 'Panduan lengkap Python Dataclasses — @dataclass, field options, inheritance, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-decorators', title: 'Python Decorators: Fungsi Pembungkus', icon: '🐍', cat: 'Python', desc: 'Panduan lengkap Python Decorators — function decorators, class decorators, bu...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-design-patterns', title: 'Python Design Patterns: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Design Patterns — Singleton, Factory, Observer, Strat...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-file-io', title: 'Python File I/O: Baca Tulis File', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python File I/O — open, read, write, CSV, JSON, pathlib, con...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-generators', title: 'Python Generators & Yield', icon: '🐍', cat: 'Python', desc: 'Panduan lengkap Python Generators & Yield — yield keyword, generator expressi...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-json-processing', title: 'Python JSON Processing', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python JSON processing — json module, serialization, custom ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-list-comprehension', title: 'Python List Comprehension: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Panduan lengkap Python List Comprehension — list comprehension, dict comprehe...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-logging', title: 'Python Logging: Sistem Logging', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Logging — logger, handlers, formatters, levels, confi...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-matplotlib', title: 'Matplotlib: Visualisasi Data Python', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Matplotlib untuk visualisasi data — line plot, bar chart, sc...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-metaclasses', title: 'Python Metaclasses: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Metaclasses — type(), __new__, __init_subclass__, ABC...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-multiprocessing', title: 'Python Multiprocessing: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Multiprocessing — Pool, Queue, shared memory, sinkron...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-numpy-basics', title: 'NumPy: Array Computing Python', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap NumPy untuk Python — pembuatan array, operasi matematika, br...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-openpyxl-excel', title: 'Python Excel: openpyxl & pandas', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap manipulasi Excel dengan Python menggunakan openpyxl dan pand...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-pandas-basics', title: 'Pandas: Data Manipulation Python', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Pandas untuk Python — DataFrame, Series, indexing, filtering...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-pathlib-files', title: 'Python Pathlib: File System Modern', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python pathlib — Path objects, operasi file system, globbing...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-plotly-interactive', title: 'Plotly: Visualisasi Interaktif untuk Data Science', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Plotly — scatter, line, bar, heatmap, 3D, maps, Dashboards, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-poetry-packaging', title: 'Python Poetry: Manajemen Dependency', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Poetry untuk manajemen dependency — pyproject.toml, l...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-pre-commit-hooks', title: 'Python Pre-commit Hooks: Otomatiskan Kode Berkualitas', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python pre-commit hooks — setup, linting, formatting, securi...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-profiling', title: 'Python Profiling & Optimisasi: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python profiling dan optimisasi — cProfile, memory_profiler,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-regular-expressions', title: 'Regular Expressions (Regex) Python: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Regular Expressions (Regex) di Python — pola dasar, groups, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-requests-http', title: 'Python Requests: HTTP Client Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python Requests library — GET, POST, headers, sessions, auth...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-scikit-learn', title: 'Scikit-learn: Machine Learning Library', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Scikit-learn — classification, regression, clustering, featu...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-scipy', title: 'SciPy: Scientific Computing dengan Python', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap SciPy — optimization, interpolation, signal processing, line...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-security', title: 'Python Security Best Practices', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap keamanan Python — input validation, secrets management, OWAS...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-selenium-automation', title: 'Selenium: Web Automation Python Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Selenium WebDriver di Python — browser automation, selectors...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-sqlalchemy-orm', title: 'SQLAlchemy ORM untuk Python: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap SQLAlchemy ORM di Python — models, queries, relationships, m...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-threading-multiprocessing', title: 'Python Threading & Multiprocessing', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python threading dan multiprocessing — thread, process, sync...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-type-hints', title: 'Python Type Hints: Type Annotations', icon: '🐍', cat: 'Python', desc: 'Panduan lengkap Python Type Hints — typing module, generics, protocols, mypy,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-virtual-environments', title: 'Python Virtual Environments', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python virtual environments — venv, conda, pip-tools, poetry...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'python-wsgi-asgi', title: 'Python WSGI & ASGI: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Python WSGI & ASGI — Gunicorn, Uvicorn, Starlette, protocol,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'pytorch-basics', title: 'PyTorch: Deep Learning Framework', icon: '🤖', cat: 'AI & Data Science', desc: 'Tutorial lengkap PyTorch — tensors, autograd, nn.Module, training loop, loss ...', diff: 'lanjut', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'railway-deployment', title: 'Railway: Platform App Hosting Modern', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Railway.app — deploy aplikasi dari Git, managed databases, e...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'react-native-reanimated', title: 'React Native Reanimated: Animasi & Gesture Canggih', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap React Native Reanimated — shared values, worklets, animation...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'red-team-operations', title: 'Red Team Operations: Panduan Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap Red Team Operations — planning, execution, tools, teknik ser...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'remix-framework', title: 'Remix: Full-Stack Web Framework', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Remix framework — loaders, actions, nested routes, form hand...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sass-scss-basics', title: 'SASS/SCSS: CSS Preprocessor untuk Styling Modern', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap SASS/SCSS — variabel, mixins, nesting, functions, partials, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'security-awareness-training', title: 'Security Awareness Training: Pelatihan Kesadaran Keamanan...', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap Security Awareness Training — phishing, social engineering, ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'skill-api-design', title: 'API Design Best Practices: REST, Versioning & Documentati...', icon: '🌐', cat: 'Web Development', desc: 'Panduan lengkap API Design Best Practices 2026 — REST API, versioning, docume...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'skill-code-review', title: 'Code Review: Panduan Lengkap untuk Developer 2026', icon: '🌐', cat: 'Web Development', desc: 'Panduan lengkap code review untuk developer — best practices, tools, etika, d...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'skill-documentation', title: 'Technical Documentation Writing: Panduan Lengkap 2026', icon: '🌐', cat: 'Web Development', desc: 'Panduan lengkap teknis menulis dokumentasi — tools, struktur, automation, bes...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'skill-system-design', title: 'System Design untuk Developer: Panduan Lengkap', icon: '🌐', cat: 'Web Development', desc: 'Panduan system design untuk developer — scalability, load balancing, database...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'solid-js-basics', title: 'SolidJS: Reactive UI Framework', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap SolidJS untuk pemula dan menengah — signals, components, sto...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sql-indexes-advanced', title: 'SQL Indexes: Panduan Advanced — B-tree, Has...', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap SQL Indexes tingkat lanjut — B-tree, Hash, Composite, Coveri...', diff: 'lanjut', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sql-migration-tools', title: 'Database Migration Tools: Flyway, Alembic, Prisma Migrat...', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Database Migration Tools — Flyway, Alembic, Prisma Migrate u...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sql-partitioning', title: 'SQL Table Partitioning: Range, List & Hash Partitioning', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap SQL Table Partitioning — range, list, hash partitioning untu...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sql-query-optimization', title: 'SQL Query Optimization: Panduan Lengkap EXPLAIN, Index...', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap SQL Query Optimization — EXPLAIN, indexes, query plans, tekn...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sql-stored-procedures', title: 'SQL Stored Procedures & Functions: Panduan Lengkap', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap SQL Stored Procedures dan Functions — parameter, return valu...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sql-window-functions', title: 'SQL Window Functions: Panduan Lengkap ROW_NUMBER, RA...', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap SQL Window Functions — ROW_NUMBER, RANK, DENSE_RANK, LAG, LE...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sqlmap-automation', title: 'SQLMap: SQL Injection Automation Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap SQLMap — deteksi SQL injection otomatis, teknik tamper scrip...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'stripe-integration', title: 'Stripe Payment Integration: Panduan Lengkap', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Stripe Payment Integration — Checkout, Webhooks, Subscriptio...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'svelte-basics', title: 'Svelte: Framework Reaktif untuk Web Modern', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Svelte — components, stores, transitions, actions, reactivit...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'sveltekit', title: 'SvelteKit: Full-Stack Svelte', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap SvelteKit — routing, load functions, form actions, adapters,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'swiftui-basics', title: 'SwiftUI: UI Declarative iOS', icon: '📱', cat: 'Mobile Development', desc: 'Tutorial lengkap SwiftUI untuk pemula — dari views, modifiers, state manageme...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'threat-intelligence', title: 'Threat Intelligence: Panduan Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap Threat Intelligence — sumber data, framework, indikator komp...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'timescaledb', title: 'TimescaleDB: Time-Series SQL Database Lengkap', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap TimescaleDB — hypertables, compression, continuous aggregate...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'turbopack', title: 'Turbopack: Rust-based Bundler', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Turbopack — arsitektur Rust-based bundler, migrasi dari Webp...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'vector-database-pinecone', title: 'Vector Databases: Pinecone — Embeddings, Similar...', icon: '🗄️', cat: 'Database', desc: 'Tutorial lengkap Vector Database dengan Pinecone — embeddings, similarity sea...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'vercel-deployment', title: 'Vercel: Frontend Cloud Platform', icon: '☁️', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Vercel — deploy Next.js, serverless functions, edge function...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'vite-basics', title: 'Vite: Build Tool Cepat untuk Web Development Modern', icon: '🌐', cat: 'Web Development', desc: 'Tutorial lengkap Vite — setup, HMR, plugins, optimasi build, SSR, environment...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'web-auth-bypass', title: 'Authentication Bypass Attacks: Panduan Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap serangan authentication bypass — teknik, contoh exploit, stu...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'web-content-security-policy', title: 'Content Security Policy (CSP): Panduan Lengkap', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari Content Security Policy (CSP) secara mendalam — direktif, reporting,...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'web-cors-security', title: 'CORS Security: Cross-Origin Resource Sharing', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari CORS Security — cara kerja Cross-Origin Resource Sharing, preflight ...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'web-csrf-protection', title: 'CSRF Protection: Cross-Site Request Forgery', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari CSRF Protection — cara kerja serangan Cross-Site Request Forgery, to...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'web-file-upload-security', title: 'File Upload Security: Panduan Lengkap Keamanan Uploa...', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap keamanan file upload — validasi file, malware scanning, peny...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'web-jwt-security', title: 'JWT Security: Best Practices untuk Keamanan Token', icon: '🛡️', cat: 'Keamanan', desc: 'Pelajari JWT Security secara mendalam — struktur token JWT, serangan umum, pe...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
  { slug: 'web-ssrf-protection', title: 'SSRF: Server-Side Request Forgery — ...', icon: '🛡️', cat: 'Keamanan', desc: 'Tutorial lengkap SSRF (Server-Side Request Forgery) — memahami serangan, tekn...', diff: 'menengah', time: '20', access: 'Token', date: '26 Juni 2026' },
{ slug: 'c-pemula', title: 'C Programming untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap C Programming untuk pemula — variabel, pointer, array, fungs...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'cpp-memory-management', title: 'Memory Management di C++: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Memory Management di C++ — stack vs heap, RAII, smart pointe...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'cpp-modern', title: 'Modern C++ (C++17/20): Fitur Terbaru', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Modern C++ — smart pointers, move semantics, constexpr, conc...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'cpp-oop', title: 'C++ Object-Oriented Programming: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap C++ OOP — class, inheritance, polymorphism, template, STL, d...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'dns-lengkap', title: 'DNS Lengkap: Cara Kerja Domain Name System', icon: '🔗', cat: 'Networking', desc: 'Panduan lengkap DNS — cara kerja resolver, jenis record DNS, caching, DNSSEC,...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'edge-computing', title: 'Edge Computing untuk IoT: Panduan Lengkap', icon: '📡', cat: 'IoT', desc: 'Panduan lengkap Edge Computing untuk IoT — edge vs cloud, latency, Fog comput...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'go-concurrency', title: 'Go Concurrency: Goroutines & Channels', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Go Concurrency — goroutines, channels, select, sync package,...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'go-pemula', title: 'Go (Golang) untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Go (Golang) untuk pemula — instalasi, variabel, tipe data, f...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'go-testing', title: 'Go Testing: Unit Test & Benchmark', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Go Testing — testing package, table-driven tests, benchmarks...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'go-web-development', title: 'Go Web Development: net/http & Gin Framework', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Go Web Development — net/http, routing, middleware, JSON API...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'iot-cloud-platform', title: 'IoT Cloud Platform: Panduan Lengkap', icon: '📡', cat: 'IoT', desc: 'Panduan lengkap IoT Cloud Platform — AWS IoT Core, Azure IoT Hub, Google Clou...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'java-collections', title: 'Java Collections Framework: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Java Collections Framework — List, Set, Map, Iterator, Compa...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'java-pemula', title: 'Java untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Java untuk pemula — instalasi JDK, variabel, tipe data, OOP,...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'java-spring-boot', title: 'Spring Boot: REST API Modern', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Spring Boot — dependency injection, REST controller, JPA, se...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'java-streams', title: 'Java Streams API: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Java Streams API — stream operations, filter, map, reduce, c...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'javascript-array-methods', title: 'JavaScript Array Methods: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap JavaScript Array Methods — map, filter, reduce, find, some, ...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'javascript-closures-scope', title: 'Closures & Scope di JavaScript', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Closures dan Scope di JavaScript — global scope, function sc...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'javascript-dom-manipulation', title: 'DOM Manipulation: Panduan Lengkap JavaScript', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap DOM Manipulation JavaScript — getElementById, querySelector,...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'javascript-pemula', title: 'JavaScript untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap JavaScript untuk pemula — variabel, tipe data, operator, fun...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'kotlin-pemula', title: 'Kotlin untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Kotlin untuk pemula — variabel, null safety, extension, coro...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'lora-mesh-network', title: 'LoRa Mesh Networking: Multi-Hop & Deployment', icon: '📡', cat: 'LoRa', desc: 'Tutorial lengkap LoRa Mesh Networking — topologi mesh, routing protocol, mult...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'lora-wan-protocol', title: 'LoRaWAN Protocol: Arsitektur & Implementasi', icon: '📡', cat: 'LoRa', desc: 'Tutorial lengkap LoRaWAN Protocol — arsitektur gateway, node, ADR, class A/B/...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'mqtt-lengkap', title: 'MQTT Protocol: Panduan Lengkap', icon: '📡', cat: 'IoT', desc: 'Panduan lengkap protokol MQTT untuk IoT — broker, QoS, topic hierarchy, retai...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'php-laravel', title: 'Laravel Framework: Panduan Dasar', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Laravel untuk developer — routing, Blade templating, Eloquen...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'php-oop', title: 'PHP Object-Oriented Programming', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap PHP OOP — class, trait, interface, namespace, autoloading, d...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'php-pemula', title: 'PHP untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap PHP untuk pemula — instalasi, variabel, array, fungsi, form ...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'php-security', title: 'PHP Security Best Practices', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap keamanan PHP — SQL injection, XSS, CSRF, input validation, p...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'raspberry-pi-cluster', title: 'Raspberry Pi Cluster Computing: K3s, Docker Swarm & Hadoop...', icon: '🍓', cat: 'Raspberry Pi', desc: 'Tutorial lengkap Raspberry Pi Cluster Computing — K3s Kubernetes, Docker Swar...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'raspberry-pi-home-server', title: 'Raspberry Pi Home Server: NAS, Pi-hole, VPN & Media Serv...', icon: '🍓', cat: 'Raspberry Pi', desc: 'Tutorial lengkap Raspberry Pi Home Server — NAS, Pi-hole ad blocker, WireGuar...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'ruby-metaprogramming', title: 'Ruby Metaprogramming', icon: '🐍', cat: 'Python', desc: 'Tutorial Ruby Metaprogramming — method_missing, define_method, singleton meth...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'ruby-pemula', title: 'Ruby untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Ruby untuk pemula — instalasi, variabel, tipe data, block, i...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'ruby-rails', title: 'Ruby on Rails: Web Development', icon: '🐍', cat: 'Python', desc: 'Tutorial Ruby on Rails untuk pengembangan web — MVC, routing, Active Record, ...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'ruby-testing-rspec', title: 'Ruby Testing dengan RSpec', icon: '🐍', cat: 'Python', desc: 'Tutorial Ruby Testing dengan RSpec — describe, context, it, let, mocks, share...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'rust-concurrency', title: 'Rust Concurrency: Threads & Async', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap concurrency di Rust — threads, mutex, channels, async/await,...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'rust-error-handling', title: 'Error Handling di Rust', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap error handling di Rust — Result, Option, unwrap, custom erro...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'rust-ownership', title: 'Ownership & Borrowing di Rust', icon: '🐍', cat: 'Python', desc: 'Tutorial mendalam tentang ownership, borrowing, references, lifetimes, dan mo...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'rust-pemula', title: 'Rust untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Rust untuk pemula — instalasi, variabel, ownership, borrowin...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'sensor-interfacing', title: 'Sensor Interfacing dengan Microcontroller', icon: '📡', cat: 'IoT', desc: 'Panduan lengkap sensor interfacing dengan microcontroller — ADC, I2C, SPI, UA...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'swift-pemula', title: 'Swift untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap Swift untuk pemula — variabel, tipe data, optional, enum, st...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'tcp-ip-dasar', title: 'TCP/IP Dasar: Panduan Lengkap', icon: '🔗', cat: 'Networking', desc: 'Panduan lengkap TCP/IP untuk pemula — model OSI, protokol TCP dan UDP, IP add...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'typescript-advanced-types', title: 'TypeScript Advanced Types: Union, Intersection & Mapped T...', icon: '🐍', cat: 'Python', desc: 'Tutorial lanjutan TypeScript — union types, intersection types, conditional t...', diff: 'lanjut', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'typescript-decorators', title: 'TypeScript Decorators: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap TypeScript Decorators — class decorators, method decorators,...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'typescript-generics', title: 'TypeScript Generics: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap TypeScript Generics — generic functions, generic classes, co...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'typescript-pemula', title: 'TypeScript untuk Pemula: Panduan Lengkap', icon: '🐍', cat: 'Python', desc: 'Tutorial lengkap TypeScript untuk pemula — instalasi, type annotations, inter...', diff: 'pemula', time: '20', access: 'Gratis', date: '27 Juni 2026' },
  { slug: 'vpn-panduan', title: 'VPN: Virtual Private Network Panduan Lengkap', icon: '🔗', cat: 'Networking', desc: 'Panduan lengkap VPN — protokol VPN, tunneling, OpenVPN, WireGuard, IPSec, set...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'wifi-security', title: 'WiFi Security: Keamanan Jaringan Nirkabel', icon: '🔗', cat: 'Networking', desc: 'Panduan lengkap WiFi security — WPA3, WPA2, rogue AP, WiFi pen testing, hard...', diff: 'menengah', time: '20', access: 'Token', date: '27 Juni 2026' },
  { slug: 'ai-agent-architecture', title: 'AI Agent Architecture', icon: '🐝', cat: 'AI & Data Science', desc: 'Tutorial lengkap AI Agent Architecture.', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'airflow-orchestration', title: 'Apache Airflow untuk Data Pipeline — DAGs, Operators &amp; Monitoring', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Apache Airflow — DAGs, operators, XCom, sensors, pools, backfil', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'android-compose-advanced', title: 'Jetpack Compose Advanced', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap Jetpack Compose Advanced. Custom layout, animation, side effect', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'api-security-testing', title: 'API Security Testing', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari API Security Testing: OWASP API Top 10, REST API vulnerabilities, JWT a', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'arduino-libraries', title: 'Membuat Arduino Library yang Profesional: Dari Dasar hingga Publish', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap membuat Arduino Library profesional. Pelajari header files, cla', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'argocd-gitops', title: 'ArgoCD: GitOps for Kubernetes', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap ArgoCD untuk GitOps di Kubernetes — Application CRD, sync strat', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'astro-content-collections', title: 'Astro Content Collections', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap Astro Content Collections — schema definition, collection queri', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'aws-iot-core', title: 'AWS IoT Core untuk Device Management', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap AWS IoT Core untuk manajemen device IoT. Pelajari MQTT broker, ', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'azure-iot-hub', title: 'Azure IoT Hub untuk Device Management', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap Azure IoT Hub. Pelajari device twins, direct methods, file uplo', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'backstage-developer-portal', title: 'Backstage Developer Portal', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Backstage Developer Portal — Software Catalog, TechDocs, scaffo', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'bgp-fundamentals', title: 'BGP Fundamentals untuk ISP', icon: '📖', cat: 'Networking', desc: 'Tutorial lengkap BGP Fundamentals untuk ISP. Pelajari AS numbering, peering, rou', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'bun-elysia', title: 'Bun dan Elysia.js: High Performance API', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap Bun runtime dan Elysia.js — routes, middleware, type safety, be', diff: 'menengah', time: '14', access: 'Token', date: '29 Juni 2026' },
  { slug: 'career-freelance-to-startup', title: 'Dari Freelancer ke Startup Founder', icon: '📖', cat: 'IT Career', desc: 'Panduan transisi dari freelancer ke startup founder. Pelajari MVP, product valid', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'career-into-management', title: 'Transisi dari Developer ke Engineering Manager', icon: '📖', cat: 'IT Career', desc: 'Panduan transisi dari Software Developer ke Engineering Manager. Pelajari people', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'career-specialist-generalist', title: 'Specialist vs Generalist: Strategi Karir IT', icon: '📖', cat: 'IT Career', desc: 'Panduan strategi karir IT: Specialist vs Generalist. Pelajari depth vs breadth, ', diff: 'menengah', time: '13', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'chaos-engineering', title: 'Chaos Engineering with Litmus', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Chaos Engineering dengan Litmus — experiments, chaos hub, probe', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'clickhouse-analytics', title: 'ClickHouse untuk Real-time Analytics', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap ClickHouse — columnar database untuk real-time analytics dengan', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'cloud-security-posture', title: 'Cloud Security Posture Management', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari CSPM: cloud misconfiguration detection, compliance monitoring, multi-cl', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'coap-protocol', title: 'CoAP Protocol untuk IoT', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap CoAP Protocol (Constrained Application Protocol) untuk IoT — re', diff: 'menengah', time: '14', access: 'Token', date: '29 Juni 2026' },
  { slug: 'cockroachdb-distributed', title: 'CockroachDB: Distributed SQL untuk Aplikasi Skala Global', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap CockroachDB — distributed SQL database dengan serializability, ', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'computer-vision-yolo', title: 'YOLO Object Detection: v8 hingga v11 — Training, Inference &amp; Deployment', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap YOLO Object Detection dari v8 hingga v11 — training custom data', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'container-security', title: 'Container Security Best Practices', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari Container Security: Docker hardening, Kubernetes security, image scanni', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'crossplane-infrastructure', title: 'Crossplane: Infrastructure as Code from Kubernetes', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Crossplane untuk Infrastructure as Code dari Kubernetes — provi', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'crystal-language', title: 'Crystal: Ruby-like Performance - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Crystal Language: sintaks Ruby dengan performa C. Type inference, macro', diff: 'menengah', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'css-container-queries-2', title: 'CSS Container Queries Advanced', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap CSS Container Queries Advanced — container units, style queries', diff: 'menengah', time: '13', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'database-migration-flyway', title: 'Database Migration dengan Flyway', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap Flyway — database migration tool untuk versioned migration, rep', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'database-sharding-vitess', title: 'Database Sharding dengan Vitess', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap Vitess — database sharding untuk MySQL. Pelajari VSchema, shard', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'deep-linking', title: 'Deep Linking & App Links', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap Deep Linking. URL schemes, Universal Links, Android App Links, ', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'deno-fresh', title: 'Deno Fresh: Web Framework Modern', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap Deno Fresh — islands architecture, routing, middleware, data fe', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'developer-productivity', title: 'Developer Productivity & Deep Work', icon: '📖', cat: 'IT Career', desc: 'Panduan developer productivity dan deep work. Pelajari environment setup, focus ', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'elixir-phoenix', title: 'Elixir dan Phoenix Framework: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Elixir dan Phoenix Framework dari dasar hingga mahir. Pattern matching,', diff: 'menengah', time: '15', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'emqx-broker', title: 'EMQX: Enterprise MQTT Broker untuk IoT', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap EMQX Enterprise MQTT Broker. Pelajari clustering, rule engine, ', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'esp32-camera-streaming', title: 'ESP32-CAM Video Streaming: MJPEG, Face Detection &amp; Telegram', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap ESP32-CAM video streaming. Pelajari OV2640 setup, MJPEG stream,', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'esp32-matter-protocol', title: 'ESP32 Matter Smart Home: Thread, Commissioning &amp; Multi-Admin', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap ESP32 Matter Smart Home. Pelajari Matter SDK, device types, Thr', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'esp32-rust', title: 'Rust on ESP32: Embedded Development dengan Rust', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap Rust on ESP32. Pelajari esp-hal, esp-idf-hal, async embassy, GP', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'esp32-sleep-modes', title: 'ESP32 Deep Sleep &amp; Power Management: Hemat Energi Maksimal', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap ESP32 deep sleep dan power management. Pelajari light sleep, de', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'esp32-web-bluetooth', title: 'ESP32 Web Bluetooth API: Komunikasi BLE dari Browser', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap ESP32 Web Bluetooth API. Pelajari BLE advertising, GATT service', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'firebase-realtime', title: 'Firebase Realtime Database untuk IoT', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap Firebase Realtime Database untuk IoT. Pelajari data structure, ', diff: 'menengah', time: '14', access: 'Token', date: '29 Juni 2026' },
  { slug: 'flutter-web-desktop', title: 'Flutter Web & Desktop Development', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap Flutter Web & Desktop. Responsive layout, platform channels, pl', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'github-actions-advanced', title: 'GitHub Actions Advanced Workflows', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap GitHub Actions advanced — matrix builds, reusable workflows, co', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'gitlab-ci-advanced', title: 'GitLab CI/CD Advanced Pipeline', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap GitLab CI/CD advanced — parent-child pipeline, DAG, environment', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'gleam-type-safe', title: 'Gleam: Type-Safe BEAM Language - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Gleam, bahasa type-safe untuk BEAM VM. Types, pattern matching, OTP, Ja', diff: 'menengah', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'grafana-loki', title: 'Grafana Loki: Log Aggregation Modern untuk IoT & Cloud', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap Grafana Loki untuk log aggregation. Pelajari LogQL query, label', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'grafana-stack', title: 'Grafana Stack: Mimir + Tempo + Loki', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Grafana Stack — Mimir untuk metrics, Tempo untuk traces, Loki u', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'graphql-federation', title: 'GraphQL Federation dan Schema Stitching', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap GraphQL Federation dan Schema Stitching — Apollo Federation, su', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'grpc-protobuf', title: 'gRPC dan Protocol Buffers', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap gRPC dan Protocol Buffers — service definition, unary &amp; str', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'home-assistant-advanced', title: 'Home Assistant Advanced Configuration', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lanjutan Home Assistant untuk smart home. Pelajari automations, templat', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'htmx-dynamic-ui', title: 'HTMX: Dynamic UI Tanpa JavaScript', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap HTMX — atribut, triggers, AJAX, boosting, SSE, WebSockets, temp', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'http2-http3', title: 'HTTP/2 dan HTTP/3 untuk Developer', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap HTTP/2 dan HTTP/3 — multiplexing, server push, QUIC protocol, h', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'influxdb-telegraf', title: 'InfluxDB dan Telegraf untuk IoT', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap InfluxDB dan Telegraf untuk data IoT. Pelajari line protocol, r', diff: 'menengah', time: '14', access: 'Token', date: '29 Juni 2026' },
  { slug: 'ios-swiftui-advanced', title: 'SwiftUI Advanced Patterns', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap SwiftUI Advanced. MVVM, @Observable, navigation, animations, wi', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'istio-service-mesh', title: 'Istio Service Mesh', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap Istio Service Mesh — sidecar injection, virtual service, destin', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'julia-scientific', title: 'Julia untuk Scientific Computing: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Julia untuk Scientific Computing. Multiple dispatch, type system, paral', diff: 'menengah', time: '15', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'langchain-rag', title: 'LangChain RAG: Retrieval Augmented Generation — Tutorial Lengkap', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap LangChain RAG — document loading, chunking, embedding, vector s', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'llm-fine-tuning', title: 'Fine-tuning LLM dengan LoRA/QLoRA — Tutorial Lengkap', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap fine-tuning Large Language Model dengan LoRA dan QLoRA — adapte', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'maui-cross-platform', title: '.NET MAUI Cross-Platform Development', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap .NET MAUI. XAML layout, MVVM pattern, Shell navigation, platfor', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'message-queue-patterns', title: 'Message Queue Patterns', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap Message Queue Patterns — RabbitMQ vs Kafka, pub/sub, competing ', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mikrotik-bridge', title: 'MikroTik Bridge dan Switching: Panduan Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial lengkap MikroTik Bridge dan Switching. Pelajari bridge settings, STP, R', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mikrotik-hotspot', title: 'MikroTik Hotspot Configuration: Panduan Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial lengkap konfigurasi MikroTik Hotspot. Pelajari walled garden, user prof', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'mikrotik-scripting', title: 'MikroTik Scripting Language: Panduan Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial lengkap MikroTik Scripting Language. Pelajari variables, loops, functio', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mikrotik-user-manager', title: 'MikroTik User Manager: RADIUS Server Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial lengkap MikroTik User Manager sebagai RADIUS Server. Pelajari user mana', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mlflow-experiment-tracking', title: 'MLflow untuk Experiment Tracking — Tutorial Lengkap', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap MLflow untuk experiment tracking — runs, parameters, metrics, a', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mobile-auth-patterns', title: 'Mobile Authentication Patterns', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap Mobile Authentication. Biometric, OAuth 2.0, PKCE, token storag', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'mobile-ci-cd', title: 'Mobile CI/CD Pipeline', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap Mobile CI/CD. Fastlane, GitHub Actions, TestFlight, Play Store ', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mobile-performance', title: 'Mobile App Performance Optimization', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap optimasi performa aplikasi mobile. Memory profiling, rendering,', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mobile-security-testing', title: 'Mobile App Security Testing', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari Mobile App Security Testing: OWASP Mobile Top 10, Android/iOS pentestin', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mobile-testing-strategies', title: 'Mobile Testing Strategies', icon: '📖', cat: 'Mobile Development', desc: 'Tutorial lengkap Mobile Testing. Unit test, widget test, integration test, E2E d', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mpls-traffic-engineering', title: 'MPLS dan Traffic Engineering: Panduan Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial MPLS dan Traffic Engineering untuk ISP. Pelajari LDP, RSVP-TE, fast rer', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'mqtt-v5', title: 'MQTT v5: Fitur Terbaru', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap MQTT v5 — user properties, shared subscriptions, message expiry', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'network-monitoring-zabbix', title: 'Network Monitoring dengan Zabbix: Panduan Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial Zabbix untuk network monitoring. Pelajari templates, triggers, items, p', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'nim-systems', title: 'Nim Systems Programming: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Nim Systems Programming dari dasar hingga mahir. Metaprogramming, memor', diff: 'menengah', time: '15', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'nix-containers', title: 'NixOS and Nix for Containers', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap NixOS dan Nix untuk containers — reproducible builds, flakes, N', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'nlp-transformers', title: 'NLP dengan Transformers — BERT, GPT, Hugging Face', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap NLP dengan Transformers — arsitektur BERT dan GPT, tokenization', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'node-red-advanced', title: 'Node-RED Advanced Flow Programming', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lanjutan Node-RED untuk IoT. Pelajari subflows, context store, custom n', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'oauth2-oidc', title: 'OAuth 2.0 dan OpenID Connect', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap OAuth 2.0 dan OpenID Connect — authorization code flow, PKCE, t', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'ocaml-functional', title: 'OCaml Functional Programming: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari OCaml Functional Programming dari dasar hingga mahir. Algebraic types, ', diff: 'menengah', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'odin-performance', title: 'Odin Programming Language: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Odin Programming Language. Manual memory, SIMD, C interop, explicit ove', diff: 'menengah', time: '15', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'open-source-career', title: 'Membangun Karir dari Open Source Contribution', icon: '📖', cat: 'IT Career', desc: 'Panduan membangun karir IT dari open source contribution. Pelajari first issue, ', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'opentofu-iac', title: 'OpenTofu: Terraform Alternative', icon: '📖', cat: 'DevOps & Cloud', desc: 'Tutorial lengkap OpenTofu sebagai alternatif Terraform — state management, provi', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'ospf-multi-area', title: 'OSPF Multi-Area Design: Panduan Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial OSPF Multi-Area Design. Pelajari stub areas, NSSA, route summarization,', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'pcb-design-iot', title: 'PCB Design untuk IoT dengan KiCad: Schematic hingga Gerber', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap PCB design untuk IoT dengan KiCad. Pelajari schematic capture, ', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'prompt-engineering', title: 'Prompt Engineering Advanced — Chain-of-Thought, ReAct, Tree-of-Thought', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Prompt Engineering Advanced — chain-of-thought, few-shot, self-', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'qos-mikrotik', title: 'QoS di MikroTik: Bandwidth Management Lengkap', icon: '📖', cat: 'Networking', desc: 'Tutorial QoS MikroTik: simple queue, queue tree, mangle, burst, HTB, PCQ untuk b', diff: 'menengah', time: '16', access: 'Token', date: '29 Juni 2026' },
  { slug: 'raspberry-pi-kubernetes', title: 'Raspberry Pi Kubernetes Cluster: k3s Multi-Node dengan Persistent Storage', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap Raspberry Pi Kubernetes Cluster. Pelajari k3s setup, multi-node', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'redis-streams', title: 'Redis Streams untuk Event Sourcing', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap Redis Streams — XADD, XREAD, consumer groups, pending entries, ', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'remix-v2-deep-dive', title: 'Remix v2 Deep Dive', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap Remix v2 — loaders, actions, nested routes, forms, streaming, c', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'remote-work-playbook', title: 'Remote Work Playbook untuk Developer', icon: '📖', cat: 'IT Career', desc: 'Panduan lengkap remote work untuk developer Indonesia. Pelajari async communicat', diff: 'menengah', time: '13', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'rest-api-versioning', title: 'REST API Versioning Strategies', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap REST API Versioning — URL path vs header vs query parameter, ba', diff: 'menengah', time: '13', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'roc-functional', title: 'Roc Functional Programming: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Roc Functional Programming. Platforms, abilities, tasks, effect system,', diff: 'menengah', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'scylladb-nosql', title: 'ScyllaDB: High Performance NoSQL Database', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap ScyllaDB — high performance NoSQL database dengan CQL, compacti', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'sertifikasi-cloud-2026', title: 'Panduan Sertifikasi Cloud 2026', icon: '📖', cat: 'IT Career', desc: 'Panduan lengkap sertifikasi cloud 2026. Pelajari track AWS, Azure, GCP, study pl', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'siem-splunk', title: 'SIEM dengan Splunk: Security Monitoring - BeebaneLabs', icon: '📖', cat: 'Keamanan', desc: 'Pelajari implementasi SIEM menggunakan Splunk untuk security monitoring, data in', diff: 'menengah', time: '15', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'soc-operations', title: 'SOC Operations dan Incident Triage', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari SOC Operations dan Incident Triage: struktur tim SOC, workflow monitori', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'social-engineering-awareness', title: 'Social Engineering Defense', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari Social Engineering Defense: phishing awareness, pretexting, baiting, ta', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'sql-query-optimization-2', title: 'SQL Query Optimization Advanced', icon: '📖', cat: 'Database', desc: 'Tutorial lanjutan SQL query optimization — execution plans, index tuning, statis', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'stm32-bare-metal', title: 'STM32 Bare Metal Programming: Register, Linker Script &amp; DMA', icon: '📖', cat: 'Internet of Things', desc: 'Tutorial lengkap STM32 bare metal programming. Pelajari register-level programmi', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'supabase-realtime', title: 'Supabase Realtime Features', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap Supabase Realtime — broadcast, presence, database changes, RLS,', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'tech-lead-role', title: 'Peran Tech Lead: Antara Kode dan Arsitektur', icon: '📖', cat: 'IT Career', desc: 'Panduan lengkap peran Tech Lead. Pelajari decision making, ADRs, code review, me', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'technical-interview-coding', title: 'Technical Coding Interview Preparation', icon: '📖', cat: 'IT Career', desc: 'Panduan lengkap persiapan Technical Coding Interview. Pelajari data structures, ', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'technical-interview-system-design', title: 'System Design Interview: Panduan Lengkap', icon: '📖', cat: 'IT Career', desc: 'Panduan lengkap System Design Interview. Pelajari load balancer, cache, database', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'thingsboard-platform', title: 'ThingsBoard IoT Platform: Panduan Lengkap', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap ThingsBoard IoT Platform. Pelajari device management, dashboard', diff: 'menengah', time: '15', access: 'Token', date: '29 Juni 2026' },
  { slug: 'threat-hunting-techniques', title: 'Threat Hunting Techniques', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari Threat Hunting: hypothesis-driven hunting, MITRE ATT&CK mapping, IOC hu', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'time-series-forecasting', title: 'Time Series Forecasting — ARIMA, Prophet, LSTM', icon: '📖', cat: 'AI & Data Science', desc: 'Tutorial lengkap Time Series Forecasting — ARIMA, Prophet, LSTM, feature enginee', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'timescaledb-iot', title: 'TimescaleDB untuk Time Series IoT', icon: '📖', cat: 'Dashboard & Cloud', desc: 'Tutorial lengkap TimescaleDB untuk data time series IoT. Pelajari hypertables, c', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'tls-13-deep-dive', title: 'TLS 1.3 Deep Dive', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap TLS 1.3 — handshake 1-RTT dan 0-RTT, cipher suites, key exchang', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'turso-edge-database', title: 'Turso: Edge Database dengan libSQL', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap Turso — edge database berbasis libSQL dengan embedded replicas,', diff: 'menengah', time: '14', access: 'Token', date: '29 Juni 2026' },
  { slug: 'v-language', title: 'V Programming Language: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari V Programming Language. Autofree, C interop, cross-compilation, web fra', diff: 'menengah', time: '14', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'vector-database-qdrant', title: 'Qdrant Vector Database: Semantik Search &amp; AI', icon: '📖', cat: 'Database', desc: 'Tutorial lengkap Qdrant — vector database untuk semantic search, RAG, dan AI. Pe', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'vector-embeddings', title: 'Vector Embeddings untuk Semantic Search', icon: '🐝', cat: 'AI & Data Science', desc: 'Tutorial lengkap Vector Embeddings untuk semantic search.', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'view-transitions-api', title: 'View Transitions API', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap View Transitions API — same-document, cross-document, custom an', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'wasm-rust-web', title: 'WebAssembly dengan Rust', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap WebAssembly dengan Rust — wasm-bindgen, wasm-pack, memory model', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'web-components-lit', title: 'Web Components dengan Lit', icon: '📖', cat: 'Web Development', desc: 'Tutorial lengkap Web Components dengan Lit — Shadow DOM, custom elements, LitEle', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'web-performance-2026', title: 'Web Performance 2026', icon: '📖', cat: 'Web Development', desc: 'Tutorial web performance terkini 2026 — INP optimization, lazy loading, priority', diff: 'menengah', time: '14', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'websocket-deep-dive', title: 'WebSocket Deep Dive', icon: '📖', cat: 'Protokol', desc: 'Tutorial lengkap WebSocket — handshake, framing, ping/pong, close handshake, sca', diff: 'menengah', time: '14', access: 'Token', date: '29 Juni 2026' },
  { slug: 'wifi-6-deployment', title: 'Wi-Fi 6/6E Deployment Best Practices', icon: '📖', cat: 'Networking', desc: 'Tutorial Wi-Fi 6/6E deployment. Pelajari OFDMA, MU-MIMO, BSS coloring, channel p', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'wireless-penetration-testing', title: 'Wireless Penetration Testing', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari wireless penetration testing: WiFi security, WPA/WPA2/WPA3 cracking, ro', diff: 'menengah', time: '16', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'zero-trust-implementation', title: 'Zero Trust Architecture Implementation', icon: '🐝', cat: 'Keamanan', desc: 'Pelajari Zero Trust Architecture: microsegmentation, identity verification, leas', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' },
  { slug: 'zig-language', title: 'Zig Programming Language: Panduan Lengkap - BeebaneLabs', icon: '📖', cat: 'Software Engineering', desc: 'Pelajari Zig Programming Language dari dasar hingga mahir. Panduan lengkap compt', diff: 'menengah', time: '15', access: 'Gratis', date: '25 Juni 2026' },
  { slug: 'zigbee-thread-matter', title: 'Zigbee, Thread, dan Matter: Perbandingan Protokol Smart Home', icon: '📖', cat: 'Internet of Things', desc: 'Perbandingan lengkap Zigbee, Thread, dan Matter untuk smart home. Pelajari stack', diff: 'menengah', time: '15', access: 'Gratis', date: '29 Juni 2026' }
];

// Populate search articles from ALL_ARTICLES (avoids duplicate data)
articles = ALL_ARTICLES.map(a => ({
  title: a.title, category: a.cat,
  url: 'articles/' + a.slug + '.html',
  icon: a.icon, desc: a.desc
}));

function renderArticleCard(a) {
  const isUnlocked = (typeof PaywallSystem !== 'undefined' && PaywallSystem.isUnlocked(a.slug));
  const lockIcon = isUnlocked
    ? '<div class="lock-icon unlocked">🔓</div>'
    : '<div class="lock-icon locked">🔒</div>';
  return '<a href="articles/' + a.slug + '.html" class="article-card' + (isUnlocked ? ' viewed' : '') + '"><div class="thumbnail"><div class="thumbnail-bg cyan">' + a.icon + '</div>' + lockIcon + (isUnlocked ? '<div class="viewed-badge">✓ Dilihat</div>' : '') + '</div><div class="content"><div class="meta"><span class="category-tag">' + a.cat + '</span><span class="access-badge ' + (a.access === 'Token' ? 'token' : (a.access === 'Gratis' ? 'free' : 'unlocked')) + '">' + a.access + '</span><span class="date">' + a.date + '</span></div><h3>' + a.title + '</h3><p>' + a.desc + '</p><div class="footer"><span class="read-time">📖 ' + a.time + ' menit baca</span><span class="difficulty ' + a.diff + '">' + a.diff.charAt(0).toUpperCase() + a.diff.slice(1) + '</span></div></div></a>';
}

function renderGroupedArticles(filter) {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;

  // Filter articles if needed
  let articles = filter && filter !== 'all'
    ? ALL_ARTICLES.filter(a => a.diff === filter)
    : ALL_ARTICLES;

  // Shuffle and pick 12 random articles (mixed across all categories)
  articles = articles.slice().sort(() => Math.random() - 0.5).slice(0, 12);

  // Render as flat 4-column grid (no category grouping)
  let html = '<div class="cards-grid">' + articles.map(renderArticleCard).join('') + '</div>';

  grid.innerHTML = html;
}

// === INITIALIZE ALL SYSTEMS ===
document.addEventListener('DOMContentLoaded', async () => {
  AuthSystem.init();
  PaywallSystem.init();
  ProgressTracker.init();
  BookmarkSystem.init();
  TokenDisplay.showBanner();
  updateArticleCardStatus();
  Toast.init();
  CookieConsent.init();
  ThemeToggle.init();
  // Update theme-color meta tag based on current theme
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    themeMeta.content = currentTheme === 'light' ? '#ffffff' : '#08090a';
  }
  injectArticleExtras();
  injectArticleJsonLd();
  injectBreadcrumb();
  initTOC();

  // Visual enhancements
  addRevealClasses();
  initScrollReveal();
  initParticles();
  animateCounters();
  initCopyCode();
  initMouseGlow();
  initSectionDividers();
  initSyntaxHighlighting();
  initReadingProgressBar();
  initReadingTimeEstimate();
  initServiceWorker();
  injectLearningPath();
  renderGroupedArticles('all');
  initArticleFilter();
  initCategoryFilter();

  // FIX: Sync unlocked articles from server for logged-in users
  // This must happen AFTER initial render (sync is async, render is sync)
  // After sync completes, re-render to update lock icons
  if (typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn()) {
    await PaywallSystem.syncFromServer();
    renderGroupedArticles(
      document.querySelector('.filter-btn.active')?.dataset?.filter || 'all'
    );
    updateArticleCardStatus();
  }
});

