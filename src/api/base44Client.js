/**
 * Local-first replacement for @base44/sdk.
 * All data lives in IndexedDB via Dexie.js — zero backend, works offline.
 */
import makeEntityAPI, { db } from '@/lib/localDB';

// Stub for LLM integration features
const llmFallback = {
  async InvokeLLM({ prompt }) {
    console.debug('[local] LLM invoked (stub):', prompt?.slice(0, 80));
    return {
      choices: [{ message: { content: 'This feature is available with a cloud backend. For now, trust your own intuition.' } }],
    };
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
      // Reload to clear React state to a clean page
      window.location.reload();
    },
    redirectToLogin: () => {},
  },
  integrations: {
    Core: llmFallback,
  },
  // Clear all local data — replaces "Delete Account" in local mode
  clearAllData,
};

export default base44;
