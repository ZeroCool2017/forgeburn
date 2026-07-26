import React, { useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/loanCalculations';
import { Flame } from 'lucide-react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playFieldTone } from '@/lib/orchestraSound';

export default function ExtraBudgetSlider({ value, onChange, max = 2000 }) {
  const { enabled } = useAmbientSoundContext();
  const lastPlayRef = useRef(0);

  // Dragging the slider sings in the same field voice as the mind map — pitch
  // rises with the budget, so reaching for more momentum feels brighter.
  const handleChange = ([v]) => {
    onChange(v);
    const now = performance.now();
    if (now - lastPlayRef.current < 110) return;
    lastPlayRef.current = now;
    const norm = Math.max(0, Math.min(1, v / max));
    playFieldTone(Math.round(norm * 7), enabled, 1.4);
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          Extra Monthly Strike
        </h3>
        <span className="text-lg font-bold font-mono text-primary glow-text">
          {formatCurrency(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleChange}
        max={max}
        step={25}
        className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary/50 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/20"
      />
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
        <span>$0</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}