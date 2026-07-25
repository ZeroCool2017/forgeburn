import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import SoundIntroBar from '@/components/forge/SoundIntroBar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Headphone hint + sound toggle — floats at the top */}
      <SoundIntroBar />
      {/* Page content — padded so it clears the bottom nav (z-10) */}
      <div className="pb-safe-nav relative z-10">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}