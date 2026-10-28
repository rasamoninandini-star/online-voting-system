const passwordInput = document.querySelector('#password');
const showPasswordButton = document.querySelector('.show-password');
const loginForm = document.querySelector('#login-form');
const formMessage = document.querySelector('#form-message');

if (passwordInput && showPasswordButton) {
  showPasswordButton.addEventListener('click', () => {
    const shouldShowPassword = passwordInput.type === 'password';
    passwordInput.type = shouldShowPassword ? 'text' : 'password';
    showPasswordButton.textContent = shouldShowPassword ? 'Hide' : 'Show';
    showPasswordButton.setAttribute('aria-pressed', String(shouldShowPassword));
  });
}

if (loginForm && formMessage) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formMessage.classList.remove('error');

    if (!loginForm.reportValidity()) {
      formMessage.textContent = 'Please check your email and password.';
      formMessage.classList.add('error');
      return;
    }

    formMessage.textContent = 'The login form is ready. Account sign-in needs a server-side authentication service.';
  });
}
