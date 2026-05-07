// Milestone detection — returns a milestone object if a payment crossed a threshold, else null
// Milestones: 10%, 25%, 50%, 75%, 90%, 100% paid off

export const MILESTONES = [
  {
    pct: 100,
    rank: 'ZERO',
    label: 'Chain Broken',
    sub: 'Fully paid off.',
    icon: '⛓️‍💥',
    color: '#a78bfa',
    quote: { text: "You did it. Carry the zero.", author: "Carry the Zero" },
    particles: 'shatter',
  },
  {
    pct: 90,
    rank: 'S',
    label: '90% Down',
    sub: 'Almost free.',
    icon: '🔥',
    color: '#f97316',
    quote: { text: "The last 10% is where legends are made.", author: "Forge wisdom" },
    particles: 'fire',
  },
  {
    pct: 75,
    rank: 'A',
    label: '75% Forged',
    sub: 'Three-quarters gone.',
    icon: '⚡',
    color: '#facc15',
    quote: { text: "Three-quarters of the weight lifted. You feel lighter already.", author: "Carry the Zero" },
    particles: 'spark',
  },
  {
    pct: 50,
    rank: 'B',
    label: 'Halfway',
    sub: 'The tipping point.',
    icon: '⚔️',
    color: '#38bdf8',
    quote: { text: "At the halfway point, momentum is yours. The curve bends toward zero now.", author: "Carry the Zero" },
    particles: 'spark',
  },
  {
    pct: 25,
    rank: 'C',
    label: '25% Crushed',
    sub: 'First quarter done.',
    icon: '🔨',
    color: '#34d399',
    quote: { text: "A quarter down. The system said you couldn't. The numbers say otherwise.", author: "Carry the Zero" },
    particles: 'pop',
  },
  {
    pct: 10,
    rank: 'D',
    label: 'First Strike',
    sub: '10% cleared.',
    icon: '✊',
    color: '#818cf8',
    quote: { text: "The first 10% is the hardest. You broke inertia. That's everything.", author: "Carry the Zero" },
    particles: 'pop',
  },
];

/**
 * Returns a milestone if the payment crossed one, else null.
 * @param {number} oldBalance
 * @param {number} newBalance
 * @param {number} original
 */
export function detectMilestone(oldBalance, newBalance, original) {
  if (!original || original <= 0) return null;
  const oldPct = Math.round((1 - oldBalance / original) * 100);
  const newPct = Math.round((1 - Math.max(0, newBalance) / original) * 100);
  // Find highest milestone crossed (most exciting one)
  return MILESTONES.find(m => oldPct < m.pct && newPct >= m.pct) || null;
}