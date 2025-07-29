// src/js/settings.js

// 1. Element references
const settingsBtn    = document.getElementById('settings-btn');
const modal          = document.getElementById('settings-modal');
const overlay        = modal.querySelector('.modal__overlay');
const closeBtn       = modal.querySelector('.button--modal-close');
const saveBtn        = modal.querySelector('.button--modal-save');
const resetBtn       = modal.querySelector('.button--modal-reset');

const darkToggle     = document.getElementById('dark-mode-toggle');
const motionToggle   = document.getElementById('reduced-motion-toggle');
const fontSelect     = document.getElementById('font-size-select');
const motionWarning  = document.getElementById('motion-warning');

let userToggledMotion = false;
let lastFocusedEl     = null;

// 2. LocalStorage keys
const STORAGE_KEYS = {
  dark:     'pref-dark-mode',
  motion:   'pref-reduced-motion',
  fontSize: 'pref-font-size'
};

// 3. Load saved preferences (or defaults)
function loadSettings() {
  return {
    dark:     JSON.parse(localStorage.getItem(STORAGE_KEYS.dark))     || false,
    motion:   JSON.parse(localStorage.getItem(STORAGE_KEYS.motion))   || null,
    fontSize: localStorage.getItem(STORAGE_KEYS.fontSize)             || 'medium'
  };
}

// 4. Apply to document
function applySettings({ dark, motion, fontSize }) {
  // Dark mode
  document.body.classList.toggle('dark-mode', dark);

  // Font size via data-attribute on <html>
  document.documentElement.setAttribute('data-font-size', fontSize);

  // Reduced motion: if null => auto-detect
  let shouldReduce;
  if (motion === null) {
    shouldReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                || window.innerWidth <= 768;
  } else {
    shouldReduce = motion;
  }
  document.body.classList.toggle('reduced-motion', shouldReduce);
  if (motionWarning) motionWarning.hidden = !shouldReduce;
}

// 5. Populate the form controls inside modal
function populateForm({ dark, motion, fontSize }) {
  darkToggle.checked    = dark;
  fontSelect.value      = fontSize;
  userToggledMotion     = motion !== null;
  motionToggle.checked  = motion !== null
                         ? motion
                         : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionWarning) motionWarning.hidden = userToggledMotion;
}

// 6. Persist settings
function saveSettings({ dark, motion, fontSize }) {
  localStorage.setItem(STORAGE_KEYS.dark,     JSON.stringify(dark));
  localStorage.setItem(STORAGE_KEYS.motion,   JSON.stringify(motion));
  localStorage.setItem(STORAGE_KEYS.fontSize, fontSize);
}

// 7. Open/Close modal + focus management
function openModal(e) {
  e.preventDefault();
  lastFocusedEl = document.activeElement;
  populateForm(loadSettings());

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // focus first control
  darkToggle.focus();
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  // return focus
  if (lastFocusedEl) lastFocusedEl.focus();
}

// 8. Event listeners

// Open / Close
settingsBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Escape key to close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal();
  }
});

// Save
saveBtn.addEventListener('click', () => {
  const newPrefs = {
    dark:     darkToggle.checked,
    motion:   motionToggle.checked,
    fontSize: fontSelect.value
  };
  applySettings(newPrefs);
  saveSettings(newPrefs);
  closeModal();

  // inside your saveBtn listener
saveBtn.addEventListener('click', () => {
  console.log('💬 Save clicked – fontSelect.value =', fontSelect.value);
  const newPrefs = {
    dark:     darkToggle.checked,
    motion:   motionToggle.checked,
    fontSize: fontSelect.value
  };
  applySettings(newPrefs);
  saveSettings(newPrefs);
  closeModal();
});
});

// Reset to system default
resetBtn.addEventListener('click', () => {
  if (!confirm('This will restore system default preferences. Proceed?')) return;

  const defaults = { dark: false, motion: null, fontSize: 'medium' };
  applySettings(defaults);
  populateForm(defaults);

  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  closeModal();
});

// Real-time toggles
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', darkToggle.checked);
});

//  ――――― Integrate font-size logic ―――――

// Apply & persist immediately when user picks a new font-size
fontSelect.addEventListener('change', () => {
  const size = fontSelect.value;              // 'small' | 'medium' | 'large'
  document.documentElement.setAttribute('data-font-size', size);
  localStorage.setItem(STORAGE_KEYS.fontSize, size);
});

// Reduced-motion toggle
motionToggle.addEventListener('change', () => {
  userToggledMotion = true;
  document.body.classList.toggle('reduced-motion', motionToggle.checked);
  if (motionWarning) motionWarning.hidden = true;
});

// 9. Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const prefs = loadSettings();

  // Populate the form (so the <select> shows the right value even before opening)
  populateForm(prefs);

  // Apply all saved or auto-detected settings
  applySettings(prefs);
});




