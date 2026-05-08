import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Brain, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Money Psychologist Session — 10 deep questions about the emotional
 * and psychological roots of this specific debt. Generates a personalized
 * money story narrative at the end.
 */

const PSYCHOLOGIST_QUESTIONS = [
  {
    id: 'origin_emotion',
    text: 'When you first took on this debt, what was the dominant emotion driving that decision?',
    hint: 'Be honest — there\'s no wrong answer here.',
    choices: [
      { text: 'Hope — I believed it would open doors', tag: 'hope' },
      { text: 'Fear — I felt I had no other option', tag: 'fear' },
      { text: 'Desire — I wanted something and acted on it', tag: 'desire' },
      { text: 'Numbness — I wasn\'t really thinking deeply', tag: 'dissociation' },
    ],
  },
  {
    id: 'childhood_pattern',
    text: 'Growing up, what was the dominant money message in your household?',
    hint: 'Our earliest money lessons shape everything.',
    choices: [
      { text: '"Money is always tight — be careful"', tag: 'scarcity' },
      { text: '"Money is for spending and enjoying life"', tag: 'abundance' },
      { text: '"Money means status and success"', tag: 'status' },
      { text: '"We don\'t talk about money"', tag: 'avoidance' },
    ],
  },
  {
    id: 'identity_link',
    text: 'How does carrying this debt affect your sense of self?',
    hint: 'Debt often carries psychological weight beyond the numbers.',
    choices: [
      { text: 'I feel ashamed or embarrassed by it', tag: 'shame' },
      { text: 'I see it as a temporary chapter, not my identity', tag: 'resilient' },
      { text: 'I feel stuck or defined by it', tag: 'stuck' },
      { text: 'It motivates me — I use it as fuel', tag: 'motivated' },
    ],
  },
  {
    id: 'avoidance_pattern',
    text: 'When you think about this debt, what\'s your most common response?',
    hint: 'Awareness of your patterns is the first step to changing them.',
    choices: [
      { text: 'I try not to think about it', tag: 'avoidance' },
      { text: 'I obsess over it with anxiety', tag: 'anxiety' },
      { text: 'I make a plan and feel in control', tag: 'control' },
      { text: 'I feel numb or indifferent', tag: 'numbness' },
    ],
  },
  {
    id: 'spending_belief',
    text: 'Deep down, what do you believe spending money gives you that nothing else can?',
    hint: 'This is often the emotional core of debt.',
    choices: [
      { text: 'A sense of worth or validation', tag: 'worth' },
      { text: 'Temporary relief from pain or stress', tag: 'relief' },
      { text: 'Connection with others or belonging', tag: 'connection' },
      { text: 'A feeling of freedom or control', tag: 'freedom' },
    ],
  },
  {
    id: 'relationship_money',
    text: 'If money were a person in your life, what role would they play?',
    hint: 'How we personify money reveals our relationship with it.',
    choices: [
      { text: 'A controlling parent I\'m always trying to please', tag: 'controlled' },
      { text: 'A fair-weather friend — there when things are good', tag: 'unreliable' },
      { text: 'A tool I\'m learning to use better', tag: 'tool' },
      { text: 'An enemy I\'m constantly fighting', tag: 'adversarial' },
    ],
  },
  {
    id: 'payoff_fear',
    text: 'What scares you most about actually becoming debt-free?',
    hint: 'Sometimes freedom has its own fears. This is more common than you think.',
    choices: [
      { text: 'Nothing — I can\'t wait', tag: 'eager' },
      { text: 'That I\'ll just create new debt again', tag: 'pattern_fear' },
      { text: 'I\'m not sure who I am without this struggle', tag: 'identity_fear' },
      { text: 'That other financial problems will emerge', tag: 'scarcity_fear' },
    ],
  },
  {
    id: 'support_system',
    text: 'Who in your life truly understands your financial journey?',
    hint: 'Money shame thrives in isolation.',
    choices: [
      { text: 'No one — I keep this very private', tag: 'isolated' },
      { text: 'A partner or close friend', tag: 'supported' },
      { text: 'I\'m building that support now', tag: 'building' },
      { text: 'I don\'t need anyone — I handle it alone', tag: 'independent' },
    ],
  },
  {
    id: 'money_wound',
    text: 'Was there a single moment or event that most shaped your relationship with debt?',
    hint: 'Often there is one defining chapter.',
    choices: [
      { text: 'A crisis that forced my hand — medical, job loss, emergency', tag: 'crisis' },
      { text: 'A gradual drift I didn\'t notice until it was large', tag: 'drift' },
      { text: 'A conscious bet on myself that\'s taking longer to pay off', tag: 'investment' },
      { text: 'Following someone else\'s advice that didn\'t work out', tag: 'trust' },
    ],
  },
  {
    id: 'future_self',
    text: 'When you imagine your debt-free self, what has fundamentally changed?',
    hint: 'Your vision of freedom is your deepest motivator.',
    choices: [
      { text: 'I have more choices — I\'m not trapped by obligation', tag: 'freedom' },
      { text: 'I feel proud of what I overcame', tag: 'pride' },
      { text: 'I\'ve rebuilt trust with myself around money', tag: 'trust' },
      { text: 'I can finally focus on what I actually care about', tag: 'purpose' },
    ],
  },
];

function InsightResult({ loanName, answers, onClose }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    generateInsight();
  }, []);

  const generateInsight = async () => {
    try {
      const tagSummary = Object.entries(answers)
        .map(([qId, tag]) => {
          const q = PSYCHOLOGIST_QUESTIONS.find(q => q.id === qId);
          return `${q?.text}: ${tag}`;
        })
        .join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the world's most empathetic and insightful money psychologist. You have just completed a deep session with a client about their debt: "${loanName}".

Based on their responses, here are their psychological patterns:
${tagSummary}

Write a personalized "Money Story" — a compassionate, psychologically precise narrative of 3-4 paragraphs that:
1. Names what you see in their patterns with specific language (not generic)
2. Traces the emotional root that led to this debt with compassion
3. Identifies the hidden belief about money or self-worth that's been running in the background
4. Offers one precise, powerful reframe that changes how they see this debt — not as a failure, but as information

Tone: wise, warm, direct. Like a great therapist who also knows finance deeply. Do NOT be generic or vague. Speak to what you actually see in their specific answers.`,
      });
      setInsight(result);
    } catch {
      setInsight(`Your relationship with ${loanName} carries more meaning than the number suggests. The patterns you've shared reveal someone navigating real tension between who they've been and who they're becoming with money. This debt is not a character flaw — it's a chapter. The awareness you've shown today is the first page of the next one.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-border/20">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-base font-semibold text-foreground">Your Money Story</h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
          />
          <p className="text-xs font-mono text-muted-foreground">The psychologist is reading your patterns...</p>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{insight}</p>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/60 text-center">
            This story is yours. It explains the past — it does not define the future.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-colors"
          >
            I Acknowledge My Story ✓
          </motion.button>
        </>
      )}
    </motion.div>
  );
}

export default function MoneyStorySession({ loan, open, onOpenChange }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = PSYCHOLOGIST_QUESTIONS[questionIndex];
  const progress = (questionIndex / PSYCHOLOGIST_QUESTIONS.length) * 100;

  const handleChoose = (choice) => {
    const newAnswers = { ...answers, [currentQuestion.id]: choice.tag };
    setAnswers(newAnswers);
    if (questionIndex < PSYCHOLOGIST_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleClose = () => {
    setQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    onOpenChange(false);
  };

  if (!open || !loan) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="relative z-10 w-full sm:max-w-lg glass rounded-t-3xl sm:rounded-2xl border border-border/40 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Money Psychologist</h2>
                  <p className="text-[10px] font-mono text-muted-foreground">Session: {loan.name}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5 max-h-[75vh] overflow-y-auto" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
              <AnimatePresence mode="wait">
                {showResult ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <InsightResult loanName={loan.name} answers={answers} onClose={handleClose} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`q-${questionIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-5"
                  >
                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Question {questionIndex + 1} of {PSYCHOLOGIST_QUESTIONS.length}
                        </span>
                        <span className="text-[10px] font-mono text-primary">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Question */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground leading-snug">{currentQuestion.text}</p>
                      <p className="text-[10px] text-muted-foreground italic">{currentQuestion.hint}</p>
                    </div>

                    {/* Choices */}
                    <div className="space-y-1.5">
                      {currentQuestion.choices.map((choice, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChoose(choice)}
                          className="w-full p-2.5 text-left bg-secondary/40 hover:bg-primary/15 border border-border/30 hover:border-primary/40 rounded-xl transition-all group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-foreground/90 leading-snug">{choice.text}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}