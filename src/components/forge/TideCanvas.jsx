import React, { useEffect, useRef } from 'react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playFieldTone, playOrbTone, playFieldBass } from '@/lib/orchestraSound';

const W = 540;
const H = 300;

/**
 * Tides — a living tide pool that visualizes monthly cash flow as water.
 * Income streams in from above, anchors drain steadily at the bottom,
 * spending habits swirl as eddies, and the depth (reserve) glows at center.
 * Drag through the water to play therapeutic pentatonic tones.
 */
export default function TideCanvas({ income, anchors, habits, depth }) {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);
  const planktonRef = useRef([]);
  const inflowRef = useRef([]);
  const outflowRef = useRef([]);
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const { enabled } = useAmbientSoundContext();

  // Seed plankton once
  useEffect(() => {
    planktonRef.current = Array.from({ length: 34 }, () => ({
      x: Math.random() * W,
      y: 40 + Math.random() * (H - 80),
      r: 0.6 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      drift: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let frame;
    let t = 0;

    const anchorDrains = anchors.map((a, i) => ({
      x: anchors.length === 1 ? W / 2 : 50 + (i / Math.max(1, anchors.length - 1)) * (W - 100),
      y: H - 22,
      amount: a.monthly_average || 0,
      emoji: a.emoji,
    }));

    const habitEddies = habits.map((h, i) => ({
      x: habits.length === 1 ? W / 2 : 80 + (i / Math.max(1, habits.length - 1)) * (W - 160),
      y: H * 0.58,
      amount: h.monthly_average || 0,
      emoji: h.emoji,
      phase: Math.random() * Math.PI * 2,
    }));

    const incomeRate = Math.min(0.8, (income || 0) / 6000);
    const depthRatio = income > 0 ? Math.max(0, depth) / income : 0;

    const animate = () => {
      t += 16;
      ctx.clearRect(0, 0, W, H);

      // Dot grid
      ctx.fillStyle = 'rgba(140,100,240,0.02)';
      for (let x = 20; x < W; x += 22) {
        for (let y = 20; y < H; y += 22) {
          ctx.beginPath();
          ctx.arc(x, y, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Surface wave
      ctx.beginPath();
      ctx.moveTo(0, 28);
      for (let x = 0; x <= W; x += 4) {
        const y = 28 + Math.sin(x * 0.025 + t * 0.0015) * 4 + Math.sin(x * 0.015 + t * 0.001) * 2;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(140,100,240,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Income stream — particles falling from the source
      if (income > 0 && Math.random() < incomeRate) {
        inflowRef.current.push({
          x: W / 2 + (Math.random() - 0.5) * 24,
          y: 0,
          vy: 1.2 + Math.random() * 0.6,
          life: 1,
        });
      }
      inflowRef.current = inflowRef.current.filter(p => {
        p.y += p.vy;
        if (p.y > H * 0.4) p.life -= 0.05;
        if (p.life <= 0 || p.y > H) return false;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.life * 0.6})`;
        ctx.fill();
        return true;
      });

      // Depth glow — the reserve that remains, pulsing gently
      const glowR = (50 + depthRatio * 90) * (1 + Math.sin(t * 0.002) * 0.06);
      const glowAlpha = 0.05 + depthRatio * 0.12;
      const grad = ctx.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, glowR);
      grad.addColorStop(0, `rgba(167,139,250,${glowAlpha})`);
      grad.addColorStop(0.6, `rgba(140,100,240,${glowAlpha * 0.4})`);
      grad.addColorStop(1, 'rgba(140,100,240,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Plankton — bioluminescent drifters
      planktonRef.current.forEach(p => {
        p.phase += 0.02 * p.speed;
        p.drift += 0.003;
        const px = p.x + Math.sin(p.drift) * 10;
        const py = p.y + Math.cos(p.drift * 0.7) * 6 + Math.sin(t * 0.001 + p.phase) * 2;
        const twinkle = 0.3 + Math.sin(p.phase) * 0.25;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,181,253,${twinkle * 0.45})`;
        ctx.fill();
      });

      // Habit eddies — swirling currents
      habitEddies.forEach(e => {
        e.phase += 0.012;
        const radius = 10 + Math.min(22, e.amount / 30);
        for (let a = 0; a < Math.PI * 2; a += 0.35) {
          const sr = radius * (0.35 + (a / (Math.PI * 2)) * 0.65);
          const sx = e.x + Math.cos(a + e.phase) * sr;
          const sy = e.y + Math.sin(a + e.phase) * sr * 0.55;
          ctx.beginPath();
          ctx.arc(sx, sy, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196,181,253,${0.25 + Math.sin(a + e.phase) * 0.12})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(e.x, e.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(196,181,253,0.45)';
        ctx.fill();
      });

      // Anchor drains — steady outflow at the bottom
      anchorDrains.forEach(d => {
        const drainSize = 3 + Math.min(14, d.amount / 60);
        ctx.beginPath();
        ctx.arc(d.x, d.y, drainSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140,100,240,0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(140,100,240,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        if (Math.random() < 0.25) {
          outflowRef.current.push({
            x: d.x + (Math.random() - 0.5) * drainSize,
            y: d.y,
            vy: 0.4 + Math.random() * 0.8,
            life: 1,
          });
        }
      });

      outflowRef.current = outflowRef.current.filter(p => {
        p.y += p.vy;
        p.life -= 0.025;
        if (p.life <= 0 || p.y > H + 10) return false;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,100,240,${p.life * 0.35})`;
        ctx.fill();
        return true;
      });

      // Ripples from interaction
      ripplesRef.current = ripplesRef.current.filter(r => {
        r.radius += 2;
        r.alpha -= 0.02;
        if (r.alpha <= 0) return false;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(167,139,250,${r.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        return true;
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [income, anchors, habits, depth]);

  const eventPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const handlePointerDown = (e) => {
    const pt = eventPoint(e);
    playFieldBass(enabled, 0.4);
    playOrbTone(pt.y / H, enabled, 2.0);
    ripplesRef.current.push({ x: pt.x, y: pt.y, radius: 8, alpha: 0.7 });
    dragRef.current = { active: true, lastX: pt.x, lastY: pt.y };
    canvasRef.current.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return;
    const pt = eventPoint(e);
    const dist = Math.hypot(pt.x - dragRef.current.lastX, pt.y - dragRef.current.lastY);
    if (dist > 22) {
      playFieldTone(Math.round((1 - pt.y / H) * 7), enabled, 1.6);
      ripplesRef.current.push({ x: pt.x, y: pt.y, radius: 6, alpha: 0.5 });
      dragRef.current.lastX = pt.x;
      dragRef.current.lastY = pt.y;
    }
  };

  const handlePointerUp = (e) => {
    dragRef.current.active = false;
    canvasRef.current?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'none', cursor: 'crosshair' }}
      aria-label="Interactive tide pool — your monthly cash flow as living water"
    />
  );
}