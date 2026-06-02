/**
 * Local-first replacement for @base44/sdk.
 * All data lives in IndexedDB via Dexie.js — zero backend, works offline.
 */
import makeEntityAPI, { db } from '@/lib/localDB';

// Stub for LLM integration features — Base44 provided this but we can't
// call it anymore. Returns a fallback so the UI doesn't crash.
const llmFallback = {
  async InvokeLLM({ prompt }) {
    console.debug('[local] LLM invoked (stub):', prompt?.slice(0, 80));
    return {
      choices: [{ message: { content: 'This feature is available with a cloud backend. For now, trust your own intuition.' } }],
    };
  },
};

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
      // No-op — local-only app, no session to clear
      console.debug('[local] logout called (no-op)');
    },
    redirectToLogin: () => {
      // No-op — always authenticated locally
      console.debug('[local] redirectToLogin called (no-op)');
    },
  },
  integrations: {
    Core: llmFallback,
  },
};

export default base44;
