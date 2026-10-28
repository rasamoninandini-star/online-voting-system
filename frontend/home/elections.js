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

const electionSearch = document.querySelector('#election-search');
const electionCards = [...document.querySelectorAll('.election-card')];
const filterButtons = [...document.querySelectorAll('.filter-button')];
const emptyState = document.querySelector('#empty-state');
let activeFilter = 'all';

function filterElections() {
  const searchTerm = electionSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  electionCards.forEach((card) => {
    const matchesFilter = activeFilter === 'all' || card.dataset.status === activeFilter;
    const matchesSearch = card.dataset.search.includes(searchTerm)
      || card.querySelector('h3').textContent.toLowerCase().includes(searchTerm);
    const isVisible = matchesFilter && matchesSearch;

    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

if (electionSearch && emptyState) {
  electionSearch.addEventListener('input', filterElections);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle('active', isActive);
        filterButton.setAttribute('aria-pressed', String(isActive));
      });
      filterElections();
    });
  });
}

const currentYear = document.querySelector('#current-year');
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
