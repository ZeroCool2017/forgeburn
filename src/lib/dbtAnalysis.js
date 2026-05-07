/**
 * DBT (Dialectical Behavior Therapy) Framework for Debt Analysis
 * Maps spending patterns to DBT modules: Mindfulness, Distress Tolerance, 
 * Emotion Regulation, and Interpersonal Effectiveness
 */

const DBT_MODULES = {
  mindfulness: {
    name: 'Mindfulness',
    description: 'Awareness of the present moment without judgment',
    key: 'mindfulness',
  },
  distress_tolerance: {
    name: 'Distress Tolerance',
    description: 'Coping with crises and painful situations',
    key: 'distress_tolerance',
  },
  emotion_regulation: {
    name: 'Emotion Regulation',
    description: 'Managing intense emotions and impulses',
    key: 'emotion_regulation',
  },
  interpersonal_effectiveness: {
    name: 'Interpersonal Effectiveness',
    description: 'Maintaining relationships while meeting needs',
    key: 'interpersonal_effectiveness',
  },
};

// Map user response tags to DBT modules
const TAG_TO_DBT_MAPPING = {
  // Mindfulness deficits
  impulsive: ['mindfulness', 'emotion_regulation'],
  unplanned: ['mindfulness'],
  emotional: ['emotion_regulation', 'mindfulness'],
  avoidance: ['distress_tolerance'],
  
  // Distress Tolerance
  emergency: ['distress_tolerance'],
  self_soothing: ['distress_tolerance', 'emotion_regulation'],
  
  // Emotion Regulation
  obligation: ['interpersonal_effectiveness', 'emotion_regulation'],
  social: ['interpersonal_effectiveness'],
  
  // Positive/Intentional
  growth: ['mindfulness', 'emotion_regulation'],
  planned: ['mindfulness'],
  investment: ['mindfulness'],
  satisfied: [],
  freedom: [],
  control: ['emotion_regulation'],
  responsibility: ['mindfulness'],
};

// DBT-informed reflection questions
const DBT_REFLECTIONS = {
  mindfulness: [
    'What were you feeling in the moment before this purchase?',
    'Did you pause to notice your thoughts, or did you act immediately?',
    'What would have changed if you had taken three deep breaths first?',
  ],
  distress_tolerance: [
    'What difficult feeling were you trying to escape or avoid?',
    'How did the purchase provide temporary relief?',
    'What would happen if you sat with that discomfort instead?',
  ],
  emotion_regulation: [
    'What emotion was strongest when you decided to spend?',
    'How did the purchase change how you felt afterward?',
    'What other ways could you have regulated that emotion?',
  ],
  interpersonal_effectiveness: [
    'Who influenced this decision, intentionally or unintentionally?',
    'Were you saying "yes" to something or "no" to something else?',
    'What would it have looked like to prioritize your own needs here?',
  ],
};

/**
 * Analyze spending patterns through DBT lens
 * Returns strengths, vulnerabilities, and targeted growth areas
 */
export function analyzeDbtProfile(answers, debt) {
  const tags = Object.values(answers);
  const dbtModules = new Set();
  const moduleCounts = {};

  // Initialize counts
  Object.keys(DBT_MODULES).forEach(key => {
    moduleCounts[key] = 0;
  });

  // Map tags to DBT modules
  tags.forEach(tag => {
    const modules = TAG_TO_DBT_MAPPING[tag] || [];
    modules.forEach(module => {
      dbtModules.add(module);
      moduleCounts[module]++;
    });
  });

  // Identify primary challenges (areas needing most support)
  const sortedModules = Object.entries(moduleCounts)
    .filter(([, count]) => count > 0)
    .sort(([, countA], [, countB]) => countB - countA);

  const primaryChallenge = sortedModules[0]?.[0];
  const secondaryChallenge = sortedModules[1]?.[0];

  return {
    tags,
    modules: Array.from(dbtModules),
    primaryChallenge,
    secondaryChallenge,
    moduleCounts,
    reflectionQuestions: generateReflections(dbtModules),
  };
}

/**
 * Generate personalized reflection questions based on profile
 */
function generateReflections(dbtModules) {
  const reflections = {};
  
  dbtModules.forEach(module => {
    const questions = DBT_REFLECTIONS[module] || [];
    reflections[module] = questions[Math.floor(Math.random() * questions.length)];
  });

  return reflections;
}

/**
 * Create narrative arc using DBT insights
 */
export function generateDbtNarrative(answers, debt, profile) {
  const { primaryChallenge, secondaryChallenge, tags } = profile;
  const hasEmotional = tags.includes('emotional') || tags.includes('self_soothing');
  const hasImpulsive = tags.includes('impulsive') || tags.includes('unplanned');
  const hasPlanning = tags.includes('planned') || tags.includes('growth');

  const narratives = {
    beginning: {
      title: 'How We Got Here',
      content: `You accumulated $${debt.current_balance.toLocaleString()} in ${debt.category} debt. This wasn't random. Through a DBT lens, your spending reflects challenges in ${primaryChallenge ? `${DBT_MODULES[primaryChallenge].name}—${DBT_MODULES[primaryChallenge].description.toLowerCase()}` : 'managing emotions and choices'}.`,
    },
    middle: {
      title: 'What Your Patterns Reveal',
      content: generateMiddleNarrative(hasEmotional, hasImpulsive, hasPlanning, primaryChallenge),
    },
    end: {
      title: 'A Different Path Forward',
      content: generateEndNarrative(primaryChallenge, secondaryChallenge),
    },
  };

  return narratives;
}

function generateMiddleNarrative(hasEmotional, hasImpulsive, hasPlanning, primaryChallenge) {
  if (hasEmotional) {
    return `You were seeking emotional relief through spending—a form of self-soothing that provided temporary comfort. DBT calls this a distress tolerance gap. The money wasn't the goal; the feeling was. Understanding this distinction is the first step toward finding healthier coping strategies.`;
  }
  if (hasImpulsive) {
    return `Your decisions came without the pause that mindfulness creates. You acted before fully considering consequences. This suggests a mindfulness gap—the space between impulse and action was too small. That space is where your power lives.`;
  }
  if (hasPlanning) {
    return `You made intentional choices, even if outcomes didn't match hopes. This shows you have the capacity for mindfulness and planning. Your challenge now is applying those strengths to all financial decisions, especially when emotions run high.`;
  }
  return `Your spending patterns suggest struggles with staying present (mindfulness) or managing intense feelings (emotion regulation). The good news: both are learnable skills within the DBT framework.`;
}

function generateEndNarrative(primaryChallenge, secondaryChallenge) {
  let narrative = `Breaking free from this debt means building strength in ${primaryChallenge ? `${DBT_MODULES[primaryChallenge].name}` : 'emotional awareness'}. `;
  
  if (secondaryChallenge) {
    narrative += `Your secondary growth area is ${DBT_MODULES[secondaryChallenge].name}. `;
  }

  narrative += `Every payment forward is practice in mindfulness—choosing what matters to you over what feels urgent. Every moment you pause before spending is a win. The debt is real, but your power to change is realer.`;

  return narrative;
}

/**
 * Generate DBT-based action suggestions
 */
export function generateDbtActions(primaryChallenge) {
  const actions = {
    mindfulness: [
      'Practice the OBSERVE skill: Notice impulses without acting on them',
      'Before any purchase, pause and ask: "What am I feeling right now?"',
      'Use the 5-4-3-2-1 grounding technique when urges arise',
    ],
    distress_tolerance: [
      'Build your TIPP skills: Temperature, Intense exercise, Paced breathing, Pair support',
      'Create a distress tolerance kit with non-harmful coping strategies',
      'Practice tolerating discomfort for 15 minutes before spending',
    ],
    emotion_regulation: [
      'Track ABC PLEASE: Accumulate positive experiences, Build mastery, Cope ahead, Physical health',
      'Identify your emotion vulnerability—what makes you most susceptible to spending?',
      'Build a mood regulation toolkit specific to your triggers',
    ],
    interpersonal_effectiveness: [
      'Practice GIVE skills: Gentle, Interested, Validate, Easy manner',
      'Say "no" to pressures without justifying or over-explaining',
      'Identify relationships that support vs. undermine your financial goals',
    ],
  };

  return actions[primaryChallenge] || [];
}