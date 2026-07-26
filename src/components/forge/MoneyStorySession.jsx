import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain } from 'lucide-react';
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

function cleanStoryText(value = '') {
  return value
    .replace(/[\u2010-\u2015-]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

function InsightResult({ loanId, loanName, answers, onClose, existingStory = null }) {
  const [insight, setInsight] = useState(existingStory);
  const [loading, setLoading] = useState(!existingStory);

  React.useEffect(() => {
    if (!existingStory) generateInsight();
  }, [existingStory]);

  const generateInsight = async () => {
    try {
      const tagSummary = Object.entries(answers)
        .map(([qId, tag]) => {
          const q = PSYCHOLOGIST_QUESTIONS.find(q => q.id === qId);
          return `${q?.text}: ${tag}`;
        })
        .join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a financial behavior reflection assistant. You have just completed a reflective session with a person about their debt: "${loanName}".

Based on their responses, here are their psychological patterns:
${tagSummary}

Write a personalized "Money Story" — a compassionate, psychologically precise narrative of 3-4 paragraphs that:
1. Names what you see in their patterns with specific language (not generic)
2. Traces the emotional root that led to this debt with compassion
3. Identifies the hidden belief about money or self-worth that's been running in the background
4. Offers one precise, powerful reframe that changes how they see this debt — not as a failure, but as information

Tone: wise, warm, direct, and careful. Do not diagnose, provide therapy, claim to know hidden motives, or call yourself a psychologist. Speak only to the answers provided. Avoid hyphens and dash punctuation.`,
      });
      const cleaned = cleanStoryText(result);
      setInsight(cleaned);
      await base44.entities.MoneyStory.create({
        loan_id: loanId,
        loan_name: loanName,
        answers,
        story: cleaned,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await base44.entities.MoneyStoryDraft.delete(`loan-${loanId}`);
    } catch {
      setInsight(cleanStoryText(`Your relationship with ${loanName} carries more meaning than the number suggests. The patterns you shared reveal someone navigating real tension between who they have been and who they are becoming with money. This debt is not a character flaw. It is a chapter. The awareness you showed today is the first page of the next one.`));
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
          <p className="text-xs font-mono text-muted-foreground">Reading your patterns...</p>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{insight}</p>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/60 text-center">
            This story is yours. It describes a pattern. It does not define your future.
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
  const [selectedTag, setSelectedTag] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const isLastQuestion = questionIndex === PSYCHOLOGIST_QUESTIONS.length - 1;
  const currentQuestion = PSYCHOLOGIST_QUESTIONS[questionIndex];
  const progress = ((questionIndex + (selectedTag ? 1 : 0)) / PSYCHOLOGIST_QUESTIONS.length) * 100;

  const [savedStory, setSavedStory] = useState(null);

  useEffect(() => {
    if (!open || !loan?.id) return;
    let cancelled = false;
    Promise.all([
      base44.entities.MoneyStoryDraft.get(`loan-${loan.id}`),
      base44.entities.MoneyStory.list(),
    ]).then(([draft, stories]) => {
      if (cancelled) return;
      const savedAnswers = draft?.answers || {};
      const savedIndex = Math.min(draft?.question_index || 0, PSYCHOLOGIST_QUESTIONS.length - 1);
      const latestStory = (stories || [])
        .filter(story => story.loan_id === loan.id)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
      setSavedStory(draft ? null : latestStory?.story || null);
      if (draft) {
        setAnswers(savedAnswers);
        setQuestionIndex(savedIndex);
        setSelectedTag(savedAnswers[PSYCHOLOGIST_QUESTIONS[savedIndex]?.id] || null);
      } else if (latestStory) {
        setAnswers(latestStory.answers || {});
        setShowResult(true);
      }
    });
    return () => { cancelled = true; };
  }, [open, loan?.id]);

  const saveDraft = async (nextAnswers, nextIndex = questionIndex) => {
    if (!loan?.id) return;
    const record = {
      id: `loan-${loan.id}`,
      loan_id: loan.id,
      loan_name: loan.name,
      answers: nextAnswers,
      question_index: nextIndex,
      updated_at: new Date().toISOString(),
    };
    const existing = await base44.entities.MoneyStoryDraft.get(record.id);
    if (existing) await base44.entities.MoneyStoryDraft.update(record.id, record);
    else await base44.entities.MoneyStoryDraft.create(record);
  };

  const handleChoose = (choice) => {
    setSelectedTag(choice.tag);
    saveDraft({ ...answers, [currentQuestion.id]: choice.tag });
  };

  const handleNext = () => {
    if (!selectedTag) return;
    const newAnswers = { ...answers, [currentQuestion.id]: selectedTag };
    setAnswers(newAnswers);
    saveDraft(newAnswers, isLastQuestion ? questionIndex : questionIndex + 1);
    setSelectedTag(null);
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setQuestionIndex(i => i + 1);
    }
  };

  const handleClose = () => {
    setQuestionIndex(0);
    setAnswers({});
    setSelectedTag(null);
    setShowResult(false);
    setSavedStory(null);
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
            className="relative z-10 w-full sm:max-w-lg glass rounded-t-3xl sm:rounded-2xl border border-border/40 shadow-2xl flex flex-col"
            style={{ maxHeight: '90vh', minHeight: 'min(620px, 90vh)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/20 shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Money Story</h2>
                  <p className="text-[10px] font-mono text-muted-foreground">Session: {loan.name}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-5" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
              <AnimatePresence mode="wait">
                {showResult ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <InsightResult loanId={loan.id} loanName={loan.name} answers={answers} existingStory={savedStory} onClose={handleClose} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`q-${questionIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-4"
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
                      <p className="text-sm font-semibold text-foreground leading-relaxed">{currentQuestion.text}</p>
                      <p className="text-[11px] text-muted-foreground italic">{currentQuestion.hint}</p>
                    </div>

                    {/* Choices */}
                    <div className="space-y-2">
                      {currentQuestion.choices.map((choice, idx) => {
                        const isSelected = selectedTag === choice.tag;
                        return (
                          <motion.button
                            key={idx}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleChoose(choice)}
                            className={`w-full p-3 text-left rounded-xl transition-all border ${
                              isSelected
                                ? 'bg-primary/20 border-primary/60 text-foreground'
                                : 'bg-secondary/40 hover:bg-primary/10 border-border/30 hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-foreground/90 leading-relaxed">{choice.text}</span>
                              {isSelected && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-primary font-bold text-sm shrink-0"
                                >✓</motion.span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Next / Done button */}
                    <motion.button
                      whileHover={{ scale: selectedTag ? 1.01 : 1 }}
                      whileTap={{ scale: selectedTag ? 0.98 : 1 }}
                      onClick={handleNext}
                      disabled={!selectedTag}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2 ${
                        selectedTag
                          ? isLastQuestion
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-secondary/80 text-foreground hover:bg-secondary border border-border/40'
                          : 'bg-secondary/30 text-muted-foreground cursor-not-allowed border border-border/20'
                      }`}
                    >
                      {isLastQuestion ? '✨ Generate My Story' : 'Next →'}
                    </motion.button>
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