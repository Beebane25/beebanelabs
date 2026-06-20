1|1|/* ============================================
2|2|   IoTHub - Main JavaScript
3|3|   ============================================ */
4|4|
5|5|// === Search Data ===
6|6|const articles = [
7|7|  {
8|8|    title: "Panduan Lengkap ESP32: Dari Setup Hingga Proyek IoT Pertama",
9|9|    category: "ESP32",
10|10|    url: "articles/esp32-fundamentals.html",
11|11|    icon: "🔧",
12|12|    desc: "Tutorial komprehensif ESP32 untuk pemula"
13|13|  },
14|14|  {
15|15|    title: "Konfigurasi Routing MikroTik: Static Route, OSPF & BGP",
16|16|    category: "MikroTik",
17|17|    url: "articles/mikrotik-routing.html",
18|18|    icon: "🌐",
19|19|    desc: "Pelajari routing di RouterOS MikroTik"
20|20|  },
21|21|  {
22|22|    title: "Membangun Jaringan Sensor LoRa: Telemetry & Monitoring",
23|23|    category: "LoRa",
24|24|    url: "articles/lora-communication.html",
25|25|    icon: "📡",
26|26|    desc: "Sistem monitoring jarak jauh dengan LoRa"
27|27|  },
28|28|  {
29|29|    title: "Otomasi IoT dengan Python: MQTT, GPIO & Scheduling",
30|30|    category: "Python",
31|31|    url: "articles/python-iot-automation.html",
32|32|    icon: "🐍",
33|33|    desc: "Gunakan Python untuk kontrol perangkat IoT"
34|34|  },
35|35|  {
36|36|    title: "Keamanan Jaringan IoT: Firewall, VPN & Enkripsi Data",
37|37|    category: "Keamanan",
38|38|    url: "articles/network-security.html",
39|39|    icon: "🔐",
40|40|    desc: "Lindungi perangkat IoT dari serangan siber"
41|41|  },
42|42|  {
43|43|    title: "Dashboard Monitoring Real-time: Node-RED + Grafana + MQTT",
44|44|    category: "Dashboard",
45|45|    url: "articles/dashboard-monitoring.html",
46|46|    icon: "📊",
47|47|    desc: "Bangun dashboard visual untuk monitoring IoT"
48|48|  },
49|49|  {
50|50|    title: "ESP8266 NodeMCU untuk Pemula: Setup & Proyek Pertama",
51|51|    category: "ESP8266",
52|52|    url: "articles/esp8266-nodemcu.html",
53|53|    icon: "📶",
54|54|    desc: "Pelajari ESP8266 NodeMCU untuk proyek IoT"
55|55|  },
56|56|  {
57|57|    title: "Protokol MQTT: Panduan Lengkap untuk IoT",
58|58|    category: "Protokol",
59|59|    url: "articles/mqtt-protocol.html",
60|60|    icon: "📨",
61|61|    desc: "Pahami cara kerja MQTT untuk perangkat IoT"
62|62|  },
63|63|  {
64|64|    title: "Sensor DHT11/DHT22 dengan ESP32: Tutorial Lengkap",
65|65|    category: "Sensor",
66|66|    url: "articles/sensor-dht-esp32.html",
67|67|    icon: "🌡️",
68|68|    desc: "Baca data suhu dan kelembaban dengan ESP32"
69|69|  },
70|70|  {
71|71|    title: "Raspberry Pi untuk IoT: Gateway & Edge Computing",
72|72|    category: "Raspberry Pi",
73|73|    url: "articles/raspberry-pi-iot.html",
74|74|    icon: "🍓",
75|75|    desc: "Gunakan Raspberry Pi sebagai gateway IoT"
76|76|  },
77|77|  {
78|78|    title: "Firebase untuk IoT: Realtime Database & Cloud Functions",
79|79|    category: "Cloud",
80|80|    url: "articles/firebase-iot.html",
81|81|    icon: "🔥",
82|82|    desc: "Integrasikan perangkat IoT dengan Google Firebase"
83|83|  },
84|84|  {
85|85|    title: "MikroTik Firewall: Filter Rules, NAT & Mangle",
86|86|    category: "MikroTik",
87|87|    url: "articles/mikrotik-firewall.html",
88|88|    icon: "🛡️",
89|89|    desc: "Konfigurasi firewall MikroTik RouterOS"
90|90|  },
91|91|  {
92|92|    title: "Telegram Bot untuk IoT: Notifikasi & Kontrol Jarak Jauh",
93|93|    category: "IoT",
94|94|    url: "articles/telegram-bot-iot.html",
95|95|    icon: "🤖",
96|96|    desc: "Buat Telegram Bot untuk notifikasi dan kontrol IoT"
97|97|  },
98|98|  {
99|99|    title: "Web Server di ESP32: Interface Kontrol & Monitoring",
100|100|    category: "ESP32",
101|101|    url: "articles/web-server-esp32.html",
102|102|    icon: "🌐",
103|103|    desc: "Bangun web server mandiri di ESP32"
104|104|  },
105|105|  {
106|106|    title: "Perbandingan Protokol IoT: MQTT vs CoAP vs HTTP vs AMQP",
107|107|    category: "Protokol",
108|108|    url: "articles/iot-protocols-comparison.html",
109|109|    icon: "⚖️",
110|110|    desc: "Analisis mendalam protokol komunikasi IoT"
111|111|  },
112|112|  {
113|113|    title: "ESP32 Deep Sleep: Hemat Baterai untuk Proyek IoT",
114|114|    category: "ESP32",
115|115|    url: "articles/deep-sleep-esp32.html",
116|116|    icon: "💤",
117|117|    desc: "Optimalkan konsumsi daya ESP32 dengan deep sleep"
118|118|  },
119|119|  {
120|120|    title: "Arduino IDE 2.x Setup: Instalasi & Konfigurasi Lengkap",
121|121|    category: "Tools",
122|122|    url: "articles/arduino-ide-setup.html",
123|123|    icon: "💻",
124|124|    desc: "Panduan instalasi Arduino IDE 2.x untuk ESP32"
125|125|  },
126|126|  {
127|127|    title: "Node-RED untuk IoT: Flow Programming & Integrasi",
128|128|    category: "Dashboard",
129|129|    url: "articles/node-red-iot.html",
130|130|    icon: "🔀",
131|131|    desc: "Pelajari Node-RED untuk alur data IoT visual"
132|132|  },
133|133|  {
134|134|    title: "Grafana + InfluxDB: Visualisasi Data IoT Real-time",
135|135|    category: "Dashboard",
136|136|    url: "articles/grafana-influxdb.html",
137|137|    icon: "📈",
138|138|    desc: "Bangun pipeline data IoT dengan Grafana dan InfluxDB"
139|139|  },
140|140|  {
141|141|    title: "MikroTik Queue Management: QoS & Bandwidth Control",
142|142|    category: "MikroTik",
143|143|    url: "articles/mikrotik-queue.html",
144|144|    icon: "🎛️",
145|145|    desc: "Kelola bandwidth jaringan dengan MikroTik Queue"
146|146|  },
147|147|  {
148|148|    title: "Blynk IoT: Kontrol Perangkat dari Mobile App",
149|149|    category: "IoT",
150|150|    url: "articles/blynk-iot.html",
151|151|    icon: "📱",
152|152|    desc: "Bangun aplikasi mobile untuk kontrol ESP32 dengan Blynk"
153|153|  }
154|154|];
155|155|
156|156|// === Navbar Scroll Effect ===
157|157|const navbar = document.getElementById('navbar');
158|158|let lastScroll = 0;
159|159|
160|160|window.addEventListener('scroll', () => {
161|161|  const currentScroll = window.pageYOffset;
162|162|  if (currentScroll > 50) {
163|163|    navbar.classList.add('scrolled');
164|164|  } else {
165|165|    navbar.classList.remove('scrolled');
166|166|  }
167|167|  lastScroll = currentScroll;
168|168|});
169|169|
170|170|// === Mobile Menu Toggle ===
171|171|const menuToggle = document.getElementById('menuToggle');
172|172|const navLinks = document.getElementById('navLinks');
173|173|
174|174|if (menuToggle && navLinks) {
175|175|  menuToggle.addEventListener('click', () => {
176|176|    navLinks.classList.toggle('active');
177|177|    menuToggle.classList.toggle('active');
178|178|  });
179|179|
180|180|  // Close menu when link clicked
181|181|  navLinks.querySelectorAll('a').forEach(link => {
182|182|    link.addEventListener('click', () => {
183|183|      navLinks.classList.remove('active');
184|184|      menuToggle.classList.remove('active');
185|185|    });
186|186|  });
187|187|}
188|188|
189|189|// === Search Overlay ===
190|190|const searchTrigger = document.getElementById('searchTrigger');
191|191|const searchOverlay = document.getElementById('searchOverlay');
192|192|const searchInput = document.getElementById('searchInput');
193|193|const searchResults = document.getElementById('searchResults');
194|194|
195|195|function openSearch() {
196|196|  searchOverlay.classList.add('active');
197|197|  searchInput.focus();
198|198|}
199|199|
200|200|function closeSearch() {
201|201|  searchOverlay.classList.remove('active');
202|202|  searchInput.value = '';
203|203|  searchResults.innerHTML = '<div class="search-hint">Tekan <kbd>Esc</kbd> untuk menutup</div>';
204|204|}
205|205|
206|206|if (searchTrigger) {
207|207|  searchTrigger.addEventListener('click', openSearch);
208|208|}
209|209|
210|210|if (searchOverlay) {
211|211|  searchOverlay.addEventListener('click', (e) => {
212|212|    if (e.target === searchOverlay) closeSearch();
213|213|  });
214|214|}
215|215|
216|216|// Keyboard shortcuts
217|217|document.addEventListener('keydown', (e) => {
218|218|  if (e.key === '/' && !searchOverlay.classList.contains('active') && document.activeElement.tagName !== 'INPUT') {
219|219|    e.preventDefault();
220|220|    openSearch();
221|221|  }
222|222|  if (e.key === 'Escape') {
223|223|    closeSearch();
224|224|  }
225|225|});
226|226|
227|227|// Search functionality
228|228|if (searchInput) {
229|229|  searchInput.addEventListener('input', (e) => {
230|230|    const query = e.target.value.toLowerCase().trim();
231|231|    if (query.length < 2) {
232|232|      searchResults.innerHTML = '<div class="search-hint">Ketik minimal 2 karakter untuk mencari</div>';
233|233|      return;
234|234|    }
235|235|
236|236|    const filtered = articles.filter(a =>
237|237|      a.title.toLowerCase().includes(query) ||
238|238|      a.category.toLowerCase().includes(query) ||
239|239|      a.desc.toLowerCase().includes(query)
240|240|    );
241|241|
242|242|    if (filtered.length === 0) {
243|243|      const safeQuery = query.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
244|244|      searchResults.innerHTML = '<div class="search-hint">Tidak ada hasil ditemukan untuk "' + safeQuery + '"</div>';
245|245|      return;
246|246|    }
247|247|
248|248|    searchResults.innerHTML = filtered.map(a => `
249|249|      <a href="${a.url}" class="search-result-item">
250|250|        <span class="icon">${a.icon}</span>
251|251|        <div class="text">
252|252|          <h4>${a.title}</h4>
253|253|          <p>${a.category} — ${a.desc}</p>
254|254|        </div>
255|255|      </a>
256|256|    `).join('');
257|257|  });
258|258|}
259|259|
260|260|// === Back to Top ===
261|261|const backToTop = document.getElementById('backToTop');
262|262|
263|263|window.addEventListener('scroll', () => {
264|264|  if (window.pageYOffset > 400) {
265|265|    backToTop.classList.add('visible');
266|266|  } else {
267|267|    backToTop.classList.remove('visible');
268|268|  }
269|269|});
270|270|
271|271|if (backToTop) {
272|272|  backToTop.addEventListener('click', () => {
273|273|    window.scrollTo({ top: 0, behavior: 'smooth' });
274|274|  });
275|275|}
276|276|
277|277|// === Scroll Animations ===
278|278|const observerOptions = {
279|279|  threshold: 0.1,
280|280|  rootMargin: '0px 0px -50px 0px'
281|281|};
282|282|
283|283|const observer = new IntersectionObserver((entries) => {
284|284|  entries.forEach(entry => {
285|285|    if (entry.isIntersecting) {
286|286|      entry.target.classList.add('visible');
287|287|      observer.unobserve(entry.target);
288|288|    }
289|289|  });
290|290|}, observerOptions);
291|291|
292|292|document.querySelectorAll('.fade-in').forEach(el => {
293|293|  observer.observe(el);
294|294|});
295|295|
296|296|// Safety: force all fade-in elements visible after 3s max
297|297|// Prevents invisible content if observer fails or user has reduced motion
298|298|setTimeout(() => {
299|299|  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
300|300|    el.classList.add('visible');
301|301|  });
302|302|}, 3000);
303|303|
304|304|// Also handle reduced motion preference
305|305|if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
306|306|  document.querySelectorAll('.fade-in').forEach(el => {
307|307|    el.classList.add('visible');
308|308|  });
309|309|}
310|310|
311|311|// === Newsletter Subscribe ===
312|312|async function handleSubscribe(e) {
313|313|  e.preventDefault();
314|314|  const form = e.target;
315|315|  const input = form.querySelector('input');
316|316|  const btn = form.querySelector('button');
317|317|  const email = input.value.trim();
318|318|
319|319|  if (!email || !email.includes('@')) {
320|320|    btn.textContent = '❌ Email tidak valid';
321|321|    btn.style.background = '#ef4444';
322|322|    setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.background = ''; }, 2000);
323|323|    return;
324|324|  }
325|325|
326|326|  // Disable button during request
327|327|  btn.disabled = true;
328|328|  btn.textContent = '⏳ Mengirim...';
329|329|
330|330|  try {
331|331|    // Try backend API first
332|332|    const API_BASE = window.location.origin;
333|333|    const res = await fetch(API_BASE + '/api/subscribe', {
334|334|      method: 'POST',
335|335|      headers: { 'Content-Type': 'application/json' },
336|336|      body: JSON.stringify({ email: email })
337|337|    });
338|338|
339|339|    if (res.ok) {
340|340|      const data = await res.json();
341|341|      btn.textContent = '✓ ' + data.message;
342|342|      btn.style.background = '#10b981';
343|343|      input.value = '';
344|344|      // Store in localStorage as backup
345|345|      const subs = JSON.parse(localStorage.getItem('iothub_subscribers') || '[]');
346|346|      if (!subs.includes(email)) subs.push(email);
347|347|      localStorage.setItem('iothub_subscribers', JSON.stringify(subs));
348|348|    } else {
349|349|      throw new Error('Server error');
350|350|    }
351|351|  } catch (err) {
352|352|    // Fallback: save to localStorage
353|353|    const subs = JSON.parse(localStorage.getItem('iothub_subscribers') || '[]');
354|354|    if (!subs.includes(email)) {
355|355|      subs.push(email);
356|356|      localStorage.setItem('iothub_subscribers', JSON.stringify(subs));
357|357|      btn.textContent = '✓ Tersubscribe! (offline mode)';
358|358|      btn.style.background = '#10b981';
359|359|      input.value = '';
360|360|    } else {
361|361|      btn.textContent = '✓ Email sudah terdaftar';
362|362|      btn.style.background = '#fbbf24';
363|363|    }
364|364|  }
365|365|
366|366|  setTimeout(() => {
367|367|    btn.textContent = 'Subscribe';
368|368|    btn.style.background = '';
369|369|    btn.disabled = false;
370|370|  }, 3500);
371|371|}
372|372|
373|373|// === Code Copy Button ===
374|374|document.querySelectorAll('.code-copy').forEach(btn => {
375|375|  btn.addEventListener('click', () => {
376|376|    const code = btn.closest('.code-block').querySelector('pre').textContent;
377|377|    navigator.clipboard.writeText(code).then(() => {
378|378|      const original = btn.textContent;
379|379|      btn.textContent = '✓ Copied!';
380|380|      setTimeout(() => { btn.textContent = original; }, 2000);
381|381|    });
382|382|  });
383|383|});
384|384|
385|385|// === Copy to clipboard utility ===
386|386|function copyToClipboard(text) {
387|387|  navigator.clipboard.writeText(text).then(() => {
388|388|    return true;
389|389|  }).catch(() => {
390|390|    return false;
391|391|  });
392|392|}
393|393|
394|394|// === Quiz System ===
395|395|function initQuiz(quizId, answers) {
396|396|  const container = document.getElementById(quizId);
397|397|  if (!container) return;
398|398|
399|399|  let score = 0;
400|400|  let answered = 0;
401|401|  const total = answers.length;
402|402|  const options = container.querySelectorAll('.quiz-option');
403|403|  const resultEl = container.querySelector('.quiz-result');
404|404|  const submitBtn = container.querySelector('.quiz-btn');
405|405|  const selected = {};
406|406|
407|407|  options.forEach(opt => {
408|408|    opt.addEventListener('click', () => {
409|409|      const qIndex = opt.dataset.question;
410|410|      const qOptions = container.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`);
411|411|      qOptions.forEach(o => o.classList.remove('selected'));
412|412|      opt.classList.add('selected');
413|413|      selected[qIndex] = opt.dataset.answer;
414|414|    });
415|415|  });
416|416|
417|417|  if (submitBtn) {
418|418|    submitBtn.addEventListener('click', () => {
419|419|      if (Object.keys(selected).length < total) {
420|420|        alert('Silakan jawab semua pertanyaan terlebih dahulu!');
421|421|        return;
422|422|      }
423|423|
424|424|      score = 0;
425|425|      answers.forEach((correct, i) => {
426|426|        const qOptions = container.querySelectorAll(`.quiz-option[data-question="${i}"]`);
427|427|        qOptions.forEach(o => {
428|428|          o.classList.remove('selected');
429|429|          if (o.dataset.answer === correct) {
430|430|            o.classList.add('correct');
431|431|          } else if (selected[i] === o.dataset.answer && o.dataset.answer !== correct) {
432|432|            o.classList.add('wrong');
433|433|          }
434|434|          o.style.pointerEvents = 'none';
435|435|        });
436|436|        if (selected[i] === correct) score++;
437|437|      });
438|438|
439|439|      const percent = Math.round((score / total) * 100);
440|440|      if (percent >= 60) {
441|441|        resultEl.className = 'quiz-result pass';
442|442|        resultEl.innerHTML = `🎉 Selamat! Kamu menjawab benar ${score}/${total} (${percent}%). Keamanan: LOLOS!`;
443|443|      } else {
444|444|        resultEl.className = 'quiz-result fail';
445|445|        resultEl.innerHTML = `😢 Kamu menjawab benar ${score}/${total} (${percent}%). Coba baca ulang materinya ya!`;
446|446|      }
447|447|
448|448|      submitBtn.style.display = 'none';
449|449|    });
450|450|  }
451|451|}
452|452|
453|453|// === Tab System ===
454|454|function initTabs(containerId) {
455|455|  const container = document.getElementById(containerId);
456|456|  if (!container) return;
457|457|
458|458|  const tabs = container.querySelectorAll('.tab-btn');
459|459|  const panels = container.querySelectorAll('.tab-panel');
460|460|
461|461|  tabs.forEach(tab => {
462|462|    tab.addEventListener('click', () => {
463|463|      tabs.forEach(t => t.classList.remove('active'));
464|464|      panels.forEach(p => p.classList.remove('active'));
465|465|
466|466|      tab.classList.add('active');
467|467|      const target = container.querySelector(`#${tab.dataset.tab}`);
468|468|      if (target) target.classList.add('active');
469|469|    });
470|470|  });
471|471|}
472|472|
473|473|// === Reading Progress ===
474|474|function initReadingProgress() {
475|475|  const progressBar = document.getElementById('readingProgress');
476|476|  if (!progressBar) return;
477|477|
478|478|  window.addEventListener('scroll', () => {
479|479|    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
480|480|    const scrolled = (window.pageYOffset / docHeight) * 100;
481|481|    progressBar.style.width = scrolled + '%';
482|482|  });
483|483|}
484|484|
485|485|// === Initialize ===
486|486|document.addEventListener('DOMContentLoaded', () => {
487|487|  initReadingProgress();
488|488|});
489|489|
490|
491|// === PAYWALL SYSTEM ===
492|const PaywallSystem = {
493|  STORAGE_KEY: 'iothub_access',
494|  FREE_ARTICLES: [
495|    'esp32-fundamentals.html',
496|    'mqtt-protocol.html',
497|    'mikrotik-routing.html',
498|    'lora-communication.html',
499|    'esp8266-nodemcu.html'
500|  ],
501|

// === AUTH SYSTEM ===
const AuthSystem = {
  API_BASE: '',
  STORAGE_KEY: 'iothub_auth',
  VIEW_KEY: 'iothub_views',
  FREE_VIEWS: 5,

  init() {
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

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        this.saveSession({ user: data.user, token: data.token });
        this.showSuccess('Login berhasil! Mengalihkan...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        this.showError(data.error || 'Login gagal');
      }
    } catch (err) {
      this.showError('Gagal terhubung ke server');
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success) {
        this.saveSession({ user: data.user, token: data.token });
        this.showSuccess('Registrasi berhasil! Mengalihkan...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        this.showError(data.error || 'Registrasi gagal');
      }
    } catch (err) {
      this.showError('Gagal terhubung ke server');
    }
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
        authContainer.innerHTML = `
          <div class="user-badge">
            <div class="avatar">${initial}</div>
            <div>
              <div class="user-name">${user.name || user.email.split('@')[0]}</div>
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

// === VIEW TRACKER ===
const ViewTracker = {
  SESSION_KEY: 'iothub_session_id',
  VIEWED_KEY: 'iothub_viewed',
  FREE_VIEWS: 5,

  getSessionId() {
    let sid = sessionStorage.getItem(this.SESSION_KEY);
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(this.SESSION_KEY, sid);
    }
    return sid;
  },

  getViews() {
    return parseInt(sessionStorage.getItem(this.VIEWED_KEY) || '0');
  },

  addView() {
    const views = this.getViews() + 1;
    sessionStorage.setItem(this.VIEWED_KEY, views.toString());
    return views;
  },

  hasReachedLimit() {
    return this.getViews() >= this.FREE_VIEWS;
  },

  showBanner() {
    const path = window.location.pathname;
    if (!path.includes('/articles/')) return;

    // Check if user is logged in and has subscription
    const user = AuthSystem.getUser();
    if (user && user.plan && user.plan !== 'free') return;

    const views = this.getViews();
    const remaining = this.FREE_VIEWS - views;

    // Create or update banner
    let banner = document.getElementById('viewCounterBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'viewCounterBanner';
      const articleContent = document.querySelector('.article-content');
      if (articleContent) {
        articleContent.insertBefore(banner, articleContent.firstChild);
      }
    }

    if (remaining <= 0) {
      banner.className = 'view-counter-banner limit-reached';
      banner.innerHTML = `
        <span class="view-text">⚠️ <strong>Batas viewing tercapai!</strong> Daftar atau login untuk melanjutkan membaca.</span>
        <button class="view-btn" onclick="AuthSystem.showModal()">👤 Masuk / Daftar</button>
      `;
    } else {
      banner.className = 'view-counter-banner';
      banner.innerHTML = `
        <span class="view-text">📖 Sisa artikel gratis: <span class="view-count">${remaining}</span> lagi dari ${this.FREE_VIEWS}</span>
        ${!AuthSystem.isLoggedIn() ? '<button class="view-btn" onclick="AuthSystem.showModal()">👤 Daftar Gratis</button>' : ''}
      `;
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
