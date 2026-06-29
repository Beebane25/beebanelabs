#!/usr/bin/env python3
"""Add more content to articles that are under 500 lines."""
import os, re

DIR = r"C:\Users\user\Documents\pribadi\web adsence\articles"

# Additional content blocks for each article
# Each block will be inserted before the quiz section
extra = {}

extra["wireless-penetration-testing.html"] = """
      <h3>WPA2 Handshake Analysis</h3>
      <p>Memahami proses 4-way handshake WPA2 sangat penting untuk wireless security testing. Handshake terjadi saat client terhubung ke access point dan menukar cryptographic keys.</p>
      <div class="diagram-box"><div class="diagram-label">Diagram: WPA2 4-Way Handshake</div>
<pre>
┌─────────────────────────────────────────────────────┐
│           WPA2 4-WAY HANDSHAKE                       │
│                                                      │
│  Client (Supplicant)        AP (Authenticator)       │
│       │                          │                   │
│       │    1. ANonce             │                   │
│       │ ◄────────────────────────│                   │
│       │                          │                   │
│       │  [Derive PTK from        │                   │
│       │   ANonce + SNonce +      │                   │
│       │   PMK + MAC addresses]   │                   │
│       │                          │                   │
│       │    2. SNonce + MIC       │                   │
│       │ ────────────────────────►│                   │
│       │                          │                   │
│       │  [AP derives PTK,        │                   │
│       │   verifies MIC]          │                   │
│       │                          │                   │
│       │    3. GTK + MIC          │                   │
│       │ ◄────────────────────────│                   │
│       │                          │                   │
│       │    4. ACK                │                   │
│       │ ────────────────────────►│                   │
│       │                          │                   │
│  [Both sides now have PTK        │                   │
│   for encrypted communication]   │                   │
└─────────────────────────────────────────────────────┘
</pre>
      </div>
      <h3>WiFi Jamming dan DoS</h3>
      <p>Serangan denial of service pada wireless network dapat dilakukan dengan mengirimkan deauthentication frames secara massal, menyebabkan semua client terputus dari access point.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WiFi DoS Detection</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# WiFi DoS Attack Detection &amp; Monitoring
# =============================================

# Monitor deauth flood attacks
sudo airodump-ng wlan0mon --output-format pcap \\
  --write deauth_monitor

# Detect using mdk4
sudo mdk4 wlan0mon d -c 6

# Monitor with Wireshark filter
# wlan.fc.type_subtype == 0x000c
# (Deauthentication frames)

# Counter-measures:
# 1. Enable 802.11w (Protected Management Frames)
# 2. Deploy WIDS to detect deauth floods
# 3. Use frequency hopping if supported
# 4. Monitor signal strength anomalies

# Script: Automated deauth detection
#!/bin/bash
THRESHOLD=50
INTERFACE="wlan0mon"

while true; do
    DEAUTH_COUNT=$(tcpdump -i $INTERFACE -c 1000 \\
      'type mgt subtype deauth' 2>/dev/null | wc -l)
    if [ "$DEAUTH_COUNT" -gt "$THRESHOLD" ]; then
        echo "[ALERT] Deauth flood detected: $DEAUTH_COUNT frames"
        # Send alert to SIEM
        logger -p auth.alert "WiFi deauth flood detected"
    fi
    sleep 10
done</pre>
      </div>
"""

extra["api-security-testing.html"] = """
      <h3>API Security Headers</h3>
      <p>HTTP security headers adalah pertahanan pertama yang harus dikonfigurasi pada setiap API. Headers yang tepat dapat mencegah berbagai jenis serangan seperti XSS, clickjacking, dan MIME sniffing.</p>
      <table class="net-table"><thead><tr><th>Header</th><th>Nilai</th><th>Fungsi</th></tr></thead><tbody>
        <tr><td><strong>Content-Security-Policy</strong></td><td>default-src 'self'</td><td>Mencegah XSS dan injection</td></tr>
        <tr><td><strong>X-Content-Type-Options</strong></td><td>nosniff</td><td>Mencegah MIME type sniffing</td></tr>
        <tr><td><strong>X-Frame-Options</strong></td><td>DENY</td><td>Mencegah clickjacking</td></tr>
        <tr><td><strong>Strict-Transport-Security</strong></td><td>max-age=31536000</td><td>Force HTTPS</td></tr>
        <tr><td><strong>Cache-Control</strong></td><td>no-store</td><td>Mencegah caching data sensitif</td></tr>
        <tr><td><strong>RateLimit-Limit</strong></td><td>100</td><td>Informasi rate limit ke client</td></tr>
      </tbody></table>

      <h3>GraphQL Security</h3>
      <p>GraphQL API memiliki attack surface yang berbeda dari REST. Beberapa kerentanan khusus GraphQL meliputi introspection abuse, nested query depth attack, dan batch query abuse.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — GraphQL Security Testing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# GraphQL Security Testing
+# =============================================

+# 1. Introspection query (enumerate schema)
+curl -X POST https://target.com/graphql \\
+  -H "Content-Type: application/json" \\
+  -d '{"query":"{ __schema { types { name fields { name type { name } } } } }"}'

+# 2. Disable introspection in production!
+# Apollo Server config:
+# introspection: process.env.NODE_ENV !== 'production'

+# 3. Query depth attack (nested queries)
+# Malicious: deeply nested query to cause DoS
+# { user(id:1) { friends { friends { friends { ... } } } } }
+
+# Defense: Set max depth limit
+# graphql-depth-limit package: maxDepth: 5

+# 4. Batch query abuse
+# Sending multiple queries in single request
+curl -X POST https://target.com/graphql \\
+  -H "Content-Type: application/json" \\
+  -d '[
+    {"query":"{ user(id:1) { email } }"},
+    {"query":"{ user(id:2) { email } }"},
+    {"query":"{ user(id:3) { email } }"}
+  ]'

+# Defense: Limit batch size
+# graphql-config: batch: { max: 5 }

+# 5. SQL Injection via GraphQL variables
+curl -X POST https://target.com/graphql \\
+  -H "Content-Type: application/json" \\
+  -d '{"query":"query($name: String!) { users(name: $name) { id } }", "variables": {"name": "\\' OR 1=1--"}}'

+# 6. Field suggestion abuse
+# GraphQL leaks field names through suggestions
+# Defense: Disable suggestions in production</pre>
      </div>

      <h3>API Gateway Security</h3>
      <p>API Gateway berfungsi sebagai single entry point untuk semua API calls. Konfigurasi gateway yang tepat sangat penting untuk keamanan.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">YAML — Kong API Gateway Security</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# API Gateway Security — Kong Configuration
+# =============================================

+# Enable rate limiting plugin
+curl -X POST http://kong:8001/services/my-api/plugins \\
+  --data "name=rate-limiting" \\
+  --data "config.minute=100" \\
+  --data "config.policy=local"

+# Enable IP restriction
+curl -X POST http://kong:8001/services/my-api/plugins \\
+  --data "name=ip-restriction" \\
+  --data "config.allow=10.0.0.0/8"

+# Enable bot detection
+curl -X POST http://kong:8001/services/my-api/plugins \\
+  --data "name=bot-detection"

+# Enable CORS
+curl -X POST http://kong:8001/services/my-api/plugins \\
+  --data "name=cors" \\
+  --data "config.origins=https://trusted.com" \\
+  --data "config.methods=GET,POST" \\
+  --data "config.max_age=3600"

+# Enable request size limiting
+curl -X POST http://kong:8001/services/my-api/plugins \\
+  --data "name=request-size-limiting" \\
+  --data "config.allowed_payload_size=10"</pre>
      </div>
"""

extra["container-security.html"] = """
      <h3>Supply Chain Security</h3>
      <p>Supply chain attacks pada container ecosystem terjadi ketika komponen yang dipercaya (base image, dependency, registry) dikompromikan. SolarWinds dan Codecov adalah contoh supply chain attacks besar.</p>
      <div class="diagram-box"><div class="diagram-label">Diagram: Container Supply Chain</div>
<pre>
┌─────────────────────────────────────────────────────┐
│           CONTAINER SUPPLY CHAIN                      │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  Base     │    │ Package  │    │ App      │      │
│  │  Image    │───▶│ Manager  │───▶│ Code     │      │
│  │  (OS)     │    │ (pip/npm)│    │          │      │
│  └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │              │
│       ▼               ▼               ▼              │
│  ┌──────────────────────────────────────────┐       │
│  │           Dockerfile                      │       │
│  │  (Build instructions)                     │       │
│  └──────────────────────┬───────────────────┘       │
│                         ▼                            │
│  ┌──────────────────────────────────────────┐       │
│  │           Container Image                 │       │
│  │  ┌──────┐ ┌──────┐ ┌──────┐             │       │
│  │  │Layer1│ │Layer2│ │Layer3│ ...          │       │
│  │  │(OS)  │ │(deps)│ │(app) │             │       │
│  │  └──────┘ └──────┘ └──────┘             │       │
│  └──────────────────────┬───────────────────┘       │
│                         ▼                            │
│  ┌──────────────────────────────────────────┐       │
│  │           Container Registry              │       │
│  │  (DockerHub, ECR, GCR, Harbor)           │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  ⚠️ ATTACK POINTS:                                  │
│  • Poisoned base image                               │
│  • Malicious dependency (typosquatting)              │
│  • Compromised build pipeline                        │
│  • Registry tampering                                │
│  • Signed image bypass                               │
└─────────────────────────────────────────────────────┘
</pre>
      </div>

      <h3>Image Signing with Cosign</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Container Image Signing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Container Image Signing &amp; Verification
+# =============================================

+# 1. Install cosign (Sigstore)
+go install github.com/sigstore/cosign/v2/cmd/cosign@latest

+# 2. Generate keypair
+cosign generate-key-pair

+# 3. Sign image
+cosign sign --key cosign.key registry.example.com/myapp:v1.0

+# 4. Verify signature
+cosign verify --key cosign.pub registry.example.com/myapp:v1.0

+# 5. Sign with keyless (OIDC identity)
+cosign sign registry.example.com/myapp:v1.0
+# Uses Fulcio for short-lived certificates
+# Uses Rekor for transparency log

+# 6. Enforce signature verification in K8s
+# Kyverno policy:
+apiVersion: kyverno.io/v1
+kind: ClusterPolicy
+metadata:
+  name: verify-image-signatures
+spec:
+  validationFailureAction: enforce
+  rules:
+    - name: verify-cosign-signature
+      match:
+        resources:
+          kinds: ["Pod"]
+      verifyImages:
+        - imageReferences: ["registry.example.com/*"]
+          attestors:
+            - entries:
+                - keys:
+                    publicKeys: |-
+                      -----BEGIN PUBLIC KEY-----
+                      ...
+                      -----END PUBLIC KEY-----</pre>
      </div>

      <h3>Container Forensics</h3>
      <p>Ketika container terkompromi, forensik container berbeda dari tradisional karena sifat ephemeral container. Evidence collection harus dilakukan sebelum container dihapus.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Container Forensics</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Container Incident Response &amp; Forensics
+# =============================================

+# 1. Snapshot container filesystem (sebelum dihapus)
+docker commit suspicious-container forensic-image:v1
+docker save forensic-image:v1 -o forensic-image.tar

+# 2. Export container filesystem
+docker export suspicious-container -o container-fs.tar
+mkdir /forensics/container && tar xf container-fs.tar -C /forensics/container

+# 3. Capture container memory
+docker exec suspicious-container sh -c 'cat /proc/*/maps' > mem-maps.txt
+# Or use AVML for memory capture
+docker cp suspicious-container:/proc /forensics/proc

+# 4. Collect container logs
+docker logs suspicious-container > container-logs.txt 2>&1

+# 5. Network forensics
+docker exec suspicious-container ss -tulnp > network-connections.txt
+docker exec suspicious-container cat /etc/resolv.conf > dns-config.txt

+# 6. Process forensics
+docker top suspicious-container > process-list.txt
+docker exec suspicious-container ps auxf > process-tree.txt

+# 7. Analyze image layers
+dive forensic-image:v1
+# Check each layer for suspicious additions

+# 8. Timeline reconstruction
+# Correlate timestamps from:
+# - Container logs
+# - Host audit logs (auditd)
+# - Network flow logs
+# - SIEM alerts</pre>
      </div>
"""

extra["mobile-security-testing.html"] = """
      <h3>Flutter App Security</h3>
      <p>Flutter apps memiliki tantangan keamanan khusus karena menggunakan Dart yang dikompilasi ke native code (AOT compilation). Standard Android/iOS reverse engineering tools tidak langsung bekerja pada Flutter.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Flutter App Analysis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Flutter App Security Testing
+# =============================================

+# Flutter apps store Dart code in libapp.so
+# Standard decompilers won't work

+# 1. ReFlutter — Repackage Flutter app
+pip install reflutter
+reflutter target.apk
+# This patches the app to dump SSL traffic

+# 2. Frida for Flutter
+# Use rida (Flutter-specific Frida scripts)
+git clone https://github.com/aspect-apps/rida
+frida -U -f com.target.app -l rida.js --no-pause

+# 3. Binary analysis
+# Extract libapp.so
+unzip target.apk lib/armeabi-v7a/libapp.so
+# Use Ghidra or IDA to analyze
+# Search for API endpoints in binary
+strings libapp.so | grep -i "https://api"

+# 4. Dart-specific reverse engineering
+# Use blutter for Flutter reverse engineering
+git clone https://github.com/aspect-apps/blutter
+python3 blutter.py path/to/libapp.so path/to/output

+# 5. Intercept Flutter HTTP traffic
+# Flutter doesn't use system proxy by default
+# Use ProxyDroid (rooted device) to force proxy
+# Or patch app with iptables redirect

+# 6. Secure Storage analysis
+# Flutter flutter_secure_storage uses:
+# Android: EncryptedSharedPreferences
+# iOS: Keychain
+# Check for weak encryption keys</pre>
      </div>

      <h3>React Native App Security</h3>
      <p>React Native apps membawa JavaScript bundle yang berisi source code dan business logic. Bundle ini bisa diekstrak dan dibaca langsung.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — React Native Analysis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# React Native App Analysis
+# =============================================

+# 1. Extract JS bundle dari APK
+unzip target.apk assets/index.android.bundle

+# 2. Beautify dan analisis
+js-beautify assets/index.android.bundle > bundle.js
+
+# 3. Search for sensitive data
+grep -i "api_key\\|secret\\|password\\|token" bundle.js
+grep -i "https://api" bundle.js
+
+# 4. Find hardcoded credentials
+grep -i "bearer\\|authorization" bundle.js
+
+# 5. Check for debug flags
+grep -i "__DEV__\\|debug\\|DEV_MODE" bundle.js
+
+# 6. Find environment configs
+grep -i "staging\\|production\\|localhost" bundle.js
+
+# 7. Hermes bytecode (if Hermes engine enabled)
+# Hermes compiles JS to bytecode
+# Use hermes-dec to decompile:
+git clone https://github.com/P1sec/hermes-dec
+python3 hermes-dec/bytecode_dec.py index.android.bundle
+
+# Defense:
+# - Enable ProGuard/R8 obfuscation
+# - Use Hermes engine (compiled bytecode)
+# - Don't store secrets in JS bundle
+# - Use env-specific builds (not JS checks)</pre>
      </div>

      <h3>Mobile App Hardening Checklist</h3>
      <table class="net-table"><thead><tr><th>Category</th><th>Control</th><th>Implementation</th></tr></thead><tbody>
        <tr><td><strong>Data Storage</strong></td><td>Encrypt sensitive data</td><td>Keychain (iOS), EncryptedSharedPreferences (Android)</td></tr>
        <tr><td><strong>Network</strong></td><td>Certificate pinning</td><td>TrustManager, NSAppTransportSecurity</td></tr>
        <tr><td><strong>Authentication</strong></td><td>Biometric + MFA</td><td>BiometricPrompt, LocalAuthentication</td></tr>
        <tr><td><strong>Code</strong></td><td>Obfuscation</td><td>ProGuard/R8 (Android), SwiftShield (iOS)</td></tr>
        <tr><td><strong>Tamper</strong></td><td>Tamper detection</td><td>Root/jailbreak detection, integrity checks</td></tr>
        <tr><td><strong>Debug</strong></td><td>Disable debugging</td><td>android:debuggable=false, strip symbols</td></tr>
      </tbody></table>
"""

extra["social-engineering-awareness.html"] = """
      <h3>Phishing URL Analysis</h3>
      <p>Kemampuan menganalisis URL sangat penting untuk mengenali phishing. URL palsu sering menggunakan teknik typosquatting, homograph attack, dan URL shortening untuk menyamarkan tujuan sebenarnya.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Phishing URL Analysis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Phishing URL Analysis Techniques
+# =============================================

+# 1. Check URL dengan VirusTotal
+curl --request GET \\
+  --url "https://www.virustotal.com/api/v3/urls/$(echo -n 'http://suspicious.com' | sha256sum | cut -d' ' -f1)" \\
+  --header "x-apikey: YOUR_API_KEY"

+# 2. Analyze URL structure
+# RED FLAGS dalam URL:
+# ❌ http:// (bukan https)
+# ❌ login-bca.secure-verify.com (subdomain palsu)
+# ❌ bca-secure-login.com (typosquatting)
+# ❌ bаnkbca.com (homograph - Cyrillic 'а')
+# ❌ bit.ly/xyz123 (URL shortener untuk hide destination)

+# 3. Expand shortened URLs
+curl -sI "https://bit.ly/xyz123" | grep -i location

+# 4. Check domain age
+# Baru dibuat &lt; 30 hari = suspicious
+whois suspicious-domain.com | grep -i "creation date"

+# 5. DNS analysis
+dig suspicious-domain.com ANY +noall +answer
+dig suspicious-domain.com TXT  # Check SPF/DKIM

+# 6. Email header analysis
+# Check Return-Path, Received headers
+# Verify SPF/DKIM/DMARC results
+# Look for sender spoofing indicators

+# 7. Attachment analysis
+# Sandbox suspicious attachments
+# Check macros in Office documents
+# Analyze URLs embedded in PDF
+python3 -c "
+import sys
+with open(sys.argv[1], 'rb') as f:
+    data = f.read()
+    import re
+    urls = re.findall(rb'https?://[^\\s<>\"\\x00]+', data)
+    for u in urls:
+        print(u.decode('utf-8', errors='ignore'))
+" suspicious.pdf</pre>
+      </div>

+      <h3>Creating Effective Security Policies</h3>
+      <p>Security policy yang baik harus jelas, mudah diikuti, dan ditegakkan secara konsisten. Berikut adalah template kebijakan untuk menghadapi social engineering.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Template — Anti-Phishing Policy</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Template: Anti-Phishing Policy
+# =============================================

+# POLICY: Email and Communication Security
+# Version: 1.0
+# Effective: 2024-01-01

+# 1. VERIFICATION REQUIREMENTS
+#    - Semua permintaan transfer &gt; Rp 10.000.000
+#      harus diverifikasi via telepon ke nomor terdaftar
+#    - Perubahan detail bank vendor harus dikonfirmasi
+#      langsung dengan PIC vendor via kontak yang ada
+#    - Permintaan akses admin harus melalui tiket resmi

+# 2. REPORTING PROCEDURE
+#    - Jika menerima email mencurigakan:
+#      a. Jangan klik link atau buka attachment
+#      b. Forward ke security@company.com sebagai attachment
+#      c. Laporkan melalui tombol "Report Phishing"
+#    - Jika sudah klik link/kirim data:
+#      a. Segera ubah password
+#      b. Hubungi IT Security hotline
+#      c. Jangan matikan komputer (bisa diperlukan forensik)

+# 3. CONSEQUENCES
+#    - Pelanggaran policy dapat mengakibatkan:
+#      a. Verbal warning (first offense)
+#      b. Written warning + mandatory training
+#      c. Disciplinary action (repeat offense)

+# 4. EXCEPTIONS
+#    - Tidak ada exceptions untuk verification requirements
+#    - Semua permintaan "urgent" tetap harus diverifikasi
+#    - CEO sekalipun tidak bisa bypass prosedur</pre>
+      </div>

+      <h3>Incident Response untuk Social Engineering</h3>
+      <p>Ketika karyawan melaporkan telah menjadi korban social engineering, langkah cepat sangat penting untuk meminimalkan dampak.</p>
+      <div class="diagram-box"><div class="diagram-label">Diagram: Social Engineering IR Flow</div>
+<pre>
+┌─────────────────────────────────────────────────────┐
+     SOCIAL ENGINEERING INCIDENT RESPONSE                │
+│                                                      │
+│  ┌────────────────────────────────┐                 │
+│  │  KARYAWAN MELAPORKAN           │                 │
+│  │  "Saya klik link phishing"     │                 │
+│  └──────────────┬─────────────────┘                 │
+│                 ▼                                    │
+│  ┌────────────────────────────────┐                 │
+│  │  IMMEDIATE (0-15 menit)        │                 │
+│  │  □ Reset password korban       │                 │
+│  │  □ Revoke active sessions      │                 │
+│  │  □ Block sender di email GW    │                 │
+│  │  □ Block URL di web filter     │                 │
+│  │  □ Scan device korban          │                 │
+│  └──────────────┬─────────────────┘                 │
+│                 ▼                                    │
+│  ┌────────────────────────────────┐                 │
+│  │  SHORT TERM (1-4 jam)          │                 │
+│  │  □ Cek apakah ada data yang    │                 │
+│  │    sudah terkirim ke attacker   │                 │
+│  │  □ Cek lateral access dari     │                 │
+│  │    akun korban                 │                 │
+│  │  □ Alert karyawan lain tentang │                 │
+│  │    campaign phishing ini       │                 │
+│  │  □ Update email filter rules   │                 │
+│  └──────────────┬─────────────────┘                 │
+│                 ▼                                    │
+│  ┌────────────────────────────────┐                 │
+│  │  FOLLOW UP (1-7 hari)          │                 │
+│  │  □ Review access logs 7 hari   │                 │
+│  │  □ Forced password reset semua │                 │
+│  │    yang terkena campaign       │                 │
+│  │  □ Update training materials   │                 │
+│  │  □ Post-incident report        │                 │
+│  └────────────────────────────────┘                 │
+└─────────────────────────────────────────────────────┘
+</pre>
+      </div>

+      <h3>OSINT untuk Defense</h3>
+      <p>Open Source Intelligence (OSINT) dapat digunakan untuk memahami apa yang diketahui attacker tentang organisasi Anda, sehingga bisa dilakukan mitigasi proaktif.</p>
+      <h4>Data yang Bisa Dikumpulkan Attacker dari OSINT</h4>
+      <ul>
+        <li><strong>LinkedIn</strong> — Struktur organisasi, nama karyawan, jabatan, teknologi yang digunakan</li>
+        <li><strong>GitHub</strong> — Source code, credentials yang bocor, konfigurasi internal</li>
+        <li><strong>WHOIS</strong> — Informasi domain, nama kontak, email admin</li>
+        <li><strong>Google Dorking</strong> — File sensitif yang ter-ekspos, login pages, error messages</li>
+        <li><strong>Shodan/Censys</strong> — Service yang ter-ekspos ke internet, banner information</li>
+        <li><strong>Social Media</strong> — Lokasi kantor, foto yang mengungkap informasi, jadwal</li>
+      </ul>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Defensive OSINT</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Defensive OSINT — Check Your Exposure
+# =============================================

+# 1. Check for leaked credentials
+# Monitor: haveibeenpwned.com API
+curl "https://haveibeenpwned.com/api/v3/breachedaccount/company.com" \\
+  -H "hibp-api-key: YOUR_KEY"

+# 2. GitHub secret scanning
+# Enable GitHub Advanced Security
+# Monitor for company secrets in public repos
+# Tools: truffleHog, git-secrets
+trufflehog git https://github.com/org/repo --only-verified

+# 3. Google dorking untuk exposure check
+# site:company.com filetype:pdf
+# site:company.com "password" OR "secret"
+# site:company.com inurl:login
+# site:company.com intitle:"index of"

+# 4. Shodan exposure check
+shodan search "org:YourCompany" --fields ip_str,port,product

+# 5. DNS enumeration (check subdomains)
+subfinder -d company.com -silent
+amass enum -passive -d company.com</pre>
+      </div>
"""

extra["cloud-security-posture.html"] = """
      <h3>Cloud Identity &amp; Access Management</h3>
      <p>IAM adalah kontrol keamanan paling penting di cloud. Konfigurasi IAM yang salah adalah penyebab #1 dari cloud breaches. Principle of least privilege harus diterapkan secara ketat.</p>

+      <h3>IAM Policy Analysis</h3>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — IAM Security Audit</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Cloud IAM Security Audit
+# =============================================

+# AWS: Find users with admin access
+aws iam list-entities-for-policy \\
+  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

+# AWS: Find unused IAM credentials
+aws iam generate-credential-report
+aws iam get-credential-report \\
+  --query 'Content' --output text | base64 -d

+# AWS: Find roles that can be assumed externally
+aws iam list-roles --query 'Roles[?contains(AssumeRolePolicyDocument.Statement[].Principal.AWS, `*`)]'

+# Azure: Find owners on subscriptions
+az role assignment list --role "Owner" \\
+  --query "[].{Principal:principalName, Scope:scope}"

+# GCP: Find service accounts with keys
+gcloud iam service-accounts list \\
+  --format="table(email,displayName)"
+gcloud iam service-accounts keys list \\
+  --iam-account=SA_EMAIL

+# Terraform: Check for overly permissive policies
+cat > check_iam.py &lt;&lt; 'EOF'
+import json, glob
+for f in glob.glob("**/*.tf.json", recursive=True):
+    data = json.load(open(f))
+    for r in data.get("resource", []):
+        for policy in r.get("aws_iam_policy", {}):
+            doc = json.loads(policy["policy"])
+            for stmt in doc.get("Statement", []):
+                if stmt.get("Effect") == "Allow":
+                    actions = stmt.get("Action", [])
+                    if isinstance(actions, str):
+                        actions = [actions]
+                    if "*" in actions:
+                        print(f"WARNING: {policy} has Action: *")
+EOF
+python3 check_iam.py</pre>
+      </div>

+      <h3>Cloud Logging &amp; Monitoring</h3>
+      <p>Logging adalah fondasi deteksi dan forensik di cloud. Pastikan semua control plane dan data plane activity ter-log.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Cloud Logging Setup</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Cloud Logging Best Practices
+# =============================================

+# AWS CloudTrail — Log semua API calls
+aws cloudtrail create-trail \\
+  --name org-trail \\
+  --s3-bucket-name audit-logs-bucket \\
+  --is-multi-region-trail \\
+  --enable-log-file-validation

+aws cloudtrail start-logging --name org-trail

+# AWS VPC Flow Logs — Network traffic
+aws ec2 create-flow-logs \\
+  --resource-type VPC \\
+  --resource-ids vpc-12345 \\
+  --traffic-type ALL \\
+  --log-destination-type s3 \\
+  --log-destination arn:aws:s3:::flow-logs-bucket

+# Azure Monitor — Activity logs
+az monitor diagnostic-settings create \\
+  --name audit \\
+  --resource /subscriptions/xxx \\
+  --storage-account auditstorage \\
+  --logs '[
+    {"category":"Administrative","enabled":true},
+    {"category":"Security","enabled":true},
+    {"category":"Alert","enabled":true}
+  ]'

+# GCP Audit Logs
+gcloud logging sinks create audit-sink \\
+  --log-filter='logName:cloudaudit.googleapis.com' \\
+  --destination=storage.googleapis.com/audit-bucket</pre>
+      </div>

+      <h3>Cloud Incident Response</h3>
+      <p>Cloud incident response berbeda dari on-premise karena sifat API-driven dan ephemeral resources. Speed sangat kritis karena attacker bisa spin up resources dalam hitungan detik.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Cloud IR Quick Response</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Cloud Incident Response — Quick Actions
+# =============================================

+# COMPROMISED EC2 INSTANCE
+# 1. Snapshot instance (preserve evidence)
+aws ec2 create-snapshot --volume-id vol-xxx \\
+  --description "IR evidence - $(date)"

+# 2. Isolate instance (change security group)
+aws ec2 modify-instance-attribute \\
+  --instance-id i-xxx \\
+  --groups sg-isolation  # SG with no rules

+# 3. Capture instance metadata
+aws ec2 describe-instances --instance-id i-xxx

+# COMPROMISED IAM CREDENTIALS
+# 1. Immediately disable access
+aws iam update-access-key \\
+  --user-name compromised-user \\
+  --access-key-id AKIAxxx \\
+  --status Inactive

+# 2. Revoke all sessions
+aws iam put-user-policy \\
+  --user-name compromised-user \\
+  --policy-name RevokeAllSessions \\
+  --policy-document '{
+    "Version":"2012-10-17",
+    "Statement":[{
+      "Effect":"Deny",
+      "Action":"*",
+      "Resource":"*",
+      "Condition":{"DateLessThan":{"aws:TokenIssueTime":"2024-01-15T00:00:00Z"}}
+    }]
+  }'

+# 3. Check CloudTrail for damage
+aws cloudtrail lookup-events \\
+  --lookup-attributes AttributeKey=Username,AttributeValue=compromised-user \\
+  --max-results 100</pre>
+      </div>
"""

extra["threat-hunting-techniques.html"] = """
      <h3>Hunting with YARA Rules</h3>
      <p>YARA adalah pattern matching tool yang sangat powerful untuk mengidentifikasi dan mengkategorikan malware samples. Dalam threat hunting, YARA digunakan untuk scanning endpoint dan memory.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">YARA — Threat Hunting Rules</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# YARA Rules untuk Threat Hunting
+# =============================================

+# Detect Cobalt Strike Beacon
+rule CobaltStrike_Beacon {
+    meta:
+        description = "Detects Cobalt Strike Beacon"
+        author = "Threat Hunter"
+        severity = "high"
+    strings:
+        $beacon_config = { 00 01 00 01 00 02 ?? ?? 00 02 00 01 00 02 ?? ?? }
+        $pipe = "\\\\.\\pipe\\msagent_" ascii
+        $sleep_mask = { 4C 8B 53 08 45 8B 0A 45 8B 5A 04 4D 8D 52 08 45 85 C9 }
+    condition:
+        uint16(0) == 0x5A4D and 2 of them
+}

+# Detect suspicious PowerShell patterns
+rule Suspicious_PowerShell_Hunting {
+    meta:
+        description = "Suspicious PowerShell for hunting"
+    strings:
+        $enc1 = "-EncodedCommand" nocase
+        $enc2 = "-enc " nocase
+        $bypass = "Set-ExecutionPolicy Bypass" nocase
+        $download = "DownloadString" nocase
+        $download2 = "DownloadFile" nocase
+        $invoke = "IEX" nocase
+        $hidden = "-WindowStyle Hidden" nocase
+        $amsi = "AmsiUtils" nocase
+        $etw = "ETW" nocase
+    condition:
+        3 of them
+}

+# Hunting on endpoints with YARA
+# Scan running processes
+yara64 -p 20 rules.yar /proc/*/mem

+# Scan files on disk
+yara64 -r rules.yar /home/ /tmp/ /var/

+# Scan with Velociraptor
+# VQL: SELECT * FROM glob(globs="/**/*.{exe,dll,sys}")
+#       WHERE yara(file=FullPath, rules=yara_rules)</pre>
      </div>

      <h3>Memory Forensics for Hunting</h3>
      <p>Memory forensik sangat penting untuk threat hunting karena banyak malware yang hanya hidup di memory (fileless malware). Tool seperti Volatility memungkinkan analisis memory dump.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Memory Forensics</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Memory Forensics untuk Threat Hunting
+# =============================================

+# 1. Capture memory (Windows)
+# Using WinPmem
+winpmem_mini_x64.exe memdump.raw

+# Using DumpIt
+DumpIt.exe

+# 2. Capture memory (Linux)
+sudo dd if=/dev/mem of=/tmp/memdump.raw bs=1M
+# Or using AVML
+sudo ./avml /tmp/memdump.raw

+# 3. Analyze with Volatility 3
+# List processes
+vol -f memdump.raw windows.pslist

+# Detect hidden processes
+vol -f memdump.raw windows.psscan

+# Network connections
+vol -f memdump.raw windows.netscan

+# Command line arguments
+vol -f memdump.raw windows.cmdline

+# DLLs loaded by process
+vol -f memdump.raw windows.dlls --pid 1234

+# Injected code detection
+vol -f memdump.raw windows.malfind

+# Extract suspicious process
+vol -f memdump.raw windows.memmap --pid 1234 --dump

+# 4. Scan memory dump with YARA
+vol -f memdump.raw windows.vadyarascan \\
+  --yara-rules hunting_rules.yar</pre>
      </div>

      <h3>Network-Based Hunting</h3>
      <p>Network traffic analysis mengungkap komunikasi C2, data exfiltration, dan lateral movement yang mungkin tidak terlihat di endpoint logs.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Zeek — Network Hunting Scripts</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Network Hunting dengan Zeek (Bro)
+# =============================================

+# 1. Detect DNS tunneling
+zeek -r capture.pcap dns_tunnel_detect.zeek

+# dns_tunnel_detect.zeek content:
+# @load base/frameworks/notice
+# module DNS_TUNNEL;
+# export {
+#     redef enum Notice::Type += {
+#         Long_DNS_Query,
+#         High_DNS_Volume
+#     };
+# }
+# event dns_request(c: connection, msg: dns_msg, query: string) {
+#     if (|query| > 50) {
+#         NOTICE([
+#             $note=Long_DNS_Query,
+#             $conn=c,
+#             $msg=fmt("Long DNS query: %s", query)
+#         ]);
+#     }
+# }

+# 2. JA3/JA3S fingerprinting (TLS)
+# Detect C2 frameworks by TLS fingerprint
+zeek -r capture.pcap ja3.zeek
+# Compare JA3 hashes against known C2 hashes

+# 3. Beaconing detection with RITA
+rita import capture.pcap hunting_db
+rita show-beacons hunting_db
+# High scores indicate regular communication patterns (C2)

+# 4. Analyze with tshark
+# DNS query analysis
+tshark -r capture.pcap -Y "dns" \\
+  -T fields -e dns.qry.name -e dns.qry.type \\
+  | sort | uniq -c | sort -rn | head -50</pre>
      </div>
"""

extra["zero-trust-implementation.html"] = """
      <h3>Device Trust &amp; Compliance</h3>
      <p>Dalam Zero Trust, device health adalah faktor kritis dalam keputusan akses. Device yang tidak compliant harus ditolak atau diberikan akses terbatas.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Config — Device Compliance Policy</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Device Compliance &amp; Trust Policy
+# =============================================

+# Device Trust Requirements:
+# Level 1: Basic (all devices)
+# - OS version &gt;= minimum
+# - Antivirus active &amp; updated
+# - Firewall enabled
+# - Disk encryption enabled
+
+# Level 2: Enhanced (corporate devices)
+# - All Level 1 requirements
+# - MDM enrolled
+# - Company certificate installed
+# - Approved OS build
+# - No jailbreak/root
+
+# Level 3: High Security (privileged access)
+# - All Level 2 requirements
+# - Hardware TPM/FIDO2 key
+# - Specific network location
+# - Recent security scan passed
+# - No USB peripherals (optional)

+# Azure AD Conditional Access — Device filter
+# IF device.trustType == "ServerAD"
+# OR device.isCompliant == true
+# THEN allow_access()
+# ELSE redirect_to_portal("Register your device")

+# Intune Compliance Policy
+# Minimum OS: Windows 10 22H2
+# BitLocker: Required
+# Defender: Real-time protection ON
+# Password: Min 12 chars, complexity
+# Jailbreak: Block compromised devices</pre>
      </div>

      <h3>Zero Trust Network Architecture</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: Zero Trust Network Design</div>
<pre>
┌─────────────────────────────────────────────────────────┐
│          ZERO TRUST NETWORK ARCHITECTURE                  │
│                                                          │
│  Users &amp; Devices                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │Remote│ │Office│ │Mobile│ │ IoT  │                  │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘                  │
│     │        │        │        │                        │
│     ▼        ▼        ▼        ▼                        │
│  ┌──────────────────────────────────────────────┐       │
│  │         IDENTITY PROVIDER (IdP)               │       │
│  │  • MFA verification                          │       │
│  │  • Device compliance check                   │       │
│  │  • Risk assessment                           │       │
│  └──────────────────────┬───────────────────────┘       │
│                         ▼                                │
│  ┌──────────────────────────────────────────────┐       │
│  │         POLICY DECISION POINT (PDP)           │       │
│  │  • Evaluate access policies                   │       │
│  │  • Context-aware decisions                    │       │
│  │  • Real-time risk scoring                     │       │
│  └──────────────────────┬───────────────────────┘       │
│                         ▼                                │
│  ┌──────────────────────────────────────────────┐       │
│  │         POLICY ENFORCEMENT POINT (PEP)        │       │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │       │
│  │  │ZTNA │ │ SWG │ │CASB │ │DLP  │           │       │
│  │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘           │       │
│  └─────┼───────┼───────┼───────┼───────────────┘       │
│        ▼       ▼       ▼       ▼                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Apps │ │ Web  │ │ SaaS │ │ Data │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
└─────────────────────────────────────────────────────────┘
</pre>
      </div>

      <h3>Automated Access Reviews</h3>
      <p>Zero Trust memerlukan review akses berkala untuk memastikan tidak ada privilege creep. Automasi membantu skala proses ini.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Python — Access Review Automation</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Automated Access Review Script
+# =============================================

+import datetime
+from dataclasses import dataclass
+
+@dataclass
+class AccessReview:
+    user: str
+    role: str
+    last_activity: datetime.datetime
+    granted_date: datetime.datetime
+    approver: str
+    risk_level: str
+
+def review_access(access_records):
+    # Flag access that needs review.
+    now = datetime.datetime.now()
+    alerts = []
+
+    for record in access_records:
+        # Rule 1: Inactive access (&gt; 90 days no activity)
+        days_inactive = (now - record.last_activity).days
+        if days_inactive &gt; 90:
+            alerts.append({
+                "user": record.user,
+                "issue": f"Inactive for {days_inactive} days",
+                "action": "REVOKE"
+            })
+
+        # Rule 2: Stale access grants (&gt; 365 days)
+        days_granted = (now - record.granted_date).days
+        if days_granted &gt; 365:
+            alerts.append({
+                "user": record.user,
+                "issue": f"Access granted {days_granted} days ago",
+                "action": "RE-APPROVE"
+            })
+
+        # Rule 3: High-risk access without recent review
+        if record.risk_level == "high":
+            alerts.append({
+                "user": record.user,
+                "issue": "High-risk access needs quarterly review",
+                "action": "MANAGER_REVIEW"
+            })
+
+    return alerts
+
+# Generate report
+# alerts = review_access(all_access_records)
+# for alert in alerts:
+#     send_notification(alert["user"], alert["issue"])</pre>
+      </div>

+      <h3>Zero Trust Assessment Checklist</h3>
+      <table class="net-table"><thead><tr><th>Domain</th><th>Assessment Criteria</th><th>Score</th></tr></thead><tbody>
+        <tr><td><strong>Identity</strong></td><td>MFA enabled for all users? SSO implemented?</td><td>0-5</td></tr>
+        <tr><td><strong>Devices</strong></td><td>MDM enrolled? Compliance policies enforced?</td><td>0-5</td></tr>
+        <tr><td><strong>Network</strong></td><td>Microsegmentation? Encrypted traffic?</td><td>0-5</td></tr>
+        <tr><td><strong>Applications</strong></td><td>ZTNA deployed? API security?</td><td>0-5</td></tr>
+        <tr><td><strong>Data</strong></td><td>Classification done? DLP active?</td><td>0-5</td></tr>
+        <tr><td><strong>Monitoring</strong></td><td>UEBA? SOAR? Continuous verification?</td><td>0-5</td></tr>
+        <tr><td><strong>Governance</strong></td><td>Access reviews? Policy enforcement?</td><td>0-5</td></tr>
+      </tbody></table>
+      <p>Target score: 28/35 (80%) untuk mature Zero Trust implementation.</p>
+"""

for fname, extra_content in extra.items():
    path = os.path.join(DIR, fname)
    if not os.path.exists(path):
        print(f"SKIP: {fname} not found")
        continue

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Insert before quiz section
    quiz_marker = '      <h2 id="quiz"'
    if quiz_marker in content:
        content = content.replace(quiz_marker, extra_content + "\n" + quiz_marker)
    else:
        print(f"WARNING: No quiz marker in {fname}")
        continue

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    lines = content.count("\n") + 1
    status = "OK" if lines >= 500 else f"NEED +{500-lines}"
    print(f"Updated {fname} — {lines} lines — {status}")
