import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

/**
 * Interactive debt narrative — choose-your-own-adventure storytelling.
 * Users answer psychological questions about their debt origins.
 * Their choices shape a narrative and feed data about spending patterns.
 */

const DEBT_STORIES = {
  student: {
    title: 'The Knowledge Quest',
    questions: [
      {
        id: 'reason',
        text: 'Why did you take on this student debt?',
        choices: [
          { text: 'Career change or advancement', tag: 'growth', value: 0 },
          { text: 'Following expected path', tag: 'obligation', value: 1 },
          { text: 'Escape or fresh start', tag: 'avoidance', value: 2 },
        ],
      },
      {
        id: 'feeling',
        text: 'How do you feel about your education investment now?',
        choices: [
          { text: 'It was worth it', tag: 'satisfied', value: 0 },
          { text: 'Mixed feelings', tag: 'ambivalent', value: 1 },
          { text: 'Regret and resentment', tag: 'regret', value: 2 },
        ],
      },
    ],
  },
  credit_card: {
    title: 'The Spending Spiral',
    questions: [
      {
        id: 'trigger',
        text: 'What triggered your credit card debt spiral?',
        choices: [
          { text: 'Emergency or crisis', tag: 'emergency', value: 0 },
          { text: 'Reward seeking or comfort', tag: 'self_soothing', value: 1 },
          { text: 'Lifestyle creep', tag: 'lifestyle', value: 2 },
        ],
      },
      {
        id: 'pattern',
        text: 'What pattern do you notice in your spending?',
        choices: [
          { text: 'Impulsive splurges', tag: 'impulsive', value: 0 },
          { text: 'Steady accumulation', tag: 'gradual', value: 1 },
          { text: 'Emotional spending', tag: 'emotional', value: 2 },
        ],
      },
    ],
  },
  auto: {
    title: 'The Wheel of Necessity',
    questions: [
      {
        id: 'need',
        text: 'Was this vehicle a need or a want?',
        choices: [
          { text: 'Essential necessity', tag: 'necessity', value: 0 },
          { text: 'Justified upgrade', tag: 'justified', value: 1 },
          { text: 'Emotional purchase', tag: 'emotional', value: 2 },
        ],
      },
      {
        id: 'decision',
        text: 'How was the purchase decision made?',
        choices: [
          { text: 'Careful planning', tag: 'planned', value: 0 },
          { text: 'Influenced by others', tag: 'social', value: 1 },
          { text: 'Impulsive or pressured', tag: 'impulsive', value: 2 },
        ],
      },
    ],
  },
  default: {
    title: 'The Debt Journey',
    questions: [
      {
        id: 'origin',
        text: 'What led to this debt?',
        choices: [
          { text: 'Investment in something', tag: 'investment', value: 0 },
          { text: 'Unexpected circumstance', tag: 'unexpected', value: 1 },
          { text: 'Spending without planning', tag: 'unplanned', value: 2 },
        ],
      },
      {
        id: 'meaning',
        text: 'What does paying this off mean to you?',
        choices: [
          { text: 'Freedom and relief', tag: 'freedom', value: 0 },
          { text: 'Responsibility and duty', tag: 'responsibility', value: 1 },
          { text: 'Reclaiming control', tag: 'control', value: 2 },
        ],
      },
    ],
  },
};

function StoryChapter({ debt, answers, onComplete }) {
  const tags = Object.values(answers);
  const hasEmotional = tags.includes('emotional') || tags.includes('self_soothing') || tags.includes('avoidance');
  const hasImpulsive = tags.includes('impulsive');
  const hasPlanning = tags.includes('planned') || tags.includes('growth');

  const storyTexts = {
    beginning: `You accumulated $${debt.current_balance.toLocaleString()} in ${debt.category} debt. This wasn't an accident. Something in your life—a need, a dream, a moment of escape—led you here. Every dollar tells part of your story.`,
    
    middle_emotional: hasEmotional 
      ? `You were seeking something beyond the transaction. Maybe safety. Maybe relief. Maybe a version of yourself you weren't ready to be. Spending felt like control when everything else wasn't.`
      : hasImpulsive
      ? `Your decisions came fast. There was momentum, excitement, sometimes pressure. You acted before you thought through the long game.`
      : `You made calculated choices. Whether they worked out or not, you were trying to move forward, to build, to improve.`,
    
    end: `Now you're here, facing this debt directly. The story isn't over. Every payment is a new chapter. Every choice to understand why is a choice to write a different future.`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Beginning */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <p className="text-sm text-foreground/90 leading-relaxed italic">{storyTexts.beginning}</p>
      </div>

      {/* Middle */}
      <div className="p-4 bg-gradient-to-r from-accent/10 to-chart-3/10 rounded-lg border border-accent/20">
        <p className="text-sm text-foreground/90 leading-relaxed italic">{storyTexts.middle_emotional}</p>
      </div>

      {/* End */}
      <div className="p-4 bg-gradient-to-r from-chart-3/10 to-primary/10 rounded-lg border border-chart-3/20">
        <p className="text-sm text-foreground/90 leading-relaxed italic">{storyTexts.end}</p>
      </div>

      {/* Data reflection */}
      <div className="p-3 bg-background/50 rounded-lg border border-border/20">
        <p className="text-xs font-mono text-muted-foreground/70 mb-2">Your patterns revealed:</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onComplete}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
      >
        Continue Your Journey
      </motion.button>
    </motion.div>
  );
}

export default function DebtStoryAdventure({ debt, open, onOpenChange }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showStory, setShowStory] = useState(false);

  const storyConfig = DEBT_STORIES[debt?.category] || DEBT_STORIES.default;
  const currentQuestion = storyConfig.questions[questionIndex];
  const isComplete = questionIndex >= storyConfig.questions.length;

  const handleChoose = (choice) => {
    const newAnswers = { ...answers, [currentQuestion.id]: choice.tag };
    setAnswers(newAnswers);

    if (questionIndex < storyConfig.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setShowStory(true);
    }
  };

  const handleClose = () => {
    setQuestionIndex(0);
    setAnswers({});
    setShowStory(false);
    onOpenChange(false);
  };

  if (!open || !debt) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Nintendo DS-style modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-lg"
          >
            {/* Outer DS frame */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-4 shadow-2xl border-4 border-slate-700">
              {/* Screen bezel */}
              <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl p-3 shadow-inner border-2 border-slate-600">
                {/* Content area */}
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg p-6 space-y-6">
                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <h2 className="text-lg font-bold text-foreground font-display">{storyConfig.title}</h2>
                  </motion.div>

                  {/* Story or Questions */}
                  <AnimatePresence mode="wait">
                    {showStory ? (
                      <motion.div
                        key="story"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <StoryChapter debt={debt} answers={answers} onComplete={handleClose} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`question-${questionIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {/* Progress */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              layoutId="progress"
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${((questionIndex + 1) / storyConfig.questions.length) * 100}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {questionIndex + 1}/{storyConfig.questions.length}
                          </span>
                        </div>

                        {/* Question */}
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-4">{currentQuestion.text}</p>
                          <div className="space-y-2">
                            {currentQuestion.choices.map((choice, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChoose(choice)}
                                className="w-full p-3 text-left bg-slate-800 hover:bg-primary/20 border border-slate-700 hover:border-primary/50 rounded-lg transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-foreground/90">{choice.text}</span>
                                  <ChevronRight className="w-4 h-4 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}