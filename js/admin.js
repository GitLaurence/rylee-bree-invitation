const KEY_STORAGE = 'admin_export_key';

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const adminPanel = document.getElementById('admin-panel');
const adminSummary = document.getElementById('admin-summary');
const tableBody = document.getElementById('admin-table-body');
const refreshButton = document.getElementById('refresh-button');
const logoutButton = document.getElementById('logout-button');

function showLoginError(text) {
  loginMessage.textContent = text;
  loginMessage.className = 'form-message form-message--visible form-message--error';
}

function clearLoginError() {
  loginMessage.textContent = '';
  loginMessage.className = 'form-message';
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

async function fetchRsvps(key) {
  const response = await fetch('/api/export', {
    headers: { 'x-admin-key': key },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json();
}

function renderRsvps(entries) {
  const totalGuests = entries.reduce((sum, e) => sum + 1 + (Number(e.guest_count) || 0), 0);
  adminSummary.textContent = `${entries.length} RSVP${entries.length === 1 ? '' : 's'} · ${totalGuests} total ${totalGuests === 1 ? 'guest' : 'guests'} expected`;

  tableBody.innerHTML = entries
    .map(
      (entry, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(entry.full_name)}</td>
        <td>${escapeHtml(entry.phone)}</td>
        <td>${escapeHtml(entry.guest_count)}</td>
        <td>${escapeHtml(entry.message)}</td>
        <td>${escapeHtml(formatDate(entry.created_at))}</td>
      </tr>
    `
    )
    .join('');
}

async function loadAndRender(key) {
  const entries = await fetchRsvps(key);
  entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  renderRsvps(entries);
  loginForm.hidden = true;
  adminPanel.hidden = false;
}

async function tryLogin(key) {
  clearLoginError();
  try {
    await loadAndRender(key);
    sessionStorage.setItem(KEY_STORAGE, key);
  } catch (err) {
    sessionStorage.removeItem(KEY_STORAGE);
    showLoginError(err.message === 'Unauthorized' ? 'Incorrect admin key.' : err.message);
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const key = document.getElementById('admin-key').value.trim();
  if (key) tryLogin(key);
});

refreshButton.addEventListener('click', () => {
  const key = sessionStorage.getItem(KEY_STORAGE);
  if (key) loadAndRender(key).catch((err) => showLoginError(err.message));
});

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem(KEY_STORAGE);
  adminPanel.hidden = true;
  loginForm.hidden = false;
  document.getElementById('admin-key').value = '';
});

const storedKey = sessionStorage.getItem(KEY_STORAGE);
if (storedKey) {
  tryLogin(storedKey);
}
