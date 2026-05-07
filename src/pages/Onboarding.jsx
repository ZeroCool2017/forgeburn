import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'name',
    category: 'intro',
    title: 'Who are you?',
    subtitle: 'Your name or what you go by',
    type: 'text',
    placeholder: 'e.g., Maya, Alex, Jordan',
  },
  {
    id: 'money_origin',
    category: 'psychology',
    title: 'Where does your relationship with money come from?',
    subtitle: 'How did your family or upbringing shape how you think about debt?',
    type: 'textarea',
    placeholder: 'Share what comes to mind...',
  },
  {
    id: 'biggest_fear',
    category: 'psychology',
    title: 'What\'s your biggest fear around money right now?',
    subtitle: 'Be honest. This is just for you.',
    type: 'textarea',
    placeholder: 'e.g., being trapped, failure, judgment...',
  },
  {
    id: 'freedom_looks_like',
    category: 'goals',
    title: 'What does freedom look like to you?',
    subtitle: 'Not just debt-free. What does your life look like when you\'re free?',
    type: 'textarea',
    placeholder: 'Paint the picture...',
  },
  {
    id: 'admire_who',
    category: 'psychology',
    title: 'Who do you admire?',
    subtitle: 'Could be anyone — historical figure, family, artist, activist. Who inspires you?',
    type: 'textarea',
    placeholder: 'e.g., Oprah, your grandma, Kendrick Lamar, Malala...',
  },
  {
    id: 'admire_why',
    category: 'psychology',
    title: 'Why do you admire them?',
    subtitle: 'What qualities do they have that resonate with you?',
    type: 'textarea',
    placeholder: 'Resilience, creativity, integrity, courage...',
  },
  {
    id: 'songs_that_move',
    category: 'culture',
    title: 'What songs move you?',
    subtitle: 'Music that gets you through. Could be any genre.',
    type: 'textarea',
    placeholder: 'e.g., Nina Simone - Feeling Good, Kendrick - PRIDE., Radiohead - Pyramid Song...',
  },
  {
    id: 'books_or_stories',
    category: 'culture',
    title: 'Are there books, podcasts, or stories that shaped you?',
    subtitle: 'Anything from Twitter threads to novels.',
    type: 'textarea',
    placeholder: 'Share what comes to mind...',
  },
  {
    id: 'hobbies_passions',
    category: 'identity',
    title: 'What do you do when no one\'s watching?',
    subtitle: 'Your hobbies, passions, the things that make you feel alive.',
    type: 'textarea',
    placeholder: 'e.g., painting, coding, gardening, gaming, writing...',
  },
  {
    id: 'colors_drawn_to',
    category: 'aesthetic',
    title: 'What colors do you feel drawn to?',
    subtitle: 'Colors that represent how you want to feel.',
    type: 'text',
    placeholder: 'e.g., deep purple, gold, forest green, burnt orange',
  },
  {
    id: 'current_struggle',
    category: 'reality',
    title: 'What\'s your biggest struggle right now?',
    subtitle: 'Beyond debt. What keeps you up at night?',
    type: 'textarea',
    placeholder: 'Share what\'s real for you...',
  },
  {
    id: 'small_win',
    category: 'momentum',
    title: 'What\'s one small win you\'ve had recently?',
    subtitle: 'Could be anything. We celebrate progress.',
    type: 'textarea',
    placeholder: 'e.g., made a payment, read a book, had a hard conversation...',
  },
  {
    id: 'dream_impossible',
    category: 'vision',
    title: 'If money wasn\'t a constraint, what would you do?',
    subtitle: 'Dream big. The impossible dream.',
    type: 'textarea',
    placeholder: 'Travel? Create? Rest? Teach? Revolution?',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = async () => {
    if (step === QUESTIONS.length - 1) {
      // Submit and create user profile
      await submitOnboarding();
    } else {
      setStep(step + 1);
    }
  };

  const submitOnboarding = async () => {
    setIsLoading(true);
    try {
      // Save personalization data to user profile
      await base44.auth.updateMe({
        personalization: JSON.stringify(answers),
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">⛓️</span>
            <h1 className="text-3xl font-black text-foreground font-display">Carry the Zero</h1>
          </div>
          <p className="text-sm text-muted-foreground font-mono">Let's get to know you first</p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-muted-foreground">Question {step + 1} of {QUESTIONS.length}</p>
            <p className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</p>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="mb-6">
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                {currentQuestion.category}
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-foreground font-display mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.subtitle}
              </p>
            </div>

            {/* Input */}
            <div className="mb-6">
              {currentQuestion.type === 'text' ? (
                <input
                  type="text"
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              ) : (
                <textarea
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
                  autoFocus
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-sm font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                ← Back
              </button>
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                loading={isLoading}
                className="flex items-center gap-2"
              >
                {step === QUESTIONS.length - 1 ? 'Create Dashboard' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground/50 text-center mt-12 font-mono">
          Your answers help us craft a personalized experience just for you.
        </p>
      </div>
    </div>
  );
}