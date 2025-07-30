document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('settings-modal');
  const overlay = document.getElementById('modal-overlay');
  const settingsBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-modal');
  const saveBtn = document.getElementById('save-settings');
  const resetBtn = document.getElementById('reset-settings');

  const darkToggle = document.getElementById('dark-mode-toggle');
  const motionToggle = document.getElementById('reduced-motion-toggle');
  const fontSelect = document.getElementById('font-size-select');

  let systemPrefCount = 0;
  const systemLocked = { dark: false, motion: false, font: false };
  let savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

  function lockControl(control, key) {
    if (!control) return;
    control.checked = true;
    control.disabled = true;
    systemLocked[key] = true;
    systemPrefCount++;

    const labelText = control.closest('label')?.querySelector('.label-text');
    if (labelText && !labelText.querySelector('.system-star')) {
      const star = document.createElement('span');
      star.className = 'system-star';
      star.textContent = '*';
      labelText.prepend(star);
    }
  }

  function refreshSystemSettings() {
    systemPrefCount = 0;
    Object.keys(systemLocked).forEach(key => systemLocked[key] = false);

    [darkToggle, motionToggle, fontSelect].forEach(el => {
      if (el) el.disabled = false;
      const star = el?.closest('label')?.querySelector('.system-star');
      if (star) star.remove();
    });

    localStorage.removeItem('userPreferences');
    savedPrefs = {};

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      lockControl(darkToggle, 'dark');
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lockControl(motionToggle, 'motion');
    }

    if (window.matchMedia('(prefers-contrast: more)').matches) {
      fontSelect.value = 'large';
      fontSelect.disabled = true;
      systemLocked.font = true;
      systemPrefCount++;
      document.documentElement.setAttribute('data-font-size', 'large');
    }

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
      document.documentElement.classList.toggle('dark-mode', savedPrefs.dark);
    }
    if (motionToggle && !systemLocked.motion && typeof savedPrefs.motion === 'boolean') {
      motionToggle.checked = savedPrefs.motion;
      document.documentElement.classList.toggle('reduced-motion', savedPrefs.motion);
    }
    if (fontSelect && !systemLocked.font && savedPrefs.font) {
      fontSelect.value = savedPrefs.font;
      document.documentElement.setAttribute('data-font-size', savedPrefs.font);
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

  saveBtn?.addEventListener('click', () => {
    const prefs = {};
    if (darkToggle && !systemLocked.dark) {
      prefs.dark = darkToggle.checked;
      document.documentElement.classList.toggle('dark-mode', prefs.dark);
    }
    if (motionToggle && !systemLocked.motion) {
      prefs.motion = motionToggle.checked;
      document.documentElement.classList.toggle('reduced-motion', prefs.motion);
    }
    if (fontSelect && !systemLocked.font) {
      prefs.font = fontSelect.value;
      document.documentElement.setAttribute('data-font-size', prefs.font);
    }
    savedPrefs = prefs;
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
    closeModal();
  });

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

  // 🌍 Listen for changes from other tabs
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

      // ✅ Update modal controls if open
      if (modal.classList.contains('is-open')) {
        restoreUserPreferences();
      }
    }
  });
});

