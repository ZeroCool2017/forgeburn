import { useCallback, useRef } from 'react';

// Synthesizes motivational sounds using the Web Audio API — no files needed
export function useForgeSound() {
  const ctx = useRef(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.current;
  };

  // Strike sound: a satisfying metallic clank + shimmer
  const playStrike = useCallback(() => {
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Impact thud
      const osc1 = ac.createOscillator();
      const gain1 = ac.createGain();
      osc1.connect(gain1); gain1.connect(ac.destination);
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, t);
      osc1.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      gain1.gain.setValueAtTime(0.4, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc1.start(t); osc1.stop(t + 0.2);

      // Shimmer overtone
      const osc2 = ac.createOscillator();
      const gain2 = ac.createGain();
      osc2.connect(gain2); gain2.connect(ac.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, t + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1760, t + 0.3);
      gain2.gain.setValueAtTime(0.15, t + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc2.start(t + 0.05); osc2.stop(t + 0.4);
    } catch (e) { /* audio blocked — silent fail */ }
  }, []);

  // Chain break: dramatic low boom + rising sparkle
  const playChainBreak = useCallback(() => {
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // Deep boom
      const noise = ac.createOscillator();
      const noiseGain = ac.createGain();
      noise.connect(noiseGain); noiseGain.connect(ac.destination);
      noise.type = 'square';
      noise.frequency.setValueAtTime(80, t);
      noise.frequency.exponentialRampToValueAtTime(20, t + 0.4);
      noiseGain.gain.setValueAtTime(0.5, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      noise.start(t); noise.stop(t + 0.5);

      // Rising shimmer cascade
      [0, 0.08, 0.16, 0.24].forEach((delay, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(440 * (i + 1), t + delay);
        o.frequency.exponentialRampToValueAtTime(880 * (i + 1), t + delay + 0.3);
        g.gain.setValueAtTime(0.12, t + delay);
        g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);
        o.start(t + delay); o.stop(t + delay + 0.4);
      });
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