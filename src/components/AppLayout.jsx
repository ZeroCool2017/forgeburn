import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import CelestialBackground from '@/components/forge/CelestialBackground';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background obsidian-grid">
      <CelestialBackground />
      {/* Subtle vignette edges */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 60%, hsl(0,0%,4%) 100%)' }} />
      {/* Page content — padded so it clears the bottom nav */}
      <div className="pb-safe-nav relative z-10">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}