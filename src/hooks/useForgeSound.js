import { useCallback, useRef } from 'react';

// Synthesizes motivational sounds using the Web Audio API — no files needed
export function useForgeSound() {
  const ctx = useRef(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.current;
  };

  // Strike sound: warm, satisfying C major progression (payment confirmation)
  const playStrike = useCallback(() => {
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Warm bass (C note — grounding)
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.connect(bassGain); bassGain.connect(ac.destination);
      bass.type = 'sine';
      bass.frequency.value = 130.8; // C3
      bassGain.gain.setValueAtTime(0.18, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      bass.start(t); bass.stop(t + 0.25);

      // Rising C major chord: C-E-G
      const chordNotes = [
        { freq: 262, delay: 0, duration: 0.35 },    // C4
        { freq: 330, delay: 0.06, duration: 0.32 }, // E4
        { freq: 392, delay: 0.12, duration: 0.3 },  // G4
      ];

      chordNotes.forEach(note => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(0, t + note.delay);
        gain.gain.linearRampToValueAtTime(0.12, t + note.delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + note.delay + note.duration);
        osc.start(t + note.delay);
        osc.stop(t + note.delay + note.duration);
      });

      // Shimmer top (C5 octave — bright, affirming)
      const shimmer = ac.createOscillator();
      const shimmerGain = ac.createGain();
      shimmer.connect(shimmerGain); shimmerGain.connect(ac.destination);
      shimmer.type = 'sine';
      shimmer.frequency.value = 524;
      shimmerGain.gain.setValueAtTime(0, t + 0.15);
      shimmerGain.gain.linearRampToValueAtTime(0.1, t + 0.17);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      shimmer.start(t + 0.15); shimmer.stop(t + 0.45);
    } catch (e) { /* audio blocked — silent fail */ }
  }, []);

  // Chain break: satisfying magical progression (G minor arpeggio rising)
  const playChainBreak = useCallback(() => {
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Warm bass impact + release (G note)
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.connect(bassGain); bassGain.connect(ac.destination);
      bass.type = 'sine';
      bass.frequency.value = 196; // G3
      bassGain.gain.setValueAtTime(0.22, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      bass.start(t); bass.stop(t + 0.35);

      // Rising magical chord: G minor (G-Bb-D) + upper harmonics
      // Soft, warm progression that feels victorious not jarring
      const magicalNotes = [
        { freq: 196, delay: 0, duration: 0.6 },    // G3
        { freq: 233, delay: 0.08, duration: 0.55 }, // Bb3
        { freq: 293, delay: 0.16, duration: 0.5 },  // D4
        { freq: 392, delay: 0.24, duration: 0.5 },  // G4 — resolution
        { freq: 587, delay: 0.3, duration: 0.45 },  // D5 — shimmer peak
      ];

      magicalNotes.forEach(note => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(0, t + note.delay);
        gain.gain.linearRampToValueAtTime(0.14, t + note.delay + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + note.delay + note.duration);
        osc.start(t + note.delay);
        osc.stop(t + note.delay + note.duration);
      });

      // Top shimmer wash — ethereal, magical
      const shimmer = ac.createOscillator();
      const shimmerGain = ac.createGain();
      shimmer.connect(shimmerGain); shimmerGain.connect(ac.destination);
      shimmer.type = 'triangle';
      shimmer.frequency.value = 880;
      shimmerGain.gain.setValueAtTime(0, t + 0.4);
      shimmerGain.gain.linearRampToValueAtTime(0.1, t + 0.42);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      shimmer.start(t + 0.4); shimmer.stop(t + 0.8);
    } catch (e) { /* silent fail */ }
  }, []);

  // Soft ambient chime for adding a loan
  const playAdd = useCallback(() => {
    try {
      const ac = getCtx();
      const t = ac.currentTime;
      [523, 659, 784].forEach((freq, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t + i * 0.1);
        g.gain.linearRampToValueAtTime(0.15, t + i * 0.1 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.6);
        o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.6);
      });
    } catch (e) { /* silent fail */ }
  }, []);

  return { playStrike, playChainBreak, playAdd };
}