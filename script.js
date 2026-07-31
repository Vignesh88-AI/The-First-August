/* ==========================================================================
   KAWAII PASSCODE LOCK SCREEN - INTERACTIVE JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const heartsRing = document.getElementById('heartsRing');
  const pinBoxes = document.querySelectorAll('.pin-box');
  const keypadGrid = document.getElementById('keypadGrid');
  const successModal = document.getElementById('successModal');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');

  let enteredPin = '';
  const MAX_PIN_LENGTH = 4;

  // ==========================================================================
  // 1. GENERATE CONTINUOUS CIRCLE OF SMALL PINK HEARTS AROUND THE OVAL
  // ==========================================================================
  function renderHeartsRing() {
    if (!heartsRing) return;
    heartsRing.innerHTML = '';

    const totalHearts = 28;
    for (let i = 0; i < totalHearts; i++) {
      const angle = (i * 2 * Math.PI) / totalHearts - Math.PI / 2;
      const rx = 48.5;
      const ry = 48.5;
      const x = 50 + rx * Math.cos(angle);
      const y = 50 + ry * Math.sin(angle);

      const heart = document.createElement('div');
      heart.className = 'pink-heart-item';
      heart.innerHTML = '❤️';
      heart.style.left = `${x}%`;
      heart.style.top = `${y}%`;

      const rotDeg = (angle * 180) / Math.PI + 90;
      heart.style.transform = `translate(-50%, -50%) rotate(${rotDeg}deg)`;

      heartsRing.appendChild(heart);
    }
  }

  renderHeartsRing();
  window.addEventListener('resize', renderHeartsRing);

  // ==========================================================================
  // 2. PIN INPUT LOGIC & DISPLAY UPDATES
  // ==========================================================================
  function updatePinDisplay() {
    pinBoxes.forEach((box, index) => {
      if (index < enteredPin.length) {
        box.classList.add('filled');
      } else {
        box.classList.remove('filled');
      }
    });

    if (enteredPin.length === MAX_PIN_LENGTH) {
      setTimeout(() => {
        onPasscodeComplete();
      }, 250);
    }
  }

  function handleKeyPress(val) {
    if (enteredPin.length < MAX_PIN_LENGTH) {
      enteredPin += val;
      updatePinDisplay();
      playClickFeedback();
    }
  }

  function handleBackspace() {
    if (enteredPin.length > 0) {
      enteredPin = enteredPin.slice(0, -1);
      updatePinDisplay();
      playClickFeedback();
    }
  }

  function resetPin() {
    enteredPin = '';
    updatePinDisplay();
  }

  function onPasscodeComplete() {
    if (successModal) {
      successModal.classList.remove('hidden');
    }
  }

  function playClickFeedback() {
    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch (e) {}
    }
  }

  // ==========================================================================
  // 3. EVENT LISTENERS FOR KEYPAD BUTTONS & PHYSICAL KEYBOARD
  // ==========================================================================
  if (keypadGrid) {
    keypadGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.key-btn');
      if (!btn) return;
      const val = btn.getAttribute('data-val');
      if (val) handleKeyPress(val);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleKeyPress(e.key);
    } else if (e.key === '*' || e.key === '#') {
      handleKeyPress(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      resetPin();
    }
  });

  if (closeSuccessBtn && successModal) {
    closeSuccessBtn.addEventListener('click', () => {
      successModal.classList.add('hidden');
      resetPin();
    });
  }
});