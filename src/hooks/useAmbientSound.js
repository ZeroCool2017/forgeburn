import { useCallback, useRef, useEffect } from 'react';

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

  // ─── ELECTROPLANKTON MODE ─────────────────────────────────────────────────
  const startElectroplankton = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0.0;
    master.gain.linearRampToValueAtTime(0.22, ac.currentTime + 4);
    master.connect(ac.destination);

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

    const warmFilter = ac.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = 2200;
    warmFilter.Q.value = 0.6;
    warmFilter.connect(master);
    warmFilter.connect(delay);

    const harmonics = [
      65.4, 130.8, 196.0, 261.6, 293.7,
      329.6, 392.0, 440.0, 523.3, 587.3,
      659.3, 783.9, 880.0, 1046.5,
    ];

    const spawnTone = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.05;
      const freq = harmonics[Math.floor(Math.random() * harmonics.length)];
      const detune = (Math.random() - 0.5) * 8;
      const duration = 4 + Math.random() * 9;
      const peakVol = 0.04 + Math.random() * 0.06;
      const type = Math.random() > 0.7 ? 'triangle' : 'sine';

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const vib = ac.createOscillator();
      const vibGain = ac.createGain();
      vib.frequency.value = 0.05 + Math.random() * 0.2;
      vibGain.gain.value = freq * 0.003;
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);

      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.35);
      gain.gain.setValueAtTime(peakVol, t + duration * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(warmFilter);
      vib.start(t); osc.start(t);
      osc.stop(t + duration + 0.1); vib.stop(t + duration + 0.1);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 600 + Math.random() * 2800;
      const tid = setTimeout(spawnTone, nextIn);
      timersRef.current.push(tid);
    };

    [0, 900, 1800, 2700, 3800].forEach(offset => {
      const tid = setTimeout(spawnTone, offset);
      timersRef.current.push(tid);
    });

    // Ocean-floor drone
    const drone = ac.createOscillator();
    const droneGain = ac.createGain();
    drone.type = 'sine';
    drone.frequency.value = 32.7;
    droneGain.gain.setValueAtTime(0, ac.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.07, ac.currentTime + 6);
    drone.connect(droneGain);
    droneGain.connect(master);
    drone.start();
    nodesRef.current.push({ osc: drone, gain: droneGain, ac });

    // Surface shimmer
    const shimmer = ac.createOscillator();
    const shimmerGain = ac.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 2093;
    shimmerGain.gain.setValueAtTime(0, ac.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(0.012, ac.currentTime + 5);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);
    shimmer.start();
    nodesRef.current.push({ osc: shimmer, gain: shimmerGain, ac });
  }, []);

  // ─── ENDER MODE — sparse, cold, tactical ─────────────────────────────────
  const startEnder = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.18, ac.currentTime + 3);
    master.connect(ac.destination);

    // Long sparse delay — like the Battle Room's echo
    const delay = ac.createDelay(6.0);
    delay.delayTime.value = 1.2;
    const delayFB = ac.createGain();
    delayFB.gain.value = 0.55;
    const delayWet = ac.createGain();
    delayWet.gain.value = 0.35;
    delay.connect(delayFB);
    delayFB.connect(delay);
    delay.connect(delayWet);
    delayWet.connect(master);

    // High-pass filter — cold, clear
    const hpf = ac.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 300;
    hpf.connect(master);
    hpf.connect(delay);

    // Tactical tones — Locrian / minor pentatonic, cold intervals
    const enderTones = [
      130.8, 155.6, 185.0, 220.0, 246.9,   // C3 Eb3 F#3 A3 B3
      261.6, 311.1, 369.9, 440.0, 493.9,   // C4 Eb4 F#4 A4 B4
      523.3, 622.3, 739.9, 880.0,           // C5 Eb5 F#5 A5
    ];

    const spawnPing = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.02;
      const freq = enderTones[Math.floor(Math.random() * enderTones.length)];
      const duration = 2.5 + Math.random() * 5;
      const peakVol = 0.025 + Math.random() * 0.04;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      // Sharp attack, exponential decay — like a sonar ping
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(hpf);
      osc.start(t);
      osc.stop(t + duration + 0.1);
      nodesRef.current.push({ osc, gain, ac });

      // Very sparse — 2-6 seconds between pings
      const nextIn = 2000 + Math.random() * 4000;
      const tid = setTimeout(spawnPing, nextIn);
      timersRef.current.push(tid);
    };

    [0, 1500, 3200, 5100].forEach(offset => {
      timersRef.current.push(setTimeout(spawnPing, offset));
    });

    // Deep cold sub hum
    const sub = ac.createOscillator();
    const subGain = ac.createGain();
    sub.type = 'sine';
    sub.frequency.value = 55.0; // A1
    subGain.gain.setValueAtTime(0, ac.currentTime);
    subGain.gain.linearRampToValueAtTime(0.05, ac.currentTime + 8);
    sub.connect(subGain);
    subGain.connect(master);
    sub.start();
    nodesRef.current.push({ osc: sub, gain: subGain, ac });
  }, []);

  // ─── DEEP DRONE MODE ─────────────────────────────────────────────────────
  const startDeep = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.25, ac.currentTime + 6);
    master.connect(ac.destination);

    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 800;
    lpf.Q.value = 1.2;
    lpf.connect(master);

    // Three detuned sub drones
    const drones = [
      { freq: 32.7, detune: 0, vol: 0.08 },
      { freq: 32.7, detune: 7, vol: 0.05 },
      { freq: 49.0, detune: -3, vol: 0.04 },
      { freq: 65.4, detune: 5, vol: 0.03 },
    ];

    drones.forEach(({ freq, detune, vol }) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ac.currentTime + 5 + Math.random() * 4);
      osc.connect(gain);
      gain.connect(lpf);
      osc.start();
      nodesRef.current.push({ osc, gain, ac });
    });

    // Slow LFO tremolo on master
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.03;
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    nodesRef.current.push({ osc: lfo, gain: lfoGain, ac });
  }, []);

  // ─── TULSA MODE — Greenwood Black Wall Street, resilience ─────────────────
  const startTulsa = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.25, ac.currentTime + 5);
    master.connect(ac.destination);

    // Warm, earthy low-pass + mid-presence resonance
    const warmLpf = ac.createBiquadFilter();
    warmLpf.type = 'lowpass';
    warmLpf.frequency.value = 1800;
    warmLpf.Q.value = 0.7;
    
    const midBoost = ac.createBiquadFilter();
    midBoost.type = 'peaking';
    midBoost.frequency.value = 320;
    midBoost.gain.value = 3;
    midBoost.Q.value = 1.2;
    
    warmLpf.connect(midBoost);
    midBoost.connect(master);

    // Rich reverb-like delay (spiritual, reflective space)
    const delay = ac.createDelay(4);
    delay.delayTime.value = 0.58;
    const delayFB = ac.createGain();
    delayFB.gain.value = 0.55;
    const delayWet = ac.createGain();
    delayWet.gain.value = 0.35;
    delay.connect(delayFB);
    delayFB.connect(delay);
    delay.connect(delayWet);
    delayWet.connect(master);

    // Blues/Gospel-inspired pentatonic + natural minor + blue notes
    const tulsiTones = [
      110.0, 123.5, 146.8, 155.6, 165.0, 196.0,  // A2 B2 D3 F#3 E3 G3
      220.0, 246.9, 293.7, 330.0, 370.0, 392.0,  // A3 B3 D4 E4 F#4 G4
      440.0, 493.9, 587.3, 659.3, 740.0, 784.0,  // A4 B4 D5 E5 F#5 G5
    ];

    const spawnBluesTone = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.05;
      const freq = tulsiTones[Math.floor(Math.random() * tulsiTones.length)];
      const duration = 2.5 + Math.random() * 8;
      const peakVol = 0.04 + Math.random() * 0.06;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 8;

      // Warm, breathy envelope with vibrato
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol * 0.6, t + duration * 0.2);
      gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(warmLpf);
      osc.start(t); osc.stop(t + duration + 0.15);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 700 + Math.random() * 3500;
      timersRef.current.push(setTimeout(spawnBluesTone, nextIn));
    };

    [0, 1400, 2800, 4600].forEach(offset => {
      timersRef.current.push(setTimeout(spawnBluesTone, offset));
    });

    // Deep earth drone — foundation (low A)
    const earthDrone = ac.createOscillator();
    const earthGain = ac.createGain();
    earthDrone.type = 'sine';
    earthDrone.frequency.value = 55.0; // A1
    earthGain.gain.setValueAtTime(0, ac.currentTime);
    earthGain.gain.linearRampToValueAtTime(0.1, ac.currentTime + 8);
    earthDrone.connect(earthGain);
    earthGain.connect(warmLpf);
    earthDrone.start(ac.currentTime);
    nodesRef.current.push({ osc: earthDrone, gain: earthGain, ac });

    // Second harmonic drone (E1)
    const harmonic = ac.createOscillator();
    const harmonicGain = ac.createGain();
    harmonic.type = 'sine';
    harmonic.frequency.value = 82.41; // E1
    harmonicGain.gain.setValueAtTime(0, ac.currentTime);
    harmonicGain.gain.linearRampToValueAtTime(0.055, ac.currentTime + 7);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(warmLpf);
    harmonic.start(ac.currentTime);
    nodesRef.current.push({ osc: harmonic, gain: harmonicGain, ac });

    // Soft brass-like shimmer
    const shimmer = ac.createOscillator();
    const shimmerGain = ac.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 1760; // A6
    shimmerGain.gain.setValueAtTime(0, ac.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(0.02, ac.currentTime + 6);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(warmLpf);
    shimmer.start(ac.currentTime);
    nodesRef.current.push({ osc: shimmer, gain: shimmerGain, ac });
  }, []);

  const start = useCallback((mode = 'electroplankton', debtProgress = 0) => {
    if (playingRef.current) return;
    try {
      const ac = getCtx();
      if (ac.state === 'suspended') ac.resume();
      playingRef.current = true;

      if (mode === 'electroplankton') startElectroplankton(ac);
      else if (mode === 'ender') startEnder(ac);
      else if (mode === 'deep') startDeep(ac);
      else if (mode === 'tulsa') startTulsa(ac);
    } catch (e) {}
  }, [startElectroplankton, startEnder, startDeep, startTulsa]);

  const updateProgress = useCallback((debtProgress) => {
    // Modulate organism spawn rate and complexity based on progress (0-1)
    if (playingRef.current && nodesRef.current.length > 0) {
      // Placeholder for future dynamic modulation
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}