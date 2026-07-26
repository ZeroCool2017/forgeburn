import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SpendingHabitManager() {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', emoji: '💰', monthly_average: 0, pattern: 'momentum_building' });
  const queryClient = useQueryClient();

  const { data: habits = [] } = useQuery({
    queryKey: ['spending_habits'],
    queryFn: () => base44.entities.SpendingHabit.list(),
  });

  const createHabit = useMutation({
    mutationFn: (data) => base44.entities.SpendingHabit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spending_habits'] });
      setFormData({ name: '', emoji: '💰', monthly_average: 0, pattern: 'momentum_building' });
    },
  });

  const updateHabit = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SpendingHabit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spending_habits'] });
      setEditingId(null);
      setFormData({ name: '', emoji: '💰', monthly_average: 0, pattern: 'momentum_building' });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: (id) => base44.entities.SpendingHabit.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spending_habits'] }),
  });

  const handleSubmit = () => {
    if (!formData.name || formData.monthly_average <= 0) return;
    if (editingId) {
      updateHabit.mutate({ id: editingId, data: formData });
    } else {
      createHabit.mutate(formData);
    }
  };

  const handleEdit = (habit) => {
    setEditingId(habit.id);
    setFormData({
      name: habit.name,
      emoji: habit.emoji,
      monthly_average: habit.monthly_average,
      pattern: habit.pattern,
    });
  };

  const totalMonthlySpending = habits.reduce((sum, h) => sum + (h.monthly_average || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">Total Monthly Spending</p>
        <p className="text-lg font-bold text-primary">${totalMonthlySpending.toFixed(0)}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">Every dollar you manage here is a dollar that could accelerate your payoff</p>
      </div>

      {/* Add/Edit Form */}
      <div className="border border-border/30 rounded-lg p-3 space-y-3">
        <input
          type="text"
          placeholder="Habit name (e.g., Coffee runs)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border/20 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary/50"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Emoji"
            value={formData.emoji}
            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
            maxLength="2"
            className="w-12 px-2 py-2 rounded-lg bg-secondary/40 border border-border/20 text-center text-lg focus:outline-none focus:border-primary/50"
          />
          <input
            type="number"
            placeholder="Monthly amount"
            value={formData.monthly_average || ''}
            onChange={(e) => setFormData({ ...formData, monthly_average: parseFloat(e.target.value) || 0 })}
            className="flex-1 px-3 py-2 rounded-lg bg-secondary/40 border border-border/20 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', emoji: '💰', monthly_average: 0, pattern: 'momentum_building' });
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="flex-1 bg-primary/20 hover:bg-primary/30"
          >
            {editingId ? 'Update' : 'Add Habit'}
          </Button>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        <AnimatePresence>
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/20 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{habit.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">${habit.monthly_average.toFixed(0)}/mo</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(habit)}
                  className="p-1.5 rounded-lg bg-secondary/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteHabit.mutate(habit.id)}
                  className="p-1.5 rounded-lg bg-secondary/40 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {habits.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No habits tracked yet. Add one to get started.</p>
      )}
    </div>
  );
}