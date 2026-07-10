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

  async function fetchCSV(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }
    const text = await response.text();
    const rows = parseCSV(text);
    return rows.slice(1);
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

    function openModal(name, folderId) {
      title.textContent = name;
      frame.removeAttribute('srcdoc');
      frame.src = getDriveUrl(folderId);
      if (openLink) {
        openLink.href = getDriveFolderUrl(folderId);
      }
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('active');
      frame.src = '';
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });

    window.openDriveModal = openModal;
    window.closeDriveModal = closeModal;
  }

  document.addEventListener('DOMContentLoaded', setupDriveModal);

  window.cms = {
    parseCSV,
    fetchCSV,
    isPlaceholderValue,
    isUsableLink,
    getDriveUrl,
    setupDriveModal
  };
})();
