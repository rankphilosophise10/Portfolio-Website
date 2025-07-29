document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('settings-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-modal');
  const saveBtn = document.getElementById('save-settings');
  const resetBtn = document.getElementById('reset-settings');

  const darkToggle = document.getElementById('dark-mode-toggle');
  const motionToggle = document.getElementById('reduced-motion-toggle');
  const fontSelect = document.getElementById('font-size-select');
  const motionTooltip = document.getElementById('motion-tooltip');

  const summaryMessage = document.createElement('p');
  summaryMessage.className = 'system-preference-message';
  summaryMessage.textContent =
    "Some settings are being automatically applied based on your system's preferred experience settings or screen size and cannot be overridden here.";
  summaryMessage.hidden = true;
  document.querySelector('.modal__body')?.appendChild(summaryMessage);

  let systemPrefCount = 0;
  const systemLocked = {
    dark: false,
    motion: false,
    font: false,
  };

  function lockControl(control, key) {
    if (control) {
      control.checked = true;
      control.disabled = true;
      systemLocked[key] = true;
      systemPrefCount++;
    }
  }

  const savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  const userHasMotionPref = typeof savedPrefs.motion === 'boolean';
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    lockControl(darkToggle, 'dark');
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lockControl(motionToggle, 'motion');
    if (motionTooltip) motionTooltip.hidden = false;
  }

  if (window.matchMedia('(prefers-contrast: more)').matches) {
    if (fontSelect) {
      fontSelect.value = 'large';
      fontSelect.disabled = true;
      systemLocked.font = true;
      systemPrefCount++;
      document.documentElement.setAttribute('data-font-size', 'large');
    }
  }

  if (isSmallScreen && !systemLocked.motion && !userHasMotionPref) {
    lockControl(motionToggle, 'motion');
    document.documentElement.classList.add('auto-reduce-motion');
    document.documentElement.setAttribute('data-motion-level', 'none');
    if (motionTooltip) motionTooltip.hidden = false;
  }

  if (systemPrefCount > 0) summaryMessage.hidden = false;

  // Restore saved preferences
  if (darkToggle && !systemLocked.dark && typeof savedPrefs.dark === 'boolean') {
    darkToggle.checked = savedPrefs.dark;
  }
  if (motionToggle && !systemLocked.motion && typeof savedPrefs.motion === 'boolean') {
    motionToggle.checked = savedPrefs.motion;
  }
  if (fontSelect && !systemLocked.font && savedPrefs.font) {
    fontSelect.value = savedPrefs.font;
    document.documentElement.setAttribute('data-font-size', savedPrefs.font);
  }

  // 💾 Save preferences and close modal
  saveBtn?.addEventListener('click', () => {
    const prefs = {};

    if (darkToggle && !systemLocked.dark) {
      prefs.dark = darkToggle.checked;
    }
    if (motionToggle && !systemLocked.motion) {
      prefs.motion = motionToggle.checked;
    }
    if (fontSelect && !systemLocked.font) {
      prefs.font = fontSelect.value;
      document.documentElement.setAttribute('data-font-size', prefs.font);
    }

    localStorage.setItem('userPreferences', JSON.stringify(prefs));
    modal?.classList.remove('is-open');
  });

  // 🔄 Reset preferences and close modal
  resetBtn?.addEventListener('click', () => {
    localStorage.removeItem('userPreferences');

    if (darkToggle && !systemLocked.dark) {
      darkToggle.checked = false;
    }
    if (motionToggle && !systemLocked.motion) {
      motionToggle.checked = false;
    }
    if (fontSelect && !systemLocked.font) {
      fontSelect.value = 'medium';
      document.documentElement.setAttribute('data-font-size', 'medium');
    }

    modal?.classList.remove('is-open');
  });

  // 📂 Open modal
  settingsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    modal?.classList.toggle('is-open');
    if (modal?.classList.contains('is-open')) {
      trapFocus(modal);
    }
  });

  // ❌ Close modal
  closeBtn?.addEventListener('click', () => {
    modal?.classList.remove('is-open');
  });

  // ⌨️ Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal?.classList.remove('is-open');
    }
  });

  // 🖱 Real-time font-size changes
  fontSelect?.addEventListener('change', () => {
    const selected = fontSelect.value;
    if (!systemLocked.font) {
      document.documentElement.setAttribute('data-font-size', selected);
      savedPrefs.font = selected;
      localStorage.setItem('userPreferences', JSON.stringify(savedPrefs));
    }
  });

  // 🔒 Trap focus inside modal
  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }
});








