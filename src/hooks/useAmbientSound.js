import { useCallback, useRef, useEffect } from 'react';

// Electroplankton-inspired generative soundscape
// No beat, no structure — just living tonal organisms drifting through harmonic space
export function useAmbientSound() {
  const ctx = useRef(null);
  const nodesRef = useRef([]);
  const timersRef = useRef([]);
  const playingRef = useRef(false);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.current;
  };

  const stop = useCallback(() => {
    if (!playingRef.current) return;
    playingRef.current = false;
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    nodesRef.current.forEach(n => {
      try {
        n.gain.gain.cancelScheduledValues(0);
        n.gain.gain.linearRampToValueAtTime(0, n.ac.currentTime + 2);
        n.osc.stop(n.ac.currentTime + 2.1);
      } catch (e) {}
    });
    nodesRef.current = [];
  }, []);

  const start = useCallback(() => {
    if (playingRef.current) return;
    try {
      const ac = getCtx();
      if (ac.state === 'suspended') ac.resume();
      playingRef.current = true;

      // Master reverb-like chain: convolver approximated with feedback delay
      const master = ac.createGain();
      master.gain.value = 0.0;
      master.gain.linearRampToValueAtTime(0.22, ac.currentTime + 4);
      master.connect(ac.destination);

      // Soft feedback delay for space / depth
      const delay = ac.createDelay(4.0);
      delay.delayTime.value = 0.38;
      const delayFB = ac.createGain();
      delayFB.gain.value = 0.42;
      const delayWet = ac.createGain();
      delayWet.gain.value = 0.28;
      delay.connect(delayFB);
      delayFB.connect(delay);
      delay.connect(delayWet);
      delayWet.connect(master);

      // Overtone-rich lowpass filter — warms everything
      const warmFilter = ac.createBiquadFilter();
      warmFilter.type = 'lowpass';
      warmFilter.frequency.value = 2200;
      warmFilter.Q.value = 0.6;
      warmFilter.connect(master);
      warmFilter.connect(delay);

      // Pentatonic + natural harmonic series tones (C major pentatonic + octaves)
      // These are the "plankton" — each organism
      const harmonics = [
        65.4, 130.8, 196.0, 261.6, 293.7,  // C2 C3 G3 C4 D4
        329.6, 392.0, 440.0, 523.3, 587.3,  // E4 G4 A4 C5 D5
        659.3, 783.9, 880.0, 1046.5,         // E5 G5 A5 C6
      ];

      // Spawn a single "plankton tone" — fades in, drifts, fades out
      const spawnTone = () => {
        if (!playingRef.current) return;

        const t = ac.currentTime + 0.05;
        const freq = harmonics[Math.floor(Math.random() * harmonics.length)];
        const detune = (Math.random() - 0.5) * 8; // tiny organic drift
        const duration = 4 + Math.random() * 9;    // 4–13s lifespan
        const peakVol = 0.04 + Math.random() * 0.06;

        // Waveform: mostly sine, occasionally triangle for shimmer
        const type = Math.random() > 0.7 ? 'triangle' : 'sine';

        const osc = ac.createOscillator();
        const gain = ac.createGain();

        // Slow vibrato (breathing)
        const vib = ac.createOscillator();
        const vibGain = ac.createGain();
        vib.frequency.value = 0.05 + Math.random() * 0.2;
        vibGain.gain.value = freq * 0.003;
        vib.connect(vibGain);
        vibGain.connect(osc.frequency);

        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;

        // Soft attack → gentle swell → long tail
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.35);
        gain.gain.setValueAtTime(peakVol, t + duration * 0.55);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(gain);
        gain.connect(warmFilter);
        vib.start(t);
        osc.start(t);
        osc.stop(t + duration + 0.1);
        vib.stop(t + duration + 0.1);

        nodesRef.current.push({ osc, gain, ac });

        // Schedule next tone — staggered, never cluttered
        const nextIn = 600 + Math.random() * 2800; // 0.6s–3.4s between spawns
        const tid = setTimeout(spawnTone, nextIn);
        timersRef.current.push(tid);
      };

      // Seed with a few overlapping tones to feel immediately present
      [0, 900, 1800, 2700, 3800].forEach(offset => {
        const tid = setTimeout(spawnTone, offset);
        timersRef.current.push(tid);
      });

      // Sparse deep undertone — the "ocean floor" hum
      const drone = ac.createOscillator();
      const droneGain = ac.createGain();
      drone.type = 'sine';
      drone.frequency.value = 32.7; // C1 — sub, felt more than heard
      droneGain.gain.setValueAtTime(0, ac.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.07, ac.currentTime + 6);
      drone.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      nodesRef.current.push({ osc: drone, gain: droneGain, ac });

      // Silky high shimmer — like surface light on water
      const shimmer = ac.createOscillator();
      const shimmerGain = ac.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.value = 2093; // C7
      shimmerGain.gain.setValueAtTime(0, ac.currentTime);
      shimmerGain.gain.linearRampToValueAtTime(0.012, ac.currentTime + 5);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start();
      nodesRef.current.push({ osc: shimmer, gain: shimmerGain, ac });

    } catch (e) { /* audio blocked — silent fail */ }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}