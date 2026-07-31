(function () {

  const PASSCODE = '2910';
  let entered = '';

  const screenLock    = document.getElementById('screen-lock');
  const screenMessage = document.getElementById('screen-message');
  const slotsEl       = document.getElementById('slots');
  const slots         = slotsEl.querySelectorAll('.slot');
  const keys          = document.querySelectorAll('.key');
  const btnClose      = document.getElementById('btn-close');
  const msgDate       = document.getElementById('msg-date');

  if (msgDate) {
    msgDate.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  let ctx = null;
  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type = 'sine', vol = 0.12) {
    try {
      const a = audio();
      const osc = a.createOscillator(), g = a.createGain();
      osc.type = type; osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
      osc.connect(g); g.connect(a.destination);
      osc.start(); osc.stop(a.currentTime + dur);
    } catch (_) {}
  }

  function soundTap()   { beep(600, 0.07); }
  function soundError() { beep(160, 0.28, 'sawtooth', 0.18); }
  function soundSuccess() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => beep(f, 0.2, 'sine', 0.14), i * 90));
  }

  function renderSlots() {
    slots.forEach((s, i) => s.classList.toggle('filled', i < entered.length));
  }

  function input(v) {
    soundTap();
    if (v === '*')           { entered = entered.slice(0, -1); }
    else if (v === '#')      { entered = ''; }
    else if (entered.length < 4) { entered += v; }
    renderSlots();
    if (entered.length === 4) setTimeout(check, 140);
  }

  function check() {
    if (entered === PASSCODE) {
      soundSuccess();
      burst();
      setTimeout(unlock, 480);
    } else {
      soundError();
      slotsEl.classList.add('shake');
      setTimeout(() => { slotsEl.classList.remove('shake'); entered = ''; renderSlots(); }, 420);
    }
  }

  function unlock() {
    screenLock.classList.add('hidden');
    screenMessage.classList.remove('hidden');
    entered = ''; renderSlots();
  }

  function pressKey(btn) {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 130);
  }

  keys.forEach(k => {
    k.addEventListener('click', () => { pressKey(k); input(k.dataset.v); });
  });

  document.addEventListener('keydown', e => {
    if (!screenMessage.classList.contains('hidden')) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { pressKey(document.querySelector(`.key[data-v="${k}"]`) || {}); input(k); }
    else if (k === 'Backspace') { pressKey(document.querySelector('.key[data-v="*"]') || {}); input('*'); }
    else if (k === 'Escape')    { pressKey(document.querySelector('.key[data-v="#"]') || {}); input('#'); }
  });

  btnClose.addEventListener('click', () => {
    screenMessage.classList.add('hidden');
    screenLock.classList.remove('hidden');
  });

  function burst() {
    const colors = ['#ff6b9d','#ff9ec4','#ffb3c6','#ffd6e8','#ff4d8b','#ffffff','#ffd700'];
    for (let i = 0; i < 55; i++) {
      const p = document.createElement('div');
      p.className = 'cfetti';
      const sz = Math.random() * 10 + 6;
      p.style.cssText = `width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]};top:50%;left:50%;border-radius:${Math.random()>.5?'50%':'3px'};transform:translate(-50%,-50%);transition:transform 1s cubic-bezier(.25,1,.5,1),opacity 1s ease;`;
      document.body.appendChild(p);
      const angle = Math.random() * Math.PI * 2, dist = Math.random() * 280 + 80;
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle)*dist-50}%,${Math.sin(angle)*dist-50}%) rotate(${Math.random()*360}deg)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 1050);
    }
  }

})();
