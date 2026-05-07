import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, X, MapPin, Music, Heart, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'chainforge_personalization';

const PROMPT_FIELDS = [
  {
    key: 'admired_people',
    icon: Heart,
    label: 'Who do you admire?',
    hint: 'Artists, thinkers, athletes, ancestors, fictional characters — anyone. Think outside the box.',
    placeholder: 'e.g. Octavia Butler, Thelonious Monk, your grandmother…',
  },
  {
    key: 'places',
    icon: MapPin,
    label: 'Places that feel like you',
    hint: 'Cities, landscapes, vibes — where do you feel most yourself?',
    placeholder: 'e.g. Marfa TX, Mexico City, a specific trail…',
  },
  {
    key: 'songs',
    icon: Music,
    label: 'Songs that move you',
    hint: 'Songs that hit different when you\'re working on something hard.',
    placeholder: 'e.g. Tracy Chapman – Fast Car, Radiohead – Everything in Its Right Place…',
  },
];

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const remove = (item) => onChange(value.filter(v => v !== item));

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="bg-secondary/40 border-border/40 text-sm font-mono h-8 text-foreground placeholder:text-muted-foreground/50"
        />
        <button
          onClick={add}
          type="button"
          className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(v => (
            <span key={v} className="flex items-center gap-1 text-xs font-mono bg-secondary/60 border border-border/40 text-foreground/80 rounded-md px-2 py-0.5">
              {v}
              <button onClick={() => remove(v)} className="text-muted-foreground hover:text-foreground ml-0.5">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PersonalizationForm() {
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { admired_people: [], places: [], songs: [] };
    } catch { return { admired_people: [], places: [], songs: [] }; }
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setField = (key, val) => setData(d => ({ ...d, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your inputs shape the quote randomizer. The more specific and personal, the more the app feels like yours.
          Think outside the obvious — obscure poets, specific neighborhoods, songs you've listened to 200 times.
        </p>
      </div>

      {PROMPT_FIELDS.map((field, i) => {
        const Icon = field.icon;
        return (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">{field.label}</p>
            </div>
            <p className="text-[11px] text-muted-foreground/70 mb-2 ml-5">{field.hint}</p>
            <TagInput
              value={data[field.key]}
              onChange={val => setField(field.key, val)}
              placeholder={field.placeholder}
            />
          </motion.div>
        );
      })}

      <Button
        onClick={save}
        size="sm"
        className="w-full gap-2 bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 text-xs"
        variant="ghost"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? 'Saved ✓' : 'Save My World'}
      </Button>
    </div>
  );
}