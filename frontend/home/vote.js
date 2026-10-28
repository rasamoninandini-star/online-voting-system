const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('#sidebar');
const mobileOverlay = document.querySelector('.mobile-overlay');

function setMenuOpen(isOpen) {
  if (!menuToggle || !sidebar || !mobileOverlay) return;

  sidebar.classList.toggle('is-open', isOpen);
  mobileOverlay.classList.toggle('is-visible', isOpen);
  mobileOverlay.hidden = !isOpen;
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
}

if (menuToggle && sidebar && mobileOverlay) {
  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileOverlay.addEventListener('click', () => setMenuOpen(false));

  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
}

const voteForm = document.querySelector('#vote-form');
const formMessage = document.querySelector('#form-message');
const voteStorageKey = 'ballot-community-council-voted';

if (voteForm && formMessage) {
  if (localStorage.getItem(voteStorageKey) === 'true') {
    voteForm.querySelectorAll('input, button').forEach((control) => {
      control.disabled = true;
    });
    formMessage.textContent = 'A vote has already been submitted from this browser for this demo election.';
  }

  voteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!voteForm.reportValidity()) {
      formMessage.textContent = 'Please select a candidate before submitting your vote.';
      formMessage.classList.add('error');
      return;
    }

    if (localStorage.getItem(voteStorageKey) === 'true') {
      formMessage.textContent = 'A vote has already been submitted from this browser for this demo election.';
      formMessage.classList.remove('error');
      return;
    }

    localStorage.setItem(voteStorageKey, 'true');
    voteForm.querySelectorAll('input, button').forEach((control) => {
      control.disabled = true;
    });
    formMessage.classList.remove('error');
    formMessage.textContent = 'Your vote has been recorded in this browser demo. A real election needs secure server-side vote storage.';
  });
}

const currentYear = document.querySelector('#current-year');
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
