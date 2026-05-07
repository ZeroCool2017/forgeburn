import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronRight, Calendar, MapPin, Clock, Sun, Moon, Star } from 'lucide-react';
import { formatBirthData, ZODIAC_SIGNS } from '@/lib/astrologyCalc';

const ZODIAC_DATA = [
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

export default function MoneyHoroscope() {
  const [birthData, setBirthData] = useState(null);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: 1,
    day: 1,
    year: 2000,
    hour: 12,
    minute: 0,
    latitude: 40,
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleBirthSubmit = async () => {
    const data = formatBirthData(
      formData.month,
      formData.day,
      formData.year,
      formData.hour,
      formData.minute,
      formData.latitude
    );
    setBirthData(data);
    setShowBirthForm(false);
    await generateHoroscope(data);
  };

  const generateHoroscope = async (astroData) => {
    setLoading(true);
    try {
      const prompt = `You are CoStar's mystical financial astrologer. Generate a personalized wealth horoscope in CoStar's tone.

BIRTH CHART:
- Sun in ${astroData.sunSign.name} (${astroData.sunSign.element} element, ruled by ${astroData.sunSign.ruling})
- Moon in ${astroData.moonSign.name} (${astroData.moonSign.element} element)
- Rising in ${astroData.risingSign.name} (${astroData.risingSign.element} element)

Your financial nature: ${astroData.insight.vibe}
Your money style: ${astroData.insight.financialType}

Write a CoStar-style money/debt freedom horoscope for today (${dateStr}) that:
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

  const handleReset = () => {
    setBirthData(null);
    setHoroscope(null);
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
          <h3 className="text-sm font-semibold text-foreground">FINANCIAL ASTROLOGY</h3>
          <p className="text-[10px] font-mono text-muted-foreground/50 ml-auto">
            <Calendar className="w-3 h-3 inline mr-1" />
            {dateStr}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Your birth chart wealth forecast · CoStar mysticism</p>
      </div>

      <AnimatePresence mode="wait">
        {!birthData ? (
          <motion.div
            key="birth-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground/70 mb-4">Enter your birth details for a personalized financial forecast</p>

            <div className="space-y-3">
              {/* Date inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground/70">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm rounded border border-border/20 bg-background/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground/70">Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm rounded border border-border/20 bg-background/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground/70">Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={today.getFullYear()}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm rounded border border-border/20 bg-background/50 text-foreground"
                  />
                </div>
              </div>

              {/* Time inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground/70">Hour (24h)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm rounded border border-border/20 bg-background/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground/70">Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm rounded border border-border/20 bg-background/50 text-foreground"
                  />
                </div>
              </div>

              {/* Latitude */}
              <div>
                <label className="text-[10px] font-mono text-muted-foreground/70">Birth Latitude (°N)</label>
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="0.1"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm rounded border border-border/20 bg-background/50 text-foreground"
                  placeholder="40 (New York) or -33 (Sydney)"
                />
              </div>

              {/* Submit button */}
              <motion.button
                onClick={handleBirthSubmit}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Reading Your Chart...' : <>
                  <Sun className="w-4 h-4" />
                  Generate My Horoscope
                </>}
              </motion.button>
            </div>
          </motion.div>
        ) : !horoscope ? (
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
              <p className="text-xs text-muted-foreground">Consulting the stars...</p>
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

            {/* Reset button */}
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-foreground border border-border/20 rounded-lg transition-colors"
            >
              Read Another Chart
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}