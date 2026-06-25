// === MOBILE QUICK MENU (Zoom + Theme) ===
const MobileQuickMenu = {
  currentZoom: 100,
  minZoom: 70,
  maxZoom: 150,
  step: 10,
  isOpen: false,

  init() {
    // Only on mobile
    if (window.innerWidth > 768) {
      const btn = document.getElementById('quickMenuBtn');
      if (btn) btn.style.display = 'none';
      return;
    }

    // Load saved zoom
    const saved = localStorage.getItem('beebanelabs_mobile_zoom');
    if (saved) {
      this.currentZoom = parseInt(saved);
      this.applyZoom();
    }

    // Update theme icon
    this.updateThemeIcon();
  },

  toggle() {
    const menu = document.getElementById('quickMenuPanel');
    if (!menu) return;
    this.isOpen = !this.isOpen;
    menu.style.display = this.isOpen ? 'flex' : 'none';
  },

  close() {
    const menu = document.getElementById('quickMenuPanel');
    if (menu) {
      menu.style.display = 'none';
      this.isOpen = false;
    }
  },

  zoomIn() {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom += this.step;
      this.applyZoom();
    }
  },

  zoomOut() {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom -= this.step;
      this.applyZoom();
    }
  },

  resetZoom() {
    this.currentZoom = 100;
    this.applyZoom();
  },

  applyZoom() {
    const content = document.querySelector('.article-content');
    if (content) {
      if (this.currentZoom === 100) {
        content.style.transform = '';
        content.style.width = '';
      } else {
        content.style.transform = 'scale(' + (this.currentZoom / 100) + ')';
        content.style.transformOrigin = 'top left';
        content.style.width = (100 / (this.currentZoom / 100)) + '%';
      }
    }
    // Update display
    const level = document.getElementById('quickMenuZoomLevel');
    if (level) level.textContent = this.currentZoom + '%';
    // Save
    localStorage.setItem('beebanelabs_mobile_zoom', this.currentZoom);
  },

  toggleTheme() {
    if (typeof ThemeToggle !== 'undefined') {
      ThemeToggle.toggle();
      this.updateThemeIcon();
    }
  },

  updateThemeIcon() {
    const icon = document.getElementById('quickMenuThemeIcon');
    if (icon) {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      icon.textContent = current === 'dark' ? '☀️' : '🌙';
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  MobileQuickMenu.init();
});
