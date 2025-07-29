// src/js/settings.js

const settingsBtn         = document.getElementById('settings-btn');
const modal               = document.getElementById('settings-modal');
const closeBtn            = modal.querySelector('.modal__close');
const overlay             = modal.querySelector('.modal__overlay');
const saveBtn             = modal.querySelector('.modal__save');
const resetButton         = document.querySelector('.modal__reset');
const checkbox            = document.querySelector('#dark-mode-toggle');
const fontSelect          = document.querySelector('#font-size-select');
const reducedMotionToggle = document.querySelector('#reduced-motion-toggle');
const motionWarning       = document.getElementById('motion-warning');

let userToggledMotion = false;

// 🧠 Restore saved reduced motion state, if available
const savedMotion = localStorage.getItem('reducedMotion');
if (savedMotion) {
  const shouldReduce = savedMotion === 'enabled';
  document.body.classList.toggle('reduced-motion', shouldReduce);
  reducedMotionToggle.checked = shouldReduce;
  userToggledMotion = true;

  if (motionWarning) {
    motionWarning.hidden = true;
  }
} else {
  updateMotionPreference(); // fallback auto-detect
}

// 🧁 Modal interactions
function openModal(event) {
  event.preventDefault();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  settingsBtn.focus();
}

settingsBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
saveBtn.addEventListener('click', () => {
  // your save logic here…
  closeModal();
});

// 🧹 Reset settings
resetButton.addEventListener('click', () => {
  if (confirm('WARNING! This will clear your selected preferences and will set all values back to the system default settings.')) {
    checkbox.checked = false;
    fontSelect.value = 'medium';
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');

    // Reset reduced motion preferences
    document.body.classList.remove('reduced-motion');
    reducedMotionToggle.checked = false;
    localStorage.removeItem('reducedMotion');
    userToggledMotion = false;

    if (motionWarning) {
      motionWarning.hidden = true;
    }

    updateMotionPreference(); // re-apply auto preference
    closeModal();
  }
});

// ⚙️ Manual reduced motion toggle
reducedMotionToggle.addEventListener('change', () => {
  userToggledMotion = true;
  const shouldReduce = reducedMotionToggle.checked;

  document.body.classList.toggle('reduced-motion', shouldReduce);
  localStorage.setItem('reducedMotion', shouldReduce ? 'enabled' : 'disabled');

  if (motionWarning) {
    motionWarning.hidden = true;
  }
});

// 🌍 Auto-detect screen size + system preference
function updateMotionPreference() {
  if (userToggledMotion) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.innerWidth <= 768;
  const shouldReduce = prefersReduced || isSmallScreen;

  document.body.classList.toggle('reduced-motion', shouldReduce);
  reducedMotionToggle.checked = shouldReduce;
  localStorage.setItem('reducedMotion', shouldReduce ? 'enabled' : 'disabled');

  if (motionWarning) {
    motionWarning.hidden = !shouldReduce;
  }

  // 🧪 Debugging info
  console.log({ prefersReduced, isSmallScreen, shouldReduce });
}

// 🖥 React to viewport changes
window.addEventListener('resize', updateMotionPreference);




