// === MOBILE QUICK MENU (Zoom + Theme) ===
window.MobileQuickMenu = {
  currentZoom: 100,
  minZoom: 70,
  maxZoom: 150,
  step: 10,
  isOpen: false,

  init: function() {
    if (window.innerWidth > 768) {
      var btn = document.getElementById('quickMenuBtn');
      if (btn) btn.style.display = 'none';
      return;
    }
    var saved = localStorage.getItem('beebanelabs_mobile_zoom');
    if (saved) {
      this.currentZoom = parseInt(saved);
      this.applyZoom();
    }
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
    this.currentZoom = 100;
    this.applyZoom();
  },

  applyZoom: function() {
    // Use CSS zoom property (works on Chrome & Safari mobile)
    // This actually changes layout size, not just visual
    var body = document.body;
    if (!body) return;
    
    if (this.currentZoom === 100) {
      body.style.zoom = '';
      body.style.width = '';
    } else {
      body.style.zoom = String(this.currentZoom / 100);
      body.style.width = (100 / (this.currentZoom / 100)) + '%';
    }
    
    // Update display
    var level = document.getElementById('quickMenuZoomLevel');
    if (level) level.textContent = this.currentZoom + '%';
    
    // Save
    localStorage.setItem('beebanelabs_mobile_zoom', String(this.currentZoom));
  },

  toggleTheme: function() {
    if (typeof ThemeToggle !== 'undefined' && ThemeToggle.toggle) {
      ThemeToggle.toggle();
      this.updateThemeIcon();
    }
  },

  updateThemeIcon: function() {
    var icon = document.getElementById('quickMenuThemeIcon');
    if (icon) {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      icon.textContent = current === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  window.MobileQuickMenu.init();
});
