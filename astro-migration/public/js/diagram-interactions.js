/**
 * diagram-interactions.js
 * GSAP-powered scroll reveal + zoom for SVG diagrams
 */
(function() {
  'use strict';

  // Wait for DOM
  function init() {
    const diagrams = document.querySelectorAll('.diagram-svg');
    if (!diagrams.length) return;

    // Mark for reveal animation
    diagrams.forEach(d => d.classList.add('reveal-diagram'));

    // Intersection Observer for scroll reveal (no GSAP dependency needed)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    diagrams.forEach(d => observer.observe(d));

    // Zoom on click
    diagrams.forEach(diagram => {
      diagram.addEventListener('click', function(e) {
        if (this.classList.contains('zoomed')) {
          this.classList.remove('zoomed');
          document.body.style.overflow = '';
        } else {
          this.classList.add('zoomed');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    // ESC to close zoomed diagram
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const zoomed = document.querySelector('.diagram-svg.zoomed');
        if (zoomed) {
          zoomed.classList.remove('zoomed');
          document.body.style.overflow = '';
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
