import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Brain, Heart, Shield, Users } from 'lucide-react';
import { analyzeDbtProfile, generateDbtNarrative, generateDbtActions } from '@/lib/dbtAnalysis';

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
      {
        id: 'pause',
        text: 'Did you pause to consider alternatives before borrowing?',
        choices: [
          { text: 'Yes, I weighed options carefully', tag: 'planned', value: 0 },
          { text: 'Somewhat, but felt pressured', tag: 'social', value: 1 },
          { text: 'No, it felt like the only way forward', tag: 'impulsive', value: 2 },
        ],
      },
    ],
  },
  credit_card: {
    title: 'The Spending Spiral',
    questions: [
      {
        id: 'trigger',
        text: 'What emotional state triggered the spending?',
        choices: [
          { text: 'Handling a crisis or unexpected event', tag: 'emergency', value: 0 },
          { text: 'Seeking comfort or relief from difficult emotions', tag: 'self_soothing', value: 1 },
          { text: 'Keeping up with others or wanting what they had', tag: 'social', value: 2 },
        ],
      },
      {
        id: 'awareness',
        text: 'How aware were you of your emotions during spending?',
        choices: [
          { text: 'Very aware—I was trying to feel better', tag: 'emotional', value: 0 },
          { text: 'Somewhat—I noticed but didn\'t think to stop', tag: 'impulsive', value: 1 },
          { text: 'Not aware—it just happened', tag: 'unplanned', value: 2 },
        ],
      },
      {
        id: 'pattern',
        text: 'Did you have ways to cope with emotions besides spending?',
        choices: [
          { text: 'Yes, but spending felt easier', tag: 'avoidance', value: 0 },
          { text: 'Not really—I didn\'t know what else to do', tag: 'distress_tolerance', value: 1 },
          { text: 'No, and I wasn\'t looking for alternatives', tag: 'unplanned', value: 2 },
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
          { text: 'Justified upgrade—needed features', tag: 'justified', value: 1 },
          { text: 'Wanted emotionally or for status', tag: 'emotional', value: 2 },
        ],
      },
      {
        id: 'decision',
        text: 'How was the purchase decision made?',
        choices: [
          { text: 'Research, comparison, deliberate choice', tag: 'planned', value: 0 },
          { text: 'Influenced by friends, family, or salesperson', tag: 'social', value: 1 },
          { text: 'Impulsive, felt right in the moment', tag: 'impulsive', value: 2 },
        ],
      },
      {
        id: 'pause_time',
        text: 'Did you give yourself time to reflect before committing?',
        choices: [
          { text: 'Yes—I waited and reconsidered', tag: 'planned', value: 0 },
          { text: 'A little—felt some pressure to decide', tag: 'social', value: 1 },
          { text: 'No—I signed that day or very quickly', tag: 'impulsive', value: 2 },
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
          { text: 'Intentional investment in your future', tag: 'investment', value: 0 },
          { text: 'Unexpected circumstance or crisis', tag: 'emergency', value: 1 },
          { text: 'Gradual spending without full awareness', tag: 'unplanned', value: 2 },
        ],
      },
      {
        id: 'emotion_then',
        text: 'What emotions were present when this debt started?',
        choices: [
          { text: 'Optimism and purpose', tag: 'growth', value: 0 },
          { text: 'Stress, anxiety, or overwhelm', tag: 'distress_tolerance', value: 1 },
          { text: 'Numbness, impulse, or avoidance', tag: 'emotional', value: 2 },
        ],
      },
      {
        id: 'meaning',
        text: 'What does paying this off mean to you?',
        choices: [
          { text: 'Freedom and capability to pursue what matters', tag: 'freedom', value: 0 },
          { text: 'Responsibility fulfilled and duty met', tag: 'responsibility', value: 1 },
          { text: 'Reclaiming control over my own choices', tag: 'control', value: 2 },
        ],
      },
    ],
  },
};

// DBT module icons
const DBT_ICONS = {
  mindfulness: { icon: Brain, color: 'text-primary', bg: 'bg-primary/10' },
  distress_tolerance: { icon: Shield, color: 'text-accent', bg: 'bg-accent/10' },
  emotion_regulation: { icon: Heart, color: 'text-chart-3', bg: 'bg-chart-3/10' },
  interpersonal_effectiveness: { icon: Users, color: 'text-chart-4', bg: 'bg-chart-4/10' },
};

function StoryChapter({ debt, answers, onComplete }) {
  const profile = analyzeDbtProfile(answers, debt);
  const narrative = generateDbtNarrative(answers, debt, profile);
  const actions = generateDbtActions(profile.primaryChallenge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Beginning */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <h3 className="text-xs font-mono text-primary/70 uppercase mb-2">Beginning</h3>
        <p className="text-sm text-foreground/90 leading-relaxed">{narrative.beginning.content}</p>
      </div>

      {/* Middle with DBT insight */}
      <div className="p-4 bg-gradient-to-r from-accent/10 to-chart-3/10 rounded-lg border border-accent/20">
        <h3 className="text-xs font-mono text-accent/70 uppercase mb-2">Middle</h3>
        <p className="text-sm text-foreground/90 leading-relaxed mb-3">{narrative.middle.content}</p>
        {profile.reflectionQuestions && Object.entries(profile.reflectionQuestions).length > 0 && (
          <div className="mt-3 p-2 bg-background/40 rounded border border-border/20">
            <p className="text-xs text-muted-foreground italic">
              {Object.entries(profile.reflectionQuestions)[0]?.[1] || ''}
            </p>
          </div>
        )}
      </div>

      {/* End */}
      <div className="p-4 bg-gradient-to-r from-chart-3/10 to-primary/10 rounded-lg border border-chart-3/20">
        <h3 className="text-xs font-mono text-chart-3/70 uppercase mb-2">End</h3>
        <p className="text-sm text-foreground/90 leading-relaxed">{narrative.end.content}</p>
      </div>

      {/* DBT Profile */}
      <div className="p-4 bg-background/50 rounded-lg border border-border/20 space-y-3">
        <p className="text-xs font-mono text-muted-foreground/70 uppercase">Your DBT Profile</p>
        
        {profile.primaryChallenge && (() => {
          const dbtIcon = DBT_ICONS[profile.primaryChallenge];
          const Icon = dbtIcon?.icon;
          return (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground">Primary Focus Area</p>
              <div className={`p-3 rounded-lg ${dbtIcon?.bg}`}>
                <div className="flex items-start gap-2">
                  {Icon && <Icon className={`w-4 h-4 mt-0.5 ${dbtIcon?.color}`} />}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{profile.primaryChallenge.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-foreground/70 mt-1">{actions[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* All modules involved */}
        {profile.modules.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-2">Modules Involved</p>
            <div className="flex flex-wrap gap-2">
              {profile.modules.map(module => (
                <span key={module} className={`text-xs px-2 py-1 rounded-full ${DBT_ICONS[module]?.bg} ${DBT_ICONS[module]?.color}`}>
                  {module.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Growth Actions */}
      {actions.length > 0 && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
          <p className="text-xs font-mono text-primary/70 uppercase">Targeted Growth</p>
          <ul className="space-y-1.5">
            {actions.map((action, idx) => (
              <li key={idx} className="text-xs text-foreground/80 flex gap-2">
                <span className="text-primary">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onComplete}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
      >
        Acknowledge Your Story
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