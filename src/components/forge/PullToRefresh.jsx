import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);
  const pullY = useMotionValue(0);
  const opacity = useTransform(pullY, [0, THRESHOLD], [0, 1]);
  const rotate = useTransform(pullY, [0, THRESHOLD], [0, 360]);
  const scale = useTransform(pullY, [0, THRESHOLD * 0.6, THRESHOLD], [0.5, 0.9, 1]);

  const onTouchStart = useCallback((e) => {
    // Only activate if scrolled to very top
    if (window.scrollY > 2) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta < 0) { pulling.current = false; return; }
    // Rubber-band resistance
    const resistance = delta / (1 + delta / THRESHOLD);
    pullY.set(Math.min(resistance, THRESHOLD));
  }, [pullY]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullY.get() >= THRESHOLD * 0.85 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    pullY.set(0);
    startY.current = null;
  }, [pullY, onRefresh, refreshing]);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pt-2 pointer-events-none"
      >
        <motion.div
          style={{ scale, rotate: refreshing ? 0 : rotate }}
          animate={refreshing ? { rotate: 360 } : {}}
          transition={refreshing ? { repeat: Infinity, duration: 0.7, ease: 'linear' } : {}}
          className="w-8 h-8 rounded-full glass border border-primary/40 flex items-center justify-center shadow-lg"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
        </motion.div>
        <span className="text-[10px] text-primary/70 font-mono mt-1 select-none">
          {refreshing ? 'Refreshing…' : 'Pull to refresh'}
        </span>
      </motion.div>

      {/* Content shifted down while pulling */}
      <motion.div style={{ y: useTransform(pullY, [0, THRESHOLD], [0, THRESHOLD * 0.5]) }}>
        {children}
      </motion.div>
    </div>
  );
}