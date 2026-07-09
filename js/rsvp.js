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

function validate(data) {
  if (!data.full_name.trim()) return 'Please enter your name.';
  if (!PHONE_RE.test(data.phone)) return 'Please enter a valid phone number.';
  if (data.guest_count < 0 || data.guest_count > 20) return 'Guest count must be between 0 and 20.';
  return null;
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

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
      showMessage(validationError, 'error');
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
