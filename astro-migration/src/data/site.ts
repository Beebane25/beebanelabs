// ============================================
// BeebaneLabs — SUMBER DATA TUNGGAL KATEGORI
// ============================================
// Semua kartu kategori, count artikel, dan navbar/footer
// dibaca dari sini. JANGAN hardcode kategori lain.
// ============================================

export const CATEGORY_DEFS = [
  { key: 'iot',         slug: 'iot',             icon: '🤖', name: 'Internet of Things', color: '#00e5ff', desc: 'ESP32, Arduino, sensor, LoRa, mikrokontroler, dan embedded systems' },
  { key: 'networking',  slug: 'networking',      icon: '🌐', name: 'Networking',         color: '#fb923c', desc: 'MikroTik, routing, firewall, VPN, dan manajemen jaringan profesional' },
  { key: 'programming', slug: 'python',          icon: '💻', name: 'Pemrograman',        color: '#b8860b', desc: 'Python, Arduino C/C++, scripting, dan otomasi untuk berbagai kebutuhan' },
  { key: 'security',    slug: 'keamanan',        icon: '🔐', name: 'Cybersecurity',      color: '#f43f5e', desc: 'Keamanan jaringan, firewall, VPN, enkripsi, dan pertahanan siber' },
  { key: 'dashboard',   slug: 'dashboard',       icon: '📊', name: 'Dashboard & Cloud',  color: '#eab308', desc: 'Node-RED, Grafana, Firebase, dan monitoring real-time' },
  { key: 'protocol',    slug: 'protokol',        icon: '📡', name: 'Protokol & Tools',   color: '#7c5cff', desc: 'MQTT, CoAP, HTTP, Arduino IDE, dan tools pengembangan' },
  { key: 'webdev',      slug: 'web-development', icon: '🌐', name: 'Web Development',    color: '#3b82f6', desc: 'HTML, CSS, JavaScript, React, Vue, dan framework web modern' },
  { key: 'database',    slug: 'database',        icon: '🗄️', name: 'Database',           color: '#10b981', desc: 'SQL, MongoDB, Redis, database design, dan manajemen data' },
  { key: 'ai',          slug: 'ai-data-science', icon: '🤖', name: 'AI & Data Science',  color: '#8b5cf6', desc: 'Machine learning, data analysis, ChatGPT, dan Python untuk data' },
  { key: 'mobile',      slug: 'mobile',          icon: '📱', name: 'Mobile Development', color: '#ec4899', desc: 'Flutter, React Native, Android, dan desain mobile' },
  { key: 'devops',      slug: 'devops-cloud',    icon: '⚙️', name: 'DevOps & Cloud',     color: '#f97316', desc: 'Docker, CI/CD, AWS, Kubernetes, dan cloud infrastructure' },
  { key: 'career',      slug: 'it-career',       icon: '💼', name: 'IT Career',          color: '#06b6d4', desc: 'Roadmap belajar, sertifikasi, portfolio, dan pengembangan karir' },
];

export const BEEBANELABS = {
  name: 'BeebaneLabs',
  url: 'https://beebanelabs.pages.dev',
  logo: '/images/logo_beebane_webp.webp',
  tagline: 'Portal Tutorial Teknologi & IT Indonesia',
};
