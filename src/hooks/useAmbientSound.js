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
        n.gain.gain.cancelScheduledValues(n.ac.currentTime);
        n.gain.gain.setValueAtTime(0, n.ac.currentTime);
        n.osc.stop(n.ac.currentTime + 0.05);
      } catch (e) {}
    });
    setTimeout(() => { nodesRef.current = []; }, 100);
  }, []);

  // ─── DRIFT MODE ─────────────────────────────────────────────────────────
  const startDrift = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0.0;
    master.gain.linearRampToValueAtTime(0.32, ac.currentTime + 4);
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
      const duration = 8 + Math.random() * 18;
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

    // Strong bass foundation — more presence
    const bassDrones = [
      { freq: 16.35, vol: 0.22 },  // C0 — deepest sub
      { freq: 27.5, vol: 0.24 },   // A0 — very sub
      { freq: 35, vol: 0.26 },     // B0
      { freq: 41.2, vol: 0.22 },   // E1
      { freq: 55.0, vol: 0.20 },   // A1 — mid-bass
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
      nodesRef.current.push({ osc: bass, gain: bassGain, ac, isLoop: true });
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

    // Multi-layer drone foundation with more bass
    [32.7, 49.0, 65.4].forEach((droneFreq, i) => {
      const drone = ac.createOscillator();
      const droneGain = ac.createGain();
      drone.type = 'sine';
      drone.frequency.value = droneFreq;
      droneGain.gain.setValueAtTime(0, ac.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.06 + i * 0.02, ac.currentTime + 5 + i);
      drone.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      nodesRef.current.push({ osc: drone, gain: droneGain, ac, isLoop: true });
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
      nodesRef.current.push({ osc: shimmer, gain: shimmerGain, ac, isLoop: true });
    });
  }, []);

  // ─── FOCUS MODE — fast beats with strong bass ─────────────────────────────────
  const startFocus = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.28, ac.currentTime + 2);
    master.connect(ac.destination);

    // Warm tight lowpass
    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 2800;
    lpf.Q.value = 0.8;
    lpf.connect(master);

    // Fast pulsing tones — minor pentatonic, rapid fire
    const focusTones = [
      110.0, 130.8, 155.6, 185.0, 220.0, 246.9, 293.7,
      440.0, 523.3, 587.3, 659.3, 740.0, 880.0
    ];

    const spawnPulse = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime;
      const freq = focusTones[Math.floor(Math.random() * focusTones.length)];
      const duration = 0.8 + Math.random() * 1.2;
      const peakVol = 0.035 + Math.random() * 0.045;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = Math.random() > 0.6 ? 'square' : 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(lpf);
      osc.start(t);
      osc.stop(t + duration);
      nodesRef.current.push({ osc, gain, ac });

      // Faster spawn — 400-1200ms
      const nextIn = 400 + Math.random() * 800;
      const tid = setTimeout(spawnPulse, nextIn);
      timersRef.current.push(tid);
    };

    [0, 300, 700, 1100].forEach(offset => {
      timersRef.current.push(setTimeout(spawnPulse, offset));
    });

    // Heavy bass foundation for focus
    const bassDrones = [
      { freq: 16.35, vol: 0.24 }, // C0 — deepest
      { freq: 27.5, vol: 0.25 },  // A0 — very sub
      { freq: 55.0, vol: 0.22 },  // A1
      { freq: 82.41, vol: 0.18 }, // E2
    ];

    bassDrones.forEach(({ freq, vol }) => {
      const sub = ac.createOscillator();
      const subGain = ac.createGain();
      sub.type = 'sine';
      sub.frequency.value = freq;
      subGain.gain.setValueAtTime(0, ac.currentTime);
      subGain.gain.linearRampToValueAtTime(vol, ac.currentTime + 3);
      sub.connect(subGain);
      subGain.connect(master);
      sub.start();
      nodesRef.current.push({ osc: sub, gain: subGain, ac, isLoop: true });
    });
  }, []);

  // ─── HAUNTED MODE — mysterious cathedral organ, introspective ─────────────────────
  const startHaunted = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.28, ac.currentTime + 6);
    master.connect(ac.destination);

    // Warm cathedral resonance — mysterious, not scary
    const warmLpf = ac.createBiquadFilter();
    warmLpf.type = 'lowpass';
    warmLpf.frequency.value = 2200;
    warmLpf.Q.value = 0.7;
    
    // Organ-like resonance peak
    const orgResonance = ac.createBiquadFilter();
    orgResonance.type = 'peaking';
    orgResonance.frequency.value = 1600;
    orgResonance.gain.value = 4;
    orgResonance.Q.value = 2.5;
    
    warmLpf.connect(orgResonance);
    orgResonance.connect(master);

    // Phrygian scale (Em: E-F-G-A-B-C-D) — mysterious, not creepy
    // Deeper, more soulful notes
    const phrygian = [82.4, 87.3, 98.0, 110.0, 123.5, 130.8, 146.8, 164.8, 196.0, 220.0, 246.9, 293.7, 329.6, 392.0, 523.3, 659.3];

    const spawnTone = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.08;
      const freq = phrygian[Math.floor(Math.random() * phrygian.length)];
      const duration = 2 + Math.random() * 5;

      // Organ-like tone — sine for smooth, rich sound
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const vibrato = ac.createOscillator();
      const vibratoGain = ac.createGain();
      
      osc.type = 'sine'; // Smooth, organ-like
      osc.frequency.value = freq;
      
      // Slow, gentle vibrato — adds depth, not unease
      vibrato.frequency.value = 5 + Math.random() * 2;
      vibratoGain.gain.value = freq * 0.006;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      // Smooth attack, long sustain — contemplative
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.055 * 0.5, t + duration * 0.1);
      gain.gain.linearRampToValueAtTime(0.055, t + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      
      osc.connect(gain);
      gain.connect(warmLpf);
      vibrato.start(t);
      osc.start(t);
      osc.stop(t + duration + 0.3);
      vibrato.stop(t + duration + 0.3);
      nodesRef.current.push({ osc, gain, ac });

      // Slower, more meditative rhythm
      const nextIn = 2000 + Math.random() * 4000;
      const tid = setTimeout(spawnTone, nextIn);
      timersRef.current.push(tid);
    };

    [0, 2500, 5200].forEach(offset => {
      timersRef.current.push(setTimeout(spawnTone, offset));
    });

    // Warm foundational drone — mysterious but stable
    const bassDrone = ac.createOscillator();
    const bassGain = ac.createGain();
    bassDrone.type = 'sine';
    bassDrone.frequency.value = 82.4; // E2 — warm, grounded
    bassGain.gain.setValueAtTime(0, ac.currentTime);
    bassGain.gain.linearRampToValueAtTime(0.14, ac.currentTime + 7);
    bassDrone.connect(bassGain);
    bassGain.connect(master);
    bassDrone.start();
    nodesRef.current.push({ osc: bassDrone, gain: bassGain, ac, isLoop: true });

    // Slow, subtle breathing — contemplative, not unsettling
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.15; // Very slow breathing
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    nodesRef.current.push({ osc: lfo, gain: lfoGain, ac });
  }, []);

  // ─── ARCADE MODE — retro 8-bit chiptune ─────────────────────────────────
  const startArcade = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.22, ac.currentTime + 2);
    master.connect(ac.destination);

    // Sharp, thin sound — no bass depth
    const hpf = ac.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 400;
    hpf.connect(master);

    // Chiptune bleeps — square waves, arpeggios
    const chiptunes = [
      440, 494, 523, 587, 659, 784, 880, 988, 1046, 1175
    ];

    const spawnBleep = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime;
      const freq = chiptunes[Math.floor(Math.random() * chiptunes.length)];
      const duration = 0.15 + Math.random() * 0.25;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(hpf);
      osc.start(t);
      osc.stop(t + duration);
      nodesRef.current.push({ osc, gain, ac });

      // Rapid bleeps
      const nextIn = 150 + Math.random() * 600;
      const tid = setTimeout(spawnBleep, nextIn);
      timersRef.current.push(tid);
    };

    [0, 250, 500, 750].forEach(offset => {
      timersRef.current.push(setTimeout(spawnBleep, offset));
    });
  }, []);

  // ─── DEEP VOID MODE — oppressive subsonic ─────────────────────────────────
  const startDeep = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.35, ac.currentTime + 7);
    master.connect(ac.destination);

    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 600;
    lpf.Q.value = 1.5;
    lpf.connect(master);

    // Very deep sub drones
    const drones = [
      { freq: 16.35, detune: 0, vol: 0.2 },    // C0 — deepest void
      { freq: 27.5, detune: 5, vol: 0.18 },    // A0
      { freq: 32.7, detune: -6, vol: 0.15 },   // C#1
      { freq: 49.0, detune: 3, vol: 0.12 },    // B0
    ];

    drones.forEach(({ freq, detune, vol }) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ac.currentTime + 6 + Math.random() * 3);
      osc.connect(gain);
      gain.connect(lpf);
      osc.start();
      nodesRef.current.push({ osc, gain, ac, isLoop: true });
    });

    // Slow pulse
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.025;
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    nodesRef.current.push({ osc: lfo, gain: lfoGain, ac });
  }, []);

  // ─── GREENWOOD MODE — blues, soul, resilience ─────────────────────────────
  const startGreenwood = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.33, ac.currentTime + 6);
    master.connect(ac.destination);

    // Warm, soulful mid-forward sound
    const warmLpf = ac.createBiquadFilter();
    warmLpf.type = 'lowpass';
    warmLpf.frequency.value = 2200;
    warmLpf.Q.value = 0.6;
    
    const soulBoost = ac.createBiquadFilter();
    soulBoost.type = 'peaking';
    soulBoost.frequency.value = 400;
    soulBoost.gain.value = 4;
    soulBoost.Q.value = 1;
    
    warmLpf.connect(soulBoost);
    soulBoost.connect(master);

    // Deep reverb delay
    const delay = ac.createDelay(4);
    delay.delayTime.value = 0.72;
    const delayFB = ac.createGain();
    delayFB.gain.value = 0.6;
    const delayWet = ac.createGain();
    delayWet.gain.value = 0.4;
    delay.connect(delayFB);
    delayFB.connect(delay);
    delay.connect(delayWet);
    delayWet.connect(master);

    // Deep blues pentatonic — emphasis on soul notes
    const bluesTones = [
      82.41, 110.0, 123.5, 146.8, 164.8, 196.0,     // E1-G3
      220.0, 246.9, 293.7, 330.0, 369.9, 392.0,    // A3-G4
      440.0, 493.9, 587.3, 659.3, 739.9, 880.0,    // A4-A5
    ];

    const spawnBlues = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.08;
      const freq = bluesTones[Math.floor(Math.random() * bluesTones.length)];
      const duration = 3 + Math.random() * 9;
      const peakVol = 0.05 + Math.random() * 0.07;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 10;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol * 0.5, t + duration * 0.25);
      gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(warmLpf);
      osc.start(t);
      osc.stop(t + duration + 0.2);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 900 + Math.random() * 4000;
      timersRef.current.push(setTimeout(spawnBlues, nextIn));
    };

    [0, 1800, 3600, 5400].forEach(offset => {
      timersRef.current.push(setTimeout(spawnBlues, offset));
    });

    // Strong foundational bass
    [55.0, 82.41, 110.0].forEach((freq, i) => {
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.type = 'sine';
      bass.frequency.value = freq;
      bass.detune.value = (Math.random() - 0.5) * 3;
      bassGain.gain.setValueAtTime(0, ac.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.14 - i * 0.02, ac.currentTime + 7 + i);
      bass.connect(bassGain);
      bassGain.connect(master);
      bass.start();
      nodesRef.current.push({ osc: bass, gain: bassGain, ac, isLoop: true });
    });
  }, []);

  // ─── UPLIFTING MODE — hopeful, ascending major key ─────────────────────────
  const startUplifting = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.30, ac.currentTime + 4);
    master.connect(ac.destination);

    // Bright, open filter
    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 3200;
    lpf.Q.value = 0.5;
    lpf.connect(master);

    // Major key ascending tones — C major pentatonic
    const upliftTones = [
      130.8, 164.8, 196.0, 246.9, 261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 783.9, 880.0, 1046.5
    ];

    const spawnAscent = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime;
      const baseIdx = Math.floor(Math.random() * 10);
      const freq = upliftTones[baseIdx];
      const duration = 1.5 + Math.random() * 3.5;
      const peakVol = 0.04 + Math.random() * 0.055;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(lpf);
      osc.start(t);
      osc.stop(t + duration);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 600 + Math.random() * 2400;
      const tid = setTimeout(spawnAscent, nextIn);
      timersRef.current.push(tid);
    };

    [0, 900, 1800, 2700].forEach(offset => {
      timersRef.current.push(setTimeout(spawnAscent, offset));
    });

    // Warm, present bass
    const bass = ac.createOscillator();
    const bassGain = ac.createGain();
    bass.type = 'sine';
    bass.frequency.value = 65.4; // E2
    bassGain.gain.setValueAtTime(0, ac.currentTime);
    bassGain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 5);
    bass.connect(bassGain);
    bassGain.connect(master);
    bass.start();
    nodesRef.current.push({ osc: bass, gain: bassGain, ac, isLoop: true });
  }, []);

  // ─── WESTERN MODE — pedal steel, outlaw spirit ───────────────────────────
  const startWestern = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.36, ac.currentTime + 5);
    master.connect(ac.destination);

    // Bright, twangy resonance — more presence + shimmer
    const warmLpf = ac.createBiquadFilter();
    warmLpf.type = 'lowpass';
    warmLpf.frequency.value = 2400; // Brighter cutoff
    warmLpf.Q.value = 0.6;
    
    const midBoost = ac.createBiquadFilter();
    midBoost.type = 'peaking';
    midBoost.frequency.value = 1200; // Higher mid-boost for twang
    midBoost.gain.value = 5;
    midBoost.Q.value = 2;
    
    const twangBoost = ac.createBiquadFilter();
    twangBoost.type = 'peaking';
    twangBoost.frequency.value = 2800; // Bright harmonic presence
    twangBoost.gain.value = 3.5;
    twangBoost.Q.value = 1.5;
    
    warmLpf.connect(midBoost);
    midBoost.connect(twangBoost);
    twangBoost.connect(master);

    // Pentatonic minor — country/western blues
    const westernTones = [
      110.0, 123.5, 146.8, 165.0, 196.0,       // A2-G3
      220.0, 246.9, 293.7, 330.0, 392.0,       // A3-G4
      440.0, 493.9, 587.3, 659.3, 784.0, 880.0 // A4-A5
    ];

    const spawnSlide = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.04;
      const startFreq = westernTones[Math.floor(Math.random() * westernTones.length)];
      const endFreq = westernTones[Math.floor(Math.random() * westernTones.length)];
      const duration = 2.5 + Math.random() * 5;
      const peakVol = 0.06 + Math.random() * 0.08;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine'; // Triangle for more harmonic richness
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration * 0.4);
      osc.frequency.linearRampToValueAtTime(endFreq, t + duration);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol * 0.5, t + duration * 0.1);
      gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(warmLpf);
      osc.start(t);
      osc.stop(t + duration + 0.2);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 800 + Math.random() * 3500;
      timersRef.current.push(setTimeout(spawnSlide, nextIn));
    };

    [0, 1200, 2800, 4500].forEach(offset => {
      timersRef.current.push(setTimeout(spawnSlide, offset));
    });

    // Punchy, grounded bass — strong cowboy presence
    [55.0, 82.41, 110.0].forEach((freq, i) => {
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.type = 'sine';
      bass.frequency.value = freq;
      bassGain.gain.setValueAtTime(0, ac.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.18 - i * 0.02, ac.currentTime + 5 + i * 0.3);
      bass.connect(bassGain);
      bassGain.connect(master);
      bass.start();
      nodesRef.current.push({ osc: bass, gain: bassGain, ac, isLoop: true });
    });

    // Bright harmonic shimmer — twang presence
    const shimmer = ac.createOscillator();
    const shimmerGain = ac.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 1400; // Bright midrange twang
    shimmerGain.gain.setValueAtTime(0, ac.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(0.035, ac.currentTime + 5);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);
    shimmer.start();
    nodesRef.current.push({ osc: shimmer, gain: shimmerGain, ac, isLoop: true });
  }, []);

  // ─── SOUTHERN TRAP MODE — hip hop, boom bap, dark southern soul ───────────
  const startTrap = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.32, ac.currentTime + 4);
    master.connect(ac.destination);

    // Warm, compressed sound — trap aesthetic
    const warmFilter = ac.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = 2600;
    warmFilter.Q.value = 0.7;
    
    const trapBoost = ac.createBiquadFilter();
    trapBoost.type = 'peaking';
    trapBoost.frequency.value = 200;
    trapBoost.gain.value = 4;
    trapBoost.Q.value = 1;
    
    warmFilter.connect(trapBoost);
    trapBoost.connect(master);

    // Southern blues scale + minor pentatonic — soulful, dark
    // Dm: D-E-F-G-A-Bb-C
    const trapScale = [73.4, 82.4, 87.3, 98.0, 110.0, 116.5, 130.8, 146.8, 175.0, 196.0, 220.0, 246.9, 293.7, 349.2, 392.0, 440.0, 587.3];

    // Trap beat: 808 sub-bass kick
    const spawnKick = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime;

      // 808-style sub punch
      const kickOsc = ac.createOscillator();
      const kickGain = ac.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(160, t);
      kickOsc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
      kickGain.gain.setValueAtTime(0.18, t);
      kickGain.gain.exponentialRampToValueAtTime(0.02, t + 0.25);
      kickOsc.connect(kickGain);
      kickGain.connect(master);
      kickOsc.start(t);
      kickOsc.stop(t + 0.3);
      nodesRef.current.push({ osc: kickOsc, gain: kickGain, ac });

      // Trap hi-hat layer (sparse, syncopated)
      if (Math.random() > 0.4) {
        const hatOsc = ac.createOscillator();
        const hatGain = ac.createGain();
        hatOsc.type = 'square';
        hatOsc.frequency.value = 12000;
        hatGain.gain.setValueAtTime(0.05, t + 0.05);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        hatOsc.connect(hatGain);
        hatGain.connect(master);
        hatOsc.start(t + 0.05);
        hatOsc.stop(t + 0.15);
        nodesRef.current.push({ osc: hatOsc, gain: hatGain, ac });
      }

      // Trap timing: off-beat, syncopated
      const nextKick = 300 + Math.random() * 400;
      const tid = setTimeout(spawnKick, nextKick);
      timersRef.current.push(tid);
    };

    timersRef.current.push(setTimeout(spawnKick, 0));

    // Melodic layer — soulful southern strings
    const spawnMelody = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.1;
      const freq = trapScale[Math.floor(Math.random() * trapScale.length)];
      const duration = 2 + Math.random() * 4;
      const peakVol = 0.045 + Math.random() * 0.055;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle'; // Warm, vocal-like
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 8;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol * 0.6, t + duration * 0.2);
      gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(warmFilter);
      osc.start(t);
      osc.stop(t + duration);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 2000 + Math.random() * 3500;
      const tid = setTimeout(spawnMelody, nextIn);
      timersRef.current.push(tid);
    };

    [0, 1200, 2800, 4200].forEach(offset => {
      timersRef.current.push(setTimeout(spawnMelody, offset));
    });

    // Heavy sub-bass foundation (trap essential)
    [16.35, 36.7, 55.0].forEach((freq, i) => {
      const sub = ac.createOscillator();
      const subGain = ac.createGain();
      sub.type = 'sine';
      sub.frequency.value = freq;
      subGain.gain.setValueAtTime(0, ac.currentTime);
      subGain.gain.linearRampToValueAtTime(0.22 - i * 0.03, ac.currentTime + 5);
      sub.connect(subGain);
      subGain.connect(master);
      sub.start();
      nodesRef.current.push({ osc: sub, gain: subGain, ac, isLoop: true });
    });
  }, []);

  // ─── 90s HOUSE MODE — deep house euphoria ───────────────────────────────
  const startHouse90s = useCallback((ac) => {
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.31, ac.currentTime + 4);
    master.connect(ac.destination);

    // Smooth, lush lowpass
    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 2400;
    lpf.Q.value = 0.7;
    lpf.connect(master);

    // 90s house — soulful house chords and pads
    const houseTones = [
      98.0, 123.5, 146.8, 196.0,        // G2-G3 (deep soul chords)
      220.0, 246.9, 293.7, 349.2, 392.0, // A3-G4
      440.0, 493.9, 587.3, 659.3, 783.9, 880.0, // A4-A5
    ];

    // Warm, soulful pads
    const spawnPad = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime + 0.1;
      const freq = houseTones[Math.floor(Math.random() * houseTones.length)];
      const duration = 4 + Math.random() * 8;
      const peakVol = 0.03 + Math.random() * 0.05;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 6;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peakVol * 0.7, t + duration * 0.15);
      gain.gain.linearRampToValueAtTime(peakVol, t + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(lpf);
      osc.start(t);
      osc.stop(t + duration + 0.2);
      nodesRef.current.push({ osc, gain, ac });

      const nextIn = 1500 + Math.random() * 4500;
      timersRef.current.push(setTimeout(spawnPad, nextIn));
    };

    [0, 1500, 3200, 5100].forEach(offset => {
      timersRef.current.push(setTimeout(spawnPad, offset));
    });

    // Steady, hypnotic house kick and bass groove
    const kickBass = () => {
      if (!playingRef.current) return;
      const t = ac.currentTime;

      // Kick drum
      const kickOsc = ac.createOscillator();
      const kickGain = ac.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(120, t);
      kickOsc.frequency.exponentialRampToValueAtTime(50, t + 0.08);
      kickGain.gain.setValueAtTime(0.18, t);
      kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      kickOsc.connect(kickGain);
      kickGain.connect(master);
      kickOsc.start(t);
      kickOsc.stop(t + 0.15);

      // Deep sub-bass groove
      const subBass = ac.createOscillator();
      const subGain = ac.createGain();
      subBass.type = 'sine';
      subBass.frequency.value = 55.0; // Deep A1
      subGain.gain.setValueAtTime(0.18, t);
      subGain.gain.linearRampToValueAtTime(0.16, t + 0.3);
      subBass.connect(subGain);
      subGain.connect(master);
      subBass.start(t);
      subBass.stop(t + 0.5);

      // Ultra-sub foundation
      const ultraSub = ac.createOscillator();
      const ultraSubGain = ac.createGain();
      ultraSub.type = 'sine';
      ultraSub.frequency.value = 27.5; // A0
      ultraSubGain.gain.setValueAtTime(0.14, t);
      ultraSubGain.gain.linearRampToValueAtTime(0.12, t + 0.3);
      ultraSub.connect(ultraSubGain);
      ultraSubGain.connect(master);
      ultraSub.start(t);
      ultraSub.stop(t + 0.5);

      nodesRef.current.push({ osc: kickOsc, gain: kickGain, ac });
      nodesRef.current.push({ osc: subBass, gain: subGain, ac });
      nodesRef.current.push({ osc: ultraSub, gain: ultraSubGain, ac });

      // Four-on-the-floor house beat (~120 BPM)
      const nextKick = 500;
      timersRef.current.push(setTimeout(kickBass, nextKick));
    };

    timersRef.current.push(setTimeout(kickBass, 0));

    // Ambient high-frequency shimmer
    const shimmer = ac.createOscillator();
    const shimmerGain = ac.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 2093; // High C6
    shimmerGain.gain.setValueAtTime(0, ac.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(0.015, ac.currentTime + 5);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(lpf);
    shimmer.start();
    nodesRef.current.push({ osc: shimmer, gain: shimmerGain, ac, isLoop: true });
  }, []);

  const start = useCallback((mode = 'drift', debtProgress = 0) => {
    if (playingRef.current) return;
    try {
      const ac = getCtx();
      if (ac.state === 'suspended') ac.resume();
      playingRef.current = true;

      if (mode === 'drift') startDrift(ac);
      else if (mode === 'focus') startFocus(ac);
      else if (mode === 'haunted') startHaunted(ac);
      else if (mode === 'arcade') startArcade(ac);
      else if (mode === 'deep') startDeep(ac);
      else if (mode === 'tulsa') startGreenwood(ac);
      else if (mode === 'uplifting') startUplifting(ac);
      else if (mode === 'western') startWestern(ac);
      else if (mode === 'house90s') startHouse90s(ac);
      else if (mode === 'trap') startTrap(ac);
    } catch (e) {}
  }, [startDrift, startFocus, startHaunted, startArcade, startDeep, startGreenwood, startUplifting, startWestern, startHouse90s, startTrap]);

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