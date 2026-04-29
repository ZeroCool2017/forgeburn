// Payoff calculation engine
export function calculatePayoffSchedule(loans, extraBudget = 0, strategy = 'momentum') {
  if (!loans.length) return { months: 0, totalInterest: 0, schedule: [], totalPaid: 0 };

  let balances = loans.map(l => ({ ...l, balance: l.current_balance }));
  const schedule = [];
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600;

  while (balances.some(l => l.balance > 0.01) && month < maxMonths) {
    month++;
    let available = extraBudget;
    const monthData = { month, loans: [], totalPaid: 0, totalInterest: 0, totalBalance: 0 };

    // Pay minimums first + calculate interest
    balances.forEach(loan => {
      if (loan.balance <= 0) return;
      const interest = (loan.balance * (loan.interest_rate / 100)) / 12;
      totalInterest += interest;
      monthData.totalInterest += interest;
      
      const minPay = Math.min(loan.minimum_payment, loan.balance + interest);
      loan.balance = loan.balance + interest - minPay;
      monthData.totalPaid += minPay;
      
      monthData.loans.push({
        id: loan.id,
        name: loan.name,
        payment: minPay,
        interest,
        balance: loan.balance,
        original: loan.original_balance || loan.current_balance
      });
    });

    // Distribute extra budget based on strategy
    const ordered = getStrategyOrder(balances.filter(l => l.balance > 0), strategy);
    for (const loan of ordered) {
      if (available <= 0) break;
      const payment = Math.min(available, loan.balance);
      loan.balance -= payment;
      available -= payment;
      monthData.totalPaid += payment;
      const entry = monthData.loans.find(l => l.id === loan.id);
      if (entry) {
        entry.payment += payment;
        entry.balance = loan.balance;
      }
    }

    monthData.totalBalance = balances.reduce((s, l) => s + Math.max(0, l.balance), 0);
    schedule.push(monthData);
  }

  const totalPaid = schedule.reduce((s, m) => s + m.totalPaid, 0);
  return { months: month, totalInterest, schedule, totalPaid };
}

function getStrategyOrder(loans, strategy) {
  switch (strategy) {
    case 'avalanche':
      return [...loans].sort((a, b) => b.interest_rate - a.interest_rate);
    case 'snowball':
      return [...loans].sort((a, b) => a.balance - b.balance);
    case 'momentum':
      // Hybrid: weight by both rate and progress toward payoff
      return [...loans].sort((a, b) => {
        const aProgress = 1 - (a.balance / (a.original_balance || a.current_balance));
        const bProgress = 1 - (b.balance / (b.original_balance || b.current_balance));
        const aScore = (a.interest_rate * 0.6) + (aProgress * 100 * 0.4);
        const bScore = (b.interest_rate * 0.6) + (bProgress * 100 * 0.4);
        return bScore - aScore;
      });
    case 'blitz':
      // Target the loan with highest monthly interest cost
      return [...loans].sort((a, b) => {
        const aMonthly = (b.balance * b.interest_rate) - (a.balance * a.interest_rate);
        return aMonthly;
      });
    default:
      return loans;
  }
}

export function calculateMinimumOnlyPayoff(loans) {
  return calculatePayoffSchedule(loans, 0, 'avalanche');
}

export const STRATEGIES = [
  { id: 'momentum', name: 'Momentum', description: 'Smart hybrid — balances quick wins with interest savings', icon: '⚡' },
  { id: 'avalanche', name: 'Avalanche', description: 'Highest interest first — mathematically optimal', icon: '🏔️' },
  { id: 'snowball', name: 'Snowball', description: 'Smallest balance first — psychological wins', icon: '❄️' },
  { id: 'blitz', name: 'Blitz', description: 'Highest monthly cost first — maximum cash flow relief', icon: '🔥' },
];

export const QUOTES = [
  { text: "The chains of debt are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "A man in debt is so far a slave.", author: "Ralph Waldo Emerson" },
  { text: "Rather go to bed without dinner than to rise in debt.", author: "Benjamin Franklin" },
  { text: "The only man who sticks closer to you in adversity than a friend is a creditor.", author: "Unknown" },
  { text: "Debt is the worst poverty.", author: "Thomas Fuller" },
  { text: "Every time you borrow money, you're robbing your future self.", author: "Nathan W. Morris" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "It's not about how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
  { text: "Beware of little expenses. A small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "You must gain control over your money or the lack of it will forever control you.", author: "Dave Ramsey" },
  { text: "Freedom is not free. It costs discipline.", author: "Unknown" },
];

export const CATEGORY_CONFIG = {
  student: { emoji: '🎓', label: 'Student', color: '#818cf8' },
  auto: { emoji: '🚗', label: 'Auto', color: '#38bdf8' },
  mortgage: { emoji: '🏠', label: 'Mortgage', color: '#a78bfa' },
  credit_card: { emoji: '💳', label: 'Credit Card', color: '#f472b6' },
  personal: { emoji: '👤', label: 'Personal', color: '#34d399' },
  medical: { emoji: '🏥', label: 'Medical', color: '#fb923c' },
  other: { emoji: '📋', label: 'Other', color: '#94a3b8' },
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatCurrencyExact(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}