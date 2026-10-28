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

const pollCards = [...document.querySelectorAll('.poll-card')];
const filterButtons = [...document.querySelectorAll('.filter-button')];
const emptyState = document.querySelector('#empty-state');
const pollCount = document.querySelector('#poll-count');
let activeFilter = 'all';

function applyPollFilter() {
  let visibleCount = 0;

  pollCards.forEach((card) => {
    const isVisible = activeFilter === 'all' || card.dataset.status === activeFilter;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (emptyState) emptyState.hidden = visibleCount > 0;
  if (pollCount) pollCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'poll' : 'polls'}`;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    applyPollFilter();
  });
});

const pollStoragePrefix = 'ballot-poll-vote-';

document.querySelectorAll('.poll-form').forEach((form) => {
  const pollId = form.dataset.pollId;
  const message = form.querySelector('.poll-message');
  const voteButton = form.querySelector('.vote-button');

  if (!pollId || !message || !voteButton) return;

  if (localStorage.getItem(`${pollStoragePrefix}${pollId}`)) {
    form.querySelectorAll('input').forEach((input) => {
      input.disabled = true;
      input.checked = input.value === localStorage.getItem(`${pollStoragePrefix}${pollId}`);
    });
    voteButton.disabled = true;
    message.textContent = 'Your response is saved in this browser demo.';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedOption = form.querySelector('input:checked');

    if (!selectedOption) {
      form.reportValidity();
      return;
    }

    if (localStorage.getItem(`${pollStoragePrefix}${pollId}`)) {
      message.textContent = 'A response has already been saved for this poll in this browser.';
      return;
    }

    localStorage.setItem(`${pollStoragePrefix}${pollId}`, selectedOption.value);
    form.querySelectorAll('input').forEach((input) => {
      input.disabled = true;
    });
    voteButton.disabled = true;
    message.textContent = 'Your response is saved in this browser demo. Real polls need server-side storage.';
  });
});

const currentYear = document.querySelector('#current-year');
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
