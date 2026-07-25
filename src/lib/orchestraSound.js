// Orchestra layer — deep, sparse, therapeutic tones that join the ambient world
// without competing with it. Reuses the same A-minor pentatonic palette as the
// electroplankton / harmonic system so every new layer harmonizes with existing
// sounds. Every call is a no-op when `enabled` is false (ambient sound off) so the
// app stays silent for users who turned the master toggle off.

let audioContext = null;
function getAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

// Shared soft voice: sine primary + optional sub warmth, slow attack, long decay,
// gentle lowpass — Endel / music-therapy character. Never sharp or percussive.
function softVoice(freq, t, { ac, peak = 0.05, duration = 2.4, detune = 0, type = 'sine' }) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  filter.type = 'lowpass';
  filter.frequency.value = 1300;
  filter.Q.value = 0.5;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak * 0.5, t + duration * 0.18);
  gain.gain.linearRampToValueAtTime(peak, t + duration * 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function noteFromValue(normalized) {
  const clamped = Math.max(0, Math.min(0.999, normalized));
  return PENTATONIC[Math.floor(clamped * (PENTATONIC.length - 1))];
}

// Single soft tone + sub warmth — used for orb taps, curve scrubs, chart hovers.
export function playOrbTone(normalized = 0.5, enabled = true, duration = 2.2) {
  if (!enabled) return;
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.02;
    const freq = noteFromValue(normalized);
    softVoice(freq, t, { ac, peak: 0.05, duration });
    softVoice(freq * 0.5, t, { ac, peak: 0.04, duration: duration * 1.15, type: 'triangle' });
  } catch {}
}

// Slow chord bloom — root + fifth + octave, staggered. Used when a data-story
// panel reveals itself. Deep, therapeutic, resolves gently.
export function playDataBloom(normalized = 0.5, enabled = true) {
  if (!enabled) return;
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.02;
    const idx = Math.floor(Math.max(0, Math.min(0.999, normalized)) * (PENTATONIC.length - 1));
    softVoice(PENTATONIC[idx], t, { ac, peak: 0.05, duration: 3.0 });
    softVoice(PENTATONIC[Math.min(PENTATONIC.length - 1, idx + 2)] * 0.5, t + 0.12, { ac, peak: 0.04, duration: 3.2, type: 'triangle' });
    softVoice(PENTATONIC[Math.min(PENTATONIC.length - 1, idx + 4)], t + 0.24, { ac, peak: 0.035, duration: 2.8 });
  } catch {}
}

// Sustained resonance with a faint detuned shimmer — used for mind-map nodes
// and chain cards, where each loan/habit carries its own pitch.
export function playNodeResonance(pitchIndex = 0, enabled = true, duration = 2.6) {
  if (!enabled) return;
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.02;
    const idx = ((Math.round(pitchIndex) % PENTATONIC.length) + PENTATONIC.length) % PENTATONIC.length;
    const freq = PENTATONIC[idx];
    softVoice(freq, t, { ac, peak: 0.045, duration });
    softVoice(freq * 2 + 3, t, { ac, peak: 0.02, duration: duration * 0.9, detune: 7 });
  } catch {}
}