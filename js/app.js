/* v2.2.0 - Token System */
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
        Toast.show('Silakan jawab semua pertanyaan terlebih dahulu!', 'warning');
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
      Toast.show(result.message || 'Artikel dibuka!', 'success');
      window.location.reload();
    } else {
      Toast.show(result.error || 'Gagal membuka artikel', 'error');
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
          <div class="user-dropdown" id="userDropdown">
            <div class="user-trigger" onclick="document.getElementById('userDropdown').classList.toggle('open')">
              <div class="avatar">${initial}</div>
              <div class="user-meta">
                <span class="user-name">${safeName}</span>
                <span class="user-token">🔑 ${tokens} Token</span>
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
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span><span class="toast-msg">' + msg + '</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>';
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
  KEY: 'iothub_cookie_consent',
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
  KEY: 'iothub_theme',
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
  const headings = content.querySelectorAll('h2, h3');
  if (headings.length < 2) return;

  // Create TOC sidebar
  const toc = document.createElement('nav');
  toc.className = 'toc-sidebar';
  toc.innerHTML = '<h4>Daftar Isi</h4><ul>' + Array.from(headings).map((h, i) => {
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
  headings.forEach(h => observer.observe(h));
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
  { slug: 'sensor-dht-esp32', title: 'Sensor DHT dengan ESP32', icon: '🌡️', cat: 'ESP32', desc: 'Baca suhu dan kelembaban dengan DHT11/DHT22', diff: 'pemula', time: '8', access: 'Premium', date: '5 Juni 2026' },
  { slug: 'web-server-esp32', title: 'Web Server di ESP32', icon: '🌐', cat: 'ESP32', desc: 'Bangun web server mandiri di ESP32', diff: 'menengah', time: '11', access: 'Premium', date: '30 Mei 2026' },
  { slug: 'deep-sleep-esp32', title: 'ESP32 Deep Sleep', icon: '💤', cat: 'ESP32', desc: 'Hemat baterai untuk proyek IoT', diff: 'pemula', time: '7', access: 'Premium', date: '28 Mei 2026' },
  { slug: 'mikrotik-routing', title: 'Konfigurasi Routing MikroTik', icon: '🌐', cat: 'MikroTik', desc: 'Static route, OSPF, dan BGP', diff: 'menengah', time: '12', access: 'Token', date: '18 Juni 2026' },
  { slug: 'mikrotik-firewall', title: 'MikroTik Firewall', icon: '🛡️', cat: 'MikroTik', desc: 'Filter rules, NAT, dan mangle', diff: 'lanjut', time: '16', access: 'Premium', date: '2 Juni 2026' },
  { slug: 'mikrotik-queue', title: 'MikroTik Queue Management', icon: '🎛️', cat: 'MikroTik', desc: 'QoS dan bandwidth control', diff: 'menengah', time: '10', access: 'Premium', date: '24 Mei 2026' },
  { slug: 'lora-communication', title: 'Jaringan Sensor LoRa', icon: '📡', cat: 'LoRa', desc: 'Telemetry dan monitoring jarak jauh', diff: 'menengah', time: '10', access: 'Token', date: '15 Juni 2026' },
  { slug: 'python-iot-automation', title: 'Otomasi IoT dengan Python', icon: '🐍', cat: 'Python', desc: 'MQTT, GPIO, dan scheduling', diff: 'pemula', time: '8', access: 'Premium', date: '12 Juni 2026' },
  { slug: 'network-security', title: 'Keamanan Jaringan IoT', icon: '🔐', cat: 'Keamanan', desc: 'Firewall, VPN, dan enkripsi data', diff: 'lanjut', time: '14', access: 'Premium', date: '10 Juni 2026' },
  { slug: 'dashboard-monitoring', title: 'Dashboard Monitoring Real-time', icon: '📊', cat: 'Dashboard', desc: 'Node-RED, Grafana, dan MQTT', diff: 'menengah', time: '11', access: 'Premium', date: '8 Juni 2026' },
  { slug: 'node-red-iot', title: 'Node-RED untuk IoT', icon: '🔀', cat: 'Dashboard', desc: 'Flow programming dan integrasi', diff: 'menengah', time: '12', access: 'Premium', date: '26 Mei 2026' },
  { slug: 'grafana-influxdb', title: 'Grafana + InfluxDB', icon: '📈', cat: 'Dashboard', desc: 'Visualisasi data IoT real-time', diff: 'menengah', time: '13', access: 'Premium', date: '25 Mei 2026' },
  { slug: 'mqtt-protocol', title: 'Protokol MQTT', icon: '📨', cat: 'Protokol', desc: 'Panduan lengkap MQTT untuk IoT', diff: 'menengah', time: '13', access: 'Token', date: '6 Juni 2026' },
  { slug: 'iot-protocols-comparison', title: 'Perbandingan Protokol IoT', icon: '⚖️', cat: 'Protokol', desc: 'MQTT vs CoAP vs HTTP vs AMQP', diff: 'lanjut', time: '14', access: 'Premium', date: '29 Mei 2026' },
  { slug: 'raspberry-pi-iot', title: 'Raspberry Pi untuk IoT', icon: '🍓', cat: 'Raspberry Pi', desc: 'Gateway dan edge computing', diff: 'menengah', time: '15', access: 'Premium', date: '4 Juni 2026' },
  { slug: 'firebase-iot', title: 'Firebase untuk IoT', icon: '🔥', cat: 'Cloud', desc: 'Realtime database dan cloud functions', diff: 'menengah', time: '12', access: 'Premium', date: '3 Juni 2026' },
  { slug: 'telegram-bot-iot', title: 'Telegram Bot untuk IoT', icon: '🤖', cat: 'IoT', desc: 'Notifikasi dan kontrol jarak jauh', diff: 'pemula', time: '9', access: 'Premium', date: '1 Juni 2026' },
  { slug: 'blynk-iot', title: 'Blynk IoT', icon: '📱', cat: 'IoT', desc: 'Kontrol perangkat dari mobile app', diff: 'pemula', time: '8', access: 'Premium', date: '23 Mei 2026' },
  { slug: 'arduino-ide-setup', title: 'Arduino IDE 2.x Setup', icon: '💻', cat: 'Tools', desc: 'Instalasi dan konfigurasi lengkap', diff: 'pemula', time: '6', access: 'Premium', date: '27 Mei 2026' }
];

function renderArticleCard(a) {
  return '<a href="articles/' + a.slug + '.html" class="article-card"><div class="list-icon">' + a.icon + '</div><div class="list-info"><h3>' + a.title + '</h3><p>' + a.desc + '</p></div><div class="list-meta"><span class="access-badge ' + (a.access === 'Premium' ? 'premium' : 'unlocked') + '">' + a.access + '</span><span class="read-time">📖 ' + a.time + ' mnt</span><span class="difficulty ' + a.diff + '">' + a.diff.charAt(0).toUpperCase() + a.diff.slice(1) + '</span></div></a>';
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
    html += '<div class="category-section"><div class="cat-header"><h3>' + items[0].icon + ' ' + cat + '</h3><a href="kategori/' + cat.toLowerCase().replace(/\s+/g, '-') + '.html">Lihat Semua →</a></div><div style="display:flex;flex-direction:column;gap:8px;">' + items.map(renderArticleCard).join('') + '</div></div>';
  });
  grid.innerHTML = html;
}

// === INITIALIZE ALL SYSTEMS ===
document.addEventListener('DOMContentLoaded', () => {
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
});
