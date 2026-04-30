import React from 'react';
import { NavLink } from 'react-router-dom';
import { Hammer, Swords, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { to: '/', label: 'Forge', icon: Hammer },
  { to: '/strategy', label: 'Strategy', icon: Swords },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed left-0 right-0 z-40 glass border-t border-border/50"
      style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-all select-none ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => {
              const TabIcon = Icon;
              return (
              <>
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
              </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}