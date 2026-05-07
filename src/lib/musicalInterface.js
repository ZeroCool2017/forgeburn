// Musical interface system — turns data interactions into soothing electroplankton-like synth notes
// Psychology: each interaction produces harmonious, calming tones that create a meditative flow

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Pentatonic scale (naturally harmonious, no dissonance) — perfect for soothing UI interaction
const PENTATONIC_NOTES = {
  // A minor pentatonic (calming, introspective)
  c5: 523.25,
  d5: 587.33,
  e5: 659.25,
  g5: 783.99,
  a5: 880.00,
  c6: 1046.50,
  d6: 1174.66,
  e6: 1318.51,
};

const NOTE_SEQUENCE = [
  'c5', 'd5', 'e5', 'g5', 'a5', 'c6', 'd6', 'e6',
];

export function playHarmonicNote(index = 0, duration = 0.4) {
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();

    const note = NOTE_SEQUENCE[index % NOTE_SEQUENCE.length];
    const freq = PENTATONIC_NOTES[note];

    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();

    osc.type = 'triangle'; // Soft, smooth wave
    osc.frequency.value = freq;

    // Soothing filter
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Envelope: fade in/out (psychoacoustic softness)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
    gain.gain.linearRampToValueAtTime(0.08, t + duration * 0.8);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(ac.destination);

    osc.start(t);
    osc.stop(t + duration);
  } catch (e) {
    // Fail silently if audio context unavailable
  }
}

// Rich harmonic chord — stacked thirds for lush resonance
export function playHarmonicChord(rootIndex = 0) {
  // Play root + major/minor third + perfect fifth (classic harmonic triad)
  const notes = [
    { index: rootIndex, delay: 0, duration: 0.8 },           // Root
    { index: rootIndex + 2, delay: 40, duration: 0.75 },     // Third (harmonic interval)
    { index: rootIndex + 4, delay: 80, duration: 0.7 },      // Fifth (perfect interval)
    { index: rootIndex + 1, delay: 120, duration: 0.65 },    // Added tension note for richness
  ];

  notes.forEach(({ index, delay, duration }) => {
    setTimeout(() => playHarmonicNote(index, duration), delay);
  });
}

// Cascade: musical flourish when completing an action
export function playMusicalCascade(length = 5) {
  for (let i = 0; i < length; i++) {
    setTimeout(() => playHarmonicNote(i, 0.3), i * 120);
  }
}

// Interactive note based on data value (normalized 0-1)
export function playNoteFromData(value) {
  const index = Math.floor(value * (NOTE_SEQUENCE.length - 1));
  playHarmonicNote(index, 0.5);
}

// Ambient pulse — optional background resonance
export function playAmbientPulse() {
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();

    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = 'sine';
    osc.frequency.value = PENTATONIC_NOTES.c5 * 0.5; // Very low, subharmonic
    
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.linearRampToValueAtTime(0.02, t + 2);
    gain.gain.linearRampToValueAtTime(0, t + 2.5);

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.start(t);
    osc.stop(t + 2.5);
  } catch (e) {}
}

export function playResolutionChord() {
  // I-IV-V resolution — psychologically satisfying closure
  const root = 0;
  playHarmonicNote(root, 0.4);
  setTimeout(() => playHarmonicNote(root + 3, 0.4), 100);
  setTimeout(() => playHarmonicNote(root + 4, 0.5), 200);
}

// Electroplankton-like shimmer — delicate, magical leaf-touch sound
export function playShimmerChime(pitchVariation = 0) {
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();

    const t = ac.currentTime;
    const baseFreq = 800 + pitchVariation * 200; // Gentle high frequency

    // Create shimmering effect with multiple layers
    const oscillators = [];
    const gains = [];

    // Main tone
    const osc1 = ac.createOscillator();
    const gain1 = ac.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = baseFreq;
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.06, t + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc1.connect(gain1);
    gain1.connect(ac.destination);
    oscillators.push(osc1);
    gains.push(gain1);

    // Harmonic shimmer (octave higher, slightly detuned for shimmer)
    const osc2 = ac.createOscillator();
    const gain2 = ac.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = baseFreq * 2 + 3; // Slight detuning for shimmer
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.04, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc2.connect(gain2);
    gain2.connect(ac.destination);
    oscillators.push(osc2);
    gains.push(gain2);

    // Sub-harmonic warmth
    const osc3 = ac.createOscillator();
    const gain3 = ac.createGain();
    osc3.type = 'triangle';
    osc3.frequency.value = baseFreq * 0.5;
    gain3.gain.setValueAtTime(0, t);
    gain3.gain.linearRampToValueAtTime(0.02, t + 0.05);
    gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc3.connect(gain3);
    gain3.connect(ac.destination);
    oscillators.push(osc3);
    gains.push(gain3);

    // Start all oscillators
    oscillators.forEach(osc => {
      osc.start(t);
      osc.stop(t + 0.6);
    });
  } catch (e) {
    // Fail silently if audio context unavailable
  }
}

// High-fidelity electroplankton tone — distinct note that layers with ambient
// Mapped to a data value (0-1) to create unique melodic interactions
export function playElectroplantonTone(normalizedValue = 0.5, duration = 0.7) {
  try {
    const ac = getAudioContext();
    if (ac.state === 'suspended') ac.resume();

    const t = ac.currentTime;
    
    // Map normalized value to pentatonic frequency space (same scale as harmonic system)
    const noteIndex = Math.floor(normalizedValue * (NOTE_SEQUENCE.length - 1));
    const baseFreq = PENTATONIC_NOTES[NOTE_SEQUENCE[noteIndex]];
    
    // Create 3-layer polyphonic texture for richness
    const oscs = [];
    const gains = [];

    // Layer 1: Primary tone (sine, clean)
    const osc1 = ac.createOscillator();
    const gain1 = ac.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = baseFreq;
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.07, t + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc1.connect(gain1);
    gain1.connect(ac.destination);
    oscs.push(osc1);
    gains.push(gain1);

    // Layer 2: Upper harmonic (adds shimmer, slightly pitch-bent)
    const osc2 = ac.createOscillator();
    const gain2 = ac.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = baseFreq * 1.5; // Perfect fifth above
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.05, t + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.95);
    osc2.connect(gain2);
    gain2.connect(ac.destination);
    oscs.push(osc2);
    gains.push(gain2);

    // Layer 3: Sub-bass warmth (very low, rich)
    const osc3 = ac.createOscillator();
    const gain3 = ac.createGain();
    osc3.type = 'triangle';
    osc3.frequency.value = baseFreq * 0.25; // Two octaves below
    gain3.gain.setValueAtTime(0, t);
    gain3.gain.linearRampToValueAtTime(0.03, t + 0.08);
    gain3.gain.exponentialRampToValueAtTime(0.001, t + duration * 1.1);
    osc3.connect(gain3);
    gain3.connect(ac.destination);
    oscs.push(osc3);
    gains.push(gain3);

    // Start all oscillators
    oscs.forEach(osc => {
      osc.start(t);
      osc.stop(t + duration * 1.1);
    });
  } catch (e) {
    // Fail silently
  }
}