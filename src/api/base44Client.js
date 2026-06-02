/**
 * Local-first replacement for @base44/sdk.
 * All data lives in IndexedDB via Dexie.js — zero backend, works offline.
 */
import makeEntityAPI, { db } from '@/lib/localDB';

// Load user answers from onboarding to weave into content
async function loadAnswers() {
  try {
    const profile = await db.user_profile.get('local');
    if (profile?.personalization) {
      return JSON.parse(profile.personalization);
    }
  } catch (_) {}
  return {};
}

// Generate meaningful local content for the LLM stubs
async function generateLocalContent(prompt = '', schema) {
  const answers = await loadAnswers();
  const name = answers.name || '';
  const fear = answers.biggest_fear || '';
  const freedom = answers.freedom_looks_like || '';
  const admire = answers.admire_who || '';
  const hobbies = answers.hobbies_passions || '';
  const songs = answers.songs_that_move || '';
  const win = answers.small_win || '';
  const dream = answers.dream_impossible || '';
  const lower = prompt.toLowerCase();

  const greeting = name ? `${name}, ` : '';
  const winRef = win ? ` You recently said ${win.slice(0, 60)} — that same momentum is here now.` : '';
  const dreamRef = dream ? ` You said if money weren't a constraint you'd ${dream.slice(0, 80)}. That vision matters more than the number in your dashboard.` : '';
  const freedomRef = freedom ? ` You said freedom looks like ${freedom.slice(0, 100)}. Keep your eyes on that picture.` : '';

  // MoneyHoroscope — returns structured JSON
  if (schema?.properties?.opening) {
    return {
      opening: `${greeting}The sky reflects what you carry and what you're ready to release.${freedomRef}`,
      sun_insight: `Your core self is learning that worth and net worth are not the same equation.${fear ? ` The fear you named — "${fear.slice(0, 80)}" — is real, but it does not define you.` : ''}`,
      moon_insight: `Emotionally, you crave alignment between who you are and what you build.${hobbies ? ` The things you do when no one's watching — ${hobbies.slice(0, 60)} — are where your real wealth lives.` : ''}`,
      rising_influence: `${admire ? `The person you admire (${admire.slice(0, 60)}) embodies something you are ready to claim for yourself. ` : ''}That alignment alone is a form of wealth.`,
      money_move: `Today, reconnect with one thing you said yes to out of ${fear ? 'that fear you named' : 'obligation'} and ask: does it still serve you?${winRef}`,
      planetary_weather: `Saturn reminds you that discipline is just self-respect in slow motion.${songs ? ` Let "${songs.slice(0, 80)}" be your anchor today.` : ''}`,
      closing: `${dreamRef} The zero is not empty. It is the shape of a door opening.`,
    };
  }

  // MoneyStorySession — psychological narrative about a specific loan
  if (lower.includes('money psychologist') || lower.includes('money story')) {
    const fearRef = fear ? ` You named "${fear.slice(0, 80)}" as your biggest fear around money. It makes sense that some of these chains were forged trying to protect yourself from that exact thing — a bid for control, safety, or the feeling of enough.` : '';
    const admireRef = admire ? ` The person you admire (${admire.slice(0, 60)}) represents something you value. What if you already have the quality you see in them?` : '';
    return `Every financial choice carries a deeper signature — a pattern that repeats until it is seen.${fearRef} The debt you carry is not evidence of failure but of adaptation. You made the best decision you could with the awareness you had at the time, and that deserves compassion, not judgment.${freedomRef}${admireRef} The awareness you are cultivating now is not just about paying down a number; it is about understanding what that number represents in your inner economy.${dreamRef}`;
  }

  // TypingInsightPanel — brief reflective insight about patterns
  if (lower.includes('spending patterns') || lower.includes('habits')) {
    return `${greeting}Your spending patterns reveal what you invest in when no one is watching.${hobbies ? ` The things that light you up — ${hobbies.slice(0, 80)} — are clues to what you truly value.` : ''} Each choice is a signal about what you are seeking or protecting yourself from.${winRef} Awareness alone shifts the relationship.`;
  }

  // FieldEvolutionPanel — evolving insight about money relationship
  if (lower.includes('field') || lower.includes('evolution')) {
    return `${greeting}The pattern is not the problem — it is the map.${fear ? ` The fear you named — "${fear.slice(0, 80)}" — is the edge of your current field. ` : ' '}Each time you look at your habits with honesty instead of judgment, you redraw the boundary between what you used to believe and what you are ready to become.${freedomRef}${dreamRef}`;
  }

  // MindMapInsights — systemic reflection on debt-habit relationships
  if (lower.includes('mind map') || lower.includes('debt') || lower.includes('loan') || lower.includes('financial psychology')) {
    return `${greeting}Debt and habit exist in the same system.${fear ? ` The fear you named — "${fear.slice(0, 80)}" — and the freedom you described — "${(freedom || 'your vision').slice(0, 80)}" — are two ends of the same spectrum. ` : ' '}What you are building is not just a payoff plan but a renegotiation of how you relate to scarcity.${dreamRef} Every payment is a statement about what you believe is possible.`;
  }

  // Generic fallback
  return `${greeting}Every number in your dashboard tells a story.${freedomRef} The work is not to erase the story — it is to understand why it was written, and what chapter comes next.${winRef}`;
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
  await db.notes.clear();
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
