#!/usr/bin/env python3
"""Second pass: add more content to articles still under 500 lines."""
import os

DIR = r"C:\Users\user\Documents\pribadi\web adsence\articles"

extra = {}

extra["api-security-testing.html"] = """
      <h3>API Versioning Security</h3>
      <p>API versioning yang buruk dapat mengakibatkan shadow API — versi lama yang masih aktif tetapi tidak dipatching. Setiap versi API harus memiliki lifecycle management yang jelas.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — API Version Discovery</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# API Version &amp; Shadow API Discovery
+# =============================================

+# Check all active API versions
+for v in v1 v2 v3 v4 api/v1 api/v2; do
+  code=$(curl -s -o /dev/null -w "%{http_code}" \\
+    "https://target.com/$v/users" -H "Authorization: Bearer TOKEN")
+  echo "/$v/users -> HTTP $code"
+done

+# Search for deprecated endpoints still active
+curl -s "https://target.com/v1/admin/users" \\
+  -H "Authorization: Bearer TOKEN" | head -20

+# Check for debug endpoints in production
+curl -s "https://target.com/api/debug/vars" | head -20
+curl -s "https://target.com/api/debug/pprof/" | head -20
+curl -s "https://target.com/actuator" | head -20
+curl -s "https://target.com/actuator/env" | head -20

+# API security headers audit
+curl -sI "https://target.com/api/users" | \\
+  grep -i "strict-transport\\|content-security\\|x-frame\\|x-content-type"</pre>
+      </div>
"""

extra["container-security.html"] = """
      <h3>Container Monitoring with Prometheus</h3>
      <p>Container monitoring mendeteksi anomali runtime seperti resource abuse, suspicious process, dan network activity yang tidak biasa.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">YAML — Container Monitoring</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># Prometheus alerts for container security
+groups:
+  - name: container-security
+    rules:
+      - alert: ContainerHighCPU
+        expr: container_cpu_usage_seconds_total > 0.9
+        for: 5m
+        labels:
+          severity: warning
+        annotations:
+          summary: "Container {{ $labels.name }} high CPU"
+      - alert: ContainerPrivilegeEscalation
+        expr: container_security_privileged == 1
+        labels:
+          severity: critical
+        annotations:
+          summary: "Privileged container detected"</pre>
+      </div>
"""

extra["mobile-security-testing.html"] = """
      <h3>Mobile Malware Analysis</h3>
      <p>Analisis malware mobile membantu memahami teknik yang digunakan attacker untuk menginfeksi dan mencuri data dari perangkat mobile.</p>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Mobile Malware Analysis</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
+# Mobile Malware Analysis
+# =============================================

+# 1. Install malware di emulator (isolated)
+adb install suspicious_app.apk

+# 2. Monitor network traffic
+adb shell tcpdump -i any -w /sdcard/capture.pcap &amp;
+# Open suspicious app, use features
+adb pull /sdcard/capture.pcap

+# 3. Analyze network with Wireshark
+wireshark capture.pcap
+# Look for:
+# - C2 server communication
+# - Data exfiltration (POST requests)
+# - DGA (Domain Generation Algorithm) patterns

+# 4. Monitor file system changes
+adb shell inotifywait -m -r /data/data/com.suspicious.app/

+# 5. API monitoring with Frida
+frida -U com.suspicious.app -l api-monitor.js
+# api-monitor.js:
+# Interceptor.attach(Module.findExportByName(null, 'connect'), {
+#   onEnter: function(args) {
+#     console.log('connect() called');
+#   }
+# });

+# 6. Check for overlay attack capability
+# Look for SYSTEM_ALERT_WINDOW permission
+grep "SYSTEM_ALERT_WINDOW" AndroidManifest.xml

+# 7. Check for SMS interception
+# Look for RECEIVE_SMS, READ_SMS permissions
+grep -i "sms" AndroidManifest.xml

+# 8. Check for screen recording
+# Look for MEDIA_PROJECTION permission
+grep "MEDIA_PROJECTION" AndroidManifest.xml</pre>
+      </div>

+      <h3>Common Mobile Vulnerabilities</h3>
+      <table class="net-table"><thead><tr><th>Vulnerability</th><th>Platform</th><th>Impact</th></tr></thead><tbody>
+        <tr><td>Insecure WebView</td><td>Android</td><td>XSS, file access, JS injection</td></tr>
+        <tr><td>Exported Components</td><td>Android</td><td>Unauthorized access to activities/services</td></tr>
+        <tr><td>Weak Keychain</td><td>iOS</td><td>Data accessible without biometric</td></tr>
+        <tr><td>Clipboard Exposure</td><td>Both</td><td>Sensitive data in clipboard</td></tr>
+        <tr><td>Screenshot Leak</td><td>Both</td><td>App screens captured in recent apps</td></tr>
+        <tr><td>Debug Build</td><td>Both</td><td>Debug info exposed, easy reverse engineering</td></tr>
+      </tbody></table>
+"""

extra["social-engineering-awareness.html"] = """
+      <h3>Red Team Social Engineering</h3>
+      <p>Red team exercise untuk social engineering menguji ketahanan organisasi terhadap serangan nyata. Ini dilakukan dengan izin dan bertujuan mengidentifikasi kelemahan sebelum attacker sungguhan menemukannya.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Template — SE Red Team Engagement</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Red Team Social Engineering Engagement
+# =============================================

+# SCOPE DEFINITION (dengan izin tertulis)
+# Target: PT Contoh Indonesia
+# Duration: 2 minggu
+# Scope: Email phishing, vishing, physical
+# Out of scope: Destruction, harassment

+# WEEK 1: EMAIL PHISHING CAMPAIGN
+# Day 1-2: OSINT &amp; reconnaissance
+# - LinkedIn: struktur organisasi
+# - Website: informasi kontak
+# - Social media: personalisasi email
+#
+# Day 3-4: Crafting phishing emails
+# - Template 1: "Update gaji" (HR theme)
+# - Template 2: "Reset password IT" (IT theme)
+# - Template 3: "Invoice vendor" (Finance theme)
+# - Each with unique tracking pixel &amp; credential harvester
+#
+# Day 5: Launch campaign
+# - Send to 100 random employees
+# - Track: open rate, click rate, credential submit
+# - Record: time-to-click, time-to-report

+# WEEK 2: VISHING &amp; PHYSICAL
+# Day 8-9: Phone pretexting
+# - Call 20 employees posing as IT support
+# - Request: remote access, password reset
+# - Record: compliance rate, suspicion level
+#
+# Day 10-11: Physical access test
+# - Tailgate into building
+# - Drop USB drives in parking lot
+# - Attempt to access server room
+#
+# Day 12: Debrief &amp; report preparation

+# REPORT STRUCTURE:
+# 1. Executive Summary
+# 2. Attack Narrative (timeline)
+# 3. Findings &amp; Metrics
+# 4. Recommendations (prioritized)
+# 5. Training Plan
+# 6. Appendix (evidence, screenshots)</pre>
+      </div>

+      <h3>Building a Security Champions Program</h3>
+      <p>Security champions adalah karyawan dari berbagai departemen yang mendapat training keamanan khusus dan bertindak sebagai perpanjangan tim keamanan di divisi mereka.</p>
+      <ul>
+        <li><strong>Pemilihan</strong> — Pilih 1-2 orang per departemen yang tertarik dengan keamanan</li>
+        <li><strong>Training</strong> — Berikan training lanjutan tentang threat landscape terkini</li>
+        <li><strong>Komunikasi</strong> — Jadikan mereka contact point untuk pertanyaan keamanan</li>
+        <li><strong>Feedback loop</strong> — Mereka melaporkan kejanggalan di departemen masing-masing</li>
+        <li><strong>Recognition</strong> — Berikan penghargaan untuk laporan yang membantu mencegah insiden</li>
+      </ul>
+"""

extra["cloud-security-posture.html"] = """
+      <h3>Cloud Data Classification</h3>
+      <p>Data classification adalah langkah pertama untuk melindungi data di cloud. Tanpa mengetahui data apa yang sensitif, tidak mungkin menerapkan kontrol yang tepat.</p>
+      <table class="net-table"><thead><tr><th>Classification</th><th>Description</th><th>Controls</th></tr></thead><tbody>
+        <tr><td><strong>Public</strong></td><td>Data yang boleh diakses publik</td><td>Basic access controls</td></tr>
+        <tr><td><strong>Internal</strong></td><td>Hanya untuk karyawan</td><td>Authentication required, logging</td></tr>
+        <tr><td><strong>Confidential</strong></td><td>Data sensitif bisnis</td><td>Encryption, DLP, strict access</td></tr>
+        <tr><td><strong>Restricted</strong></td><td>Data paling sensitif (PII, financial)</td><td>All controls + audit + MFA + PAM</td></tr>
+      </tbody></table>
+
+      <h3>Cloud Cost Security</h3>
+      <p>Cloud cost anomaly bisa menjadi indikator serangan. Crypto mining atau resource abuse akan menghasilkan spike biaya yang tidak biasa.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Cloud Cost Anomaly Detection</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Cloud Cost Anomaly Detection
+# =============================================

+# AWS — Check billing anomaly
+aws ce get-cost-and-usage \\
+  --time-period Start=2024-01-01,End=2024-01-15 \\
+  --granularity DAILY \\
+  --metrics "UnblendedCost"

+# AWS — Set billing alarm
+aws cloudwatch put-metric-alarm \\
+  --alarm-name "HighBilling" \\
+  --metric-name EstimatedCharges \\
+  --namespace AWS/Billing \\
+  --threshold 1000 \\
+  --comparison-operator GreaterThanThreshold \\
+  --evaluation-periods 1 \\
+  --statistic Maximum

+# Check for crypto mining indicators
+# - Unusual GPU instance launches
+# - High CPU utilization on small instances
+# - New instances in unexpected regions
+aws ec2 describe-instances \\
+  --filters "Name=instance-type,Values=g4dn.*,p3.*" \\
+  --query "Reservations[].Instances[].[InstanceId,LaunchTime,Tags[?Key=='Name'].Value]"

+# Azure — Cost anomaly
+az costmanagement query \\
+  --type ActualCost \\
+  --timeframe MonthToDate \\
+  --dataset-aggregation '{"totalCost":{"name":"Cost","function":"Sum"}}'</pre>
+      </div>
+
+      <h3>Multi-Cloud Security Strategy</h3>
+      <p>Banyak organisasi menggunakan multiple cloud providers. Strategi keamanan harus konsisten di semua cloud.</p>
+      <div class="info-box info"><div class="info-box-title">💡 Multi-Cloud Best Practices</div><ul>
+        <li><strong>Unified Policy</strong> — Gunakan policy as code (Terraform + OPA) untuk konsistensi</li>
+        <li><strong>Centralized Logging</strong> — Aggregasi log dari semua cloud ke satu SIEM</li>
+        <li><strong>Identity Federation</strong> — SSO yang terhubung ke semua cloud provider</li>
+        <li><strong>CSPM Tool</strong> — Gunakan multi-cloud CSPM untuk visibility terpadu</li>
+        <li><strong>Consistent Tagging</strong> — Tag semua resource untuk cost allocation dan security</li>
+      </ul></div>
+"""

extra["threat-hunting-techniques.html"] = """
+      <h3>Hunting Playbooks</h3>
+      <p>Hunting playbook mendokumentasikan prosedur berburu yang dapat direplikasi. Setiap playbook terdiri dari hipotesis, data sources, queries, dan triage criteria.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Template — Hunting Playbook</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Hunting Playbook: Credential Dumping
+# =============================================

+# PLAYBOOK ID: HP-001
+# TITLE: LSASS Memory Access Detection
+# ATT&CK: T1003.001 (OS Credential Dumping)
+# PRIORITY: High
+# ESTIMATED TIME: 2-4 hours

+# HYPOTHESIS:
+# Attacker yang sudah mendapatkan akses ke endpoint
+# mungkin menggunakan credential dumping tools untuk
+# mencumpah LSASS memory dan mendapatkan NTLM hashes.

+# DATA SOURCES:
+# 1. Sysmon Event ID 10 (Process Access)
+# 2. Windows Security Event ID 4688 (Process Create)
+# 3. EDR telemetry (CrowdStrike, SentinelOne)

+# DETECTION QUERIES:
+# Query 1: Sysmon LSASS access
+index=sysmon EventCode=10
+  TargetImage="*\\lsass.exe"
+| where SourceImage != "*\\svchost.exe"
+  AND SourceImage != "*\\csrss.exe"
+  AND SourceImage != "*\\services.exe"
+| table _time, Computer, SourceImage, GrantedAccess

+# Query 2: Suspicious parent processes
+index=windows EventCode=4688
+  NewProcessName="*\\lsass.exe"
+| where ParentProcessName != "wininit.exe"
+| table _time, Computer, NewProcessName, ParentProcessName

+# Query 3: Known tool signatures
+index=* (mimikatz OR sekurlsa OR pypykatz
+  OR "dumpert" OR "handlekatz")
+| table _time, Computer, _raw

+# TRIAGE CRITERIA:
+# CONFIRMED if:
+# - GrantedAccess contains 0x1010 or 0x1410
+# - SourceImage is not a known legitimate process
+# - Correlated with EDR credential access alert
+#
+# FALSE POSITIVE if:
+# - SourceImage is antivirus/EDR scanner
+# - Occurs during scheduled security scan
+# - SourceImage is legitimate admin tool with audit trail

+# RESPONSE ACTIONS:
+# 1. Isolate affected endpoint
+# 2. Capture memory dump for analysis
+# 3. Force password reset for all accounts
+#    that were logged into the endpoint
+# 4. Check for lateral movement using
+#    compromised credentials</pre>
+      </div>
+
+      <h3>Automating Hunts with Jupyter Notebooks</h3>
+      <p>Jupyter Notebooks sangat baik untuk threat hunting karena mendukung iteraktif data analysis, visualisasi, dan dokumentasi dalam satu file.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Python — Jupyter Hunting Notebook</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Threat Hunting Jupyter Notebook
+# =============================================

+# Cell 1: Import libraries
+import pandas as pd
+import matplotlib.pyplot as plt
+from datetime import datetime, timedelta
+import numpy as np

+# Cell 2: Load data from SIEM export
+df = pd.read_csv('windows_logons_30d.csv',
+    parse_dates=['timestamp'])

+# Cell 3: Impossible travel detection
+# Group by user, find logons from different countries
+def detect_impossible_travel(df, max_hours=2):
+    users = df.groupby('username')
+    alerts = []
+    for user, group in users:
+        group = group.sort_values('timestamp')
+        for i in range(1, len(group)):
+            curr = group.iloc[i]
+            prev = group.iloc[i-1]
+            time_diff = (curr['timestamp'] -
+                        prev['timestamp']).total_seconds() / 3600
+            if (curr['country'] != prev['country']
+                and time_diff &lt; max_hours):
+                alerts.append({
+                    'user': user,
+                    'from': prev['country'],
+                    'to': curr['country'],
+                    'hours': round(time_diff, 1),
+                    'risk': 'HIGH'
+                })
+    return pd.DataFrame(alerts)

+alerts = detect_impossible_travel(df)
+print(f"Found {len(alerts)} impossible travel alerts")
+alerts.head(20)

+# Cell 4: Visualize logon patterns
+df.groupby(df['timestamp'].dt.hour).size().plot(
+    kind='bar', title='Logons by Hour')
+plt.xlabel('Hour')
+plt.ylabel('Count')
+plt.show()

+# Cell 5: Rare process execution
+process_counts = df['process_name'].value_counts()
+rare = process_counts[process_counts &lt; 5]
+print(f"Rare processes (&lt;5 occurrences): {len(rare)}")
+rare.head(20)</pre>
+      </div>
+
+      <h3>Hunting Metrics &amp; Reporting</h3>
+      <table class="net-table"><thead><tr><th>Metric</th><th>Description</th><th>Target</th></tr></thead><tbody>
+        <tr><td><strong>Hunts/month</strong></td><td>Jumlah hunting yang dilakukan</td><td>&gt;= 4 per bulan</td></tr>
+        <tr><td><strong>True positive rate</strong></td><td>% hunts yang menemukan ancaman nyata</td><td>&gt;= 20%</td></tr>
+        <tr><td><strong>Time to hunt</strong></td><td>Rata-rata waktu per hunting session</td><td>2-4 jam</td></tr>
+        <tr><td><strong>New detections</strong></td><td>Detection baru yang dibuat dari hunting</td><td>&gt;= 2 per bulan</td></tr>
+        <tr><td><strong>ATT&CK coverage</strong></td><td>% teknik yang sudah di-hunt</td><td>&gt;= 50%</td></tr>
+      </tbody></table>
+"""

extra["zero-trust-implementation.html"] = """
+      <h3>Zero Trust for Remote Work</h3>
+      <p>Remote work mempercepat adopsi Zero Trust karena traditional perimeter (kantor) sudah tidak relevan. Setiap koneksi harus diverifikasi terlepas dari lokasi.</p>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Config — Remote Work Zero Trust</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Zero Trust Remote Work Policy
+# =============================================

+# Network Access Policy:
+# 1. Remote workers connect via ZTNA (bukan VPN)
+# 2. Device compliance checked before access
+# 3. Per-app access (bukan full network)
+# 4. Session recording untuk sensitive apps

+# ZTNA Connection Flow:
+# 1. User opens browser/app
+# 2. ZTNA agent checks:
+#    - Device identity (certificate)
+#    - Device compliance (OS, AV, encryption)
+#    - User identity (MFA)
+#    - Location risk score
+# 3. Policy engine evaluates:
+#    - Is user allowed to access this app?
+#    - Is device compliant enough?
+#    - Is current risk acceptable?
+# 4. If approved: encrypted tunnel to app only
+# 5. If denied: clear error message + remediation steps

+# Home Network Security Recommendations:
+# - Separate VLAN for work devices
+# - Updated router firmware
+# - Strong WiFi password (WPA3)
+# - Disable WPS
+# - Enable router firewall
+# - Use DNS filtering (1.1.1.3 / 9.9.9.9)</pre>
+      </div>

+      <h3>Zero Trust Maturity Assessment</h3>
+      <div class="code-block"><div class="code-header"><span class="code-lang">Checklist — ZT Maturity Assessment</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
+<pre># =============================================
+# Zero Trust Maturity Assessment
+# =============================================

+# IDENTITY (Score: 0-5)
+# □ All users have unique identity
+# □ MFA enabled for all users (not just admin)
+# □ MFA is phishing-resistant (FIDO2)
+# □ SSO across all applications
+# □ Just-in-time privileged access
+# □ Regular access reviews (quarterly)
+# □ Service account inventory &amp; rotation
+# □ No shared accounts
+
+# DEVICES (Score: 0-5)
+# □ All devices inventoried
+# □ MDM enrolled (corporate devices)
+# □ Device compliance policies enforced
+# □ Endpoint detection &amp; response deployed
+# □ Automated patching
+# □ Disk encryption mandatory
+# □ BYOD policy with container isolation
+# □ No unmanaged devices access sensitive data
+
+# NETWORK (Score: 0-5)
+# □ Microsegmentation implemented
+# □ All traffic encrypted (TLS 1.3)
+# □ DNS filtering active
+# □ East-west traffic inspection
+# □ No implicit trust for internal traffic
+# □ ZTNA replacing VPN
+# □ DDoS protection
+# □ Network anomaly detection
+
+# APPLICATIONS (Score: 0-5)
+# □ Secure SDLC implemented
+# □ API security controls
+# □ WAF deployed
+# □ SaaS access through CASB
+# □ Application-level access control
+# □ Secrets management (no hardcoded)
+# □ Regular security testing
+# □ Dependency vulnerability scanning
+
+# DATA (Score: 0-5)
+# □ Data classification complete
+# □ Encryption at rest &amp; in transit
+# □ DLP controls active
+# □ Data access logging
+# □ Retention policies enforced
+# □ Backup &amp; recovery tested
+# □ Data sovereignty compliance
+# □ No sensitive data in unprotected locations
+
+# SCORING:
+# 0 = Not started
+# 1 = Initial (ad-hoc)
+# 2 = Developing (some implementation)
+# 3 = Defined (consistent implementation)
+# 4 = Managed (measured &amp; controlled)
+# 5 = Optimized (automated &amp; continuous improvement)
+#
+# Total Score: ___/40
+# Maturity Level: Traditional (0-10) | Advanced (11-25) | Optimal (26-40)</pre>
+      </div>
"""

for fname, extra_content in extra.items():
    path = os.path.join(DIR, fname)
    if not os.path.exists(path):
        print(f"SKIP: {fname}")
        continue

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

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
