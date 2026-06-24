/* v7.11.0 - Token System */
/* ============================================
   BeebaneLabs - Main JavaScript
   ============================================ */

// === Search Data ===
const articles = [
  {
    title: "Panduan Lengkap ESP32: Dari Setup Hingga Proyek IoT Pertama",
    category: "ESP32",
    url: "articles/esp32-fundamentals.html",
    icon: "🔧",
    desc: "Tutorial komprehensif ESP32 untuk pemula"
  },
  {
    title: "Konfigurasi Routing MikroTik: Static Route, OSPF & BGP",
    category: "MikroTik",
    url: "articles/mikrotik-routing.html",
    icon: "🌐",
    desc: "Pelajari routing di RouterOS MikroTik"
  },
  {
    title: "Membangun Jaringan Sensor LoRa: Telemetry & Monitoring",
    category: "LoRa",
    url: "articles/lora-communication.html",
    icon: "📡",
    desc: "Sistem monitoring jarak jauh dengan LoRa"
  },
  {
    title: "Otomasi IoT dengan Python: MQTT, GPIO & Scheduling",
    category: "Python",
    url: "articles/python-iot-automation.html",
    icon: "🐍",
    desc: "Gunakan Python untuk kontrol perangkat IoT"
  },
  {
    title: "Keamanan Jaringan IoT: Firewall, VPN & Enkripsi Data",
    category: "Keamanan",
    url: "articles/network-security.html",
    icon: "🔐",
    desc: "Lindungi perangkat IoT dari serangan siber"
  },
  {
    title: "Dashboard Monitoring Real-time: Node-RED + Grafana + MQTT",
    category: "Dashboard",
    url: "articles/dashboard-monitoring.html",
    icon: "📊",
    desc: "Bangun dashboard visual untuk monitoring IoT"
  },
  {
    title: "ESP8266 NodeMCU untuk Pemula: Setup & Proyek Pertama",
    category: "ESP8266",
    url: "articles/esp8266-nodemcu.html",
    icon: "📶",
    desc: "Pelajari ESP8266 NodeMCU untuk proyek IoT"
  },
  {
    title: "Protokol MQTT: Panduan Lengkap untuk IoT",
    category: "Protokol",
    url: "articles/mqtt-protocol.html",
    icon: "📨",
    desc: "Pahami cara kerja MQTT untuk perangkat IoT"
  },
  {
    title: "Sensor DHT11/DHT22 dengan ESP32: Tutorial Lengkap",
    category: "Sensor",
    url: "articles/sensor-dht-esp32.html",
    icon: "🌡️",
    desc: "Baca data suhu dan kelembaban dengan ESP32"
  },
  {
    title: "Raspberry Pi untuk IoT: Gateway & Edge Computing",
    category: "Raspberry Pi",
    url: "articles/raspberry-pi-iot.html",
    icon: "🍓",
    desc: "Gunakan Raspberry Pi sebagai gateway IoT"
  },
  {
    title: "Firebase untuk IoT: Realtime Database & Cloud Functions",
    category: "Cloud",
    url: "articles/firebase-iot.html",
    icon: "🔥",
    desc: "Integrasikan perangkat IoT dengan Google Firebase"
  },
  {
    title: "MikroTik Firewall: Filter Rules, NAT & Mangle",
    category: "MikroTik",
    url: "articles/mikrotik-firewall.html",
    icon: "🛡️",
    desc: "Konfigurasi firewall MikroTik RouterOS"
  },
  {
    title: "Telegram Bot untuk IoT: Notifikasi & Kontrol Jarak Jauh",
    category: "IoT",
    url: "articles/telegram-bot-iot.html",
    icon: "🤖",
    desc: "Buat Telegram Bot untuk notifikasi dan kontrol IoT"
  },
  {
    title: "Web Server di ESP32: Interface Kontrol & Monitoring",
    category: "ESP32",
    url: "articles/web-server-esp32.html",
    icon: "🌐",
    desc: "Bangun web server mandiri di ESP32"
  },
  {
    title: "Perbandingan Protokol IoT: MQTT vs CoAP vs HTTP vs AMQP",
    category: "Protokol",
    url: "articles/iot-protocols-comparison.html",
    icon: "⚖️",
    desc: "Analisis mendalam protokol komunikasi IoT"
  },
  {
    title: "ESP32 Deep Sleep: Hemat Baterai untuk Proyek IoT",
    category: "ESP32",
    url: "articles/deep-sleep-esp32.html",
    icon: "💤",
    desc: "Optimalkan konsumsi daya ESP32 dengan deep sleep"
  },
  {
    title: "Arduino IDE 2.x Setup: Instalasi & Konfigurasi Lengkap",
    category: "Tools",
    url: "articles/arduino-ide-setup.html",
    icon: "💻",
    desc: "Panduan instalasi Arduino IDE 2.x untuk ESP32"
  },
  {
    title: "Node-RED untuk IoT: Flow Programming & Integrasi",
    category: "Dashboard",
    url: "articles/node-red-iot.html",
    icon: "🔀",
    desc: "Pelajari Node-RED untuk alur data IoT visual"
  },
  {
    title: "Grafana + InfluxDB: Visualisasi Data IoT Real-time",
    category: "Dashboard",
    url: "articles/grafana-influxdb.html",
    icon: "📈",
    desc: "Bangun pipeline data IoT dengan Grafana dan InfluxDB"
  },
  {
    title: "MikroTik Queue Management: QoS & Bandwidth Control",
    category: "MikroTik",
    url: "articles/mikrotik-queue.html",
    icon: "🎛️",
    desc: "Kelola bandwidth jaringan dengan MikroTik Queue"
  },
  {
    title: "Blynk IoT: Kontrol Perangkat dari Mobile App",
    category: "IoT",
    url: "articles/blynk-iot.html",
    icon: "📱",
    desc: "Bangun aplikasi mobile untuk kontrol ESP32 dengan Blynk"
  }
];

// === Debounce utility ===
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// === Navbar Scroll Effect ===
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', debounce(() => {
  if (!navbar) return;
  const currentScroll = window.pageYOffset;
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
}, 10));

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
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

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
  searchResults.innerHTML = '<div class="search-hint">Tekan <kbd>Esc</kbd> untuk menutup</div>';
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

// === Back to Top ===
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', debounce(() => {
  if (!backToTop) return;
  if (window.pageYOffset > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, 50));

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
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// Safety: force all fade-in elements visible after 3s max
// Prevents invisible content if observer fails or user has reduced motion
setTimeout(() => {
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
    el.classList.add('visible');
  });
}, 3000);

// Also handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.fade-in').forEach(el => {
    el.classList.add('visible');
  });
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

    const data = await res.json();
    if (res.ok && data.success) {
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
document.querySelectorAll('.code-copy').forEach(btn => {
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
});

// === Copy to clipboard utility ===
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
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
    } catch (e) { console.warn('Quiz cache save failed:', e); }
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
      console.warn('Quiz server save failed:', e);
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
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const qIndex = opt.dataset.question;
      const qOptions = container.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`);
      qOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selected[qIndex] = opt.dataset.answer;
    });
  });

  // Reset quiz function
  function resetQuiz() {
    score = 0;
    answered = 0;
    Object.keys(selected).forEach(k => delete selected[k]);

    options.forEach(o => {
      o.classList.remove('selected', 'correct', 'wrong');
      o.style.pointerEvents = '';
    });

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
      answers.forEach((correct, i) => {
        const qOptions = container.querySelectorAll(`.quiz-option[data-question="${i}"]`);
        qOptions.forEach(o => {
          o.classList.remove('selected');
          if (o.dataset.answer === correct) {
            o.classList.add('correct');
          } else if (selected[i] === o.dataset.answer && o.dataset.answer !== correct) {
            o.classList.add('wrong');
          }
          o.style.pointerEvents = 'none';
        });
        if (selected[i] === correct) score++;
        userAnswers.push({ question: i, selected: selected[i], correct });
      });

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
        console.log('Quiz saved locally (not logged in)');
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = container.querySelector(`#${tab.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });
}

// === Reading Progress ===
function initReadingProgress() {
  const progressBar = document.getElementById('readingProgress');
  if (!progressBar) return;

  window.addEventListener('scroll', debounce(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / docHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }, 16));
}

// === Initialize ===
// NOTE: initReadingProgress() is called from the main DOMContentLoaded handler below
// to avoid running it twice.


// === CONFIGURATION ===
const SITE_CONFIG = {
  API_BASE: window.location.origin,
  APP_VERSION: '7.17',
  TOKEN_PRICE: 10000,
  INITIAL_TOKENS: 5
};

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
    const logged = typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn();
    if (!logged) {
      const localUnlocked = this.isUnlocked(slug);
      if (localUnlocked || this.hasPaidAccess()) return;
      this.showTokenGate(slug, this.getTokens(), false);
      return;
    }
    const result = await this.serverCheckAccess(slug);
    if (result.access) return;
    this.showTokenGate(slug, result.tokens || 0, true);
    if (typeof AuthSystem !== 'undefined' && AuthSystem.updateNavbar) AuthSystem.updateNavbar();
  },

  showTokenGate(f, tokens, logged) {
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
        allKeys.forEach(key => {
          if (key && key.startsWith('beebanelabs_') && !keysToKeep.has(key)) {
            localStorage.removeItem(key);
          }
        });
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

  createLoginModal() {
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
      <div class="auth-modal">
        <button class="auth-close" onclick="AuthSystem.closeModal()">&times;</button>
        <div style="text-align:center; margin-bottom:20px;">
          <div style="font-size:2.5rem; margin-bottom:8px;">⚡</div>
          <h2 style="margin-bottom:4px;">Selamat Datang di BeebaneLabs</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">Masuk atau daftar untuk melanjutkan</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" onclick="AuthSystem.switchTab('login')">Masuk</button>
          <button class="auth-tab" onclick="AuthSystem.switchTab('register')">Daftar</button>
        </div>

        <div class="auth-error" id="authError"></div>
        <div class="auth-success" id="authSuccess"></div>

        <!-- Login Form -->
        <form id="loginForm" onsubmit="AuthSystem.handleLogin(event)">
          <div class="auth-form-group">
            <label>Email</label>
            <input type="email" id="loginEmail" placeholder="email@kamu.com" required>
          </div>
          <div class="auth-form-group">
            <label>Password</label>
            <input type="password" id="loginPassword" placeholder="Masukkan password" required>
          </div>
          <button type="submit" class="auth-submit">Masuk</button>
        </form>

        <!-- Register Form -->
        <form id="registerForm" style="display:none;" onsubmit="AuthSystem.handleRegister(event)">
          <div class="auth-form-group">
            <label>Nama Lengkap</label>
            <input type="text" id="regName" placeholder="Nama kamu" required>
          </div>
          <div class="auth-form-group">
            <label>Email</label>
            <input type="email" id="regEmail" placeholder="email@kamu.com" required>
          </div>
          <div class="auth-form-group">
            <label>Password</label>
            <input type="password" id="regPassword" placeholder="Min 8 karakter, huruf besar, angka, simbol" required minlength="8">
          </div>
          <button type="submit" class="auth-submit">Daftar Sekarang</button>
        </form>

        <div class="auth-divider">atau</div>
        <p style="text-align:center; font-size:0.8rem; color:var(--text-subtle);">
          Dengan mendaftar, kamu setuju dengan <a href="terms.html">Syarat & Ketentuan</a>
        </p>
      </div>
    `;
    document.body.appendChild(modal);
  },

  switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    // FIX: Use event parameter instead of implicit global
    const activeTab = document.querySelector('.auth-tab[data-tab="' + tab + '"]') ||
                      document.querySelectorAll('.auth-tab')[tab === 'login' ? 0 : 1];
    if (activeTab) activeTab.classList.add('active');
    this.clearMessages();
  },

  showModal() {
    document.getElementById('authModal').classList.add('active');
  },

  closeModal() {
    document.getElementById('authModal').classList.remove('active');
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
      const res = await fetch(this.AUTH_ENDPOINT, {
        method: 'POST',
        headers: typeof CSRF !== 'undefined' ? CSRF.getHeaders() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        this.saveSession({ user: data.user, token: data.token });
        this.showSuccess('Registrasi berhasil! Mengalihkan...');
        setTimeout(() => window.location.reload(), 1000);
        return;
      } else {
        this.showError(data.message || 'Gagal mendaftar');
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
              <a href="profile.html">👤 Profil Saya</a>
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

// === VIEW TRACKER (FIXED) ===
// === TOKEN DISPLAY ===
const TokenDisplay = {
  showBanner() {
    const p = window.location.pathname;
    if (!p.includes('/articles/')) return;
    if (PaywallSystem.hasPaidAccess()) return;
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
  cards.forEach(card => {
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
  });
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
    t.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span><span class="toast-msg">' + safeMsg + '</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>';
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
    banner.innerHTML = '<p>🍪 Kami menggunakan cookie untuk meningkatkan pengalaman Anda. <a href="privacy-policy.html">Pelajari lebih lanjut</a></p><div class="cookie-btns"><button class="cookie-decline" onclick="CookieConsent.dismiss(this)">Tolak</button><button class="cookie-accept" onclick="CookieConsent.accept(this)">Terima</button></div>';
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')));
  },
  accept(btn) { localStorage.setItem(this.KEY, 'accepted'); btn.closest('.cookie-consent').classList.remove('show'); setTimeout(() => btn.closest('.cookie-consent').remove(), 400); Toast.show('Cookie diterima! Terima kasih.', 'success'); },
  dismiss(btn) { localStorage.setItem(this.KEY, 'declined'); btn.closest('.cookie-consent').classList.remove('show'); setTimeout(() => btn.closest('.cookie-consent').remove(), 400); }
};

// === THEME TOGGLE ===
const ThemeToggle = {
  KEY: 'beebanelabs_theme',
  init() {
    const saved = localStorage.getItem(this.KEY);
    if (saved === 'light') document.body.classList.add('light-theme');
    this.updateButton();
  },
  toggle() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem(this.KEY, isLight ? 'light' : 'dark');
    this.updateButton();
  },
  updateButton() {
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
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
  const shareHTML = '<div style="display:flex;align-items:center;gap:12px;padding:24px 0;border-top:1px solid var(--border-subtle);margin-top:32px;"><span style="font-size:0.85rem;color:var(--text-muted);font-weight:600;">Bagikan:</span><a href="https://twitter.com/intent/tweet?url='+url+'&text='+title+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-pill);background:rgba(29,161,242,0.1);border:1px solid rgba(29,161,242,0.3);color:#1da1f2;font-size:0.8rem;font-weight:600;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(29,161,242,0.2)\'" onmouseout="this.style.background=\'rgba(29,161,242,0.1)\'">𝕏 Twitter</a><a href="https://wa.me/?text='+title+'%20'+url+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-pill);background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.3);color:#25d366;font-size:0.8rem;font-weight:600;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(37,211,102,0.2)\'" onmouseout="this.style.background=\'rgba(37,211,102,0.1)\'">💬 WhatsApp</a><button onclick="navigator.clipboard.writeText(window.location.href);if(typeof Toast!==\'undefined\')Toast.show(\'Link disalin!\',\'success\')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-pill);background:var(--bg-hover);border:1px solid var(--border-standard);color:var(--text-secondary);font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s;">📋 Salin Link</button></div>';
  articleContent.insertAdjacentHTML('beforeend', shareHTML);

  // Related articles
  const allArticles = [
    { slug: 'esp32-fundamentals', title: 'Panduan Lengkap ESP32', icon: '🔧', cat: 'ESP32' },
    { slug: 'mikrotik-routing', title: 'Konfigurasi Routing MikroTik', icon: '🌐', cat: 'MikroTik' },
    { slug: 'lora-communication', title: 'Jaringan Sensor LoRa', icon: '📡', cat: 'LoRa' },
    { slug: 'python-iot-automation', title: 'Otomasi IoT dengan Python', icon: '🐍', cat: 'Python' },
    { slug: 'network-security', title: 'Keamanan Jaringan IoT', icon: '🔐', cat: 'Keamanan' },
    { slug: 'dashboard-monitoring', title: 'Dashboard Monitoring', icon: '📊', cat: 'Dashboard' },
    { slug: 'esp8266-nodemcu', title: 'ESP8266 NodeMCU', icon: '📶', cat: 'ESP8266' },
    { slug: 'mqtt-protocol', title: 'Protokol MQTT', icon: '📨', cat: 'Protokol' },
    { slug: 'sensor-dht-esp32', title: 'Sensor DHT dengan ESP32', icon: '🌡️', cat: 'Sensor' },
    { slug: 'raspberry-pi-iot', title: 'Raspberry Pi untuk IoT', icon: '🍓', cat: 'RPi' },
    { slug: 'firebase-iot', title: 'Firebase untuk IoT', icon: '🔥', cat: 'Cloud' },
    { slug: 'telegram-bot-iot', title: 'Telegram Bot untuk IoT', icon: '🤖', cat: 'IoT' }
  ];
  const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');
  const related = allArticles.filter(a => a.slug !== currentSlug).sort(() => 0.5 - Math.random()).slice(0, 3);
  if (related.length) {
    const relHTML = '<div style="margin-top:48px;padding-top:32px;border-top:1px solid var(--border-subtle);"><h3 style="font-family:var(--font-heading);font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:20px;">📚 Artikel Terkait</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">' + related.map(a => '<a href="../articles/' + a.slug + '.html" style="display:flex;align-items:center;gap:12px;padding:16px;background:var(--bg-card);border:1px solid var(--border-standard);border-radius:var(--radius-md);text-decoration:none;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--accent-primary)\'" onmouseout="this.style.borderColor=\'var(--border-standard)\'"><span style="font-size:1.5rem;">' + a.icon + '</span><div><div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:2px;">' + a.title + '</div><div style="font-size:0.7rem;color:var(--text-subtle);text-transform:uppercase;">' + a.cat + '</div></div></a>').join('') + '</div></div>';
    articleContent.insertAdjacentHTML('beforeend', relHTML);
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
    entries.forEach(e => {
      if (e.isIntersecting) {
        toc.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        const link = toc.querySelector('a[href="#' + e.target.id + '"]');
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  realHeadings.forEach(h => observer.observe(h));
}

// === COPY CODE BUTTON ===
function initCopyCode() {
  document.querySelectorAll('pre').forEach(pre => {
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
  });
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
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGroupedArticles(btn.dataset.filter);
    updateArticleCardStatus();
  });
}

// === LEARNING PATH (Homepage) ===
function injectLearningPath() {
  const homepage = document.querySelector('.hero');
  if (!homepage || window.location.pathname !== '/' && !window.location.pathname.includes('index')) return;
  const articlesSection = document.querySelector('#articles');
  if (!articlesSection) return;

  const pathHTML = '<section class="learning-path container"><h2 style="font-family:var(--font-heading);font-size:1.5rem;font-weight:800;color:var(--text-primary);text-align:center;">🗺️ Learning Path — Urutan Belajar yang Direkomendasikan</h2><p style="text-align:center;color:var(--text-muted);margin-top:8px;font-size:0.9rem;">Ikuti urutan ini untuk hasil optimal</p><div class="path-grid"><a href="articles/esp32-fundamentals.html" class="path-card"><div class="step-num">1</div><div class="path-icon">🔧</div><h4>ESP32 Dasar</h4><p>Setup Arduino IDE, WiFi, sensor dasar</p></a><a href="articles/mqtt-protocol.html" class="path-card"><div class="step-num">2</div><div class="path-icon">📨</div><h4>Protokol MQTT</h4><p>Pub/Sub, broker, QoS untuk IoT</p></a><a href="articles/dashboard-monitoring.html" class="path-card"><div class="step-num">3</div><div class="path-icon">📊</div><h4>Dashboard IoT</h4><p>Node-RED, Grafana, visualisasi data</p></a><a href="articles/firebase-iot.html" class="path-card"><div class="step-num">4</div><div class="path-icon">🔥</div><h4>Cloud & Firebase</h4><p>Penyimpanan data cloud, RTDB</p></a></div></section>';
  articlesSection.insertAdjacentHTML('beforebegin', pathHTML);
}

// === GROUPED ARTICLES (3 per category) ===
const ALL_ARTICLES = [
  { slug: 'esp32-fundamentals', title: 'Panduan Lengkap ESP32', icon: '🔧', cat: 'ESP32', desc: 'Tutorial komprehensif ESP32 untuk pemula', diff: 'pemula', time: '15', access: 'Token', date: '20 Juni 2026' },
  { slug: 'esp8266-nodemcu', title: 'ESP8266 NodeMCU untuk Pemula', icon: '📶', cat: 'ESP32', desc: 'Setup dan proyek pertama dengan ESP8266', diff: 'pemula', time: '10', access: 'Token', date: '7 Juni 2026' },
  { slug: 'sensor-dht-esp32', title: 'Sensor DHT dengan ESP32', icon: '🌡️', cat: 'ESP32', desc: 'Baca suhu dan kelembaban dengan DHT11/DHT22', diff: 'pemula', time: '8', access: 'Token', date: '5 Juni 2026' },
  { slug: 'web-server-esp32', title: 'Web Server di ESP32', icon: '🌐', cat: 'ESP32', desc: 'Bangun web server mandiri di ESP32', diff: 'menengah', time: '11', access: 'Token', date: '30 Mei 2026' },
  { slug: 'deep-sleep-esp32', title: 'ESP32 Deep Sleep', icon: '💤', cat: 'ESP32', desc: 'Hemat baterai untuk proyek IoT', diff: 'pemula', time: '7', access: 'Token', date: '28 Mei 2026' },
  { slug: 'mikrotik-routing', title: 'Konfigurasi Routing MikroTik', icon: '🌐', cat: 'MikroTik', desc: 'Static route, OSPF, dan BGP', diff: 'menengah', time: '12', access: 'Token', date: '18 Juni 2026' },
  { slug: 'mikrotik-firewall', title: 'MikroTik Firewall', icon: '🛡️', cat: 'MikroTik', desc: 'Filter rules, NAT, dan mangle', diff: 'lanjut', time: '16', access: 'Token', date: '2 Juni 2026' },
  { slug: 'mikrotik-queue', title: 'MikroTik Queue Management', icon: '🎛️', cat: 'MikroTik', desc: 'QoS dan bandwidth control', diff: 'menengah', time: '10', access: 'Token', date: '24 Mei 2026' },
  { slug: 'lora-communication', title: 'Jaringan Sensor LoRa', icon: '📡', cat: 'LoRa', desc: 'Telemetry dan monitoring jarak jauh', diff: 'menengah', time: '10', access: 'Token', date: '15 Juni 2026' },
  { slug: 'python-iot-automation', title: 'Otomasi IoT dengan Python', icon: '🐍', cat: 'Python', desc: 'MQTT, GPIO, dan scheduling', diff: 'pemula', time: '8', access: 'Token', date: '12 Juni 2026' },
  { slug: 'network-security', title: 'Keamanan Jaringan IoT', icon: '🔐', cat: 'Keamanan', desc: 'Firewall, VPN, dan enkripsi data', diff: 'lanjut', time: '14', access: 'Token', date: '10 Juni 2026' },
  { slug: 'dashboard-monitoring', title: 'Dashboard Monitoring Real-time', icon: '📊', cat: 'Dashboard', desc: 'Node-RED, Grafana, dan MQTT', diff: 'menengah', time: '11', access: 'Token', date: '8 Juni 2026' },
  { slug: 'node-red-iot', title: 'Node-RED untuk IoT', icon: '🔀', cat: 'Dashboard', desc: 'Flow programming dan integrasi', diff: 'menengah', time: '12', access: 'Token', date: '26 Mei 2026' },
  { slug: 'grafana-influxdb', title: 'Grafana + InfluxDB', icon: '📈', cat: 'Dashboard', desc: 'Visualisasi data IoT real-time', diff: 'menengah', time: '13', access: 'Token', date: '25 Mei 2026' },
  { slug: 'mqtt-protocol', title: 'Protokol MQTT', icon: '📨', cat: 'Protokol', desc: 'Panduan lengkap MQTT untuk IoT', diff: 'menengah', time: '13', access: 'Token', date: '6 Juni 2026' },
  { slug: 'iot-protocols-comparison', title: 'Perbandingan Protokol IoT', icon: '⚖️', cat: 'Protokol', desc: 'MQTT vs CoAP vs HTTP vs AMQP', diff: 'lanjut', time: '14', access: 'Token', date: '29 Mei 2026' },
  { slug: 'raspberry-pi-iot', title: 'Raspberry Pi untuk IoT', icon: '🍓', cat: 'Raspberry Pi', desc: 'Gateway dan edge computing', diff: 'menengah', time: '15', access: 'Token', date: '4 Juni 2026' },
  { slug: 'firebase-iot', title: 'Firebase untuk IoT', icon: '🔥', cat: 'Cloud', desc: 'Realtime database dan cloud functions', diff: 'menengah', time: '12', access: 'Token', date: '3 Juni 2026' },
  { slug: 'telegram-bot-iot', title: 'Telegram Bot untuk IoT', icon: '🤖', cat: 'IoT', desc: 'Notifikasi dan kontrol jarak jauh', diff: 'pemula', time: '9', access: 'Token', date: '1 Juni 2026' },
  { slug: 'blynk-iot', title: 'Blynk IoT', icon: '📱', cat: 'IoT', desc: 'Kontrol perangkat dari mobile app', diff: 'pemula', time: '8', access: 'Token', date: '23 Mei 2026' },
  { slug: 'arduino-ide-setup', title: 'Arduino IDE 2.x Setup', icon: '💻', cat: 'Tools', desc: 'Instalasi dan konfigurasi lengkap', diff: 'pemula', time: '6', access: 'Token', date: '27 Mei 2026' }
];

function renderArticleCard(a) {
  const isUnlocked = (typeof PaywallSystem !== 'undefined' && PaywallSystem.isUnlocked(a.slug));
  const lockIcon = isUnlocked
    ? '<div class="lock-icon unlocked">🔓</div>'
    : '<div class="lock-icon locked">🔒</div>';
  return '<a href="articles/' + a.slug + '.html" class="article-card' + (isUnlocked ? ' viewed' : '') + '"><div class="thumbnail"><div class="thumbnail-bg cyan">' + a.icon + '</div>' + lockIcon + (isUnlocked ? '<div class="viewed-badge">✓ Dilihat</div>' : '') + '</div><div class="content"><div class="meta"><span class="category-tag">' + a.cat + '</span><span class="access-badge ' + (a.access === 'Token' ? 'token' : 'unlocked') + '">' + a.access + '</span><span class="date">' + a.date + '</span></div><h3>' + a.title + '</h3><p>' + a.desc + '</p><div class="footer"><span class="read-time">📖 ' + a.time + ' menit baca</span><span class="difficulty ' + a.diff + '">' + a.diff.charAt(0).toUpperCase() + a.diff.slice(1) + '</span></div></div></a>';
}

function renderGroupedArticles(filter) {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  const articles = filter && filter !== 'all' ? ALL_ARTICLES.filter(a => a.diff === filter) : ALL_ARTICLES;

  // Group by category
  const groups = {};
  articles.forEach(a => {
    if (!groups[a.cat]) groups[a.cat] = [];
    groups[a.cat].push(a);
  });

  let html = '';
  const catOrder = ['ESP32', 'MikroTik', 'LoRa', 'Python', 'Keamanan', 'Dashboard', 'Protokol', 'Raspberry Pi', 'Cloud', 'IoT', 'Tools'];
  catOrder.forEach(cat => {
    if (!groups[cat]) return;
    const items = groups[cat].slice(0, 3);
    html += '<div class="category-section"><div class="cat-header"><h3>' + items[0].icon + ' ' + cat + '</h3><a href="kategori/' + cat.toLowerCase().replace(/\s+/g, '-') + '.html">Lihat Semua →</a></div><div class="cards-grid">' + items.map(renderArticleCard).join('') + '</div></div>';
  });
  grid.innerHTML = html;
}

// === INITIALIZE ALL SYSTEMS ===
document.addEventListener('DOMContentLoaded', async () => {
  initReadingProgress();
  AuthSystem.init();
  PaywallSystem.init();
  TokenDisplay.showBanner();
  updateArticleCardStatus();
  Toast.init();
  CookieConsent.init();
  ThemeToggle.init();
  injectArticleExtras();
  initTOC();
  initCopyCode();
  injectLearningPath();
  renderGroupedArticles('all');
  initArticleFilter();

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
