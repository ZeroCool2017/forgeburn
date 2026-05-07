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
  // Originals
  { text: "The chains of debt are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "A man in debt is so far a slave.", author: "Ralph Waldo Emerson" },
  { text: "Rather go to bed without dinner than to rise in debt.", author: "Benjamin Franklin" },
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

  // Warren Buffett
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { text: "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.", author: "Warren Buffett" },
  { text: "Someone is sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
  { text: "The most important investment you can make is in yourself.", author: "Warren Buffett" },
  { text: "It takes 20 years to build a reputation and five minutes to ruin it.", author: "Warren Buffett" },

  // Jack Dorsey
  { text: "Make every detail perfect and limit the number of details to perfect.", author: "Jack Dorsey" },
  { text: "The strongest thing you can do is ask for help.", author: "Jack Dorsey" },
  { text: "I try to build simple things that solve complex problems.", author: "Jack Dorsey" },

  // Shai Gilgeous-Alexander
  { text: "I just trust the process and trust my preparation.", author: "Shai Gilgeous-Alexander" },
  { text: "The work you put in when no one's watching shows up when everyone is.", author: "Shai Gilgeous-Alexander" },
  { text: "Stay calm, stay ready. Pressure is a privilege.", author: "Shai Gilgeous-Alexander" },

  // Mitt Romney
  { text: "We are a people who built this nation from nothing — immigrants and pioneers — and there is nothing we cannot do.", author: "Mitt Romney" },
  { text: "Character is doing the right thing when nobody's looking.", author: "Mitt Romney" },

  // SGI Buddhism (Daisaku Ikeda)
  { text: "A great human revolution in just a single individual will help achieve a change in the destiny of a nation.", author: "Daisaku Ikeda" },
  { text: "Hardships strengthen us. Every challenge we overcome is a step toward a life of greater value.", author: "Daisaku Ikeda" },
  { text: "The greatest revolution in life is to transform suffering into strength and joy.", author: "Daisaku Ikeda" },
  { text: "It is not the environment that shapes us, but the spirit with which we confront it.", author: "Daisaku Ikeda" },
  { text: "Never let your circumstances determine your worth. You are the author of your own story.", author: "Daisaku Ikeda" },

  // Native American Church / American Indian Movement leaders
  { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Native American Proverb" },
  { text: "The ground on which we stand is sacred ground. It is the blood of our ancestors.", author: "Plenty Coups, Crow Nation" },
  { text: "When we show our respect for other living things, they respond with respect for us.", author: "Arapaho Proverb" },
  { text: "We must protect the forests for our children, grandchildren, and children yet to be born.", author: "Qwatsinas, Nuxalk Nation" },
  { text: "A nation is not conquered until the hearts of its women are on the ground.", author: "Cheyenne Proverb" },
  { text: "They tried to bury us. They didn't know we were seeds.", author: "Dennis Banks, AIM co-founder" },
  { text: "The spirit of the people is greater than the man's technology.", author: "Dennis Banks, AIM co-founder" },
  { text: "If you talk to the animals they will talk with you and you will know each other.", author: "Chief Dan George" },
  { text: "The greatest gift is not found in stores but in the hearts of true friends.", author: "Native American Proverb" },

  // Liberal Indian business leaders
  { text: "The art of moving money is making sure it moves toward opportunity, not away from it.", author: "Anand Mahindra" },
  { text: "Success is not just about making wealth but about making a difference.", author: "Narayana Murthy" },
  { text: "To survive, you must tell stories.", author: "Anita Roddick" },
  { text: "The world is full of magic things, patiently waiting for our senses to grow sharper.", author: "Ratan Tata" },
  { text: "Leadership is about making others better as a result of your presence.", author: "Ratan Tata" },
  { text: "I don't believe in taking right decisions. I take decisions and then make them right.", author: "Ratan Tata" },
  { text: "Treat money as a tool, not a goal. It will take you wherever you need to go.", author: "Azim Premji" },
  { text: "Building a sustainable business is not about the next quarter — it's about the next generation.", author: "Azim Premji" },

  // Keith Haring
  { text: "Art is nothing if you don't reach every segment of the people.", author: "Keith Haring" },
  { text: "I am not a commodity, I am a human being — full of contradictions and possibilities.", author: "Keith Haring" },
  { text: "The public needs art, and it is important for people to use it.", author: "Keith Haring" },
  { text: "Don't worry about trying to be better than someone else. Be the best version of yourself.", author: "Keith Haring" },

  // David Hockney
  { text: "All you can do is work. That's what keeps you going.", author: "David Hockney" },
  { text: "The moment you cheat for the sake of beauty, you know you're an artist.", author: "David Hockney" },
  { text: "I'm always interested in moving forward. You can't be afraid to change.", author: "David Hockney" },
  { text: "Every new medium gives us a new perspective on older media.", author: "David Hockney" },
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