// Per-bill psychology — how to THINK about each anchor, not just "cut it."
// Each entry pairs a reframe (the mental shift) with levers (practical moves).
// Matched by category, then by name keyword, then a thoughtful default.

export const BILL_PSYCHOLOGY = {
  housing: {
    reframe: "Your largest anchor is your largest lever. A small percent here outweighs big cuts in a dozen smaller bills.",
    levers: [
      "Renegotiate at renewal — a vacancy costs a landlord more than a small reduction. The threat of turnover is your leverage.",
      "House-hack: one room or one roommate can halve your single biggest expense.",
      "Question the space: are you paying for square footage you don't use, or a location you no longer need daily?",
    ],
  },
  mortgage: {
    reframe: "A mortgage is the one bill where the rate, not the balance, is the lever. A fraction of a percent is worth thousands.",
    levers: [
      "Refinance when rates drop half a point or more — the break-even is often under two years. Run the numbers, don't just feel it.",
      "Drop PMI the moment you hit 20% equity — many lenders won't do it automatically. One call, permanent savings.",
      "Recast, don't refinance: a lump sum toward principal can lower your payment without the closing costs of a new loan.",
    ],
  },
  utilities: {
    reframe: "Variable bills are a mirror. The gap between your low and high month is the shape of your waste.",
    levers: [
      "Track three months. The spread between low and high is your opportunity, shown in dollars.",
      "A smart thermostat pays back in one season; LED swaps in two. Small hardware, permanent savings.",
      "Equalized billing plans trade surprise for steadiness — useful if the spikes are what stress you, not the total.",
    ],
  },
  phone: {
    reframe: "Loyalty is a fee you pay silently. The number on your bill is not the number they'd accept to keep you.",
    levers: [
      "Call retention. Mention a competitor's rate by name and ask what they can do. Most people save $15–40/mo in one call.",
      "Audit your data — most people pay for a tier they half-use. A lower plan plus Wi-Fi habits rarely bites.",
      "Owned vs. financed: a paid-off phone on a cheaper plan beats the 'free upgrade' loop every two years.",
    ],
  },
  internet: {
    reframe: "Speed is sold by fear. Most households use a fraction of the bandwidth they buy.",
    levers: [
      "Downgrade one tier and watch a month — you likely won't notice. The speed you 'need' is usually the speed you're sold.",
      "Promotional rates expire quietly. Call at the 12-month mark and ask for the current new-customer offer.",
      "Check for a municipal or fiber alternative — competition, even the threat of it, bends the bill down.",
    ],
  },
  subscriptions: {
    reframe: "Subscriptions are designed to be forgotten. A charge you don't notice is a charge you don't decide about.",
    levers: [
      "Audit quarterly. Pause anything you haven't opened in 30 days — you can always resume.",
      "Stack the free tiers. Most services have one; most people never look.",
      "Rotate, don't cancel: one streaming service at a time, finish its library, swap. You get everything for the price of one.",
    ],
  },
  streaming: {
    reframe: "You don't need all of them at once. The library is infinite; your time is not.",
    levers: [
      "Rotate one service per month. Finish its catalog, then swap. You get everything for the price of one.",
      "Share household plans with people you already live with — most services price for it now.",
      "Ads vs. no-ads: the price gap is months of the service itself. Decide with your hours, not your pride.",
    ],
  },
  insurance: {
    reframe: "Loyalty rarely pays in insurance. The price you're quoted is not the price you're worth.",
    levers: [
      "Re-shop annually. Bundling auto + home typically saves 10–15% — but only if you actually compare.",
      "Raise your deductible to what you can absorb in a bad month. You're insuring against ruin, not inconvenience.",
      "Check for coverage you've outgrown — old riders on old cars, or benefits duplicated across policies.",
    ],
  },
  groceries: {
    reframe: "The most variable anchor is the most psychological. You don't buy food, you buy decisions — and decisions cost more than calories.",
    levers: [
      "Meal-plan one week. The plan removes the daily decision, and the decision is where the money leaks.",
      "Shop the perimeter, not the aisles. The middle of the store is where margin lives — yours and theirs.",
      "Never shop hungry, never shop without a list. Two rules that beat every coupon.",
    ],
  },
  transport: {
    reframe: "Movement costs compound — the car, the fuel, the insurance, the parking. Each is a separate bill pretending to be one need.",
    levers: [
      "Compare fuel within a two-mile radius — prices vary 30¢/gal, and a tank multiplies it.",
      "One car-free day a week is a 14% cut in fuel and a quiet experiment in whether you need the second car at all.",
      "Re-shop insurance yearly (see insurance) — it's the transport bill people forget is a transport bill.",
    ],
  },
  gym: {
    reframe: "You're not paying for fitness, you're paying for intention. The question is whether the charge is making the intention more likely.",
    levers: [
      "If you go twice a week or more, keep it. If you don't, the fee is a guilt subscription, not a fitness one.",
      "Home equipment pays back in a year against a $40/mo membership you use inconsistently.",
      "Class packs and community centers offer the same sweat without the auto-renew.",
    ],
  },
  health: {
    reframe: "Health costs are part prevention, part system. Some you choose, some are chosen for you — know which is which.",
    levers: [
      "Preventive care is usually covered fully. Skipping it turns a free visit into a bill later.",
      "Generic vs. brand is the same molecule at a different price. Always ask.",
      "An HSA is a tax break that also rolls forward — if you're eligible, it's rarely the wrong move.",
    ],
  },
  default: {
    reframe: "Every bill is a decision you keep paying for. The question isn't just 'can I cut it' — it's 'did I choose this, or did I inherit it?'",
    levers: [
      "Compare it to a competitor once a year. Loyalty is rarely rewarded in pricing — the deal you have is usually not the best they'd give.",
      "Ask for 10% less. Call the provider, say you're reviewing costs, and ask what's possible. A one-minute call saves people money more often than any app.",
      "Could this be paused for 30 days without real harm? If yes, it's optional — even if you decide to keep it.",
      "Is it the same each month, or does it swing? The high months are where the opportunity hides; track three and find your low.",
    ],
  },
};

// Categories offered in the add-bill form — the picked key feeds the psychology.
export const BILL_CATEGORIES = [
  { key: 'other', label: 'Other' },
  { key: 'housing', label: 'Rent / Housing' },
  { key: 'mortgage', label: 'Mortgage' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'phone', label: 'Phone' },
  { key: 'internet', label: 'Internet' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'streaming', label: 'Streaming' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'transport', label: 'Transport' },
  { key: 'gym', label: 'Gym' },
  { key: 'health', label: 'Health' },
];

const NAME_KEYWORDS = [
  ['rent', 'housing'], ['mortgage', 'mortgage'], ['apartment', 'housing'],
  ['electric', 'utilities'], ['gas', 'utilities'], ['water', 'utilities'], ['power', 'utilities'], ['utility', 'utilities'],
  ['phone', 'phone'], ['cell', 'phone'], ['mobile', 'phone'],
  ['internet', 'internet'], ['wifi', 'internet'], ['broadband', 'internet'],
  ['netflix', 'streaming'], ['spotify', 'streaming'], ['disney', 'streaming'], ['hulu', 'streaming'], ['max', 'streaming'], ['prime', 'streaming'],
  ['subscription', 'subscriptions'], ['sub ', 'subscriptions'],
  ['insurance', 'insurance'], ['auto ins', 'insurance'],
  ['grocer', 'groceries'], ['food', 'groceries'], ['market', 'groceries'],
  ['gas', 'transport'], ['fuel', 'transport'], ['transit', 'transport'], ['car', 'transport'], ['uber', 'transport'], ['lyft', 'transport'],
  ['gym', 'gym'], ['fitness', 'gym'],
  ['medical', 'health'], ['health', 'health'], ['dental', 'health'], ['doctor', 'health'], ['pharma', 'health'],
];

export function getBillPsychology(category, name = '') {
  const cat = String(category || '').toLowerCase().trim();
  if (BILL_PSYCHOLOGY[cat]) return BILL_PSYCHOLOGY[cat];

  const lower = String(name || '').toLowerCase();
  for (const [kw, key] of NAME_KEYWORDS) {
    if (lower.includes(kw) && BILL_PSYCHOLOGY[key]) return BILL_PSYCHOLOGY[key];
  }
  return BILL_PSYCHOLOGY.default;
}