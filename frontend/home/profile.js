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

const profileForm = document.querySelector('#profile-form');
const profileMessage = document.querySelector('#profile-message');
const profileStorageKey = 'ballot-profile-demo';

if (profileForm && profileMessage) {
  try {
    const savedProfile = JSON.parse(localStorage.getItem(profileStorageKey) || 'null');
    if (savedProfile) {
      profileForm.elements.fullName.value = savedProfile.fullName || '';
      profileForm.elements.email.value = savedProfile.email || '';
      profileForm.elements.neighborhood.value = savedProfile.neighborhood || '';
      profileForm.elements.timezone.value = savedProfile.timezone || 'America/New_York';
      profileForm.elements.updates.checked = Boolean(savedProfile.updates);
    }
  } catch (error) {
    profileMessage.textContent = 'Saved profile data could not be loaded.';
  }

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!profileForm.reportValidity()) return;
    const formData = new FormData(profileForm);
    const profile = {
      fullName: formData.get('fullName').trim(),
      email: formData.get('email').trim(),
      neighborhood: formData.get('neighborhood').trim(),
      timezone: formData.get('timezone'),
      updates: formData.get('updates') === 'on'
    };
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      profileMessage.textContent = 'Your profile was saved in this browser demo.';
    } catch (error) {
      profileMessage.textContent = 'Your browser could not save these demo changes.';
    }
  });
}

const currentYear = document.querySelector('#current-year');
if (currentYear) currentYear.textContent = new Date().getFullYear();
