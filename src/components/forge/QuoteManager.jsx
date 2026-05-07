import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Eye, EyeOff, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QUOTES } from '@/lib/loanCalculations';
import {
  getCustomQuotes, saveCustomQuotes,
  getDisabledQuoteIndices, saveDisabledQuoteIndices,
  QUOTE_GROUPS,
} from '@/lib/quoteStore';

function GroupRow({ group, quotes, disabled, onToggle }) {
  const [open, setOpen] = useState(false);
  const groupQuotes = quotes
    .map((q, i) => ({ ...q, _i: i }))
    .filter(q => group.filter(q));
  if (!groupQuotes.length) return null;
  const enabledCount = groupQuotes.filter(q => !disabled.has(q._i)).length;

  return (
    <div className="border border-border/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/20 hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className="text-xs font-semibold text-foreground">{group.label}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{enabledCount}/{groupQuotes.length} on</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/20">
              {groupQuotes.map(q => {
                const isOff = disabled.has(q._i);
                return (
                  <div key={q._i} className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${isOff ? 'opacity-40' : ''}`}>
                    <button
                      onClick={() => onToggle(q._i)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      title={isOff ? 'Enable' : 'Disable'}
                    >
                      {isOff ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground/80 italic leading-relaxed">"{q.text}"</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">— {q.author}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomQuoteSection({ customQuotes, onSave }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  const add = () => {
    const t = text.trim();
    const a = author.trim() || 'Unknown';
    if (!t) return;
    onSave([...customQuotes, { text: t, author: a }]);
    setText('');
    setAuthor('');
  };

  const remove = (idx) => onSave(customQuotes.filter((_, i) => i !== idx));

  return (
    <div className="border border-primary/20 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-primary/5 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">My Own Quotes</span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">{customQuotes.length} added</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="The quote…"
            className="bg-secondary/40 border-border/40 text-xs h-8 font-mono"
          />
          <div className="flex gap-2">
            <Input
              value={author}
              onChange={e => setAuthor(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(); }}
              placeholder="Author (optional)"
              className="bg-secondary/40 border-border/40 text-xs h-8 font-mono flex-1"
            />
            <button
              onClick={add}
              type="button"
              className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {customQuotes.length > 0 && (
          <div className="space-y-2 pt-1">
            {customQuotes.map((q, i) => (
              <div key={i} className="flex items-start gap-2 bg-secondary/20 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 italic">"{q.text}"</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">— {q.author}</p>
                </div>
                <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuoteManager() {
  const [disabled, setDisabled] = useState(() => getDisabledQuoteIndices());
  const [customQuotes, setCustomQuotes] = useState(() => getCustomQuotes());
  const [saved, setSaved] = useState(false);

  const toggleQuote = useCallback((idx) => {
    setDisabled(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const handleSaveCustom = (quotes) => {
    setCustomQuotes(quotes);
    saveCustomQuotes(quotes);
    flash();
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const handleSaveDisabled = () => {
    saveDisabledQuoteIndices(disabled);
    flash();
  };

  const enabledCount = QUOTES.length - disabled.size + customQuotes.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {enabledCount} quotes active · Toggle groups on/off, or add your own.
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSaveDisabled}
          className="text-xs h-7 px-3 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
        >
          {saved ? 'Saved ✓' : 'Save'}
        </Button>
      </div>

      <CustomQuoteSection customQuotes={customQuotes} onSave={handleSaveCustom} />

      <div className="space-y-2">
        {QUOTE_GROUPS.map(g => (
          <GroupRow key={g.id} group={g} quotes={QUOTES} disabled={disabled} onToggle={toggleQuote} />
        ))}
      </div>
    </div>
  );
}