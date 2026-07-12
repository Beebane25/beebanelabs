/**
 * BeebaneLabs Security Module
 * Input sanitization, validation, and anti-abuse utilities
 */
'use strict';

const BBSecurity = {
  // === INPUT SANITIZATION ===
  
  /**
   * Strip dangerous HTML tags from user input
   * @param {string} input - Raw user input
   * @returns {string} Sanitized string
   */
  sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  },

  /**
   * Validate email format (strict)
   * @param {string} email
   * @returns {boolean}
   */
  validateEmail(email) {
    if (typeof email !== 'string') return false;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  },

  /**
   * Sanitize search query input
   * @param {string} query
   * @returns {string}
   */
  sanitizeSearchQuery(query) {
    if (typeof query !== 'string') return '';
    return query
      .replace(/[<>\"'&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .substring(0, 200);
  },

  /**
   * Sanitize user name
   * @param {string} name
   * @returns {string}
   */
  sanitizeName(name) {
    if (typeof name !== 'string') return '';
    return name
      .replace(/<[^>]*>/g, '')
      .replace(/[<>\"'&]/g, '')
      .trim()
      .substring(0, 100);
  },

  // === RATE LIMITING ===

  _rateLimitStore: {},

  /**
   * Check if action is rate-limited
   * @param {string} action - Action identifier (e.g., 'subscribe', 'contact')
   * @param {number} limit - Max attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
   */
  rateLimiter(action, limit = 3, windowMs = 600000) {
    const key = 'rl_' + action;
    const now = Date.now();
    
    if (!this._rateLimitStore[key]) {
      this._rateLimitStore[key] = [];
    }
    
    // Clean expired entries
    this._rateLimitStore[key] = this._rateLimitStore[key].filter(t => now - t < windowMs);
    
    const attempts = this._rateLimitStore[key];
    const remaining = Math.max(0, limit - attempts.length);
    const resetAt = attempts.length > 0 ? attempts[0] + windowMs : now + windowMs;
    
    if (attempts.length >= limit) {
      return { allowed: false, remaining: 0, resetAt };
    }
    
    return { allowed: true, remaining, resetAt };
  },

  /**
   * Record an attempt for rate limiting
   * @param {string} action
   */
  recordAttempt(action) {
    const key = 'rl_' + action;
    if (!this._rateLimitStore[key]) {
      this._rateLimitStore[key] = [];
    }
    this._rateLimitStore[key].push(Date.now());
  },

  // === TOKEN SECURITY ===

  _SALT: 'BLB_2026_',

  /**
   * Encrypt token for localStorage storage
   * @param {string} token
   * @returns {string}
   */
  tokenEncrypt(token) {
    if (!token) return '';
    try {
      const salted = this._SALT + token + this._SALT.split('').reverse().join('');
      return btoa(salted);
    } catch (e) {
      return btoa(token);
    }
  },

  /**
   * Decrypt token from localStorage
   * @param {string} encrypted
   * @returns {string}
   */
  tokenDecrypt(encrypted) {
    if (!encrypted) return '';
    try {
      const decoded = atob(encrypted);
      const salt = this._SALT;
      const reverseSalt = salt.split('').reverse().join('');
      if (decoded.startsWith(salt) && decoded.endsWith(reverseSalt)) {
        return decoded.slice(salt.length, -reverseSalt.length);
      }
      return decoded;
    } catch (e) {
      return '';
    }
  },

  // === FORM PROTECTION ===

  /**
   * Generate a simple CSRF token
   * @returns {string}
   */
  generateCSRFToken() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate form input fields
   * @param {HTMLFormElement} formElement
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateFormInput(formElement) {
    const errors = [];
    const inputs = formElement.querySelectorAll('input, textarea, select');
    
    for (const input of inputs) {
      // Skip hidden and submit
      if (input.type === 'hidden' || input.type === 'submit') continue;
      
      // Check required
      if (input.required && !input.value.trim()) {
        errors.push(`${input.name || input.id || 'Field'} harus diisi`);
        continue;
      }
      
      // Check email
      if (input.type === 'email' && input.value && !this.validateEmail(input.value)) {
        errors.push('Format email tidak valid');
      }
      
      // Check minlength
      if (input.minLength > 0 && input.value.length < input.minLength) {
        errors.push(`Minimal ${input.minLength} karakter`);
      }
      
      // Check maxlength
      if (input.maxLength > 0 && input.value.length > input.maxLength) {
        errors.push(`Maksimal ${input.maxLength} karakter`);
      }
      
      // Check pattern
      if (input.pattern && input.value) {
        const regex = new RegExp(input.pattern);
        if (!regex.test(input.value)) {
          errors.push(input.title || 'Format tidak valid');
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  },

  /**
   * Check honeypot field (should be empty)
   * @param {HTMLFormElement} formElement
   * @returns {boolean} true if honeypot is filled (bot detected)
   */
  checkHoneypot(formElement) {
    const honeypot = formElement.querySelector('[name="website"], [data-honeypot]');
    return honeypot && honeypot.value.length > 0;
  },

  // === ANTI-BOT ===

  /**
   * Get form submission timestamp for bot detection
   * @returns {number}
   */
  getFormTimestamp() {
    return Date.now();
  },

  /**
   * Check if form was submitted too quickly (bot detection)
   * @param {number} timestamp - Form load timestamp
   * @param {number} minSeconds - Minimum seconds before valid submission
   * @returns {boolean} true if submitted too quickly (likely bot)
   */
  submittedTooFast(timestamp, minSeconds = 3) {
    return (Date.now() - timestamp) < (minSeconds * 1000);
  },

  // === INITIALIZATION ===

  /**
   * Initialize security module
   * Sets up global error tracking and form protection
   */
  init() {
    // Global error tracking
    window.onerror = function(msg, url, line) {
      try {
        const errors = JSON.parse(localStorage.getItem('blb_errors') || '[]');
        errors.push({ msg, url, line, time: Date.now() });
        if (errors.length > 50) errors.shift();
        localStorage.setItem('blb_errors', JSON.stringify(errors));
      } catch (e) {}
      return false;
    };

    // Auto-protect forms with honeypot
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('form[data-protected]').forEach(form => {
        // Add honeypot if not exists
        if (!form.querySelector('[name="website"]')) {
          const hp = document.createElement('div');
          hp.style.cssText = 'position:absolute;left:-9999px;opacity:0;height:0;overflow:hidden;';
          hp.setAttribute('aria-hidden', 'true');
          hp.innerHTML = '<label>Website</label><input type="text" name="website" tabindex="-1" autocomplete="off">';
          form.appendChild(hp);
        }
        
        // Add timestamp
        const ts = document.createElement('input');
        ts.type = 'hidden';
        ts.name = '_ts';
        ts.value = Date.now();
        form.appendChild(ts);
      });
    });
  }
};

// Auto-initialize
BBSecurity.init();
