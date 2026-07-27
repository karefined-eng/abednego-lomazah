/**
 * Clean, professional Web Share API integration with Clipboard & WhatsApp fallback.
 * Strictly adheres to candidate title qualifiers ("Hopeful") and professional formatting (no emojis).
 */
document.addEventListener('DOMContentLoaded', () => {
  // Prevent duplicate insertion
  if (document.querySelector('.floating-share-btn')) return;

  // 1. Create Floating Share Button
  const shareBtn = document.createElement('button');
  shareBtn.className = 'floating-share-btn';
  shareBtn.setAttribute('aria-label', 'Share academic archive and resources');
  shareBtn.setAttribute('title', 'Share this resource archive with students');
  shareBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:6px;">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
    <span>Share Archive</span>
  `;
  document.body.appendChild(shareBtn);

  // 2. Create Toast Notification Element
  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  let toastTimeout;
  function showToast(message, actionText, actionUrl) {
    clearTimeout(toastTimeout);
    let html = `<span>${message}</span>`;
    if (actionText && actionUrl) {
      html += ` <a href="${actionUrl}" target="_blank" rel="noopener noreferrer" class="toast-action">${actionText}</a>`;
    }
    toast.innerHTML = html;
    toast.classList.add('visible');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 6000);
  }

  // 3. Prepare Share Data (Zero Emojis, Professional Tone, Strict Title Qualifier)
  const shareData = {
    title: 'Abednego Lomazah | UGSRC President 2026 Hopeful',
    text: 'Access free University of Ghana course study packs, PASSCO, tutorial schedules, and student advocacy resources compiled by Abednego Lomazah (UGSRC President 2026 Hopeful).',
    url: 'https://abednego-lomazah-site.vercel.app/'
  };

  const fullShareText = `${shareData.text} Access here: ${shareData.url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;

  // 4. Handle Click Event
  shareBtn.addEventListener('click', async () => {
    // Attempt native Web Share API
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // If user canceled the dialog, do nothing
        if (err.name === 'AbortError') return;
        console.warn('Native share failed, falling back to clipboard:', err);
      }
    }

    // Fallback: Copy to Clipboard & Show WhatsApp Action
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullShareText);
        showToast('Archive link and summary copied to clipboard.', 'Open WhatsApp Web ↗', whatsappUrl);
      } else {
        // Legacy fallback if clipboard API is unavailable
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (clipErr) {
      console.error('Clipboard copy failed:', clipErr);
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  });
});
