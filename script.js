/* ==========================================================================
   Girlfriend Day Passcode Webpage - JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Passcode
  const CORRECT_PASSCODE = '2910';
  let enteredPasscode = '';

  // DOM Elements
  const slots          = document.querySelectorAll('.slot');
  const slotsContainer = document.getElementById('slots-container');
  const keypadButtons  = document.querySelectorAll('.key-btn');
  const secretModal    = document.getElementById('secret-modal');
  const closeModalBtn  = document.getElementById('close-modal-btn');
  const lockAppBtn     = document.getElementById('lock-app-btn');
  const diaryTextarea  = document.getElementById('diary-text');
  const dateEl         = document.getElementById('current-date-string');

  // Set today's date
  if (dateEl) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // Special message for your girlfriend
  const specialMessage =
    'Happy Girlfriend Day, my love! \n\n' +
    'Every moment with you is a gift I never take for granted. ' +
    'Thank you for being the most wonderful person in my life. ' +
    'I love you more than words can say. \n\n' +
    '\u2014 Always yours';

  if (diaryTextarea) {
    diaryTextarea.value = specialMessage;
    diaryTextarea.readOnly = true;
  }

  // Web Audio API
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playPop() {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, audioCtx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.07);
  }

  function playError() {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(130, audioCtx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.25);
  }

  function playSuccess() {
    initAudio();
    if (!audioCtx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = audioCtx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(t); osc.stop(t + 0.2);
    });
  }

  // Passcode Logic
  function handleInput(val) {
    playPop();
    if (val === '*') {
      enteredPasscode = enteredPasscode.slice(0, -1);
    } else if (val === '#') {
      enteredPasscode = '';
    } else if (enteredPasscode.length < 4) {
      enteredPasscode += val;
    }
    updateSlots();
    if (enteredPasscode.length === 4) setTimeout(verify, 150);
  }

  function updateSlots() {
    slots.forEach((slot, i) => slot.classList.toggle('filled', i < enteredPasscode.length));
  }

  function verify() {
    if (enteredPasscode === CORRECT_PASSCODE) {
      playSuccess();
      triggerConfetti();
      setTimeout(() => {
        secretModal.classList.remove('hidden');
        enteredPasscode = '';
        updateSlots();
      }, 400);
    } else {
      playError();
      slotsContainer.classList.add('shake');
      setTimeout(() => {
        slotsContainer.classList.remove('shake');
        enteredPasscode = '';
        updateSlots();
      }, 500);
    }
  }

  // Keypad Listeners
  keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      btn.classList.add('btn-pressed');
      setTimeout(() => btn.classList.remove('btn-pressed'), 150);
      handleInput(val);
    });
  });

  document.addEventListener('keydown', e => {
    if (!secretModal.classList.contains('hidden')) return;
    const k = e.key;
    if (k >= '0' && k <= '9') { flashBtn(k); handleInput(k); }
    else if (k === 'Backspace' || k === 'Delete') { flashBtn('*'); handleInput('*'); }
    else if (k === 'Escape' || k.toLowerCase() === 'c') { flashBtn('#'); handleInput('#'); }
  });

  function flashBtn(val) {
    const btn = document.querySelector(`.key-btn[data-val="${val}"]`);
    if (btn) { btn.classList.add('btn-pressed'); setTimeout(() => btn.classList.remove('btn-pressed'), 150); }
  }

  // Modal
  closeModalBtn.addEventListener('click', () => secretModal.classList.add('hidden'));
  lockAppBtn.addEventListener('click', () => { secretModal.classList.add('hidden'); playPop(); });

  // Confetti
  function triggerConfetti() {
    const colors = ['#ffb3c1', '#ff758f', '#ff4d6d', '#fff0f3', '#ffe5ec', '#ffd6e8', '#ffaac8'];
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:fixed;top:50%;left:50%;width:${Math.random()*10+6}px;height:${Math.random()*10+6}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'3px'};pointer-events:none;z-index:999;transform:translate(-50%,-50%);transition:transform 1s cubic-bezier(0.25,1,0.5,1),opacity 1s ease-out;`;
      document.body.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const v = Math.random() * 260 + 120;
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle)*v}px,${Math.sin(angle)*v-80}px) rotate(${Math.random()*360}deg)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 1100);
    }
  }

});
