import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, Sun, Moon, Star } from 'lucide-react';
import { formatBirthData } from '@/lib/astrologyCalc';

export default function MoneyHoroscope({ birthData: userBirthData }) {
  const [birthData, setBirthData] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Initialize from user data on mount
  useEffect(() => {
    if (userBirthData) {
      setBirthData(userBirthData);
      generateHoroscope(userBirthData);
    } else {
      setLoading(false);
    }
  }, [userBirthData]);

  const generateHoroscope = async (astroData) => {
    setLoading(true);
    try {
      const prompt = `You are a mystical financial astrologer. Generate a personalized wealth horoscope.

BIRTH CHART:
- Sun in ${astroData.sunSign.name} (${astroData.sunSign.element} element, ruled by ${astroData.sunSign.ruling})
- Moon in ${astroData.moonSign.name} (${astroData.moonSign.element} element)
- Rising in ${astroData.risingSign.name} (${astroData.risingSign.element} element)

Your financial nature: ${astroData.insight.vibe}
Your money style: ${astroData.insight.financialType}

Write a mystical money/debt freedom horoscope for today (${dateStr}) that:
1. Speaks directly to their birth chart's financial psychology
2. Uses mystical but grounded language 
3. Connects planetary transits to their specific money challenges
4. Offers actionable financial wisdom aligned with their astrological profile
5. Includes a "Money Move of the Day" specific to their chart

Be poetic, wise, and genuinely helpful. Sound like you're reading their financial soul.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            opening: { type: 'string' },
            sun_insight: { type: 'string' },
            moon_insight: { type: 'string' },
            rising_influence: { type: 'string' },
            money_move: { type: 'string' },
            planetary_weather: { type: 'string' },
            closing: { type: 'string' },
          },
        },
      });
      setHoroscope(result);
    } catch (error) {
      console.error('Failed to generate horoscope:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!birthData) return null;

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
          <h3 className="text-sm font-semibold text-foreground">YOUR WEALTH ASTROLOGY</h3>
          <p className="text-[10px] font-mono text-muted-foreground/50 ml-auto">{dateStr}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!horoscope ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
              />
              <p className="text-xs text-muted-foreground">Reading your chart...</p>
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
            {/* Birth chart header */}
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground/70">SUN</p>
                    <p className="text-sm font-semibold text-foreground">{birthData.sunSign.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground/70">MOON</p>
                    <p className="text-sm font-semibold text-foreground">{birthData.moonSign.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground/70">RISING</p>
                    <p className="text-sm font-semibold text-foreground">{birthData.risingSign.name}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 italic">{birthData.insight.vibe}</p>
            </div>

            {/* Horoscope content */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-mono text-primary/70 uppercase tracking-wider mb-1">Opening</p>
                <p className="text-foreground/80">{horoscope.opening}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="col-span-1">
                  <p className="text-[10px] font-mono text-yellow-600/70 uppercase tracking-wider mb-1">Sun</p>
                  <p className="text-foreground/75 text-xs leading-relaxed">{horoscope.sun_insight}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] font-mono text-blue-400/70 uppercase tracking-wider mb-1">Moon</p>
                  <p className="text-foreground/75 text-xs leading-relaxed">{horoscope.moon_insight}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] font-mono text-purple-500/70 uppercase tracking-wider mb-1">Rising</p>
                  <p className="text-foreground/75 text-xs leading-relaxed">{horoscope.rising_influence}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/20">
                <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-1">Planetary Weather</p>
                <p className="text-foreground/80 text-sm italic">{horoscope.planetary_weather}</p>
              </div>

              <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
                <p className="text-[10px] font-mono text-accent/70 uppercase tracking-wider mb-2">💫 Money Move</p>
                <p className="text-sm font-medium text-foreground">{horoscope.money_move}</p>
              </div>

              <div>
                <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-1">Closing</p>
                <p className="text-foreground/80 italic text-sm">{horoscope.closing}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}