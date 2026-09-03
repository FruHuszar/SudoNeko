let context = null;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = value;
}

function audio() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone({ from, to, duration, type = 'sine', volume = 0.04, delay = 0 }) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function afterPaint(task) {
  requestAnimationFrame(() => setTimeout(task, 0));
}

function play(shape) {
  if (!enabled) return;
  afterPaint(() => {
    try {
      shape();
    } catch {
      return;
    }
  });
}

export function warmUpSound() {
  if (!enabled) return;
  afterPaint(audio);
}

export function playMark() {
  play(() => tone({ from: 620, to: 520, duration: 0.06, type: 'triangle', volume: 0.032 }));
}

export function playCat() {
  play(() => {
    tone({ from: 740, to: 740, duration: 0.07, volume: 0.045 });
    tone({ from: 1110, to: 1110, duration: 0.09, volume: 0.035, delay: 0.055 });
  });
}

export function playErase() {
  play(() => tone({ from: 380, to: 300, duration: 0.05, volume: 0.026 }));
}

export function playButton() {
  play(() => tone({ from: 430, to: 430, duration: 0.035, volume: 0.02 }));
}

export function buzz(ms) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    return;
  }
}
