// Petits sons fabriqués avec WebAudio (aucun fichier à charger).
let ac = null;
let enabled = true;

export function setSound(on) { enabled = on; }

function tone(freq, dur, type = 'sine', vol = 0.12, slide = 0) {
  if (!enabled) return;
  try {
    ac ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ac.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, ac.currentTime + dur);
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur);
  } catch { /* pas de son, pas grave */ }
}

export const SFX = {
  flap: () => tone(420, 0.12, 'sine', 0.1, 1.6),
  score: () => tone(880, 0.1, 'triangle', 0.12, 1.3),
  candy: () => tone(1175, 0.09, 'sine', 0.1, 1.5),
  hit: () => tone(180, 0.3, 'sawtooth', 0.12, 0.4),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.12), i * 110)),
};
