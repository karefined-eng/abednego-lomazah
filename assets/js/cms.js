(function () {
  function normalizeCell(value) {
    return String(value ?? '').replace(/\r/g, '').trim();
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') {
          i += 1;
        }
        row.push(field);
        if (row.some((cell) => normalizeCell(cell) !== '')) {
          rows.push(row);
        }
        row = [];
        field = '';
      } else {
        field += char;
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      if (row.some((cell) => normalizeCell(cell) !== '')) {
        rows.push(row);
      }
    }

    return rows.map((r) => r.map((cell) => normalizeCell(cell)));
  }

  const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  function _cacheKey(url) {
    return 'cms_csv_' + btoa(url).replace(/=/g, '');
  }

  function _readCache(url) {
    try {
      const key = _cacheKey(url);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (_) {
      return null;
    }
  }

  function _writeCache(url, rows) {
    try {
      const key = _cacheKey(url);
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: rows }));
    } catch (_) {
      // Storage quota exceeded or private browsing — silently skip
    }
  }

  async function fetchCSV(url) {
    const cached = _readCache(url);
    if (cached) return cached;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }
    const text = await response.text();
    const rows = parseCSV(text).slice(1);
    _writeCache(url, rows);
    return rows;
  }

  function isPlaceholderValue(value) {
    const normalized = normalizeCell(value).toLowerCase();
    if (!normalized) return true;
    return [
      'add date',
      '[link removed]',
      '[add zoom link]',
      '[add meet link]',
      '[add letter image link]',
      'n/a',
      'na',
      'tbc',
      'coming soon'
    ].includes(normalized);
  }

  function isUsableLink(value) {
    const normalized = normalizeCell(value);
    if (!normalized || isPlaceholderValue(value)) {
      return false;
    }
    return /^https?:\/\//i.test(normalized) || /^wa\.me\//i.test(normalized) || /^chat\.whatsapp\.com\//i.test(normalized);
  }

  function getDriveUrl(folderId) {
    return `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`;
  }

  function getDriveFolderUrl(folderId) {
    return `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}?usp=sharing`;
  }

  function setupDriveModal() {
    const overlay = document.getElementById('modalOverlay');
    const frame = document.getElementById('modalFrame');
    const title = document.getElementById('modalTitle');
    const closeBtn = document.getElementById('modalClose');
    const openLink = document.getElementById('modalOpenLink');

    if (!overlay || !frame || !title || !closeBtn) {
      return;
    }

    let previousActiveElement = null;

    function trapFocus(e) {
      const focusableElements = overlay.querySelectorAll('a[href], button, iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }

    function openModal(name, folderId) {
      previousActiveElement = document.activeElement;
      title.textContent = name;
      frame.removeAttribute('srcdoc');
      frame.src = getDriveUrl(folderId);
      if (openLink) {
        openLink.href = getDriveFolderUrl(folderId);
      }
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      overlay.addEventListener('keydown', trapFocus);
      setTimeout(() => closeBtn.focus(), 100);
    }

    function closeModal() {
      overlay.classList.remove('active');
      frame.src = '';
      document.body.style.overflow = '';
      overlay.removeEventListener('keydown', trapFocus);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('active')) {
        closeModal();
      }
    });

    window.openDriveModal = openModal;
    window.closeDriveModal = closeModal;
  }

  function setupMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.getElementById('primary-navigation');

    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('expanded');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupDriveModal();
    setupMobileMenu();
  });

  window.cms = {
    parseCSV,
    fetchCSV,
    isPlaceholderValue,
    isUsableLink,
    getDriveUrl,
    setupDriveModal
  };
})();
