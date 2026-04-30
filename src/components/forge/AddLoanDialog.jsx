import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { CATEGORY_CONFIG } from '@/lib/loanCalculations';
import CategorySheet from '@/components/forge/CategorySheet';

export default function AddLoanDialog({ onAdd, open, onOpenChange }) {
  const [form, setForm] = useState({
    name: '',
    current_balance: '',
    original_balance: '',
    interest_rate: '',
    minimum_payment: '',
    category: 'personal',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...form,
      current_balance: parseFloat(form.current_balance),
      original_balance: parseFloat(form.original_balance || form.current_balance),
      interest_rate: parseFloat(form.interest_rate),
      minimum_payment: parseFloat(form.minimum_payment),
    });
    setForm({ name: '', current_balance: '', original_balance: '', interest_rate: '', minimum_payment: '', category: 'personal' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 gap-2">
          <Plus className="w-4 h-4" />
          Add Chain
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <span>⛓️</span> Add a New Chain
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Loan Name</Label>
            <Input
              placeholder="e.g. Chase Credit Card"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-secondary/50 border-border/50 font-mono"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Current Balance</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="$12,000"
                value={form.current_balance}
                onChange={(e) => setForm({ ...form, current_balance: e.target.value })}
                className="bg-secondary/50 border-border/50 font-mono"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Original Balance</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="$15,000"
                value={form.original_balance}
                onChange={(e) => setForm({ ...form, original_balance: e.target.value })}
                className="bg-secondary/50 border-border/50 font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="19.99"
                value={form.interest_rate}
                onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                className="bg-secondary/50 border-border/50 font-mono"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Min. Payment</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="$250"
                value={form.minimum_payment}
                onChange={(e) => setForm({ ...form, minimum_payment: e.target.value })}
                className="bg-secondary/50 border-border/50 font-mono"
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <CategorySheet value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Forge This Chain ⚒️
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}