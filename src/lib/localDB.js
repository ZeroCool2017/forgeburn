import Dexie from 'dexie';

const db = new Dexie('CarryTheZero');

db.version(1).stores({
  loans: '++id, name, category, current_balance',
  spending_habits: '++id, name, pattern',
  transactions: '++id, date, habit_id',
  notes: '++id, month, created_at',
  user_profile: 'id',
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
initProfile();

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
