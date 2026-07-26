import Dexie from 'dexie';

const db = new Dexie('CarryTheZero');

// Handle database upgrade concurrency gracefully across multiple tabs
db.on('versionchange', () => {
  db.close();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
});

db.on('blocked', () => {
  if (typeof window !== 'undefined') {
    alert('A database update is pending. Please close other tabs of this website to let it complete!');
  }
});

db.version(1).stores({
  loans: '++id, name, category, current_balance',
  spending_habits: '++id, name, pattern',
  transactions: '++id, date, habit_id',
  notes: '++id, month, created_at',
  user_profile: 'id',
});

db.version(2).stores({
  loans: '++id, name, category, current_balance, due_date, next_due_date',
  spending_habits: '++id, name, pattern',
  transactions: '++id, date, habit_id',
  notes: '++id, month, created_at',
  user_profile: 'id',
  money_stories: '++id, loan_id, created_at, updated_at',
  money_story_drafts: 'id, loan_id, updated_at',
});

db.version(3).stores({
  loans: '++id, name, category, current_balance, due_date, next_due_date',
  spending_habits: '++id, name, pattern',
  transactions: '++id, date, habit_id',
  notes: '++id, month, created_at',
  user_profile: 'id',
  money_stories: '++id, loan_id, created_at, updated_at',
  money_story_drafts: 'id, loan_id, updated_at',
  anchors: '++id, name, category, monthly_average',
});

// Seed default user profile
async function initProfile() {
  const count = await db.user_profile.count();
  if (count === 0) {
    await db.user_profile.put({
      id: 'local',
      full_name: 'You',
      email: 'local@carrythezero.xyz',
      created_at: new Date().toISOString(),
      birthData: null,
      personalization: null,
    });
  }
}

// Seed default Anchors (Fixed Expenses) to match the lore of the Forge
async function initAnchors() {
  const count = await db.anchors.count();
  if (count === 0) {
    await db.anchors.put({ id: 1, name: 'Housing / Rent', category: 'housing', monthly_average: 1200 });
    await db.anchors.put({ id: 2, name: 'Utilities & Power', category: 'utilities', monthly_average: 150 });
    await db.anchors.put({ id: 3, name: 'Phone & Internet', category: 'utilities', monthly_average: 80 });
  }
}

async function runSeeds() {
  await initProfile();
  await initAnchors();
}
runSeeds();

// Entity-style API that mirrors @base44/sdk shape
function makeEntityAPI(tableName) {
  const table = db[tableName];
  return {
    list: async () => table.toArray(),
    create: async (data) => {
      const now = new Date().toISOString();
      const record = { ...data, created_date: now, updated_date: now };
      const id = await table.add(record);
      return { ...record, id };
    },
    update: async (id, data) => {
      await table.update(id, { ...data, updated_date: new Date().toISOString() });
      return table.get(id);
    },
    delete: async (id) => {
      await table.delete(id);
      return { success: true };
    },
    get: async (id) => table.get(id),
  };
}

export { db };
export default makeEntityAPI;
