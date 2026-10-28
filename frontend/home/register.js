const registerForm = document.querySelector('#register-form');
const passwordInput = document.querySelector('#password');
const confirmPasswordInput = document.querySelector('#confirm-password');
const formMessage = document.querySelector('#form-message');

document.querySelectorAll('.show-password').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    if (!input) return;

    const shouldShowPassword = input.type === 'password';
    input.type = shouldShowPassword ? 'text' : 'password';
    button.textContent = shouldShowPassword ? 'Hide' : 'Show';
    button.setAttribute('aria-pressed', String(shouldShowPassword));
  });
});

if (registerForm && passwordInput && confirmPasswordInput && formMessage) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formMessage.classList.remove('error');

    if (!registerForm.reportValidity()) {
      formMessage.textContent = 'Please check your details and accept the terms.';
      formMessage.classList.add('error');
      return;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      formMessage.textContent = 'Your passwords do not match.';
      formMessage.classList.add('error');
      confirmPasswordInput.focus();
      return;
    }

    formMessage.textContent = 'Your details are valid. Creating accounts requires a server-side registration service.';
  });
}
