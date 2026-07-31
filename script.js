/* ==========================================================================
   FOR MY SWEETHEART - CUSTOM ROMANCE WEB APP JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --------------------------------------------------------------------------
  // APP STATE & STORAGE
  // --------------------------------------------------------------------------
  const defaultState = {
    passcode: '1234',
    gfName: 'My Sweetheart',
    anniversaryDate: '2023-08-01',
    loveLetterMessage: `Every moment with you feels like a dream come true. You bring so much sunshine, laughter, and warm affection into my life. Thank you for being my favorite person, my best friend, and my endless joy. I love you more than words could ever say! 💕✨`
  };

  let state = { ...defaultState };

  // Load state from localStorage if available
  const savedState = localStorage.getItem('romanticAppState');
  if (savedState) {
    try {
      state = { ...defaultState, ...JSON.parse(savedState) };
    } catch (e) {
      console.warn('Could not load saved state:', e);
    }
  }

  let enteredCode = '';
  let audioContext = null;
  let isMusicPlaying = false;
  let musicInterval = null;

  // --------------------------------------------------------------------------
  // INITIALIZATION & UI SETUP
  // --------------------------------------------------------------------------
  generateHeartRing();
  setupKeypad();
  setupNavTabs();
  setupEnvelope();
  renderPolaroidGallery();
  renderReasonsGrid();
  setupPlayfulDateButtons();
  setupModals();
  updateCustomizedElements();
  startAnniversaryTimer();
  setupParticlesCanvas();

  // --------------------------------------------------------------------------
  // 1. GENERATE HEARTS AROUND OVAL FRAME (REPLICA OF SCREENSHOT)
  // --------------------------------------------------------------------------
  function generateHeartRing() {
    const heartRing = document.getElementById('heartRing');
    if (!heartRing) return;

    const heartCount = 28;
    const rx = 135; // Horizontal radius
    const ry = 185; // Vertical radius
    const centerX = 125;
    const centerY = 175;

    for (let i = 0; i < heartCount; i++) {
      const angle = (i / heartCount) * (2 * Math.PI) - (Math.PI / 2);
      const x = centerX + rx * Math.cos(angle);
      const y = centerY + ry * Math.sin(angle);
      const rotationDeg = (angle * (180 / Math.PI)) + 90;

      const heart = document.createElement('div');
      heart.className = 'mini-heart-node';
      heart.innerHTML = '❤️';
      heart.style.position = 'absolute';
      heart.style.left = `${x - 10}px`;
      heart.style.top = `${y - 10}px`;
      heart.style.fontSize = '14px';
      heart.style.transform = `rotate(${rotationDeg}deg)`;
      heart.style.pointerEvents = 'none';

      heartRing.appendChild(heart);
    }
  }

  // Fallback cute chick SVG generator if local image fails
  window.getChickSvgFallback = function() {
    return `
      <svg class="chick-svg-fallback" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
        <!-- Meadow Ground -->
        <ellipse cx="100" cy="210" rx="80" ry="20" fill="#c3e8bd" />
        <!-- Chick Body -->
        <ellipse cx="100" cy="140" rx="65" ry="60" fill="#ffe066" />
        <circle cx="100" cy="90" r="50" fill="#fff099" />
        <!-- Rosy Cheeks -->
        <circle cx="70" cy="95" r="10" fill="#ffb3c1" opacity="0.7" />
        <circle cx="130" cy="95" r="10" fill="#ffb3c1" opacity="0.7" />
        <!-- Eyes -->
        <circle cx="82" cy="85" r="4" fill="#333" />
        <circle cx="118" cy="85" r="4" fill="#333" />
        <!-- Beak -->
        <path d="M 92 92 Q 100 102 108 92 Z" fill="#ff9900" />
        <!-- Feet -->
        <ellipse cx="80" cy="195" rx="14" ry="8" fill="#ff9900" />
        <ellipse cx="120" cy="195" rx="14" ry="8" fill="#ff9900" />
        <!-- Bouquet of Flowers -->
        <g transform="translate(100, 130)">
          <!-- Stems -->
          <path d="M -10 20 Q -5 0 -15 -20" stroke="#52b788" stroke-width="3" fill="none" />
          <path d="M 0 20 Q 0 0 0 -25" stroke="#52b788" stroke-width="3" fill="none" />
          <path d="M 10 20 Q 5 0 15 -20" stroke="#52b788" stroke-width="3" fill="none" />
          <!-- Flowers -->
          <circle cx="-15" cy="-20" r="12" fill="#ff85a1" />
          <circle cx="-15" cy="-20" r="4" fill="#ffe066" />
          <circle cx="0" cy="-25" r="12" fill="#ffd166" />
          <circle cx="0" cy="-25" r="4" fill="#ffffff" />
          <circle cx="15" cy="-20" r="12" fill="#70d6ff" />
          <circle cx="15" cy="-20" r="4" fill="#ffe066" />
        </g>
        <!-- Cute Chick Wings -->
        <path d="M 40 120 Q 30 140 50 150" stroke="#ffcc00" stroke-width="8" stroke-linecap="round" fill="none" />
        <path d="M 160 120 Q 170 140 150 150" stroke="#ffcc00" stroke-width="8" stroke-linecap="round" fill="none" />
      </svg>
    `;
  };

  // --------------------------------------------------------------------------
  // 2. PASSCODE & KEYPAD LOGIC
  // --------------------------------------------------------------------------
  function setupKeypad() {
    const keyBtns = document.querySelectorAll('.key-btn');
    keyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        handleKeyPress(key);
      });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      const lockScreen = document.getElementById('lockScreen');
      if (lockScreen.classList.contains('hidden')) return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace' || e.key === '*') {
        handleKeyPress('*');
      } else if (e.key === 'Enter') {
        if (enteredCode.length === 4) checkPasscode();
      }
    });
  }

  function handleKeyPress(key) {
    playClickSound();

    if (key === '*') {
      // Clear last digit
      if (enteredCode.length > 0) {
        enteredCode = enteredCode.slice(0, -1);
      }
    } else if (key === '#') {
      // Open hint modal
      openModal('hintModal');
      return;
    } else {
      // Add digit
      if (enteredCode.length < 4) {
        enteredCode += key;
      }
    }

    updatePinDisplay();

    // Check code automatically when 4 digits are entered
    if (enteredCode.length === 4) {
      setTimeout(checkPasscode, 200);
    }
  }

  function updatePinDisplay() {
    const pinBoxes = document.querySelectorAll('.pin-box');
    pinBoxes.forEach((box, idx) => {
      if (idx < enteredCode.length) {
        box.classList.add('filled');
      } else {
        box.classList.remove('filled');
      }
    });
  }

  function checkPasscode() {
    const pinDisplay = document.getElementById('pinDisplay');
    const errorToast = document.getElementById('errorToast');

    if (enteredCode === state.passcode) {
      // Correct Passcode!
      playSuccessChime();
      triggerConfettiBurst();

      setTimeout(() => {
        const lockScreen = document.getElementById('lockScreen');
        const unlockedPortal = document.getElementById('unlockedPortal');
        
        lockScreen.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        lockScreen.style.opacity = '0';
        lockScreen.style.transform = 'scale(0.95)';

        setTimeout(() => {
          lockScreen.classList.add('hidden');
          unlockedPortal.classList.remove('hidden');
          unlockedPortal.style.animation = 'fadeIn 0.8s ease forwards';
          // Start background music automatically
          startRomanticMusic();
        }, 600);
      }, 300);

    } else {
      // Incorrect Passcode!
      playErrorSound();
      pinDisplay.classList.add('shake');
      errorToast.classList.add('show');

      setTimeout(() => {
        pinDisplay.classList.remove('shake');
        errorToast.classList.remove('show');
        enteredCode = '';
        updatePinDisplay();
      }, 900);
    }
  }

  // --------------------------------------------------------------------------
  // 3. WEB AUDIO API SYNTHESIZER (SOUND & ROMANTIC MUSIC)
  // --------------------------------------------------------------------------
  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playClickSound() {
    try {
      initAudioContext();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 0.08);
    } catch (e) {
      // Audio fallback
    }
  }

  function playErrorSound() {
    try {
      initAudioContext();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, audioContext.currentTime);
      osc.frequency.setValueAtTime(180, audioContext.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 0.3);
    } catch (e) {}
  }

  function playSuccessChime() {
    try {
      initAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0, audioContext.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(audioContext.currentTime + idx * 0.1);
        osc.stop(audioContext.currentTime + idx * 0.1 + 0.5);
      });
    } catch (e) {}
  }

  // Soft Romantic Arpeggio Music Synth
  function startRomanticMusic() {
    if (isMusicPlaying) return;
    initAudioContext();
    isMusicPlaying = true;

    const musicBtn = document.getElementById('musicToggleBtn');
    if (musicBtn) {
      musicBtn.classList.add('playing');
      musicBtn.querySelector('.music-text').textContent = 'Pause Music';
    }

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 523.25]; // Romantic sequence
    let noteIdx = 0;

    musicInterval = setInterval(() => {
      if (!isMusicPlaying) return;
      try {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx], audioContext.currentTime);

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 0.8);

        noteIdx = (noteIdx + 1) % notes.length;
      } catch (e) {}
    }, 450);
  }

  function stopRomanticMusic() {
    isMusicPlaying = false;
    if (musicInterval) clearInterval(musicInterval);
    const musicBtn = document.getElementById('musicToggleBtn');
    if (musicBtn) {
      musicBtn.classList.remove('playing');
      musicBtn.querySelector('.music-text').textContent = 'Play Music';
    }
  }

  document.getElementById('musicToggleBtn').addEventListener('click', () => {
    if (isMusicPlaying) {
      stopRomanticMusic();
    } else {
      startRomanticMusic();
    }
  });

  // --------------------------------------------------------------------------
  // 4. NAVIGATION TABS LOGIC
  // --------------------------------------------------------------------------
  function setupNavTabs() {
    const navTabs = document.querySelectorAll('.nav-tab:not(.settings-tab-btn)');
    const tabPages = document.querySelectorAll('.tab-page');

    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        navTabs.forEach(t => t.classList.remove('active'));
        tabPages.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. LOVE LETTER ENVELOPE LOGIC
  // --------------------------------------------------------------------------
  function setupEnvelope() {
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    const waxSeal = document.getElementById('waxSeal');
    const letterCard = document.getElementById('letterCard');
    const typedLetterContent = document.getElementById('typedLetterContent');

    waxSeal.addEventListener('click', () => {
      document.getElementById('envelopeFlap').style.transform = 'rotateX(180deg)';
      waxSeal.style.opacity = '0';
      waxSeal.style.transform = 'scale(0.5)';

      setTimeout(() => {
        envelopeWrapper.style.transition = 'all 0.5s ease';
        envelopeWrapper.style.opacity = '0';
        envelopeWrapper.style.transform = 'translateY(-20px)';

        setTimeout(() => {
          envelopeWrapper.classList.add('hidden');
          letterCard.classList.remove('hidden');
          typeWriterEffect(typedLetterContent, state.loveLetterMessage, 35);
        }, 400);
      }, 500);
    });
  }

  function typeWriterEffect(element, text, speed) {
    element.innerHTML = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // --------------------------------------------------------------------------
  // 6. POLAROID MEMORY GALLERY LOGIC
  // --------------------------------------------------------------------------
  function renderPolaroidGallery() {
    const grid = document.getElementById('polaroidGrid');
    if (!grid) return;

    const memories = [
      { caption: "Our First Date 💕", rotation: -4, color: "#ffe5ec" },
      { caption: "Sweetest Smiles ✨", rotation: 5, color: "#e2f4e0" },
      { caption: "Late Night Talks 🌙", rotation: -6, color: "#e0f2fe" },
      { caption: "Forever & Always 💖", rotation: 3, color: "#fef3c7" }
    ];

    grid.innerHTML = '';
    memories.forEach((mem, idx) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';
      card.style.setProperty('--rotation', mem.rotation);

      card.innerHTML = `
        <div class="polaroid-img-box" style="background: ${mem.color}">
          <span style="font-size: 3.5rem;">📷</span>
        </div>
        <div class="polaroid-caption">${mem.caption}</div>
      `;

      grid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 7. 10 REASONS WHY I LOVE YOU CARDS
  // --------------------------------------------------------------------------
  function renderReasonsGrid() {
    const grid = document.getElementById('reasonsGrid');
    if (!grid) return;

    const reasons = [
      { num: 1, icon: "😊", text: "Your radiant smile instantly brightens up my whole world." },
      { num: 2, icon: "🥰", text: "How deeply caring and kind you are to everyone around you." },
      { num: 3, icon: "🤗", text: "Your warm, cozy hugs that make me feel safe and loved." },
      { num: 4, icon: "🎵", text: "The adorable way you sing and dance when you're happy." },
      { num: 5, icon: "💬", text: "Our endless conversations where hours feel like seconds." },
      { num: 6, icon: "🌟", text: "How you inspire me every single day to be a better person." },
      { num: 7, icon: "☕", text: "Sharing quiet lazy mornings and cozy coffee moments together." },
      { num: 8, icon: "🎨", text: "Your unique, beautiful creativity and sweet imagination." },
      { num: 9, icon: "💖", text: "The gentle, loving touch that always calms my heart." },
      { num: 10, icon: "👑", text: "Simply because you are YOU—my perfect dream partner!" }
    ];

    grid.innerHTML = '';
    reasons.forEach(r => {
      const card = document.createElement('div');
      card.className = 'reason-card';
      card.innerHTML = `
        <div class="reason-inner">
          <div class="reason-front">
            <span class="reason-num">Reason #${r.num}</span>
            <span class="reason-icon">${r.icon}</span>
            <small style="color: #888; margin-top: 8px;">Tap to reveal</small>
          </div>
          <div class="reason-back">
            <p>${r.text}</p>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        playClickSound();
      });

      grid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 8. PLAYFUL DATE REQUEST BUTTON LOGIC (RUNAWAY NO BUTTON)
  // --------------------------------------------------------------------------
  function setupPlayfulDateButtons() {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');

    if (yesBtn) {
      yesBtn.addEventListener('click', () => {
        playSuccessChime();
        triggerConfettiBurst();
        openModal('celebrationModal');
      });
    }

    if (noBtn) {
      const dodgeNo = () => {
        const card = noBtn.closest('.date-card');
        const cardRect = card.getBoundingClientRect();
        
        const randomX = (Math.random() - 0.5) * (cardRect.width - 100);
        const randomY = (Math.random() - 0.5) * (cardRect.height - 80);

        noBtn.style.position = 'absolute';
        noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
      };

      noBtn.addEventListener('mouseover', dodgeNo);
      noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        dodgeNo();
      });
    }
  }

  // --------------------------------------------------------------------------
  // 9. SETTINGS & MODALS LOGIC
  // --------------------------------------------------------------------------
  function setupModals() {
    document.getElementById('openSettingsBtn').addEventListener('click', () => openModal('settingsModal'));
    document.getElementById('closeSettingsBtn').addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('hintBtn').addEventListener('click', () => openModal('hintModal'));
    document.getElementById('closeHintBtn').addEventListener('click', () => closeModal('hintModal'));
    document.getElementById('closeCelebrationBtn').addEventListener('click', () => closeModal('celebrationModal'));

    // Save settings
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      const newName = document.getElementById('inputGfName').value.trim();
      const newPasscode = document.getElementById('inputPasscode').value.trim();
      const newAnniv = document.getElementById('inputAnniversary').value;
      const newLetter = document.getElementById('inputLoveMessage').value.trim();

      if (newName) state.gfName = newName;
      if (newPasscode && newPasscode.length === 4) state.passcode = newPasscode;
      if (newAnniv) state.anniversaryDate = newAnniv;
      if (newLetter) state.loveLetterMessage = newLetter;

      localStorage.setItem('romanticAppState', JSON.stringify(state));
      updateCustomizedElements();
      closeModal('settingsModal');
      alert('Settings updated successfully! 💕');
    });
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  }

  function updateCustomizedElements() {
    document.querySelectorAll('.custom-gf-name').forEach(el => el.textContent = state.gfName);
    document.getElementById('portalGreeting').textContent = `Welcome, My Love (${state.gfName})! 💕`;
    document.getElementById('inputGfName').value = state.gfName;
    document.getElementById('inputPasscode').value = state.passcode;
    document.getElementById('inputAnniversary').value = state.anniversaryDate;
    document.getElementById('inputLoveMessage').value = state.loveLetterMessage;
    document.getElementById('hintText').innerHTML = `The secret passcode is set to <strong>${state.passcode}</strong>! Enter it on the keypad 💕`;
  }

  // --------------------------------------------------------------------------
  // 10. ANNIVERSARY COUNTDOWN TIMER
  // --------------------------------------------------------------------------
  function startAnniversaryTimer() {
    function updateCounter() {
      const anniv = new Date(state.anniversaryDate);
      const now = new Date();
      const diffTime = Math.abs(now - anniv);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const counterEl = document.getElementById('anniversaryCountdown');
      if (counterEl) {
        counterEl.textContent = `${diffDays} Beautiful Days Together 💕`;
      }
    }
    updateCounter();
    setInterval(updateCounter, 60000);
  }

  // --------------------------------------------------------------------------
  // 11. PARTICLES & CONFETTI CANVAS
  // --------------------------------------------------------------------------
  let particles = [];
  function setupParticlesCanvas() {
    const canvas = document.getElementById('canvasParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Continuous floating ambient hearts
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 12 + 8,
        speedY: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        char: ['💖', '💕', '✨', '🌸'][Math.floor(Math.random() * 4)]
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.y -= p.speedY;
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }

        ctx.font = `${p.size}px sans-serif`;
        ctx.globalAlpha = p.opacity;
        ctx.fillText(p.char, p.x, p.y);
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  function triggerConfettiBurst() {
    const canvas = document.getElementById('canvasParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 16 + 10,
        speedX: (Math.random() - 0.5) * 14,
        speedY: (Math.random() - 0.5) * 14 - 3,
        opacity: 1,
        char: ['🎉', '💖', '🌹', '✨', '⭐', '🌸'][Math.floor(Math.random() * 6)]
      });
    }
  }

});
