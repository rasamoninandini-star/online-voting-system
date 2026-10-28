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
  menuToggle.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileOverlay.addEventListener('click', () => setMenuOpen(false));
  sidebar.addEventListener('click', (event) => { if (event.target.closest('a')) setMenuOpen(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenuOpen(false); });
}

const listingList = document.querySelector('#listing-list');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const listingCount = document.querySelector('#listing-count');
const emptyState = document.querySelector('#empty-state');
const activeCount = document.querySelector('#active-count');
let activeFilter = 'all';

function updateListings() {
  const rows = [...listingList.querySelectorAll('.listing-row')];
  let visibleCount = 0;
  let openCount = 0;
  rows.forEach((row) => {
    if (row.dataset.status === 'open') openCount += 1;
    const visible = activeFilter === 'all' || row.dataset.status === activeFilter;
    row.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  listingCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'election' : 'elections'}`;
  activeCount.textContent = String(openCount);
  emptyState.hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    updateListings();
  });
});

const createForm = document.querySelector('#create-form');
const adminMessage = document.querySelector('#admin-message');
const dateInput = document.querySelector('#election-date');
if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

if (createForm && adminMessage) {
  createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!createForm.reportValidity()) return;

    const formData = new FormData(createForm);
    const name = formData.get('name').trim();
    const category = formData.get('category');
    const closes = new Date(`${formData.get('closeDate')}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const row = document.createElement('article');
    row.className = 'listing-row';
    row.dataset.status = 'upcoming';

    const mark = document.createElement('span');
    mark.className = 'listing-mark purple-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = category.slice(0, 2).toUpperCase();
    const info = document.createElement('div');
    info.className = 'listing-info';
    const title = document.createElement('strong');
    title.textContent = name;
    const detail = document.createElement('small');
    detail.textContent = `${category} · Closes ${closes}`;
    info.append(title, detail);
    const status = document.createElement('span');
    status.className = 'status-tag upcoming-tag';
    status.textContent = 'Coming soon';
    row.append(mark, info, status);
    listingList.append(row);

    adminMessage.textContent = 'Sample election added to this page only.';
    createForm.reset();
    updateListings();
  });
}

const currentYear = document.querySelector('#current-year');
if (currentYear) currentYear.textContent = new Date().getFullYear();
