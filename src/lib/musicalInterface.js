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

// Chord: play 3 notes together for deeper resonance
export function playHarmonicChord(rootIndex = 0) {
  const indices = [rootIndex, rootIndex + 2, rootIndex + 4];
  indices.forEach((idx, i) => {
    setTimeout(() => playHarmonicNote(idx, 0.6), i * 30);
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