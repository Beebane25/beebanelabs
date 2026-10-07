/* Shared, progressive article enhancements. No account data is stored here. */
(function () {
  function enhance() {
    var article = document.querySelector('article.article-content');
    if (!article) return;
    // Wide tables scroll independently rather than forcing the whole page wider.
    article.querySelectorAll('table').forEach(function (table, i) {
      if (table.closest('.table-scroll')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'Tabel tutorial ' + (i + 1) + ' — geser untuk melihat kolom lainnya');
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
    article.querySelectorAll('pre').forEach(function (pre) {
      if (pre.classList.contains('mermaid')) return;
      pre.tabIndex = 0;
      pre.setAttribute('aria-label', 'Contoh kode — dapat digeser horizontal');
    });
    if (article.querySelector('.reader-tools')) return;
    var tools = document.createElement('div');
    tools.className = 'reader-tools';
    tools.setAttribute('role', 'group');
    tools.setAttribute('aria-label', 'Pengaturan kenyamanan membaca');
    var status = document.createElement('span');
    status.className = 'reader-status';
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Ukuran teks standar';
    var size = 100;
    function addButton(label, action) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', action);
      tools.appendChild(button);
      return button;
    }
    addButton('A−', function () { size = Math.max(85, size - 5); applySize(); }).setAttribute('aria-label', 'Perkecil teks artikel');
    addButton('A+', function () { size = Math.min(140, size + 5); applySize(); }).setAttribute('aria-label', 'Perbesar teks artikel');
    addButton('Reset', function () { size = 100; article.style.fontSize = ''; status.textContent = 'Ukuran teks standar'; });
    var focus = addButton('Mode fokus', function () {
      var enabled = document.body.classList.toggle('reader-focus');
      focus.setAttribute('aria-pressed', String(enabled));
      focus.textContent = enabled ? 'Keluar mode fokus' : 'Mode fokus';
    });
    focus.setAttribute('aria-pressed', 'false');
    tools.appendChild(status);
    article.prepend(tools);
    function applySize() {
      article.style.fontSize = size + '%';
      status.textContent = 'Ukuran teks ' + size + '%';
    }
    var menu = document.getElementById('menuToggle');
    var nav = document.getElementById('navLinks');
    if (menu && nav) {
      new MutationObserver(function () {
        menu.setAttribute('aria-expanded', String(nav.classList.contains('open') || nav.classList.contains('active')));
      }).observe(nav, { attributes: true, attributeFilter: ['class'] });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance);
  else enhance();
})();
