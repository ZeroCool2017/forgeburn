import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { Zap } from 'lucide-react';

export default function RecordPaymentDialog({ loan, open, onOpenChange, onConfirm }) {
  const [amount, setAmount] = useState('');

  if (!loan) return null;

  const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
  const suggested = loan.minimum_payment;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    onConfirm(loan, val);
    setAmount('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <span>{cat.emoji}</span>
            <span>Strike a Chain</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 rounded-xl bg-secondary/40 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1 font-mono">{loan.name}</p>
          <p className="text-xl font-black font-mono text-foreground">{formatCurrency(loan.current_balance)}</p>
          <p className="text-xs text-muted-foreground">{loan.interest_rate}% APR</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Payment Amount</Label>
            <Input
              type="number"
              step="0.01"
              placeholder={`Min. ${formatCurrency(suggested)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/50 border-border/50 font-mono text-lg"
              autoFocus
            />
          </div>

          {/* Quick-select buttons */}
          <div className="flex gap-2">
            {[suggested, suggested * 1.5, suggested * 2].map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAmount(v.toFixed(2))}
                className="flex-1 text-xs font-mono py-1.5 rounded-lg border border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
              >
                {formatCurrency(v)}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold"
          >
            <Zap className="w-4 h-4" />
            Strike! ⚒️
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}