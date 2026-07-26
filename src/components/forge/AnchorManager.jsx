import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnchorManager() {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', emoji: '🏠', monthly_average: 0, category: 'housing' });
  const queryClient = useQueryClient();

  const { data: anchors = [] } = useQuery({
    queryKey: ['anchors'],
    queryFn: () => base44.entities.Anchor.list(),
  });

  const createAnchor = useMutation({
    mutationFn: (data) => base44.entities.Anchor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anchors'] });
      setFormData({ name: '', emoji: '🏠', monthly_average: 0, category: 'housing' });
    },
  });

  const updateAnchor = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Anchor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anchors'] });
      setEditingId(null);
      setFormData({ name: '', emoji: '🏠', monthly_average: 0, category: 'housing' });
    },
  });

  const deleteAnchor = useMutation({
    mutationFn: (id) => base44.entities.Anchor.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anchors'] }),
  });

  const handleSubmit = () => {
    if (!formData.name || formData.monthly_average <= 0) return;
    if (editingId) {
      updateAnchor.mutate({ id: editingId, data: formData });
    } else {
      createAnchor.mutate(formData);
    }
  };

  const handleEdit = (anchor) => {
    setEditingId(anchor.id);
    setFormData({
      name: anchor.name,
      emoji: anchor.emoji || '🏠',
      monthly_average: anchor.monthly_average,
      category: anchor.category,
    });
  };

  const totalMonthlyAnchor = anchors.reduce((sum, a) => sum + (a.monthly_average || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-mono text-muted-foreground mb-0.5">Anchor Drag</p>
          <p className="text-xl font-black text-primary font-mono">${totalMonthlyAnchor.toFixed(0)}</p>
        </div>
        <p className="text-[9px] text-muted-foreground/60 max-w-[200px] text-right leading-tight">
          Your structural base. Lowering these directly shrinks the anchor rings on your map and releases payoff budget.
        </p>
      </div>

      {/* Add/Edit Form */}
      <div className="border border-border/30 rounded-lg p-3 space-y-3 bg-secondary/10">
        <input
          type="text"
          placeholder="Anchor name (e.g., Rent, Electric bill)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/20 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary/50 font-mono"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Icon"
            value={formData.emoji}
            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
            maxLength="2"
            className="w-12 px-2 py-2 rounded-lg bg-background/50 border border-border/20 text-center text-lg focus:outline-none focus:border-primary/50"
          />
          <input
            type="number"
            placeholder="Monthly cost"
            value={formData.monthly_average || ''}
            onChange={(e) => setFormData({ ...formData, monthly_average: parseFloat(e.target.value) || 0 })}
            className="flex-1 px-3 py-2 rounded-lg bg-background/50 border border-border/20 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary/50 font-mono font-bold"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-background/50 border border-border/20 text-xs text-muted-foreground focus:outline-none"
          >
            <option value="housing">Housing / Rent</option>
            <option value="utilities">Utilities & Energy</option>
            <option value="insurance">Insurance</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="other">Other Bill</option>
          </select>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="px-4 text-xs font-mono font-bold gap-1 bg-primary/20 border border-primary/30 text-foreground hover:bg-primary/35"
          >
            <Plus className="w-3.5 h-3.5" />
            {editingId ? 'SAVE' : 'ADD'}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        <AnimatePresence>
          {anchors.map((anchor) => (
            <motion.div
              key={anchor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/20 bg-background/30 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base select-none">{anchor.emoji || '🏠'}</span>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight">{anchor.name}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/70 tracking-widest uppercase mt-0.5">{anchor.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs font-mono font-bold text-foreground/90">${anchor.monthly_average.toFixed(0)}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(anchor)}
                    className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteAnchor.mutate(anchor.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
