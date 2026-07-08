// === MOBILE QUICK MENU (Zoom + Theme) ===
window.MobileQuickMenu = {
  currentZoom: 50,
  minZoom: 50,
  maxZoom: 150,
  step: 10,
  isOpen: false,

  init: function() {
    // Use screen.width (physical) instead of innerWidth (zoomed viewport)
    if (window.screen.width > 768) {
      var btn = document.getElementById('quickMenuBtn');
      if (btn) btn.style.display = 'none';
      return;
    }
    // Load saved zoom or use default 50%
    var saved = localStorage.getItem('beebanelabs_mobile_zoom');
    if (saved) {
      this.currentZoom = parseInt(saved);
    } else {
      this.currentZoom = 50;
    }
    this.applyZoom();
    this.updateThemeIcon();
  },

  toggle: function() {
    var menu = document.getElementById('quickMenuPanel');
    var backdrop = document.getElementById('quickMenuBackdrop');
    if (!menu) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      menu.style.display = 'flex';
      if (backdrop) backdrop.style.display = 'block';
    } else {
      menu.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
    }
  },

  close: function() {
    var menu = document.getElementById('quickMenuPanel');
    var backdrop = document.getElementById('quickMenuBackdrop');
    if (menu) menu.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    this.isOpen = false;
  },

  zoomIn: function() {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom += this.step;
      this.applyZoom();
    }
  },

  zoomOut: function() {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom -= this.step;
      this.applyZoom();
    }
  },

  resetZoom: function() {
    this.currentZoom = 50;
    this.applyZoom();
  },

  applyZoom: function() {
    var viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;

    var scale = this.currentZoom / 100;
    // Use meta viewport initial-scale (standard mobile zoom)
    viewport.setAttribute('content',
      'width=device-width, initial-scale=' + scale +
      ', minimum-scale=0.1, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover');

    // Update display
    var level = document.getElementById('quickMenuZoomLevel');
    if (level) level.textContent = this.currentZoom + '%';

    // Save
    localStorage.setItem('beebanelabs_mobile_zoom', String(this.currentZoom));
  },

  toggleTheme: function() {
    // Trigger ReadingSky toggle (syncs sky + theme)
    var skyToggle = document.getElementById("reading-sky-toggle");
    if (skyToggle) { skyToggle.click(); this.updateThemeIcon(); return; }
    if (typeof ThemeToggle !== 'undefined' && ThemeToggle.toggle) {
      ThemeToggle.toggle();
      this.updateThemeIcon();
    }
  },

  updateThemeIcon: function() {
    var icon = document.getElementById('quickMenuThemeIcon');
    if (icon) {
      var isNight = document.body.classList.contains('reading-sky-night');
      icon.textContent = isNight ? '\u2600\uFE0F' : '\uD83C\uDF19';
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  window.MobileQuickMenu.init();
});
