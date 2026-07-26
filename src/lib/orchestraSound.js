// Orchestra layer — deep, sparse, therapeutic tones that join the ambient world
// without competing with it. Reuses the same A-minor pentatonic palette as the
// electroplankton / harmonic system so every new layer harmonizes with existing
// sounds. Every call is a no-op when `enabled` is false (ambient sound off) so the
// app stays silent for users who turned the master toggle off.
//
// Design principles (Endel / Electroplankton): functional, adaptive, consonant,
// low-frequency-forward, never jarring. Sustained tones with slow attacks and
// long, exponential decays. Variation built in so repeated gestures never repeat
// identically — the field stays alive, like a living organism humming to itself.

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

// Single soft tone + sub warmth — used for orb taps (short, gentle, distinct from
// the lush drag voice).
export function playOrbTone(normalized = 0.5, enabled = true, duration = 2.2) {
  if (!enabled) return;
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.02;
    const idx = Math.floor(Math.max(0, Math.min(0.999, normalized)) * (PENTATONIC.length - 1));
    const freq = PENTATONIC[idx];
    // Every orb is a little chord (root + fifth + octave) with a soft sub for bass —
    // like a chord keyboard where every button is a harmony.
    softVoice(freq, t, { ac, peak: 0.05, duration });
    softVoice(freq * 1.5, t + 0.03, { ac, peak: 0.03, duration: duration * 0.9, detune: 4 });
    softVoice(freq * 2, t + 0.06, { ac, peak: 0.016, duration: duration * 0.8, detune: 7 });
    softVoice(freq * 0.5, t, { ac, peak: 0.045, duration: duration * 1.2, type: 'triangle' });
    softVoice(freq * 0.25, t, { ac, peak: 0.04, duration: duration * 1.3, type: 'sine' });
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

// Sustained resonance with a faint detuned shimmer — used for the mind map's
// passive "breathing" layer.
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

// The lush "field" voice — the signature sound for all drag / scrub interactions
// (mind map drag, chain links, curve scrub, chart hovers). Each call randomly
// picks a different harmonic stack so sweeping across the field builds an
// evolving, never-repeating melody. Always carries a deep sub for Endel-style
// bass foundation. Soft, sustained, relaxing — never a bright pluck.
const FIELD_VARIANTS = [
  // root + sub
  (f, t, ac, dur) => {
    softVoice(f, t, { ac, peak: 0.05, duration: dur });
    softVoice(f * 0.5, t, { ac, peak: 0.045, duration: dur * 1.2, type: 'triangle' });
  },
  // root + fifth + sub
  (f, t, ac, dur) => {
    softVoice(f, t, { ac, peak: 0.045, duration: dur });
    softVoice(f * 1.5, t, { ac, peak: 0.03, duration: dur * 0.9, detune: 5 });
    softVoice(f * 0.5, t, { ac, peak: 0.045, duration: dur * 1.2, type: 'triangle' });
  },
  // root + octave shimmer + deep sub
  (f, t, ac, dur) => {
    softVoice(f, t, { ac, peak: 0.05, duration: dur });
    softVoice(f * 2, t, { ac, peak: 0.018, duration: dur * 0.8, detune: 8 });
    softVoice(f * 0.25, t, { ac, peak: 0.05, duration: dur * 1.3 });
  },
  // root + fifth + octave + sub (richest)
  (f, t, ac, dur) => {
    softVoice(f, t, { ac, peak: 0.04, duration: dur });
    softVoice(f * 1.5, t, { ac, peak: 0.03, duration: dur });
    softVoice(f * 2, t, { ac, peak: 0.016, duration: dur * 0.85, detune: 6 });
    softVoice(f * 0.5, t, { ac, peak: 0.04, duration: dur * 1.15, type: 'triangle' });
  },
];

export function playFieldTone(pitchIndex = 0, enabled = true, duration = 2.0) {
  if (!enabled) return;
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.02;
    const idx = ((Math.round(pitchIndex) % PENTATONIC.length) + PENTATONIC.length) % PENTATONIC.length;
    const freq = PENTATONIC[idx];
    FIELD_VARIANTS[Math.floor(Math.random() * FIELD_VARIANTS.length)](freq, t, ac, duration);
  } catch {}
}

// Deep Endel-style bass swell — stacked sub sines (A0 / E1 / A1) low-passed, slow
// swell, long decay. Triggered on gesture start to ground the field in deep bass
// without adding a competing continuous drone.
export function playFieldBass(enabled = true, intensity = 1) {
  if (!enabled) return;
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.02;
    const dur = 4.5;
    [27.5, 41.2, 55.0].forEach((f, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.value = f;
      filter.type = 'lowpass';
      filter.frequency.value = 220;
      const peak = (0.06 - i * 0.012) * intensity;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.6);
      gain.gain.linearRampToValueAtTime(peak * 0.7, t + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + dur + 0.1);
    });
  } catch {}
}