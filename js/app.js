1|/* ============================================
2|   IoTHub - Main JavaScript
3|   ============================================ */
4|
5|// === Search Data ===
6|const articles = [
7|  {
8|    title: "Panduan Lengkap ESP32: Dari Setup Hingga Proyek IoT Pertama",
9|    category: "ESP32",
10|    url: "articles/esp32-fundamentals.html",
11|    icon: "🔧",
12|    desc: "Tutorial komprehensif ESP32 untuk pemula"
13|  },
14|  {
15|    title: "Konfigurasi Routing MikroTik: Static Route, OSPF & BGP",
16|    category: "MikroTik",
17|    url: "articles/mikrotik-routing.html",
18|    icon: "🌐",
19|    desc: "Pelajari routing di RouterOS MikroTik"
20|  },
21|  {
22|    title: "Membangun Jaringan Sensor LoRa: Telemetry & Monitoring",
23|    category: "LoRa",
24|    url: "articles/lora-communication.html",
25|    icon: "📡",
26|    desc: "Sistem monitoring jarak jauh dengan LoRa"
27|  },
28|  {
29|    title: "Otomasi IoT dengan Python: MQTT, GPIO & Scheduling",
30|    category: "Python",
31|    url: "articles/python-iot-automation.html",
32|    icon: "🐍",
33|    desc: "Gunakan Python untuk kontrol perangkat IoT"
34|  },
35|  {
36|    title: "Keamanan Jaringan IoT: Firewall, VPN & Enkripsi Data",
37|    category: "Keamanan",
38|    url: "articles/network-security.html",
39|    icon: "🔐",
40|    desc: "Lindungi perangkat IoT dari serangan siber"
41|  },
42|  {
43|    title: "Dashboard Monitoring Real-time: Node-RED + Grafana + MQTT",
44|    category: "Dashboard",
45|    url: "articles/dashboard-monitoring.html",
46|    icon: "📊",
47|    desc: "Bangun dashboard visual untuk monitoring IoT"
48|  },
49|  {
50|    title: "ESP8266 NodeMCU untuk Pemula: Setup & Proyek Pertama",
51|    category: "ESP8266",
52|    url: "articles/esp8266-nodemcu.html",
53|    icon: "📶",
54|    desc: "Pelajari ESP8266 NodeMCU untuk proyek IoT"
55|  },
56|  {
57|    title: "Protokol MQTT: Panduan Lengkap untuk IoT",
58|    category: "Protokol",
59|    url: "articles/mqtt-protocol.html",
60|    icon: "📨",
61|    desc: "Pahami cara kerja MQTT untuk perangkat IoT"
62|  },
63|  {
64|    title: "Sensor DHT11/DHT22 dengan ESP32: Tutorial Lengkap",
65|    category: "Sensor",
66|    url: "articles/sensor-dht-esp32.html",
67|    icon: "🌡️",
68|    desc: "Baca data suhu dan kelembaban dengan ESP32"
69|  },
70|  {
71|    title: "Raspberry Pi untuk IoT: Gateway & Edge Computing",
72|    category: "Raspberry Pi",
73|    url: "articles/raspberry-pi-iot.html",
74|    icon: "🍓",
75|    desc: "Gunakan Raspberry Pi sebagai gateway IoT"
76|  },
77|  {
78|    title: "Firebase untuk IoT: Realtime Database & Cloud Functions",
79|    category: "Cloud",
80|    url: "articles/firebase-iot.html",
81|    icon: "🔥",
82|    desc: "Integrasikan perangkat IoT dengan Google Firebase"
83|  },
84|  {
85|    title: "MikroTik Firewall: Filter Rules, NAT & Mangle",
86|    category: "MikroTik",
87|    url: "articles/mikrotik-firewall.html",
88|    icon: "🛡️",
89|    desc: "Konfigurasi firewall MikroTik RouterOS"
90|  },
91|  {
92|    title: "Telegram Bot untuk IoT: Notifikasi & Kontrol Jarak Jauh",
93|    category: "IoT",
94|    url: "articles/telegram-bot-iot.html",
95|    icon: "🤖",
96|    desc: "Buat Telegram Bot untuk notifikasi dan kontrol IoT"
97|  },
98|  {
99|    title: "Web Server di ESP32: Interface Kontrol & Monitoring",
100|    category: "ESP32",
101|    url: "articles/web-server-esp32.html",
102|    icon: "🌐",
103|    desc: "Bangun web server mandiri di ESP32"
104|  },
105|  {
106|    title: "Perbandingan Protokol IoT: MQTT vs CoAP vs HTTP vs AMQP",
107|    category: "Protokol",
108|    url: "articles/iot-protocols-comparison.html",
109|    icon: "⚖️",
110|    desc: "Analisis mendalam protokol komunikasi IoT"
111|  },
112|  {
113|    title: "ESP32 Deep Sleep: Hemat Baterai untuk Proyek IoT",
114|    category: "ESP32",
115|    url: "articles/deep-sleep-esp32.html",
116|    icon: "💤",
117|    desc: "Optimalkan konsumsi daya ESP32 dengan deep sleep"
118|  },
119|  {
120|    title: "Arduino IDE 2.x Setup: Instalasi & Konfigurasi Lengkap",
121|    category: "Tools",
122|    url: "articles/arduino-ide-setup.html",
123|    icon: "💻",
124|    desc: "Panduan instalasi Arduino IDE 2.x untuk ESP32"
125|  },
126|  {
127|    title: "Node-RED untuk IoT: Flow Programming & Integrasi",
128|    category: "Dashboard",
129|    url: "articles/node-red-iot.html",
130|    icon: "🔀",
131|    desc: "Pelajari Node-RED untuk alur data IoT visual"
132|  },
133|  {
134|    title: "Grafana + InfluxDB: Visualisasi Data IoT Real-time",
135|    category: "Dashboard",
136|    url: "articles/grafana-influxdb.html",
137|    icon: "📈",
138|    desc: "Bangun pipeline data IoT dengan Grafana dan InfluxDB"
139|  },
140|  {
141|    title: "MikroTik Queue Management: QoS & Bandwidth Control",
142|    category: "MikroTik",
143|    url: "articles/mikrotik-queue.html",
144|    icon: "🎛️",
145|    desc: "Kelola bandwidth jaringan dengan MikroTik Queue"
146|  },
147|  {
148|    title: "Blynk IoT: Kontrol Perangkat dari Mobile App",
149|    category: "IoT",
150|    url: "articles/blynk-iot.html",
151|    icon: "📱",
152|    desc: "Bangun aplikasi mobile untuk kontrol ESP32 dengan Blynk"
153|  }
154|];
155|
156|// === Navbar Scroll Effect ===
157|const navbar = document.getElementById('navbar');
158|let lastScroll = 0;
159|
160|window.addEventListener('scroll', () => {
161|  const currentScroll = window.pageYOffset;
162|  if (currentScroll > 50) {
163|    navbar.classList.add('scrolled');
164|  } else {
165|    navbar.classList.remove('scrolled');
166|  }
167|  lastScroll = currentScroll;
168|});
169|
170|// === Mobile Menu Toggle ===
171|const menuToggle = document.getElementById('menuToggle');
172|const navLinks = document.getElementById('navLinks');
173|
174|if (menuToggle && navLinks) {
175|  menuToggle.addEventListener('click', () => {
176|    navLinks.classList.toggle('active');
177|    menuToggle.classList.toggle('active');
178|  });
179|
180|  // Close menu when link clicked
181|  navLinks.querySelectorAll('a').forEach(link => {
182|    link.addEventListener('click', () => {
183|      navLinks.classList.remove('active');
184|      menuToggle.classList.remove('active');
185|    });
186|  });
187|}
188|
189|// === Search Overlay ===
190|const searchTrigger = document.getElementById('searchTrigger');
191|const searchOverlay = document.getElementById('searchOverlay');
192|const searchInput = document.getElementById('searchInput');
193|const searchResults = document.getElementById('searchResults');
194|
195|function openSearch() {
196|  searchOverlay.classList.add('active');
197|  searchInput.focus();
198|}
199|
200|function closeSearch() {
201|  searchOverlay.classList.remove('active');
202|  searchInput.value = '';
203|  searchResults.innerHTML = '<div class="search-hint">Tekan <kbd>Esc</kbd> untuk menutup</div>';
204|}
205|
206|if (searchTrigger) {
207|  searchTrigger.addEventListener('click', openSearch);
208|}
209|
210|if (searchOverlay) {
211|  searchOverlay.addEventListener('click', (e) => {
212|    if (e.target === searchOverlay) closeSearch();
213|  });
214|}
215|
216|// Keyboard shortcuts
217|document.addEventListener('keydown', (e) => {
218|  if (e.key === '/' && !searchOverlay.classList.contains('active') && document.activeElement.tagName !== 'INPUT') {
219|    e.preventDefault();
220|    openSearch();
221|  }
222|  if (e.key === 'Escape') {
223|    closeSearch();
224|  }
225|});
226|
227|// Search functionality
228|if (searchInput) {
229|  searchInput.addEventListener('input', (e) => {
230|    const query = e.target.value.toLowerCase().trim();
231|    if (query.length < 2) {
232|      searchResults.innerHTML = '<div class="search-hint">Ketik minimal 2 karakter untuk mencari</div>';
233|      return;
234|    }
235|
236|    const filtered = articles.filter(a =>
237|      a.title.toLowerCase().includes(query) ||
238|      a.category.toLowerCase().includes(query) ||
239|      a.desc.toLowerCase().includes(query)
240|    );
241|
242|    if (filtered.length === 0) {
243|      const safeQuery = query.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
244|      searchResults.innerHTML = '<div class="search-hint">Tidak ada hasil ditemukan untuk "' + safeQuery + '"</div>';
245|      return;
246|    }
247|
248|    searchResults.innerHTML = filtered.map(a => `
249|      <a href="${a.url}" class="search-result-item">
250|        <span class="icon">${a.icon}</span>
251|        <div class="text">
252|          <h4>${a.title}</h4>
253|          <p>${a.category} — ${a.desc}</p>
254|        </div>
255|      </a>
256|    `).join('');
257|  });
258|}
259|
260|// === Back to Top ===
261|const backToTop = document.getElementById('backToTop');
262|
263|window.addEventListener('scroll', () => {
264|  if (window.pageYOffset > 400) {
265|    backToTop.classList.add('visible');
266|  } else {
267|    backToTop.classList.remove('visible');
268|  }
269|});
270|
271|if (backToTop) {
272|  backToTop.addEventListener('click', () => {
273|    window.scrollTo({ top: 0, behavior: 'smooth' });
274|  });
275|}
276|
277|// === Scroll Animations ===
278|const observerOptions = {
279|  threshold: 0.1,
280|  rootMargin: '0px 0px -50px 0px'
281|};
282|
283|const observer = new IntersectionObserver((entries) => {
284|  entries.forEach(entry => {
285|    if (entry.isIntersecting) {
286|      entry.target.classList.add('visible');
287|      observer.unobserve(entry.target);
288|    }
289|  });
290|}, observerOptions);
291|
292|document.querySelectorAll('.fade-in').forEach(el => {
293|  observer.observe(el);
294|});
295|
296|// Safety: force all fade-in elements visible after 3s max
297|// Prevents invisible content if observer fails or user has reduced motion
298|setTimeout(() => {
299|  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
300|    el.classList.add('visible');
301|  });
302|}, 3000);
303|
304|// Also handle reduced motion preference
305|if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
306|  document.querySelectorAll('.fade-in').forEach(el => {
307|    el.classList.add('visible');
308|  });
309|}
310|
311|// === Newsletter Subscribe ===
312|async function handleSubscribe(e) {
313|  e.preventDefault();
314|  const form = e.target;
315|  const input = form.querySelector('input');
316|  const btn = form.querySelector('button');
317|  const email = input.value.trim();
318|
319|  if (!email || !email.includes('@')) {
320|    btn.textContent = '❌ Email tidak valid';
321|    btn.style.background = '#ef4444';
322|    setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.background = ''; }, 2000);
323|    return;
324|  }
325|
326|  // Disable button during request
327|  btn.disabled = true;
328|  btn.textContent = '⏳ Mengirim...';
329|
330|  try {
331|    // Try backend API first
332|    const API_BASE = window.location.origin;
333|    const res = await fetch(API_BASE + '/api/subscribe', {
334|      method: 'POST',
335|      headers: { 'Content-Type': 'application/json' },
336|      body: JSON.stringify({ email: email })
337|    });
338|
339|    if (res.ok) {
340|      const data = await res.json();
341|      btn.textContent = '✓ ' + data.message;
342|      btn.style.background = '#10b981';
343|      input.value = '';
344|      // Store in localStorage as backup
345|      const subs = JSON.parse(localStorage.getItem('iothub_subscribers') || '[]');
346|      if (!subs.includes(email)) subs.push(email);
347|      localStorage.setItem('iothub_subscribers', JSON.stringify(subs));
348|    } else {
349|      throw new Error('Server error');
350|    }
351|  } catch (err) {
352|    // Fallback: save to localStorage
353|    const subs = JSON.parse(localStorage.getItem('iothub_subscribers') || '[]');
354|    if (!subs.includes(email)) {
355|      subs.push(email);
356|      localStorage.setItem('iothub_subscribers', JSON.stringify(subs));
357|      btn.textContent = '✓ Tersubscribe! (offline mode)';
358|      btn.style.background = '#10b981';
359|      input.value = '';
360|    } else {
361|      btn.textContent = '✓ Email sudah terdaftar';
362|      btn.style.background = '#fbbf24';
363|    }
364|  }
365|
366|  setTimeout(() => {
367|    btn.textContent = 'Subscribe';
368|    btn.style.background = '';
369|    btn.disabled = false;
370|  }, 3500);
371|}
372|
373|// === Code Copy Button ===
374|document.querySelectorAll('.code-copy').forEach(btn => {
375|  btn.addEventListener('click', () => {
376|    const code = btn.closest('.code-block').querySelector('pre').textContent;
377|    navigator.clipboard.writeText(code).then(() => {
378|      const original = btn.textContent;
379|      btn.textContent = '✓ Copied!';
380|      setTimeout(() => { btn.textContent = original; }, 2000);
381|    });
382|  });
383|});
384|
385|// === Copy to clipboard utility ===
386|function copyToClipboard(text) {
387|  navigator.clipboard.writeText(text).then(() => {
388|    return true;
389|  }).catch(() => {
390|    return false;
391|  });
392|}
393|
394|// === Quiz System ===
395|function initQuiz(quizId, answers) {
396|  const container = document.getElementById(quizId);
397|  if (!container) return;
398|
399|  let score = 0;
400|  let answered = 0;
401|  const total = answers.length;
402|  const options = container.querySelectorAll('.quiz-option');
403|  const resultEl = container.querySelector('.quiz-result');
404|  const submitBtn = container.querySelector('.quiz-btn');
405|  const selected = {};
406|
407|  options.forEach(opt => {
408|    opt.addEventListener('click', () => {
409|      const qIndex = opt.dataset.question;
410|      const qOptions = container.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`);
411|      qOptions.forEach(o => o.classList.remove('selected'));
412|      opt.classList.add('selected');
413|      selected[qIndex] = opt.dataset.answer;
414|    });
415|  });
416|
417|  if (submitBtn) {
418|    submitBtn.addEventListener('click', () => {
419|      if (Object.keys(selected).length < total) {
420|        alert('Silakan jawab semua pertanyaan terlebih dahulu!');
421|        return;
422|      }
423|
424|      score = 0;
425|      answers.forEach((correct, i) => {
426|        const qOptions = container.querySelectorAll(`.quiz-option[data-question="${i}"]`);
427|        qOptions.forEach(o => {
428|          o.classList.remove('selected');
429|          if (o.dataset.answer === correct) {
430|            o.classList.add('correct');
431|          } else if (selected[i] === o.dataset.answer && o.dataset.answer !== correct) {
432|            o.classList.add('wrong');
433|          }
434|          o.style.pointerEvents = 'none';
435|        });
436|        if (selected[i] === correct) score++;
437|      });
438|
439|      const percent = Math.round((score / total) * 100);
440|      if (percent >= 60) {
441|        resultEl.className = 'quiz-result pass';
442|        resultEl.innerHTML = `🎉 Selamat! Kamu menjawab benar ${score}/${total} (${percent}%). Keamanan: LOLOS!`;
443|      } else {
444|        resultEl.className = 'quiz-result fail';
445|        resultEl.innerHTML = `😢 Kamu menjawab benar ${score}/${total} (${percent}%). Coba baca ulang materinya ya!`;
446|      }
447|
448|      submitBtn.style.display = 'none';
449|    });
450|  }
451|}
452|
453|// === Tab System ===
454|function initTabs(containerId) {
455|  const container = document.getElementById(containerId);
456|  if (!container) return;
457|
458|  const tabs = container.querySelectorAll('.tab-btn');
459|  const panels = container.querySelectorAll('.tab-panel');
460|
461|  tabs.forEach(tab => {
462|    tab.addEventListener('click', () => {
463|      tabs.forEach(t => t.classList.remove('active'));
464|      panels.forEach(p => p.classList.remove('active'));
465|
466|      tab.classList.add('active');
467|      const target = container.querySelector(`#${tab.dataset.tab}`);
468|      if (target) target.classList.add('active');
469|    });
470|  });
471|}
472|
473|// === Reading Progress ===
474|function initReadingProgress() {
475|  const progressBar = document.getElementById('readingProgress');
476|  if (!progressBar) return;
477|
478|  window.addEventListener('scroll', () => {
479|    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
480|    const scrolled = (window.pageYOffset / docHeight) * 100;
481|    progressBar.style.width = scrolled + '%';
482|  });
483|}
484|
485|// === Initialize ===
486|document.addEventListener('DOMContentLoaded', () => {
487|  initReadingProgress();
488|});
489|

// === PAYWALL SYSTEM ===
const PaywallSystem = {
  STORAGE_KEY: 'iothub_access',
  FREE_ARTICLES: [
    'esp32-fundamentals.html',
    'mqtt-protocol.html',
    'mikrotik-routing.html',
    'lora-communication.html',
    'esp8266-nodemcu.html'
  ],

  init() {
    // Check if current article is free or premium
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    // Only activate on article pages
    if (!path.includes('/articles/')) return;

    const isFree = this.FREE_ARTICLES.includes(filename);
    const hasAccess = this.hasAccess(filename);

    if (!isFree && !hasAccess) {
      this.showPaywall(filename);
    } else if (isFree && !hasAccess) {
      this.showEmailGate(filename);
    }
  },

  hasAccess(filename) {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    // Lifetime access for paid users
    if (data.lifetime) return true;
    // Check individual article access
    if (data.articles && data.articles.includes(filename)) return true;
    // Check email gate access
    if (data.email && data.emailUnlocked && data.emailUnlocked.includes(filename)) return true;
    return false;
  },

  showEmailGate(filename) {
    const article = document.querySelector('.article-content');
    if (!article) return;

    // Create blur overlay after first 2 paragraphs
    const allContent = article.innerHTML;
    const paragraphs = article.querySelectorAll('h2, h3, p, .code-block, .info-box, .arch-diagram, .compare-grid, .spec-table, .wiring-diagram, .proto-stack, .flow-container, .diagram-box');

    let cutIndex = 0;
    let charCount = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      charCount += paragraphs[i].textContent.length;
      if (charCount > 800 || paragraphs[i].tagName === 'H2') {
        cutIndex = i;
        break;
      }
    }

    if (cutIndex === 0) return; // Don't cut if content is too short

    // Create paywall overlay
    const overlay = document.createElement('div');
    overlay.className = 'paywall-overlay';
    overlay.innerHTML = `
      <div class="paywall-blur">
        ${Array.from(paragraphs).slice(cutIndex).map(el => el.outerHTML).join('\n')}
      </div>
      <div class="paywall-card">
        <div class="paywall-icon">🔓</div>
        <div class="paywall-badge">✨ Artikel Gratis - Cukup Masukkan Email</div>
        <h3>Baca Artikel Lengkap</h3>
        <p>Masukkan email Anda untuk membuka akses ke artikel ini secara gratis. Tanpa spam, tanpa biaya.</p>
        <form class="email-gate-form" onsubmit="PaywallSystem.unlockWithEmail(event, '${filename}')">
          <input type="email" placeholder="email@kamu.com" required>
          <button type="submit">Buka Akses</button>
        </form>
        <p style="font-size:0.75rem; color:var(--text-subtle); margin-top:12px;">Atau <a href="pricing.html" style="color:var(--accent-primary);">beli akses premium</a> ke semua artikel</p>
      </div>
    `;

    // Remove content after cut point and add overlay
    const cutPoint = paragraphs[cutIndex];
    let sibling = cutPoint;
    while (sibling) {
      const next = sibling.nextElementSibling;
      sibling.remove();
      sibling = next;
    }
    article.appendChild(overlay);
  },

  showPaywall(filename) {
    const article = document.querySelector('.article-content');
    if (!article) return;

    // Show only title and first paragraph
    const allContent = article.innerHTML;
    const firstParagraph = article.querySelector('p');

    // Create full paywall
    const overlay = document.createElement('div');
    overlay.className = 'paywall-overlay';
    overlay.innerHTML = `
      <div class="paywall-blur">
        ${article.querySelectorAll('h2, p, .code-block, .info-box, .arch-diagram, .compare-grid, .spec-table, .wiring-diagram, .proto-stack, .flow-container').length > 0 ?
          Array.from(article.querySelectorAll('h2, p')).slice(0, 3).map(el => el.outerHTML).join('\n') : ''}
      </div>
      <div class="paywall-card">
        <div class="paywall-icon">🔒</div>
        <div class="paywall-badge">👑 Artikel Premium</div>
        <h3>Akses Penuh ke 21+ Tutorial IoT</h3>
        <p>Dapatkan akses ke semua tutorial lengkap, quiz interaktif, dan update masa depan. Mulai dari Rp 49.000/bulan.</p>
        <div class="payment-options">
          <div class="payment-option" onclick="PaywallSystem.selectPlan('monthly')">
            <div class="price">Rp 49rb</div>
            <div class="period">/bulan</div>
            <div class="plan-name">Bulanan</div>
          </div>
          <div class="payment-option selected" onclick="PaywallSystem.selectPlan('yearly')">
            <div class="price">Rp 399rb</div>
            <div class="period">/tahun</div>
            <div class="plan-name">Tahunan</div>
          </div>
        </div>
        <button class="btn-primary" onclick="PaywallSystem.openPayment('${filename}')" style="width:100%; justify-content:center; padding:14px;">
          💳 Beli Akses Sekarang
        </button>
        <p style="font-size:0.75rem; color:var(--text-subtle); margin-top:12px;">Atau <a href="pricing.html" style="color:var(--accent-primary);">lihat semua paket</a></p>
      </div>
    `;

    // Keep only first 2 paragraphs, replace rest with paywall
    const children = Array.from(article.children);
    const firstFew = children.slice(0, 4); // title + first content
    article.innerHTML = '';
    firstFew.forEach(el => article.appendChild(el));
    article.appendChild(overlay);
  },

  unlockWithEmail(event, filename) {
    event.preventDefault();
    const email = event.target.querySelector('input').value;

    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    if (!data.email) data.email = email;
    if (!data.emailUnlocked) data.emailUnlocked = [];
    if (!data.emailUnlocked.includes(filename)) {
      data.emailUnlocked.push(filename);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

    // Show success
    const card = event.target.closest('.paywall-card');
    card.innerHTML = `
      <div class="paywall-icon">✅</div>
      <h3 style="color: var(--accent-primary);">Akses Dibuka!</h3>
      <p>Selamat membaca! Artikel ini sekarang terbuka untuk Anda.</p>
      <button onclick="PaywallSystem.reloadUnlocked()" class="btn-primary" style="margin-top:16px;">📖 Baca Sekarang</button>
    `;
  },

  reloadUnlocked() {
    // Remove paywall overlay
    const overlay = document.querySelector('.paywall-overlay');
    if (overlay) {
      const blur = overlay.querySelector('.paywall-blur');
      if (blur) {
        // Show blurred content
        const content = blur.innerHTML;
        overlay.remove();
        document.querySelector('.article-content').innerHTML += content;
      }
    }
  },

  selectedPlan: 'yearly',

  selectPlan(plan) {
    this.selectedPlan = plan;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    event.target.closest('.payment-option').classList.add('selected');
  },

  openPayment(filename) {
    // For now, show a message about payment
    // In production, redirect to Stripe/Midtrans
    const prices = { monthly: 'Rp 49.000/bulan', yearly: 'Rp 399.000/tahun' };
    const price = prices[this.selectedPlan];

    // Store pending purchase
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    data.pendingPurchase = { filename, plan: this.selectedPlan, price };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

    // Show payment instructions
    const card = document.querySelector('.paywall-card');
    card.innerHTML = `
      <div class="paywall-icon">💳</div>
      <h3>Menunggu Pembayaran</h3>
      <p>Paket: <strong>${this.selectedPlan === 'yearly' ? 'Tahunan' : 'Bulanan'}</strong> - ${price}</p>
      <div style="background: var(--bg-secondary); border-radius: var(--radius-md); padding: 16px; margin: 16px 0; text-align: left;">
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
          <strong>Cara Pembayaran:</strong>
        </p>
        <ol style="font-size: 0.85rem; color: var(--text-muted); padding-left: 20px;">
          <li>Transfer ke: <strong style="color: var(--accent-primary);">DANA/OVO: 0812-XXXX-XXXX</strong></li>
          <li>Kirim bukti transfer ke: <strong style="color: var(--accent-primary);">iothub@gmail.com</strong></li>
          <li>Kami akan mengirimkan kode akses dalam 1x24 jam</li>
        </ol>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-subtle);">
        Atau hubungi WhatsApp kami untuk pembayaran instan
      </p>
      <button onclick="PaywallSystem.simulatePayment('${filename}')" class="btn-secondary" style="width:100%; justify-content:center; margin-top:12px;">
        ⚡ Simulasi Pembayaran (Demo)
      </button>
    `;
  },

  simulatePayment(filename) {
    // Demo: unlock all articles
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    data.lifetime = true;
    data.plan = 'yearly';
    data.purchasedAt = new Date().toISOString();
    delete data.pendingPurchase;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

    // Reload page
    window.location.reload();
  },

  // Check if user has lifetime access
  hasLifetimeAccess() {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return data.lifetime === true;
  }
};

// Initialize paywall on article pages
if (document.querySelector('.article-content')) {
  PaywallSystem.init();
}

// === PRICING PAGE ===
function initPricingPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan');

  if (plan === 'yearly' || plan === 'monthly') {
    PaywallSystem.openPayment('');
  }
}
