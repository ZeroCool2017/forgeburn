/**
 * Local-first replacement for @base44/sdk.
 * All data lives in IndexedDB via Dexie.js — zero backend, works offline.
 */
import makeEntityAPI, { db } from '@/lib/localDB';

// Generate meaningful local content for the LLM stubs
function generateLocalContent(prompt = '', schema) {
  const lower = prompt.toLowerCase();

  // MoneyHoroscope — returns structured JSON
  if (schema?.properties?.opening) {
    return {
      opening: 'The stars reflect a sky shaped by everything you have carried and released. Freedom is not a destination — it is a direction.',
      sun_insight: 'Your core self is learning that worth and net worth are not the same equation. You are unlearning the belief that struggle earns you love.',
      moon_insight: 'Emotionally, you crave safety — but real safety comes from trusting yourself, not from a zero balance. You are building that trust.',
      rising_influence: 'The version of you the world sees is becoming more aligned with who you actually are. That alignment alone is wealth.',
      money_move: 'Today, name one thing you said yes to out of fear and give yourself permission to un-choose it. That is your power.',
      planetary_weather: 'Saturn reminds you that discipline is just self-respect in slow motion. Venus asks: what are you settling for that you actually deserve?',
      closing: 'The zero is not empty. It is the shape of a door opening.',
    };
  }

  // MoneyStorySession — psychological narrative about a specific loan
  if (lower.includes('money psychologist') || lower.includes('money story')) {
    return `Every financial choice carries a deeper signature — a pattern that repeats until it is seen. The debt you carry is not evidence of failure but of adaptation. You made the best decision you could with the awareness you had at the time, and that deserves compassion, not judgment. What this particular chain reveals is a desire to invest in something — possibility, identity, relief, hope — that felt out of reach otherwise. The awareness you are cultivating now is not just about paying down a number; it is about understanding what that number represents in your inner economy. As you continue this work, you may find that what you are truly paying off is an old story about what you deserve.`;
  }

  // TypingInsightPanel — brief reflective insight about patterns
  if (lower.includes('spending patterns') || lower.includes('habits')) {
    return 'Your spending patterns reveal what you invest in when no one is watching. Each choice is a signal about what you value, what you are seeking, or what you are protecting yourself from. The question is not whether these patterns are "good" or "bad" — it is whether they are consciously chosen. Awareness alone shifts the relationship.';
  }

  // FieldEvolutionPanel — evolving insight about money relationship
  if (lower.includes('field') || lower.includes('evolution')) {
    return 'The pattern is not the problem — it is the map. Each time you look at your habits with honesty instead of judgment, you redraw the boundary between what you used to believe and what you are ready to become. The field evolves not when you force change, but when you understand the logic of what is already here.';
  }

  // MindMapInsights — systemic reflection on debt-habit relationships
  if (lower.includes('mind map') || lower.includes('debt') || lower.includes('loan') || lower.includes('financial psychology')) {
    return 'Debt and habit exist in the same system. One is not the cause of the other — they are expressions of the same relationship with time, resources, and self-trust. What you are building is not just a payoff plan but a renegotiation of how you relate to scarcity. Every payment is a statement about what you believe is possible.';
  }

  // Generic fallback
  return 'Every number in your dashboard tells a story. The work is not to erase the story — it is to understand why it was written, and what chapter comes next.';
}

const coreIntegration = {
  async InvokeLLM({ prompt, response_json_schema }) {
    console.debug('[local] LLM invoked:', prompt?.slice(0, 60), '…');
    return generateLocalContent(prompt, response_json_schema);
  },
};

async function clearAllData() {
  await db.loans.clear();
  await db.spending_habits.clear();
  await db.transactions.clear();
  await db.user_profile.clear();
}

export const base44 = {
  entities: {
    Loan: makeEntityAPI('loans'),
    SpendingHabit: makeEntityAPI('spending_habits'),
    Transaction: makeEntityAPI('transactions'),
  },
  auth: {
    me: async () => {
      const user = await db.user_profile.get('local');
      return user || { id: 'local', full_name: 'You', email: 'local@carrythezero.xyz' };
    },
    updateMe: async (data) => {
      const existing = await db.user_profile.get('local') || { id: 'local' };
      await db.user_profile.put({ ...existing, ...data, updated_at: new Date().toISOString() });
      return db.user_profile.get('local');
    },
    logout: () => {
      window.location.reload();
    },
    redirectToLogin: () => {},
  },
  integrations: {
    Core: coreIntegration,
  },
  clearAllData,
};

export default base44;
