# Global Layout + Dynamic Particle System untuk BeebaneLabs

## Tujuan

Membuat sistem:
- Dark/Light Theme yang stabil
- Particle background aktif di semua halaman
- Variasi particle berdasarkan kategori halaman
- Struktur global layout yang scalable
- Tidak merusak article page
- Tidak merusak SEO
- Mudah di-maintain

Website:
https://beebanelabs.pages.dev/

Repository:
https://github.com/Beebane25/beebanelabs

---

# Masalah Saat Ini

## Gejala

- Particle hanya muncul di halaman tertentu
- Saat particle diterapkan global:
  - dark mode rusak
  - warna theme kacau
  - background bertabrakan
  - beberapa halaman kehilangan styling

---

# Analisis Penyebab

## 1. Particle hanya dipasang di homepage

Kemungkinan:
- #particles-js hanya ada di index
- halaman artikel memakai template berbeda

Akibat:
- artikel tidak memiliki particle container

---

## 2. Theme memakai body.dark

Contoh yang bermasalah:

body.dark {
  background: black;
}

Masalah:
- body bisa di-replace oleh framework/renderer
- dark mode tidak konsisten

---

## 3. z-index particle salah

Contoh buruk:

#particles-js {
  z-index: -1;
}

Akibat:
- background hilang
- dark mode glitch
- stacking context rusak

---

## 4. Particle dan theme saling override

Contoh:
- body background transparent
- canvas menimpa layer
- CSS variables tidak sinkron

---

# Solusi Arsitektur

Gunakan:

## Global Layout System

Semua halaman harus memakai layout yang sama.

Contoh:

<html data-theme="dark">

<body data-page="iot">

  <div id="particles-js"></div>

  <main>
    <!-- page content -->
  </main>

  <script src="/js/theme.js"></script>
  <script src="/js/particles-init.js"></script>

</body>
</html>

---

# Struktur Folder yang Direkomendasikan

/src
 ├── layouts
 │    └── BaseLayout
 │
 ├── styles
 │    ├── global.css
 │    ├── theme.css
 │    └── particles.css
 │
 ├── scripts
 │    ├── theme.js
 │    ├── particles.js
 │    └── particle-presets/
 │
 └── pages

---

# Sistem Theme yang Benar

## Gunakan data-theme

JANGAN gunakan:

<body class="dark">

Gunakan:

<html data-theme="dark">

---

# CSS Variables

Gunakan CSS variables agar:
- semua halaman sinkron
- particle bisa mengikuti theme

Contoh:

:root{
  --bg:#ffffff;
  --text:#111827;
  --particle-color:#2563eb;
}

[data-theme="dark"]{
  --bg:#020617;
  --text:#f8fafc;
  --particle-color:#38bdf8;
}

---

# Apply Theme

body{
  background:var(--bg);
  color:var(--text);
}

---

# Sistem Toggle Theme

## theme.js

function setTheme(theme){

  document.documentElement
    .setAttribute("data-theme", theme);

  localStorage.setItem("theme", theme);
}

function toggleTheme(){

  const current =
    document.documentElement
      .getAttribute("data-theme");

  const next =
    current === "dark"
      ? "light"
      : "dark";

  setTheme(next);
}

const saved =
  localStorage.getItem("theme");

if(saved){
  setTheme(saved);
}

---

# Sistem Particle Global

## HTML

<div id="particles-js"></div>

HARUS ADA di semua halaman.

---

# CSS Particle Aman

#particles-js{
  position:fixed;
  inset:0;
  z-index:0;
  pointer-events:none;
}

main{
  position:relative;
  z-index:1;
}

---

# Jangan gunakan

z-index:-1;

Karena:
- sering merusak dark mode
- membuat canvas hilang
- merusak stacking context

---

# Dynamic Particle per Halaman

Gunakan:

<body data-page="iot">

atau:

<body data-page="cybersecurity">

---

# particles-init.js

document.addEventListener("DOMContentLoaded", () => {

  const page =
    document.body.dataset.page;

  switch(page){

    case "iot":
      loadParticles("/particles/iot.json");
      break;

    case "networking":
      loadParticles("/particles/network.json");
      break;

    case "cybersecurity":
      loadParticles("/particles/cyber.json");
      break;

    default:
      loadParticles("/particles/default.json");
  }
});

---

# Variasi Particle yang Direkomendasikan

## IoT
- node connection
- cyan glow
- sensor style

## Networking
- topology line
- packet animation
- mesh connection

## Cybersecurity
- matrix effect
- green neon
- hexagon pulse

## Cloud
- smooth floating particles
- soft gradient
- dashboard style

---

# Sinkronisasi Particle dengan Theme

Gunakan CSS variables.

Contoh:

const particleColor =
  getComputedStyle(document.documentElement)
    .getPropertyValue("--particle-color");

Jangan hardcode warna particle.

---

# Library yang Direkomendasikan

Gunakan:

## tsParticles

Keunggulan:
- modern
- modular
- ringan
- customizable
- responsive
- support dark/light dynamic

Alternatif:
- particles.js

Namun tsParticles lebih direkomendasikan.

---

# Optimasi Mobile

Kurangi particle di mobile:

if(window.innerWidth < 768){
  reduceParticles();
}

---

# Best Practice

## WAJIB
- gunakan global layout
- gunakan CSS variables
- gunakan data-theme
- gunakan particle config per halaman

## HINDARI
- body.dark
- z-index:-1
- inline style background
- hardcoded particle color
- particle hanya di homepage

---

# SEO Safety

Particle tidak boleh:
- mengganggu readability
- membuat text blur
- menurunkan CLS
- menghalangi interaksi

Gunakan:
- pointer-events:none
- opacity rendah
- lazy animation

---

# Goal Akhir

Sistem harus mampu:

- Menampilkan particle di semua halaman
- Mendukung dark/light theme stabil
- Variasi visual per kategori
- Performa tetap ringan
- SEO tetap aman
- Mudah dikembangkan
- Mudah maintain
- Tampilan modern profesional

---

# Target Tampilan

Style yang diinginkan:
- modern engineering portal
- futuristic dev platform
- cyberpunk tech docs
- premium IoT dashboard aesthetic

---

# Checklist Implementasi

## Theme
- [ ] data-theme diterapkan
- [ ] CSS variables aktif
- [ ] localStorage theme berjalan

## Particle
- [ ] global particle container
- [ ] dynamic particle preset
- [ ] mobile optimization
- [ ] no z-index negative

## Layout
- [ ] semua halaman memakai BaseLayout
- [ ] global CSS aktif
- [ ] global JS aktif

## Stability
- [ ] dark mode stabil
- [ ] article page aman
- [ ] particle tidak menghalangi content
