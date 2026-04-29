import React from 'react';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/loanCalculations';
import { Flame } from 'lucide-react';

export default function ExtraBudgetSlider({ value, onChange, max = 2000 }) {
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
        onValueChange={([v]) => onChange(v)}
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