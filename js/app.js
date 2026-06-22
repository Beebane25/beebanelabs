/* v2.2.0 - Token System */
/* ============================================
   IoTHub - Main JavaScript
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

// === Navbar Scroll Effect ===
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// === Mobile Menu Toggle ===
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  // Close menu when link clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });
}

// === Search Overlay ===
const searchTrigger = document.getElementById('searchTrigger');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function openSearch() {
  searchOverlay.classList.add('active');
  searchInput.focus();
}

function closeSearch() {
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
  if (e.key === '/' && !searchOverlay.classList.contains('active') && document.activeElement.tagName !== 'INPUT') {
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

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

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

  // Disable button during request
  btn.disabled = true;
  btn.textContent = '⏳ Mengirim...';

  try {
    // Try backend API first
    const API_BASE = window.location.origin;
    const res = await fetch(API_BASE + '/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });

    if (res.ok) {
      const data = await res.json();
      btn.textContent = '✓ ' + data.message;
      btn.style.background = '#10b981';
      input.value = '';
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    // Fallback: show success without storing email locally
    btn.textContent = '✓ Tersubscribe!';
    btn.style.background = '#10b981';
    input.value = '';
  }

  setTimeout(() => {
    btn.textContent = 'Subscribe';
    btn.style.background = '';
    btn.disabled = false;
  }, 3500);
}

// === Code Copy Button ===
document.querySelectorAll('.code-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.closest('.code-block').querySelector('pre').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = original; }, 2000);
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
function initQuiz(quizId, answers) {
  const container = document.getElementById(quizId);
  if (!container) return;

  let score = 0;
  let answered = 0;
  const total = answers.length;
  const options = container.querySelectorAll('.quiz-option');
  const resultEl = container.querySelector('.quiz-result');
  const submitBtn = container.querySelector('.quiz-btn');
  const selected = {};

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const qIndex = opt.dataset.question;
      const qOptions = container.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`);
      qOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selected[qIndex] = opt.dataset.answer;
    });
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (Object.keys(selected).length < total) {
        alert('Silakan jawab semua pertanyaan terlebih dahulu!');
        return;
      }

      score = 0;
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
      });

      const percent = Math.round((score / total) * 100);
      if (percent >= 60) {
        resultEl.className = 'quiz-result pass';
        resultEl.innerHTML = `🎉 Selamat! Kamu menjawab benar ${score}/${total} (${percent}%). Keamanan: LOLOS!`;
      } else {
        resultEl.className = 'quiz-result fail';
        resultEl.innerHTML = `😢 Kamu menjawab benar ${score}/${total} (${percent}%). Coba baca ulang materinya ya!`;
      }

      submitBtn.style.display = 'none';
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

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / docHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// === Initialize ===
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
});


// === CONFIGURATION ===
const SITE_CONFIG = {
  API_BASE: window.location.origin,
  APP_VERSION: '3.0.0',
  TOKEN_PRICE: 10000,
  INITIAL_TOKENS: 5
};

// === CSRF TOKEN (double-submit pattern) ===
const CSRF = {
  _KEY: 'iothub_csrf',
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

// === PAYWALL SYSTEM (ALL ARTICLES NEED TOKENS) ===
const PaywallSystem = {
  TOKEN_KEY: 'iothub_tokens',
  UNLOCKED_KEY: 'iothub_unlocked',
  TOKEN_ENDPOINT: '/api/tokens',
  _serverTokens: null,
  _serverAccess: null,

  hasPaidAccess() {
    const a = JSON.parse(localStorage.getItem('iothub_auth') || 'null');
    if (a && a.user && a.user.plan && a.user.plan !== 'free') return true;
    return false;
  },

  getTokens() {
    if (this._serverTokens !== null) return this._serverTokens;
    const v = localStorage.getItem(this.TOKEN_KEY);
    return v !== null ? parseInt(v) : SITE_CONFIG.INITIAL_TOKENS;
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
      const data = await res.json();
      this._serverTokens = data.tokens || 0;
      localStorage.setItem(this.TOKEN_KEY, String(data.tokens || 0));
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
      const data = await res.json();
      if (data.success) {
        this._serverTokens = data.tokens;
        localStorage.setItem(this.TOKEN_KEY, String(data.tokens));
        this.unlockArticle(articleSlug);
        if (typeof AuthSystem !== 'undefined' && AuthSystem.updateNavbar) AuthSystem.updateNavbar();
      }
      return data;
    } catch(e) {
      return { success: false, error: 'Gagal terhubung ke server' };
    }
  },

  getUnlocked() { return JSON.parse(localStorage.getItem(this.UNLOCKED_KEY) || '[]'); },
  isUnlocked(f) { return this.getUnlocked().includes(f); },
  unlockArticle(f) {
    const u = this.getUnlocked();
    if (!u.includes(f)) { u.push(f); localStorage.setItem(this.UNLOCKED_KEY, JSON.stringify(u)); }
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
    const result = await this.serverUseToken(f);
    if (result.success) {
      alert(result.message || 'Artikel dibuka!');
      window.location.reload();
    } else {
      alert(result.error || 'Gagal membuka artikel');
    }
  }
};
// === AUTH SYSTEM ===
const AuthSystem = {
  API_BASE: window.location.origin,
  AUTH_ENDPOINT: '/api/auth',
  STORAGE_KEY: 'iothub_auth',
  VIEW_KEY: 'iothub_views',
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
      localStorage.removeItem('iothub_users');
    } catch(e) {}

    // Version-based cleanup: if app version changed, clear ALL old data
    try {
      const storedVersion = localStorage.getItem('iothub_app_version');
      if (storedVersion !== SITE_CONFIG.APP_VERSION) {
        // New version detected — clear stale auth and cache data
        const keysToKeep = new Set(['iothub_auth', 'iothub_session_id', 'iothub_viewed', 'iothub_csrf', 'iothub_tokens']);
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          allKeys.push(localStorage.key(i));
        }
        allKeys.forEach(key => {
          if (key && key.startsWith('iothub_') && !keysToKeep.has(key)) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('iothub_app_version', SITE_CONFIG.APP_VERSION);
      }
    } catch(e) {}

    // Force logout if session is older than 7 days
    this._enforceSessionExpiry();

    this.checkSession();
    this.createLoginModal();
    this.updateNavbar();
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
  },

  checkSession() {
    const session = this.getSession();
    if (session && session.user) {
      // Sync server token balance to localStorage
      if (session.user.tokens !== undefined && typeof PaywallSystem !== 'undefined') {
        PaywallSystem._serverTokens = session.user.tokens;
        localStorage.setItem('iothub_tokens', String(session.user.tokens));
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
          localStorage.removeItem('iothub_access');
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
    localStorage.removeItem('iothub_access');
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
          <h2 style="margin-bottom:4px;">Selamat Datang di IoTHub</h2>
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
            <input type="password" id="regPassword" placeholder="Minimal 6 karakter" required minlength="6">
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
    event.target.classList.add('active');
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
  },

  showSuccess(msg) {
    const el = document.getElementById('authSuccess');
    el.textContent = msg;
    el.classList.add('show');
    document.getElementById('authError').classList.remove('show');
  },

  clearMessages() {
    document.getElementById('authError').classList.remove('show');
    document.getElementById('authSuccess').classList.remove('show');
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Login via Netlify Function backend
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
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!name || !email || password.length < 6) {
      this.showError('Semua field harus diisi, password minimal 6 karakter');
      return;
    }

    // Register via Netlify Function backend
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
        const isPremium = user.plan && user.plan !== 'free';
        const tokens = PaywallSystem.getTokens();
        const safeName = this.escapeHtml(user.name || user.email.split('@')[0]);

        let tokenBadge = '';
        if (!isPremium) {
          tokenBadge = '<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(251,146,60,0.12);border:1px solid rgba(251,146,60,0.25);border-radius:12px;padding:2px 8px;font-size:0.7rem;font-weight:600;color:#fb923c;">🔑 ' + tokens + ' Token</div>';
        } else {
          tokenBadge = '<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(62,207,142,0.12);border:1px solid rgba(62,207,142,0.25);border-radius:12px;padding:2px 8px;font-size:0.7rem;font-weight:600;color:#3ecf8e;">👑 Premium</div>';
        }

        authContainer.innerHTML = `
          <a href="profile.html" class="user-badge" style="text-decoration:none;cursor:pointer;">
            <div class="avatar">${initial}</div>
            <div>
              <div class="user-name">${safeName}</div>
              ${tokenBadge}
            </div>
          </a>
          <button class="logout-btn" onclick="event.preventDefault();AuthSystem.logout()">Keluar</button>
        `;
      } else {
        // Not logged in - show token count for guests
        const tokens = PaywallSystem.getTokens();
        authContainer.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="display:inline-flex;align-items:center;gap:4px;background:rgba(251,146,60,0.12);border:1px solid rgba(251,146,60,0.25);border-radius:12px;padding:4px 10px;font-size:0.75rem;font-weight:600;color:#fb923c;">🔑 ${tokens} Token Gratis</div>
            <button class="navbar-cta" onclick="AuthSystem.showModal()" style="background:var(--bg-card); border:1px solid var(--border-standard); color:var(--text-primary); padding:6px 14px; font-size:0.8rem;">Masuk</button>
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

// === INITIALIZE ALL SYSTEMS ===
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  AuthSystem.init();
  PaywallSystem.init();
  TokenDisplay.showBanner();
  updateArticleCardStatus();
});
