import React, { useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Hammer, Swords, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { to: '/', label: 'Forge', icon: Hammer },
  { to: '/strategy', label: 'Strategy', icon: Swords },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabPress = useCallback((to, isActive) => {
    if (isActive) {
      // Re-tap active tab → scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(to);
    }
  }, [navigate]);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed left-0 right-0 z-40 border-t border-border/30"
      style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom)', background: 'hsl(0,0%,6%/0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          const TabIcon = Icon;
          return (
            <button
              key={to}
              onClick={() => handleTabPress(to, isActive)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all select-none ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative"
              >
                <TabIcon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}