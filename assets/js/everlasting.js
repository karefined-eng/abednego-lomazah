const seedTributes = [
  { message: 'A man who worked so hard I once asked him: “Do you sleep?” So dedicated to the service of humanity, so humble to everyone, a man with a vision.', author: 'A proud teammate', kind: 'TESTIMONY' },
  { message: 'I am so proud to have served under your leadership. Will forever be proud of you. Thank you, and God continue to bless you.', author: 'A teammate', kind: 'GRATITUDE' },
  { message: 'You truly believed you could change the way people think about the SRC, and you gave your all to the student body.', author: 'A student witness', kind: 'THE WORK' },
  { message: 'You were willing to stand up for the people you served, even with a small leadership role. That is who Abednego Lomazah is.', author: 'A course representative', kind: 'SERVICE' },
  { message: 'We did not have to worry about missing deadlines because you carefully monitored the platforms and relayed every important piece of information to us.', author: 'A Level 100 classmate', kind: 'REMEMBERED' },
  { message: 'From the very beginning, through Level 300, you kept working and serving the student body. You listened and delivered to the best of your ability.', author: 'A student voice', kind: 'THE RECORD' },
  { message: 'Much appreciation to you, brother Samuel Espan Bissah. I will never forget all the toil and sacrifices we put in from January 2024.', author: 'Abednego Lomazah', kind: 'BROTHERHOOD' },
  { message: 'Putting your role as President of the Business School at risk to join us in making this a formidable ticket is something we will always appreciate.', author: 'Abednego Lomazah', kind: 'THE TEAM' },
  { message: 'He worked even when he was not given a leadership role. He served the student body diligently.', author: 'A course rep', kind: 'WITHOUT A TITLE' },
  { message: 'Who would have thought that even without a formal leadership role, you could still be a leader and serve your people? Nobody. Abednego thought of it.', author: 'A classmate', kind: 'THE IDEA' },
  { message: 'I will never forget all the toil and sacrifices we put in from January 2024. Thank you for the time, courage, and commitment you brought to the team.', author: 'Abednego Lomazah', kind: 'TO MY RUNNING MATE' },
  { message: 'Much appreciation to you brother SAMUEL ESPAN BISSAH. I will never forget all the toil and sacrifices we put in this from January 2024. Stepping in just a few minutes before the deadline... means a great deal to me and the entire team.', author: 'Abednego Lomazah', kind: 'BROTHERHOOD' },
  { message: 'You gave your all to the student body. I am so proud to have served under your leadership. I will forever be proud of you.', author: 'A proud teammate', kind: 'A WORD FOR ABEDNEGO' },
  { message: 'Tomorrow, before you CLICK that link to vote, pause for a moment. Ask yourself one simple question: Did we really choose to have only one option, or was that choice made for us?', author: 'kwadwocode', kind: 'THE CHOICE' },
  { message: 'An election is supposed to give students a voice. But what happens when the system leaves you with only one person to choose from?', author: 'kwadwocode', kind: 'THE SYSTEM' },
  { message: 'If you believe the process was unfair, you have every right to let your vote reflect that conviction. Don’t vote out of pressure. Think for yourself.', author: 'kwadwocode', kind: 'YOUR VOICE' },
  { message: 'The campaign journey in focus.', image: 'assets/headshots/abednego-lomazah-headshot-fullbody-batik-1.jpg', kind: 'ARCHIVE' },
  { message: 'Serving the student body from the beginning.', image: 'assets/headshots/abednego-lomazah-headshot-studio-batik.jpg', kind: 'ARCHIVE' }
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapeHTML(value) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

async function getApprovedTributes() {
  try {
    const response = await fetch('/api/tributes', { headers: { Accept: 'application/json' } });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.tributes) ? data.tributes : [];
  } catch {
    return [];
  }
}

function renderWall(extraTributes = []) {
  const wall = document.querySelector('#tribute-wall');
  const count = document.querySelector('#wall-count');
  if (!wall) return;

  const messages = shuffle([...seedTributes, ...extraTributes]);
  wall.innerHTML = messages.map((tribute, index) => {
    const size = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
    const tone = ['paper', 'ink', 'gold'][Math.floor(Math.random() * 3)];
    const tilt = reduceMotion ? 0 : (Math.random() * 5 - 2.5).toFixed(2);
    const delay = reduceMotion ? 0 : (index * 55);
    
    if (tribute.kind === 'ARCHIVE' && tribute.image) {
      return `
        <article class="tribute-note tribute-note--image" style="--note-tilt: ${tilt}deg; --note-delay: ${delay}ms">
          <img src="${escapeHTML(tribute.image)}" alt="${escapeHTML(tribute.message)}" loading="eager" decoding="async" />
          <p>${escapeHTML(tribute.message)}</p>
        </article>
      `;
    }

    return `
      <article class="tribute-note tribute-note--${size} tribute-note--${tone}" style="--note-tilt: ${tilt}deg; --note-delay: ${delay}ms">
        <span class="tribute-note-kind">${escapeHTML(tribute.kind || 'FROM THE WALL')}</span>
        <p>${escapeHTML(tribute.message)}</p>
        <footer>— ${escapeHTML(tribute.author || 'A student voice')}</footer>
      </article>
    `;
  }).join('');

  if (count) count.textContent = `${messages.length} voices currently on the wall`;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    wall.querySelectorAll('.tribute-note').forEach((note) => observer.observe(note));
  } else {
    wall.querySelectorAll('.tribute-note').forEach((note) => note.classList.add('is-visible'));
  }
}

async function submitTribute(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector('#tribute-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    message: String(formData.get('message') || '').trim()
  };

  if (!payload.name || !payload.message) return;
  submitButton.disabled = true;
  if (status) status.textContent = 'Sending your word for review…';

  try {
    const response = await fetch('/api/tributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Submission failed');
    form.reset();
    if (status) status.textContent = 'Thank you. Your word has been received for review.';
  } catch {
    if (status) status.textContent = 'We could not send it right now. Please try again shortly.';
  } finally {
    submitButton.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const approvedTributes = await getApprovedTributes();
  renderWall(approvedTributes);
  document.querySelector('#recompose-wall')?.addEventListener('click', () => renderWall(approvedTributes));
  document.querySelector('#tribute-form')?.addEventListener('submit', submitTribute);
});
