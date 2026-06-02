import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllActiveQuotes } from '@/lib/quoteStore';
import { db } from '@/lib/localDB';
import { Sparkles, Zap } from 'lucide-react';

const CACHED_QUOTES_KEY = 'carryzero_fetched_quotes';

// Fetch real quotes from the person the user admires
async function fetchRealQuotes(admireName) {
  if (!admireName) return [];
  try {
    const cached = localStorage.getItem(CACHED_QUOTES_KEY);
    let allQuotes;
    if (cached) {
      allQuotes = JSON.parse(cached);
    } else {
      const res = await fetch('https://dummyjson.com/quotes?limit=1500');
      const data = await res.json();
      allQuotes = data.quotes || [];
      localStorage.setItem(CACHED_QUOTES_KEY, JSON.stringify(allQuotes));
    }
    // Find quotes whose author name matches any part of the admire name
    const keywords = admireName.toLowerCase().split(/\s+/).filter(Boolean);
    return allQuotes
      .filter(q => keywords.some(k => q.author.toLowerCase().includes(k)))
      .map(q => ({ text: q.quote, author: q.author, _real: true }));
  } catch (_) {
    return [];
  }
}

// Detect if a quote feels retro/cultural
function isRetroQuote(author) {
  return /(Radiohead|Pavement|Built to Spill|Sonic Youth|Daria|Clueless|Reality Bites|Winona|Moneyball|Future|Cardi|Megan|Dolly|Kacey|Jay-Z|Grime|80s|90s|arcade|Tetris|chess|video game)/i.test(author);
}

export default function QuoteBar() {
  const [allQuotes, setAllQuotes] = useState(() => getAllActiveQuotes());
  const [realQuotes, setRealQuotes] = useState([]);
  const [index, setIndex] = useState(0);
  const [admireName, setAdmireName] = useState('');

  // Load onboarding answer
  useEffect(() => {
    db.user_profile.get('local').then(profile => {
      if (profile?.personalization) {
        try {
          const answers = JSON.parse(profile.personalization);
          const name = answers.admire_who?.trim();
          if (name) {
            setAdmireName(name);
            fetchRealQuotes(name).then(quotes => {
              if (quotes.length > 0) {
                setRealQuotes(quotes);
              }
            });
          }
        } catch (_) {}
      }
    });
  }, []);

  // Combined quote pool
  const getQuotePool = useCallback(() => {
    const pool = [...allQuotes, ...realQuotes];
    return pool.length > 0 ? pool : [{ text: '...', author: 'Silent Bob (he nods in agreement with your payoff plan)' }];
  }, [allQuotes, realQuotes]);

  const quotePool = getQuotePool();

  useEffect(() => {
    setIndex(Math.floor(Math.random() * quotePool.length));
  }, [quotePool.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % quotePool.length);
    }, 14000);
    return () => clearInterval(interval);
  }, [quotePool.length]);

  const quote = quotePool[index];
  const retro = isRetroQuote(quote?.author);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/40 backdrop-blur-sm"
      style={{ borderColor: retro ? 'hsl(45, 90%, 60%, 0.3)' : 'hsl(270, 80%, 68%, 0.2)' }}>
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ 
          background: retro 
            ? 'linear-gradient(to bottom, hsl(45, 90%, 60%, 0.8), hsl(45, 90%, 60%, 0.2), transparent)' 
            : 'linear-gradient(to bottom, hsl(270, 80%, 68%, 0.6), hsl(270, 80%, 68%, 0.2), transparent)' 
        }} />
      <div className="pl-6 pr-5 py-4">
        <div className="flex items-start gap-3">
          {retro ? (
            <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'hsl(45, 90%, 60%)' }} />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 animate-pulse-glow" />
          )}
          <div className="flex-1 min-w-0">
            <p className="obs-label mb-2">
              {quote._real && admireName
                ? `✧ ${admireName.split(',')[0].trim()} says`
                : retro ? '⚡ retro signal' : 'note'}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
              >
                <p className="text-sm font-display italic text-foreground/85 leading-relaxed">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                  — {quote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
