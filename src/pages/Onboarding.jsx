import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/localDB';

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
    id: 'biggest_fear',
    category: 'truth',
    title: 'What\'s your biggest fear around money?',
    subtitle: 'Be honest. This is just for you.',
    type: 'textarea',
    placeholder: 'e.g., being trapped, failure, judgment...',
  },
  {
    id: 'freedom_looks_like',
    category: 'vision',
    title: 'What does freedom look like to you?',
    subtitle: 'Not just debt-free. Paint the picture.',
    type: 'textarea',
    placeholder: 'Travel? Rest? Create? Build?',
  },
  {
    id: 'admire_who',
    category: 'inspiration',
    title: 'Who inspires you?',
    subtitle: 'Historical figure, family, artist, activist — anyone.',
    type: 'textarea',
    placeholder: 'e.g., Oprah, your grandma, Kendrick Lamar, Malala...',
  },
  {
    id: 'hobbies_passions',
    category: 'identity',
    title: 'What do you do when no one\'s watching?',
    subtitle: 'Your hobbies, passions, what makes you feel alive.',
    type: 'textarea',
    placeholder: 'e.g., painting, coding, gardening, gaming, writing...',
  },
  {
    id: 'songs_that_move',
    category: 'culture',
    title: 'What songs move you?',
    subtitle: 'Music that gets you through.',
    type: 'textarea',
    placeholder: 'e.g., Nina Simone - Feeling Good, Kendrick - PRIDE...',
  },
  {
    id: 'small_win',
    category: 'momentum',
    title: 'What\'s one small win you\'ve had recently?',
    subtitle: 'We celebrate every step forward.',
    type: 'textarea',
    placeholder: 'e.g., made a payment, read a book, had a hard conversation...',
  },
  {
    id: 'dream_impossible',
    category: 'vision',
    title: 'If money wasn\'t a constraint, what would you create?',
    subtitle: 'Dream big. No limits.',
    type: 'textarea',
    placeholder: 'Travel? Build? Rest? Teach? Revolution?',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleYOLOSkip = async () => {
    setIsLoading(true);
    try {
      const demoAnswers = {
        name: 'Lindsey',
        biggest_fear: 'not being in control of my time',
        freedom_looks_like: 'absolute creative autonomy and peace of mind',
        admire_who: 'pioneering artists and free thinkers',
        hobbies_passions: 'sound synthesis, design, and interactive coding',
        songs_that_move: 'Aphex Twin - Stone in Focus',
        small_win: 'getting this beautiful dashboard unblocked and live',
        dream_impossible: 'build a self-sustaining eco-sound art park'
      };
      
      await base44.auth.updateMe({
        personalization: JSON.stringify(demoAnswers),
      });

      // Clear any empty state and seed high-quality test data
      await db.loans.clear();
      await db.spending_habits.clear();

      await base44.entities.Loan.create({
        name: 'Credit Card',
        category: 'credit_card',
        current_balance: 4200,
        original_balance: 8000,
        interest_rate: 18.9,
        minimum_payment: 150
      });

      await base44.entities.Loan.create({
        name: 'Tesla Auto Loan',
        category: 'auto_loan',
        current_balance: 14500,
        original_balance: 22000,
        interest_rate: 4.5,
        minimum_payment: 380
      });

      await base44.entities.Loan.create({
        name: 'Federal Student Loan',
        category: 'student_loan',
        current_balance: 28000,
        original_balance: 35000,
        interest_rate: 5.8,
        minimum_payment: 290
      });

      await base44.entities.SpendingHabit.create({
        name: 'Daily Matcha Latte',
        emoji: '🍵',
        monthly_average: 120,
        pattern: 'luxury',
        category: 'other'
      });

      await base44.entities.SpendingHabit.create({
        name: 'Weekend Fine Dining',
        emoji: '🍣',
        monthly_average: 240,
        pattern: 'luxury',
        category: 'other'
      });

      await base44.entities.SpendingHabit.create({
        name: 'Streaming Subscriptions',
        emoji: '📺',
        monthly_average: 60,
        pattern: 'fixed',
        category: 'credit_card'
      });

      await refreshUser();
      navigate('/');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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
      await refreshUser();
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
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono text-muted-foreground tracking-widest">STEP {step + 1} of {QUESTIONS.length}</p>
            <p className="text-xs font-mono text-primary font-semibold">{Math.round(progress)}%</p>
          </div>
          <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-chart-3"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
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
            <div className="mb-8">
              {currentQuestion.type === 'text' ? (
                <motion.input
                  type="text"
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  autoFocus
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                />
              ) : (
                <motion.textarea
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px] resize-none transition-all"
                  autoFocus
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                />
              )}
            </div>

            {/* Navigation */}
            <motion.div
              className="flex gap-3 items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
              >
                ← BACK
              </button>

              <button
                onClick={handleYOLOSkip}
                className="text-[10px] font-mono text-primary/60 hover:text-primary hover:underline transition-colors"
              >
                ⚡ YOLO SKIP & LOAD DEMO DATA
              </button>

              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                loading={isLoading}
                className="flex items-center gap-2"
              >
                {step === QUESTIONS.length - 1 ? 'Enter Dashboard' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="text-[10px] text-muted-foreground/60 text-center mt-14 font-mono tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          This is for you. No data sells. Just personalization.
        </motion.p>
      </div>
    </div>
  );
}