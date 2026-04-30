import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_CONFIG } from '@/lib/loanCalculations';

// Detects touch/mobile devices
const isMobile = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export default function CategorySheet({ value, onChange }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mobile = isMobile();
  const selected = CATEGORY_CONFIG[value];

  if (!mobile) {
    // Desktop: keep existing Select
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-secondary/50 border-border/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>
              {cfg.emoji} {cfg.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Mobile: bottom sheet drawer
  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm text-foreground text-left"
      >
        <span>{selected?.emoji}</span>
        <span>{selected?.label}</span>
      </button>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="glass border-t border-border/50">
          <DrawerHeader>
            <DrawerTitle className="text-foreground text-base">Select Category</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 grid grid-cols-2 gap-2" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => { onChange(key); setDrawerOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  value === key
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/30 bg-secondary/30 text-foreground hover:border-border/60'
                }`}
              >
                <span className="text-xl">{cfg.emoji}</span>
                <span className="text-sm font-medium">{cfg.label}</span>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}