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
