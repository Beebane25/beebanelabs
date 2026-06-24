# Global Layout + Theme + Particle Refactor Guide untuk BeebaneLabs

## Tujuan
Merefactor website BeebaneLabs agar:
- Particle aktif di semua halaman
- Dark/Light theme stabil
- Variasi particle berbeda per kategori
- Tidak merusak halaman artikel
- Performa ringan
- Mudah dipelihara

## Masalah Saat Ini
1. Particle hanya ada di homepage
2. Layout artikel berbeda
3. Theme memakai body.dark
4. CSS particle menimpa background
5. Script berjalan sebelum DOM siap
6. Konflik z-index

## Arsitektur Direkomendasikan

/src
 ├── layouts
 │    └── BaseLayout
 ├── styles
 │    ├── global.css
 │    ├── theme.css
 │    └── particles.css
 ├── scripts
 │    ├── theme.js
 │    ├── particles.js
 │    └── particle-presets
 └── pages

Semua halaman harus mewarisi:
- BaseLayout
- Global CSS
- Theme Engine
- Particle Engine

## Layout Global

<html data-theme="dark">
<body data-page="iot">

<div id="particles-js"></div>

<main>
{{ content }}
</main>

</body>
</html>

## Theme

Jangan gunakan:
body.dark

Gunakan:
<html data-theme="dark">

CSS variables:

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

## Dynamic Particle

Gunakan:
<body data-page="networking">

Contoh:
iot → node connection
networking → topology mesh
cybersecurity → matrix style
dashboard → gradient blobs
programming → floating symbols

## DOM Safety

Gunakan DOMContentLoaded sebelum inisialisasi particle.

## Prioritas
1. Ubah body.dark → data-theme
2. Buat BaseLayout global
3. Pindahkan particle ke global layout
4. Tambahkan preset per kategori
5. Optimasi mobile

## Goal Akhir
- Theme stabil
- Particle global
- Dynamic effect per kategori
- Kode modular
