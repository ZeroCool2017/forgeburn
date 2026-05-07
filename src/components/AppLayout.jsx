import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page content — padded so it clears the bottom nav (z-10) */}
      <div className="pb-safe-nav relative z-10">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}