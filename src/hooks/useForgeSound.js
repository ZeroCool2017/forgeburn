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

  // Chain break: gentle resonant metallic chime (soft, elegant, Obsidian aesthetic)
  const playChainBreak = useCallback(() => {
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Soft bell-like resonance: harmonic series of C note (gentle, not jarring)
      // C4 fundamental with natural overtones for chime quality
      const baseFreqs = [
        { freq: 262, gain: 0.08, duration: 1.0 },    // C4 — warm fundamental
        { freq: 393, gain: 0.06, duration: 1.2 },    // G4 — resonance
        { freq: 524, gain: 0.05, duration: 1.4 },    // C5 — shimmer
        { freq: 656, gain: 0.03, duration: 1.3 },    // E5 — ethereal
        { freq: 787, gain: 0.02, duration: 1.5 },    // G5 — fade shimmer
      ];

      baseFreqs.forEach(note => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        
        // Gentle fade in, then slow decay (chime characteristic)
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(note.gain, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + note.duration);
        
        osc.start(t);
        osc.stop(t + note.duration + 0.1);
      });

      // Subtle metallic resonance sparkle (very soft, refined)
      const sparkle = ac.createOscillator();
      const sparkleGain = ac.createGain();
      sparkle.connect(sparkleGain); sparkleGain.connect(ac.destination);
      sparkle.type = 'triangle';
      sparkle.frequency.value = 1046; // C6 — high shimmer
      sparkleGain.gain.setValueAtTime(0, t + 0.1);
      sparkleGain.gain.linearRampToValueAtTime(0.02, t + 0.15);
      sparkleGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      sparkle.start(t + 0.1);
      sparkle.stop(t + 1.3);
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