/* ==========================================================================
   Kawaii Passcode Lock & Secret Diary - JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Passcode Settings & State
  const CORRECT_PASSCODE = '1234';
  let enteredPasscode = '';
  
  // DOM Elements
  const slots = document.querySelectorAll('.slot');
  const slotsContainer = document.getElementById('slots-container');
  const keypadButtons = document.querySelectorAll('.key-btn');
  const secretModal = document.getElementById('secret-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const lockAppBtn = document.getElementById('lock-app-btn');
  const saveDiaryBtn = document.getElementById('save-diary-btn');
  const diaryTextarea = document.getElementById('diary-text');
  const currentDateString = document.getElementById('current-date-string');
  const starsOverlay = document.getElementById('stars-overlay');
  
  // Image & Fallback Elements
  const chickImage = document.getElementById('chick-image');
  const svgFallback = document.getElementById('svg-fallback');
  const imageFileInput = document.getElementById('image-file-input');

  // Set today's date in diary
  if (currentDateString) {
    const today = new Date();
    currentDateString.textContent = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Load saved diary note if exists
  const savedNote = localStorage.getItem('kawaii_secret_note');
  if (savedNote && diaryTextarea) {
    diaryTextarea.value = savedNote;
  }

  // --------------------------------------------------------------------------
  // Image Handling & Fallback System
  // --------------------------------------------------------------------------
  const candidateImageUrls = [
    localStorage.getItem('kawaii_custom_image'),
    'assets/left_illustration.jpg',
    'left_illustration.jpg',
    'media__1785527314376.jpg'
  ].filter(Boolean);

  let currentImageIdx = 0;

  function tryNextImage() {
    if (currentImageIdx < candidateImageUrls.length) {
      const url = candidateImageUrls[currentImageIdx++];
      chickImage.src = url;
    } else {
      // If all image files fail, hide broken img tag and keep SVG fallback
      chickImage.classList.add('hidden-img');
      if (svgFallback) svgFallback.style.display = 'flex';
    }
  }

  if (chickImage) {
    chickImage.onload = () => {
      chickImage.classList.remove('hidden-img');
      if (svgFallback) svgFallback.style.display = 'none';
    };

    chickImage.onerror = () => {
      tryNextImage();
    };

    tryNextImage();
  }

  // Custom Image File Picker
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          chickImage.src = dataUrl;
          chickImage.classList.remove('hidden-img');
          if (svgFallback) svgFallback.style.display = 'none';
          localStorage.setItem('kawaii_custom_image', dataUrl);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Web Audio API Synthesizer (Cute SFX)
  // --------------------------------------------------------------------------
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft cute pop sound for button clicks
  function playPopSound() {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  }

  // Error buzz sound
  function playErrorSound() {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(130, audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  }

  // Success melody on unlock
  function playSuccessSound() {
    initAudio();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = audioCtx.currentTime + idx * 0.09;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // --------------------------------------------------------------------------
  // Passcode Core Logic
  // --------------------------------------------------------------------------
  function handleInput(val) {
    playPopSound();

    if (val === '*') {
      // Backspace / Delete last digit
      if (enteredPasscode.length > 0) {
        enteredPasscode = enteredPasscode.slice(0, -1);
      }
    } else if (val === '#') {
      // Clear all
      enteredPasscode = '';
    } else if (enteredPasscode.length < 4) {
      // Add digit 0-9
      enteredPasscode += val;
    }

    updateSlotsUI();

    // Auto verify when 4 digits are entered
    if (enteredPasscode.length === 4) {
      setTimeout(verifyPasscode, 150);
    }
  }

  function updateSlotsUI() {
    slots.forEach((slot, idx) => {
      if (idx < enteredPasscode.length) {
        slot.classList.add('filled');
      } else {
        slot.classList.remove('filled');
      }
    });
  }

  function verifyPasscode() {
    if (enteredPasscode === CORRECT_PASSCODE) {
      // Correct passcode!
      playSuccessSound();
      triggerConfetti();
      
      setTimeout(() => {
        secretModal.classList.remove('hidden');
        enteredPasscode = '';
        updateSlotsUI();
      }, 400);

    } else {
      // Incorrect passcode!
      playErrorSound();
      slotsContainer.classList.add('shake');

      setTimeout(() => {
        slotsContainer.classList.remove('shake');
        enteredPasscode = '';
        updateSlotsUI();
      }, 500);
    }
  }

  // --------------------------------------------------------------------------
  // Keypad Event Listeners & Physical Keyboard Support
  // --------------------------------------------------------------------------
  keypadButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const val = button.getAttribute('data-val');
      
      // Visual press animation
      button.classList.add('btn-pressed');
      setTimeout(() => button.classList.remove('btn-pressed'), 150);

      handleInput(val);
    });
  });

  // Physical Keyboard Listener
  document.addEventListener('keydown', (e) => {
    // If modal is open, ignore numeric passcode input
    if (!secretModal.classList.contains('hidden')) return;

    let key = e.key;
    if (key >= '0' && key <= '9') {
      animateButtonByKey(key);
      handleInput(key);
    } else if (key === 'Backspace' || key === 'Delete') {
      animateButtonByKey('*');
      handleInput('*');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      animateButtonByKey('#');
      handleInput('#');
    }
  });

  function animateButtonByKey(val) {
    const btn = document.querySelector(`.key-btn[data-val="${val}"]`);
    if (btn) {
      btn.classList.add('btn-pressed');
      setTimeout(() => btn.classList.remove('btn-pressed'), 150);
    }
  }

  // --------------------------------------------------------------------------
  // Modal & Diary Actions
  // --------------------------------------------------------------------------
  closeModalBtn.addEventListener('click', () => {
    secretModal.classList.add('hidden');
  });

  lockAppBtn.addEventListener('click', () => {
    secretModal.classList.add('hidden');
    playPopSound();
  });

  saveDiaryBtn.addEventListener('click', () => {
    const text = diaryTextarea.value;
    localStorage.setItem('kawaii_secret_note', text);
    
    // Save visual feedback
    const originalText = saveDiaryBtn.textContent;
    saveDiaryBtn.textContent = '✅ Saved!';
    playSuccessSound();

    setTimeout(() => {
      saveDiaryBtn.textContent = originalText;
    }, 1500);
  });

  // --------------------------------------------------------------------------
  // Confetti / Celebration Particles
  // --------------------------------------------------------------------------
  function triggerConfetti() {
    const colors = ['#ffb3c1', '#ff758f', '#ff4d6d', '#fff0f3', '#ffe5ec', '#ffd166'];
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: ${Math.random() * 10 + 6}px;
        height: ${Math.random() * 10 + 6}px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
        pointer-events: none;
        z-index: 120;
        transform: translate(-50%, -50%);
        transition: transform 1s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s ease-out;
      `;
      document.body.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 250 + 100;
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity - 100;

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 360}deg)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => particle.remove(), 1100);
    }
  }

  // --------------------------------------------------------------------------
  // Background Shimmer Stars Generator for Left Panel
  // --------------------------------------------------------------------------
  function generateStars() {
    if (!starsOverlay) return;
    const starSymbols = ['✨', '⭐', '🌸', '💫'];
    
    for (let i = 0; i < 8; i++) {
      const star = document.createElement('span');
      star.className = 'sparkle-star';
      star.textContent = starSymbols[Math.floor(Math.random() * starSymbols.length)];
      star.style.left = `${Math.random() * 85 + 5}%`;
      star.style.top = `${Math.random() * 85 + 5}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${Math.random() * 2 + 2}s`;
      starsOverlay.appendChild(star);
    }
  }

  generateStars();

});
