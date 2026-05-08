import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { CATEGORY_CONFIG } from '@/lib/loanCalculations';
import CategorySheet from '@/components/forge/CategorySheet';

export default function EditLoanDialog({ loan, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    current_balance: '',
    original_balance: '',
    interest_rate: '',
    minimum_payment: '',
    category: 'personal',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loan) {
      setForm({
        name: loan.name || '',
        current_balance: loan.current_balance ?? '',
        original_balance: loan.original_balance ?? '',
        interest_rate: loan.interest_rate ?? '',
        minimum_payment: loan.minimum_payment ?? '',
        category: loan.category || 'personal',
      });
    }
  }, [loan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Loan.update(loan.id, {
      ...form,
      current_balance: parseFloat(form.current_balance),
      original_balance: parseFloat(form.original_balance || form.current_balance),
      interest_rate: parseFloat(form.interest_rate),
      minimum_payment: parseFloat(form.minimum_payment),
    });
    await queryClient.invalidateQueries({ queryKey: ['loans'] });
    setSaving(false);
    onOpenChange(false);
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <span>✏️</span> Edit Chain
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
          <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}