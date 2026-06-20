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
      // Store in localStorage as backup
      const subs = JSON.parse(localStorage.getItem('iothub_subscribers') || '[]');
      if (!subs.includes(email)) subs.push(email);
      localStorage.setItem('iothub_subscribers', JSON.stringify(subs));
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    // Fallback: save to localStorage
    const subs = JSON.parse(localStorage.getItem('iothub_subscribers') || '[]');
    if (!subs.includes(email)) {
      subs.push(email);
      localStorage.setItem('iothub_subscribers', JSON.stringify(subs));
      btn.textContent = '✓ Tersubscribe! (offline mode)';
      btn.style.background = '#10b981';
      input.value = '';
    } else {
      btn.textContent = '✓ Email sudah terdaftar';
      btn.style.background = '#fbbf24';
    }
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
  FREE_ARTICLES: ['esp32-fundamentals.html', 'mqtt-protocol.html', 'mikrotik-routing.html', 'lora-communication.html', 'esp8266-nodemcu.html'],
  FREE_VIEWS: 5,
  API_BASE: window.location.origin
};

// === PAYWALL SYSTEM (FIXED) ===
const PaywallSystem = {
  FREE_ARTICLES: SITE_CONFIG.FREE_ARTICLES,

  isFreeArticle(filename) { return this.FREE_ARTICLES.includes(filename); },
  hasPaidAccess() {
    // Check session-cached plan first (set during login/register)
    const auth = JSON.parse(localStorage.getItem('iothub_auth') || 'null');
    if (auth && auth.user && auth.user.plan && auth.user.plan !== 'free') return true;
    // Also check legacy access cache
    const acc = JSON.parse(localStorage.getItem('iothub_access') || '{}');
    if (acc.lifetime === true || (acc.plan && acc.plan !== 'free')) return true;
    // Check server-side access if user is logged in with a token
    if (auth && auth.token && auth.user && auth.user.email) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/.netlify/functions/auth?action=check-access&email=' +
          encodeURIComponent(auth.user.email) + '&token=' + encodeURIComponent(auth.token), false);
        xhr.send();
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          if (result.hasAccess) {
            // Cache the plan status locally
            auth.user.plan = result.plan || 'premium';
            localStorage.setItem('iothub_auth', JSON.stringify(auth));
            return true;
          }
        }
      } catch (e) {
        // Server unavailable, rely on cached status
      }
    }
    return false;
  },

  hasEmailAccess(filename) {
    const acc = JSON.parse(localStorage.getItem('iothub_access') || '{}');
    return acc.emailUnlocked && acc.emailUnlocked.includes(filename);
  },

  init() {
    const path = window.location.pathname;
    if (!path.includes('/articles/')) return;
    const filename = path.split('/').pop();
    const isPaid = this.hasPaidAccess();
    const isFree = this.isFreeArticle(filename);
    const hasEmailAccess = this.hasEmailAccess(filename);
    const isLoggedIn = typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn();
    if (isPaid) return;
    if (isFree && (hasEmailAccess || isLoggedIn)) return;
    if (isFree && !hasEmailAccess && !isLoggedIn) { this.showEmailGate(filename); return; }
    if (!isFree && !isPaid) { this.showPaywall(filename); }
  },

  showEmailGate(filename) {
    const article = document.querySelector('.article-content');
    if (!article) return;
    const elements = article.querySelectorAll('h2, h3, p, .code-block, .info-box, .arch-diagram, .compare-grid, .spec-table');
    let cutIndex = 0, charCount = 0;
    for (let i = 0; i < elements.length; i++) {
      charCount += elements[i].textContent.length;
      if (charCount > 600 || (elements[i].tagName === 'H2' && i > 1)) { cutIndex = i; break; }
    }
    const overlay = document.createElement('div');
    overlay.className = 'paywall-overlay';
    overlay.innerHTML = '<div class="paywall-blur">' + Array.from(elements).slice(cutIndex).map(el => el.outerHTML).join('') + '</div>' +
      '<div class="paywall-card"><div class="paywall-icon">🔓</div><div class="paywall-badge">✨ Artikel Gratis</div>' +
      '<h3>Baca Artikel Lengkap</h3><p>Masukkan email untuk membuka akses gratis.</p>' +
      '<form class="email-gate-form" onsubmit="PaywallSystem.unlockWithEmail(event,\'' + filename + '\')">' +
      '<input type="email" placeholder="email@kamu.com" required><button type="submit">Buka Akses</button></form></div>';
    const cutPoint = elements[cutIndex];
    if (cutPoint) { let s = cutPoint; while (s) { const n = s.nextElementSibling; s.remove(); s = n; } }
    article.appendChild(overlay);
  },

  showPaywall(filename) {
    const article = document.querySelector('.article-content');
    if (!article) return;
    const elements = article.querySelectorAll('h2, h3, p, .code-block, .info-box, .arch-diagram, .compare-grid, .spec-table');
    const cutIndex = Math.min(4, elements.length);
    const isLoggedIn = typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn();
    const overlay = document.createElement('div');
    overlay.className = 'paywall-overlay';
    if (isLoggedIn) {
      overlay.innerHTML = '<div class="paywall-blur">' + Array.from(elements).slice(cutIndex).map(el => el.outerHTML).join('') + '</div>' +
        '<div class="paywall-card"><div class="paywall-icon">👑</div><div class="paywall-badge">Artikel Premium</div>' +
        '<h3>Upgrade ke Premium</h3><p>Akun kamu belum memiliki akses premium. Pilih paket untuk membuka semua artikel.</p>' +
        '<a href="../pricing.html" class="btn-primary" style="display:inline-block;text-decoration:none;margin-top:16px;">💎 Lihat Paket Harga</a></div>';
    } else {
      overlay.innerHTML = '<div class="paywall-blur">' + Array.from(elements).slice(cutIndex).map(el => el.outerHTML).join('') + '</div>' +
        '<div class="paywall-card"><div class="paywall-icon">🔒</div><div class="paywall-badge">Artikel Premium</div>' +
        '<h3>Dapatkan Akses Penuh</h3><p>Login atau daftar untuk melanjutkan. Upgrade ke premium untuk semua artikel.</p>' +
        '<button onclick="AuthSystem.showModal()" class="btn-primary" style="margin-top:16px;">👤 Login / Daftar</button>' +
        '<p style="margin-top:12px;"><a href="../pricing.html" style="color:#3ecf8e;font-size:0.85rem;">Lihat paket harga →</a></p></div>';
    }
    const cutPoint = elements[cutIndex];
    if (cutPoint) { let s = cutPoint; while (s) { const n = s.nextElementSibling; s.remove(); s = n; } }
    article.appendChild(overlay);
  },

  unlockWithEmail(event, filename) {
    event.preventDefault();
    const email = event.target.querySelector('input').value;
    const acc = JSON.parse(localStorage.getItem('iothub_access') || '{}');
    if (!acc.email) acc.email = email;
    if (!acc.emailUnlocked) acc.emailUnlocked = [];
    if (!acc.emailUnlocked.includes(filename)) acc.emailUnlocked.push(filename);
    localStorage.setItem('iothub_access', JSON.stringify(acc));
    window.location.reload();
  }
};


// === AUTH SYSTEM ===
const AuthSystem = {
  API_BASE: window.location.origin,
  AUTH_ENDPOINT: '/.netlify/functions/auth',
  STORAGE_KEY: 'iothub_auth',
  VIEW_KEY: 'iothub_views',
  FREE_VIEWS: 5,

  init() {
    // Clean up old localStorage data (insecure auth from previous versions)
    localStorage.removeItem('iothub_users');

    this.checkSession();
    this.createLoginModal();
    this.updateNavbar();
  },

  getSession() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null');
  },

  saveSession(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  checkSession() {
    const session = this.getSession();
    if (session && session.user) {
      return true;
    }
    return false;
  },

  isLoggedIn() {
    const s = this.getSession();
    return s && s.user && s.user.email;
  },

  getUser() {
    const s = this.getSession();
    return s ? s.user : null;
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        const planClass = user.plan && user.plan !== 'free' ? 'premium' : '';
        const planLabel = user.plan === 'yearly' ? '👑 Yearly' : user.plan === 'monthly' ? '⭐ Monthly' : 'Free';
        const safeName = this.escapeHtml(user.name || user.email.split('@')[0]);
        authContainer.innerHTML = `
          <div class="user-badge">
            <div class="avatar">${initial}</div>
            <div>
              <div class="user-name">${safeName}</div>
              <div class="user-plan ${planClass}">${planLabel}</div>
            </div>
            <button class="logout-btn" onclick="AuthSystem.logout()">Keluar</button>
          </div>
        `;
      } else {
        authContainer.innerHTML = `
          <button class="navbar-cta" onclick="AuthSystem.showModal()" style="background:var(--bg-card); border:1px solid var(--border-standard); color:var(--text-primary);">
            👤 Masuk
          </button>
        `;
      }
    }
  }
};

// === VIEW TRACKER (FIXED) ===
const ViewTracker = {
  SESSION_KEY: 'iothub_session_id',
  VIEWED_KEY: 'iothub_viewed',
  FREE_VIEWS: SITE_CONFIG.FREE_VIEWS,

  getSessionId() {
    let sid = sessionStorage.getItem(this.SESSION_KEY);
    if (!sid) { sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); sessionStorage.setItem(this.SESSION_KEY, sid); }
    return sid;
  },
  getViews() { return parseInt(sessionStorage.getItem(this.VIEWED_KEY) || '0'); },
  addView() { const v = this.getViews() + 1; sessionStorage.setItem(this.VIEWED_KEY, v.toString()); return v; },
  hasReachedLimit() { return this.getViews() >= this.FREE_VIEWS; },

  showBanner() {
    const path = window.location.pathname;
    if (!path.includes('/articles/')) return;
    if (PaywallSystem.hasPaidAccess()) return;
    const views = this.getViews();
    const remaining = this.FREE_VIEWS - views;
    const isLoggedIn = typeof AuthSystem !== 'undefined' && AuthSystem.isLoggedIn();

    let banner = document.getElementById('viewCounterBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'viewCounterBanner';
      const ac = document.querySelector('.article-content');
      if (ac) ac.insertBefore(banner, ac.firstChild);
    }

    if (remaining <= 0) {
      banner.className = 'view-counter-banner limit-reached';
      if (isLoggedIn) {
        banner.innerHTML = '<span class="view-text"><strong>Batas viewing tercapai!</strong> Upgrade ke premium untuk akses tanpa batas.</span>' +
          '<a href="../pricing.html" class="view-btn" style="text-decoration:none;">💎 Upgrade Sekarang</a>';
      } else {
        banner.innerHTML = '<span class="view-text"><strong>Batas viewing tercapai!</strong> Login atau daftar untuk melanjutkan.</span>' +
          '<button class="view-btn" onclick="AuthSystem.showModal()">👤 Masuk / Daftar</button>';
      }
    } else {
      banner.className = 'view-counter-banner';
      banner.innerHTML = '<span class="view-text">Sisa artikel gratis: <span class="view-count">' + remaining + '</span> lagi</span>' +
        (!isLoggedIn ? '<button class="view-btn" onclick="AuthSystem.showModal()">👤 Daftar Gratis</button>' : '');
    }
  }
};

// Initialize auth and view tracker
AuthSystem.init();

// Track article views
if (window.location.pathname.includes('/articles/')) {
  const views = ViewTracker.addView();
  ViewTracker.showBanner();

  if (ViewTracker.hasReachedLimit() && !AuthSystem.isLoggedIn()) {
    // Show login modal after a delay
    setTimeout(() => {
      if (!AuthSystem.isLoggedIn()) {
        AuthSystem.showModal();
      }
    }, 2000);
  }
}
