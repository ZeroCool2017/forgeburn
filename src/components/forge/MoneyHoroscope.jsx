import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronRight, Calendar } from 'lucide-react';

export default function MoneyHoroscope() {
  const [isOpen, setIsOpen] = useState(false);
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const ZODIAC_SIGNS = [
    { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19' },
    { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20' },
    { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20' },
    { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
    { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22' },
    { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22' },
    { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
    { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
    { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21' },
    { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19' },
    { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18' },
    { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20' },
  ];

  const generateHoroscope = async (sign) => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a wise financial astrologer. Generate a money/wealth horoscope for ${sign} for ${dateStr}. 
        
        Include:
        1. **Money Energy Today**: Brief energy reading (1-2 sentences)
        2. **Advice**: Practical money advice aligned with astrological themes (2-3 sentences)
        3. **Lucky Color**: A color associated with prosperity
        4. **Lucky Number**: A number for today
        5. **Planetary Influence**: What planet is influencing finances today (1 sentence)
        6. **Action Item**: One specific thing to do with money today (1 sentence)
        
        Keep it mystical but grounded. Mix real astrology with practical financial wisdom.`,
        response_json_schema: {
          type: 'object',
          properties: {
            energy: { type: 'string' },
            advice: { type: 'string' },
            lucky_color: { type: 'string' },
            lucky_number: { type: 'number' },
            planetary_influence: { type: 'string' },
            action_item: { type: 'string' },
          },
        },
      });
      setHoroscope(result);
      setSelectedSign(sign);
    } catch (error) {
      console.error('Failed to generate horoscope:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="glass rounded-2xl p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
          <h3 className="text-sm font-semibold text-foreground">MONEY HOROSCOPE</h3>
          <p className="text-[10px] font-mono text-muted-foreground/50 ml-auto">
            <Calendar className="w-3 h-3 inline mr-1" />
            {dateStr}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Your financial forecast · AI + Astrology</p>
      </div>

      <AnimatePresence mode="wait">
        {!horoscope ? (
          <motion.div
            key="signs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground/70 mb-4">Choose your sign for today's money forecast</p>
            <div className="grid grid-cols-3 gap-2">
              {ZODIAC_SIGNS.map(sign => (
                <motion.button
                  key={sign.name}
                  onClick={() => generateHoroscope(sign.name)}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border/20 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50"
                >
                  <span className="text-lg">{sign.emoji}</span>
                  <span className="text-[10px] font-mono text-foreground">{sign.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="horoscope"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Sign header */}
            <div className="flex items-center gap-3 pb-3 border-b border-border/20">
              <span className="text-3xl">{ZODIAC_SIGNS.find(s => s.name === selectedSign)?.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedSign}</p>
                <p className="text-[10px] font-mono text-muted-foreground/70">
                  {ZODIAC_SIGNS.find(s => s.name === selectedSign)?.dates}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-mono text-primary/70 uppercase tracking-wider mb-1">Energy</p>
                <p className="text-foreground/80 text-sm">{horoscope.energy}</p>
              </div>

              <div>
                <p className="text-[10px] font-mono text-primary/70 uppercase tracking-wider mb-1">Advice</p>
                <p className="text-foreground/80 text-sm">{horoscope.advice}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/20">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-1">Lucky Color</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-border/40"
                      style={{ background: horoscope.lucky_color.toLowerCase() }}
                    />
                    <p className="text-sm font-mono text-foreground capitalize">{horoscope.lucky_color}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-1">Lucky Number</p>
                  <p className="text-2xl font-black text-primary">{horoscope.lucky_number}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/20">
                <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-1">Planetary Influence</p>
                <p className="text-foreground/80 text-sm italic">{horoscope.planetary_influence}</p>
              </div>

              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                <p className="text-[10px] font-mono text-primary/70 uppercase tracking-wider mb-2">Today's Action</p>
                <p className="text-sm font-medium text-foreground">{horoscope.action_item}</p>
              </div>
            </div>

            {/* Reset button */}
            <motion.button
              onClick={() => setHoroscope(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-foreground border border-border/20 rounded-lg transition-colors"
            >
              Try Another Sign
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}