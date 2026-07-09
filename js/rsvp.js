const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

const form = document.getElementById('rsvp-form');
const submitButton = document.getElementById('submit-button');
const formMessage = document.getElementById('form-message');
const thankYou = document.getElementById('thank-you');

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message form-message--visible form-message--${type}`;
}

function clearMessage() {
  formMessage.textContent = '';
  formMessage.className = 'form-message';
}

function clearFieldErrors() {
  form.querySelectorAll('.field--invalid').forEach((field) => {
    field.classList.remove('field--invalid');
    const input = field.querySelector('input, textarea');
    if (input) input.removeAttribute('aria-invalid');
  });
}

function markFieldInvalid(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const field = input.closest('.field');
  if (field) field.classList.add('field--invalid');
  input.setAttribute('aria-invalid', 'true');
  input.focus();
}

function validate(data) {
  if (!data.full_name.trim()) return { field: 'full_name', message: 'Please enter your name.' };
  if (!PHONE_RE.test(data.phone)) return { field: 'phone', message: 'Please enter a valid phone number.' };
  if (data.guest_count < 0 || data.guest_count > 20) {
    return { field: 'guest_count', message: 'Guest count must be between 0 and 20.' };
  }
  return null;
}

function initStepper() {
  const input = document.getElementById('guest_count');
  if (!input) return;

  document.querySelectorAll('.stepper__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = Number(btn.dataset.step);
      const current = Number(input.value) || 0;
      input.value = Math.min(20, Math.max(0, current + step));
    });
  });
}

function initMessageCounter() {
  const input = document.getElementById('message');
  const counter = document.getElementById('message-count');
  if (!input || !counter) return;

  const update = () => {
    counter.textContent = `${input.value.length} / 500`;
  };
  input.addEventListener('input', update);
  update();
}

if (form) {
  initStepper();
  initMessageCounter();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();
    clearFieldErrors();

    const formData = new FormData(form);

    // Honeypot: bots tend to fill every field, humans never see this one.
    if (formData.get('company')) {
      return;
    }

    const data = {
      full_name: (formData.get('full_name') || '').toString(),
      phone: (formData.get('phone') || '').toString(),
      guest_count: Number(formData.get('guest_count') || 0),
      message: (formData.get('message') || '').toString(),
    };

    const validationError = validate(data);
    if (validationError) {
      showMessage(validationError.message, 'error');
      markFieldInvalid(validationError.field);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    form.classList.add('rsvp-form--submitting');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.error || 'Something went wrong. Please try again.', 'error');
        return;
      }

      form.hidden = true;
      thankYou.classList.add('thank-you--visible');
      thankYou.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      form.classList.remove('rsvp-form--submitting');
      submitButton.disabled = false;
      submitButton.textContent = 'Send RSVP';
    }
  });
}
