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

  // ── localStorage cache (30-minute TTL) ───────────────────────────────────
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

  // ── Skeleton utilities ────────────────────────────────────────────────────

  /**
   * Build a full-card skeleton (with thumbnail) for gallery grids.
   * @returns {HTMLElement}
   */
  function _buildGallerySkeleton() {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton-thumb"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--long"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
      </div>`;
    return card;
  }

  /**
   * Build a compact skeleton (no thumbnail, icon block + text lines).
   * @param {boolean} dark  – use dark-variant classes
   * @returns {HTMLElement}
   */
  function _buildCompactSkeleton(dark = false) {
    const cardMod = dark ? ' skeleton-card--dark' : '';
    const lineMod = dark ? ' skeleton-line--dark' : '';
    const iconMod = dark ? ' skeleton-icon-block--dark' : '';
    const card = document.createElement('div');
    card.className = `skeleton-card skeleton-card--compact${cardMod}`;
    card.innerHTML = `
      <div class="skeleton-body">
        <div class="skeleton-icon-block${iconMod}"></div>
        <div class="skeleton-line skeleton-line--short${lineMod}"></div>
        <div class="skeleton-line skeleton-line--title${lineMod}"></div>
        <div class="skeleton-line skeleton-line--long${lineMod}"></div>
        <div class="skeleton-line skeleton-line--medium${lineMod}"></div>
      </div>`;
    return card;
  }

  /**
   * Inject N skeleton cards into a container element, replacing any existing
   * content. The container receives a skeleton-grid wrapper inside it.
   *
   * @param {HTMLElement} container  – the loading placeholder element
   * @param {'gallery'|'compact'|'compact-dark'} variant
   * @param {number} [count=6]
   */
  function injectSkeletons(container, variant, count) {
    if (!container) return;
    count = count || 6;

    const isDark    = variant === 'compact-dark';
    const isGallery = variant === 'gallery';

    const grid = document.createElement('div');
    grid.setAttribute('aria-hidden', 'true');

    if (isGallery) {
      grid.className = 'skeleton-grid';
    } else {
      grid.className = 'skeleton-grid skeleton-grid--compact' + (isDark ? ' skeleton-grid--dark' : '');
    }

    for (let i = 0; i < count; i++) {
      grid.appendChild(isGallery ? _buildGallerySkeleton() : _buildCompactSkeleton(isDark));
    }

    container.innerHTML = '';
    container.appendChild(grid);
  }

  /**
   * Replace a loading container with a styled error state that includes a
   * retry button.
   *
   * @param {HTMLElement} container   – the loading/error host element
   * @param {string}      label       – human-readable section name, e.g. "guides"
   * @param {Function}    onRetry     – callback to re-trigger the data fetch
   * @param {'gallery'|'compact'|'compact-dark'} [skeletonVariant='compact']
   */
  function showErrorState(container, label, onRetry, skeletonVariant) {
    if (!container) return;
    skeletonVariant = skeletonVariant || 'compact';

    container.innerHTML = `
      <div class="error-state" role="alert">
        <div class="error-state__icon">⚠️</div>
        <p class="error-state__message">Could not load ${label}</p>
        <p class="error-state__sub">There was a problem connecting to the database.<br>Check your internet connection and try again.</p>
        <button class="error-state__retry" aria-label="Retry loading ${label}">↺ Retry</button>
      </div>`;

    container.querySelector('.error-state__retry').addEventListener('click', () => {
      injectSkeletons(container, skeletonVariant, 6);
      onRetry();
    });
  }

  // ── Drive modal ───────────────────────────────────────────────────────────

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
    return \`https://drive.google.com/embeddedfolderview?id=\${encodeURIComponent(folderId)}#list\`;
  }

  function getDriveFolderUrl(folderId) {
    return \`https://drive.google.com/drive/folders/\${encodeURIComponent(folderId)}?usp=sharing\`;
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
    setupDriveModal,
    injectSkeletons,
    showErrorState
  };
})();
