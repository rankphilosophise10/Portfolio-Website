document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('settings-modal');
  const overlay = document.getElementById('modal-overlay');
  const settingsBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-modal');
  const resetBtn = document.getElementById('reset-settings');

  const darkToggle = document.getElementById('dark-mode-toggle');
  const motionToggle = document.getElementById('reduced-motion-toggle');
  const fontSelect = document.getElementById('font-size-select');

  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  let systemLocked = { dark: false, motion: false, font: false };
  let savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');

  applyInitialPreferences();

  // 🛡️ Utility: lock control if system preference is active
  function maybeLockControl(control, key, systemPrefActive) {
    if (!control || !systemPrefActive) return;
    lockControl(control, key);
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const isDark = e.matches;
    document.documentElement.classList.toggle('dark-mode', isDark);

    maybeLockControl(darkToggle, 'dark', isDark);

    if (!savedPrefs.dark) {
      savedPrefs.dark = isDark;
      localStorage.setItem('userPreferences', JSON.stringify(savedPrefs));
    }

    if (modal.classList.contains('is-open') && darkToggle && !systemLocked.dark) {
      darkToggle.checked = isDark;
    }
  });

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    const isReduced = e.matches;
    document.documentElement.classList.toggle('reduced-motion', isReduced);

    maybeLockControl(motionToggle, 'motion', isReduced);

    if (!savedPrefs.motion) {
      savedPrefs.motion = isReduced;
      localStorage.setItem('userPreferences', JSON.stringify(savedPrefs));
    }

    if (modal.classList.contains('is-open') && motionToggle && !systemLocked.motion) {
      motionToggle.checked = isReduced;
    }
  });

  function applyInitialPreferences() {
    savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');

    if (typeof savedPrefs.dark === 'boolean') {
      document.documentElement.classList.toggle('dark-mode', savedPrefs.dark);
      if (darkToggle && !systemLocked.dark) darkToggle.checked = savedPrefs.dark;
    }

    if (typeof savedPrefs.motion === 'boolean') {
      document.documentElement.classList.toggle('reduced-motion', savedPrefs.motion);
      if (motionToggle && !systemLocked.motion) motionToggle.checked = savedPrefs.motion;
    }

    if (savedPrefs.font) {
      document.documentElement.setAttribute('data-font-size', savedPrefs.font);
      if (fontSelect && !systemLocked.font) fontSelect.value = savedPrefs.font;
    }
  }

  function lockControl(control, key) {
    if (!control) return;
    control.checked = true;
    control.disabled = true;
    systemLocked[key] = true;

    const labelText = control.closest('label')?.querySelector('.label-text');
    if (labelText && !labelText.querySelector('.system-star')) {
      const star = document.createElement('span');
      star.className = 'system-star';
      star.textContent = '*';
      labelText.prepend(star);
    }
  }

  function refreshSystemSettings() {
    systemLocked = { dark: false, motion: false, font: false };

    [darkToggle, motionToggle, fontSelect].forEach(el => {
      if (el) el.disabled = false;
      el?.closest('label')?.querySelector('.system-star')?.remove();
    });

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersMotionReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersContrastMore = window.matchMedia('(prefers-contrast: more)').matches;

    maybeLockControl(darkToggle, 'dark', prefersDark);
    maybeLockControl(motionToggle, 'motion', prefersMotionReduce);
    maybeLockControl(fontSelect, 'font', prefersContrastMore);

    const userHadMotionPref = typeof savedPrefs.motion === 'boolean';
    if (isSmallScreen && !systemLocked.motion && !userHadMotionPref) {
      lockControl(motionToggle, 'motion');
      document.documentElement.classList.add('auto-reduce-motion');
      document.documentElement.setAttribute('data-motion-level', 'none');
    }
  }

  function restoreUserPreferences() {
    if (darkToggle && !systemLocked.dark && typeof savedPrefs.dark === 'boolean') {
      darkToggle.checked = savedPrefs.dark;
    }

    if (motionToggle && !systemLocked.motion && typeof savedPrefs.motion === 'boolean') {
      motionToggle.checked = savedPrefs.motion;
    }

    if (fontSelect && !systemLocked.font && savedPrefs.font) {
      fontSelect.value = savedPrefs.font;
    }
  }

  function openModal() {
    refreshSystemSettings();
    restoreUserPreferences();
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    trapFocus(modal);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  resetBtn?.addEventListener('click', () => {
    localStorage.removeItem('userPreferences');
    savedPrefs = {};

    if (darkToggle && !systemLocked.dark) {
      darkToggle.checked = false;
      document.documentElement.classList.remove('dark-mode');
    }

    if (motionToggle && !systemLocked.motion) {
      motionToggle.checked = false;
      document.documentElement.classList.remove('reduced-motion');
    }

    if (fontSelect && !systemLocked.font) {
      fontSelect.value = 'medium';
      document.documentElement.setAttribute('data-font-size', 'medium');
    }

    closeModal();
  });

  settingsBtn?.addEventListener('click', e => {
    e.preventDefault();
    openModal();
  });

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  darkToggle?.addEventListener('change', () => {
    if (!systemLocked.dark) {
      const value = darkToggle.checked;
      document.documentElement.classList.toggle('dark-mode', value);
      savedPrefs.dark = value;
      localStorage.setItem('userPreferences', JSON.stringify(savedPrefs));
    }
  });

  motionToggle?.addEventListener('change', () => {
    if (!systemLocked.motion) {
      const value = motionToggle.checked;
      document.documentElement.classList.toggle('reduced-motion', value);
      savedPrefs.motion = value;
      localStorage.setItem('userPreferences', JSON.stringify(savedPrefs));
    }
  });

  fontSelect?.addEventListener('change', () => {
    const selected = fontSelect.value;
    if (!systemLocked.font) {
      document.documentElement.setAttribute('data-font-size', selected);
      savedPrefs.font = selected;
      localStorage.setItem('userPreferences', JSON.stringify(savedPrefs));
    }
  });

  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    container.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  window.addEventListener('storage', event => {
    if (event.key === 'userPreferences') {
      savedPrefs = JSON.parse(event.newValue || '{}');

      if (!systemLocked.dark && typeof savedPrefs.dark === 'boolean') {
        darkToggle.checked = savedPrefs.dark;
        document.documentElement.classList.toggle('dark-mode', savedPrefs.dark);
      }

      if (!systemLocked.motion && typeof savedPrefs.motion === 'boolean') {
        motionToggle.checked = savedPrefs.motion;
        document.documentElement.classList.toggle('reduced-motion', savedPrefs.motion);
      }

      if (!systemLocked.font && savedPrefs.font) {
        fontSelect.value = savedPrefs.font;
        document.documentElement.setAttribute('data-font-size', savedPrefs.font);
      }

      if (modal.classList.contains('is-open')) {
        restoreUserPreferences();
      }
    }
  });
});
