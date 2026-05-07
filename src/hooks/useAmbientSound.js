import { useCallback, useRef, useEffect } from 'react';

// Synthesizes a lo-fi ambient focus soundscape using Web Audio API
export function useAmbientSound() {
  const ctx = useRef(null);
  const nodesRef = useRef([]);
  const playingRef = useRef(false);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.current;
  };

  const stop = useCallback(() => {
    if (!playingRef.current) return;
    playingRef.current = false;
    nodesRef.current.forEach(n => {
      try { n.stop(); } catch (e) {}
    });
    nodesRef.current = [];
  }, []);

  const start = useCallback(() => {
    if (playingRef.current) return;
    try {
      const ac = getCtx();
      if (ac.state === 'suspended') ac.resume();
      playingRef.current = true;
      const nodes = [];

      // Master gain for overall volume
      const master = ac.createGain();
      master.gain.setValueAtTime(0, ac.currentTime);
      master.gain.linearRampToValueAtTime(0.18, ac.currentTime + 3);
      master.connect(ac.destination);

      // --- Drone pad: slow evolving chord (C, E, G) ---
      const droneFreqs = [65.4, 130.8, 196, 261.6, 329.6]; // C2, C3, G3, C4, E4
      droneFreqs.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const lfo = ac.createOscillator();
        const lfoGain = ac.createGain();

        // Slow vibrato
        lfo.frequency.value = 0.08 + i * 0.015;
        lfoGain.gain.value = freq * 0.004;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        gain.gain.value = 0.06 - i * 0.008;

        osc.connect(gain);
        gain.connect(master);
        lfo.start();
        osc.start();
        nodes.push(osc, lfo);
      });

      // --- Soft filtered noise (vinyl/tape hiss) ---
      const bufferSize = ac.sampleRate * 4;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseFilter = ac.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 400;
      noiseFilter.Q.value = 0.5;
      const noiseGain = ac.createGain();
      noiseGain.gain.value = 0.03;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();
      nodes.push(noise);

      // --- Soft pulse beat (sub kick ~60bpm) ---
      const bpm = 60;
      const beatInterval = 60 / bpm;
      let beatCount = 0;
      const scheduleBeat = () => {
        if (!playingRef.current) return;
        const t = ac.currentTime + 0.05;
        const kick = ac.createOscillator();
        const kickGain = ac.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(80, t);
        kick.frequency.exponentialRampToValueAtTime(30, t + 0.2);
        kickGain.gain.setValueAtTime(0.12, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        kick.connect(kickGain);
        kickGain.connect(master);
        kick.start(t);
        kick.stop(t + 0.35);
        beatCount++;
        setTimeout(scheduleBeat, beatInterval * 1000);
      };
      setTimeout(scheduleBeat, 800); // slight delay before first beat

      // --- Occasional soft chime notes (pentatonic: C, D, E, G, A) ---
      const penta = [261.6, 293.7, 329.6, 392, 440, 523.3];
      let chimeTimeout;
      const scheduleChime = () => {
        if (!playingRef.current) return;
        const delay = 3000 + Math.random() * 6000;
        chimeTimeout = setTimeout(() => {
          if (!playingRef.current) return;
          const t = ac.currentTime + 0.05;
          const freq = penta[Math.floor(Math.random() * penta.length)];
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.08, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
          o.connect(g); g.connect(master);
          o.start(t); o.stop(t + 2.5);
          scheduleChime();
        }, delay);
      };
      scheduleChime();

      nodesRef.current = nodes;
    } catch (e) { /* audio blocked */ }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}