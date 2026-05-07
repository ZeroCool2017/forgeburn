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

  // ─── DRIFT MODE ─────────────────────────────────────────────────────────
  const startDrift = useCallback((ac) => {
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

    // Extended harmonic palette — more richness
    const harmonics = [
      32.7, 49.0, 65.4, 82.4, 110.0, 130.8, 164.8, 196.0, 246.9, 261.6, 293.7,
      329.6, 392.0, 440.0, 493.9, 523.3, 587.3, 659.3, 783.9, 880.0, 987.8, 1046.5, 1174.7,
    ];

    const spawnTone = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.05;
      const freq = harmonics[Math.floor(Math.random() * harmonics.length)];
      const detune = (Math.random() - 0.5) * 12;
      const duration = 3 + Math.random() * 10;
      const peakVol = 0.03 + Math.random() * 0.07;
      const type = Math.random() > 0.6 ? 'triangle' : 'sine';

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const vib = ac.createOscillator();
      const vibGain = ac.createGain();
      vib.frequency.value = 0.04 + Math.random() * 0.25;
      vibGain.gain.value = freq * 0.004;
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);

      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol * 0.4, t + duration * 0.15);
      gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.4);
      gain.gain.setValueAtTime(peakVol, t + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(warmFilter);
      vib.start(t); osc.start(t);
      osc.stop(t + duration + 0.1); vib.stop(t + duration + 0.1);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 500 + Math.random() * 3200;
      const tid = setTimeout(spawnTone, nextIn);
      timersRef.current.push(tid);
    };

    // Soft multi-layer bass foundation
    const bassDrones = [
      { freq: 27.5, vol: 0.06 },  // A0 — very sub
      { freq: 35, vol: 0.08 },     // B0
      { freq: 41.2, vol: 0.05 },   // E1
    ];

    bassDrones.forEach(({ freq, vol }) => {
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.frequency.value = freq;
      bass.type = 'sine';
      bassGain.gain.setValueAtTime(0, ac.currentTime);
      bassGain.gain.linearRampToValueAtTime(vol, ac.currentTime + 2);
      bass.connect(bassGain);
      bassGain.connect(master);
      bass.start();
      nodesRef.current.push({ osc: bass, gain: bassGain, ac });
    });

    // Ambient beat layer — kick/drum pulse
    const beatGain = ac.createGain();
    beatGain.gain.value = 0;
    beatGain.connect(master);

    const spawnBeat = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime;

      // Kick drum: click + sub punch
      const kickOsc = ac.createOscillator();
      const kickGain = ac.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, t);
      kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
      kickGain.gain.setValueAtTime(0.12, t);
      kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      kickOsc.connect(kickGain);
      kickGain.connect(beatGain);
      kickOsc.start(t);
      kickOsc.stop(t + 0.2);

      const nextBeat = 600; // Kick every 600ms (~100 BPM)
      timersRef.current.push(setTimeout(spawnBeat, nextBeat));
    };

    timersRef.current.push(setTimeout(spawnBeat, 0));

    [0, 800, 1600, 2500, 3600, 4800].forEach(offset => {
      const tid = setTimeout(spawnTone, offset);
      timersRef.current.push(tid);
    });

    // Multi-layer drone foundation
    [32.7, 49.0, 65.4].forEach((droneFreq, i) => {
      const drone = ac.createOscillator();
      const droneGain = ac.createGain();
      drone.type = 'sine';
      drone.frequency.value = droneFreq;
      droneGain.gain.setValueAtTime(0, ac.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.04 + i * 0.015, ac.currentTime + 5 + i);
      drone.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      nodesRef.current.push({ osc: drone, gain: droneGain, ac });
    });

    // Shimmer layer (upper harmonics)
    [2093, 2637, 3136].forEach((shimmerFreq, i) => {
      const shimmer = ac.createOscillator();
      const shimmerGain = ac.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.value = shimmerFreq;
      shimmerGain.gain.setValueAtTime(0, ac.currentTime);
      shimmerGain.gain.linearRampToValueAtTime(0.008 - i * 0.002, ac.currentTime + 4 + i * 0.5);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start();
      nodesRef.current.push({ osc: shimmer, gain: shimmerGain, ac });
    });
  }, []);

  // ─── FOCUS MODE — precise, grounded with soft bass ─────────────────────────────────
  const startFocus = useCallback((ac) => {
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

    // Soft grounded bass foundation
    const bassDrones = [
      { freq: 27.5, vol: 0.08 },  // A0
      { freq: 55.0, vol: 0.06 },  // A1
    ];

    bassDrones.forEach(({ freq, vol }) => {
      const sub = ac.createOscillator();
      const subGain = ac.createGain();
      sub.type = 'sine';
      sub.frequency.value = freq;
      subGain.gain.setValueAtTime(0, ac.currentTime);
      subGain.gain.linearRampToValueAtTime(vol, ac.currentTime + 6);
      sub.connect(subGain);
      subGain.connect(master);
      sub.start();
      nodesRef.current.push({ osc: sub, gain: subGain, ac });
    });
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

  const start = useCallback((mode = 'drift', debtProgress = 0) => {
    if (playingRef.current) return;
    try {
      const ac = getCtx();
      if (ac.state === 'suspended') ac.resume();
      playingRef.current = true;

      if (mode === 'drift') startDrift(ac);
      else if (mode === 'focus') startFocus(ac);
      else if (mode === 'deep') startDeep(ac);
      else if (mode === 'tulsa') startTulsa(ac);
    } catch (e) {}
  }, [startDrift, startFocus, startDeep, startTulsa]);

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