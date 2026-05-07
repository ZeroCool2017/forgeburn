import React, { useEffect, useRef } from 'react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';

/**
 * Celestial night sky background — layered starfield with depth and parallax.
 * Creates atmospheric context for floating organisms without overwhelming them.
 */

export default function CelestialBackground() {
  const canvasRef = useRef(null);
  const context = useAmbientSoundContext();
  const mode = context?.mode || 'off';
  const seedRef = useRef(null);

  // Generate unique seed per page (from pathname) for reproducible unique patterns
  if (!seedRef.current) {
    const hash = window.location.pathname.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    seedRef.current = hash % 10000;
  }

  // Seeded random for consistent but unique patterns
  const seededRandom = (seed, index) => {
    const x = Math.sin(seed + index * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Set canvas to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate multiple layers of stars with different depths using seeded randomness
    const starLayers = Array.from({ length: 5 }).map((_, layer) => {
      const depth = (layer + 1) / 5; // 0.2 to 1
      const baseCount = layer === 0 ? 300 : layer === 1 ? 250 : layer === 2 ? 180 : layer === 3 ? 120 : 60;
      const starCount = Math.floor(baseCount * depth);
      const stars = Array.from({ length: starCount }).map((_, idx) => {
        const seed = seedRef.current + layer * 1000 + idx;
        return {
          x: (seededRandom(seed, 0) * canvas.width) % canvas.width,
          y: (seededRandom(seed, 1) * canvas.height) % canvas.height,
          brightness: 0.2 + seededRandom(seed, 2) * 0.8,
          twinkleDuration: 1500 + seededRandom(seed, 3) * 3500,
          twinklePhase: seededRandom(seed, 4) * Math.PI * 2,
          twinkleActive: seededRandom(seed, 5) > 0.5, // 50% of stars twinkle
          size: depth * (0.4 + seededRandom(seed, 6) * 1.2),
          color: ['hsl(200, 100%, 70%)', 'hsl(210, 80%, 65%)', 'hsl(220, 90%, 75%)', 'hsl(240, 70%, 70%)', 'hsl(195, 95%, 72%)'][
            Math.floor(seededRandom(seed, 7) * 5)
          ],
        };
      });
      return { depth, stars };
    });

    // Nebula clouds (soft colorful regions)
    const nebulae = Array.from({ length: 3 }).map((_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 150 + Math.random() * 200,
      color: ['hsl(260, 60%, 40%)', 'hsl(240, 50%, 35%)', 'hsl(200, 70%, 45%)'][i % 3],
      opacity: 0.08 + Math.random() * 0.06,
    }));

    const animate = () => {
      time += 16;

      // Dark blue gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'hsl(240, 30%, 5%)'); // Very dark blue at top
      gradient.addColorStop(0.5, 'hsl(250, 40%, 8%)'); // Slightly lighter in middle
      gradient.addColorStop(1, 'hsl(260, 35%, 6%)'); // Dark purple at bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulae.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = nebula.opacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      });

      // Draw star layers with individual twinkling control
       starLayers.forEach((layer) => {
         layer.stars.forEach((star) => {
           // Each star has own twinkling duration for variety
           const twinkle = star.twinkleActive 
             ? Math.sin(time / star.twinkleDuration + star.twinklePhase) * 0.35 + 0.65
             : 1; // Static stars stay bright
           const opacity = star.brightness * twinkle * (0.35 + layer.depth * 0.65);

           ctx.fillStyle = star.color;
           ctx.globalAlpha = opacity;
           ctx.beginPath();
           ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
           ctx.fill();

           // Subtle glow for brighter stars
           if (star.brightness > 0.7 && star.size > 0.6) {
             ctx.globalAlpha = opacity * 0.15;
             ctx.beginPath();
             ctx.arc(star.x, star.y, star.size * 1.8, 0, Math.PI * 2);
             ctx.fill();
           }
         });
       });

      ctx.globalAlpha = 1;

      // Add subtle glow effect to distant areas
      const glowGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8
      );
      glowGradient.addColorStop(0, 'rgba(100, 150, 255, 0.05)');
      glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mode]);

  if (mode === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}