const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (!EMAIL_RE.test(data.email)) return 'Please enter a valid email address.';
  if (data.attending === null) return 'Please let us know if you can make it.';
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

    const attendingValue = formData.get('attending');
    const data = {
      full_name: (formData.get('full_name') || '').toString(),
      email: (formData.get('email') || '').toString(),
      attending: attendingValue === null ? null : attendingValue === 'true',
      guest_count: Number(formData.get('guest_count') || 0),
      meal_preference: (formData.get('meal_preference') || '').toString(),
      message: (formData.get('message') || '').toString(),
    };

    const validationError = validate(data);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.error || 'Something went wrong. Please try again.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Send RSVP';
        return;
      }

      form.hidden = true;
      thankYou.classList.add('thank-you--visible');
    } catch (err) {
      showMessage('Network error. Please check your connection and try again.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Send RSVP';
    }
  });
}
