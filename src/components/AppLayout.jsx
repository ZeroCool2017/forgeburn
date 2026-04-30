import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page content — padded so it clears the bottom nav */}
      <div className="pb-safe-nav">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}