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
  // Debt & freedom classics
  { text: "The chains of debt are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "A man in debt is so far a slave.", author: "Ralph Waldo Emerson" },
  { text: "Rather go to bed without dinner than to rise in debt.", author: "Benjamin Franklin" },
  { text: "Debt is the worst poverty.", author: "Thomas Fuller" },
  { text: "Every time you borrow money, you're robbing your future self.", author: "Nathan W. Morris" },
  { text: "Beware of little expenses. A small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "Freedom is not free. It costs discipline.", author: "Unknown" },

  // Compounding interest
  { text: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.", author: "Albert Einstein (attributed)" },
  { text: "The most powerful force in the universe is compound interest.", author: "Albert Einstein (attributed)" },
  { text: "Time is the friend of the wonderful company, the enemy of the mediocre.", author: "Warren Buffett" },
  { text: "The stock market is a device to transfer money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "Someone is sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { text: "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.", author: "Warren Buffett" },
  { text: "The most important investment you can make is in yourself.", author: "Warren Buffett" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },

  // Ben Graham
  { text: "The intelligent investor is a realist who sells to optimists and buys from pessimists.", author: "Benjamin Graham" },
  { text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
  { text: "In the short run, the market is a voting machine. In the long run, it is a weighing machine.", author: "Benjamin Graham" },
  { text: "The market is there to serve you, not to guide you.", author: "Benjamin Graham" },

  // JL Collins (A Simple Path to Wealth)
  { text: "Spend less than you earn. Invest the surplus. Avoid debt.", author: "JL Collins" },
  { text: "Debt is the most potent force for keeping you from your goals.", author: "JL Collins" },
  { text: "The more you can simplify your financial life, the more you are in control of it.", author: "JL Collins" },
  { text: "Financial independence is about having options, not things.", author: "JL Collins" },

  // Ken Honda (Happy Money)
  { text: "When you receive money with a grateful heart, you attract more of it.", author: "Ken Honda" },
  { text: "Money is just energy. When you let it flow freely, it comes back to you.", author: "Ken Honda" },
  { text: "The way you treat money reflects how you treat yourself.", author: "Ken Honda" },
  { text: "Arigato — say thank you to every dollar that comes in and every dollar that goes out.", author: "Ken Honda" },

  // James Clear (Atomic Habits)
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "Small habits compound into remarkable results over time.", author: "James Clear" },
  { text: "The most practical way to change who you are is to change what you do.", author: "James Clear" },
  { text: "Goals are good for setting direction. Systems are best for making progress.", author: "James Clear" },

  // Marsha Linehan (DBT)
  { text: "You can't go back and change the beginning, but you can start where you are and change the ending.", author: "Marsha Linehan" },
  { text: "Radical acceptance is the path out of hell — refusing it keeps you there.", author: "Marsha Linehan" },
  { text: "The willingness to suffer is what makes the willingness to change possible.", author: "Marsha Linehan" },
  { text: "A life worth living is built one moment at a time.", author: "Marsha Linehan" },

  // Grimes
  { text: "I want to be a billionaire so I can fund art projects. That's literally it.", author: "Grimes" },
  { text: "The future is weird and uncertain and that's the most exciting thing about it.", author: "Grimes" },
  { text: "I think creativity is just another form of problem solving.", author: "Grimes" },

  // Coco Gauff
  { text: "Doubt me, watch me work.", author: "Coco Gauff" },
  { text: "I learned that the journey matters more than the destination.", author: "Coco Gauff" },
  { text: "Use your voice. Even when it shakes.", author: "Coco Gauff" },
  { text: "Every loss teaches you something a win never could.", author: "Coco Gauff" },

  // Jack Dorsey
  { text: "Make every detail perfect and limit the number of details to perfect.", author: "Jack Dorsey" },
  { text: "The strongest thing you can do is ask for help.", author: "Jack Dorsey" },
  { text: "Edit your life frequently and ruthlessly.", author: "Jack Dorsey" },

  // Shai Gilgeous-Alexander
  { text: "I just trust the process and trust my preparation.", author: "Shai Gilgeous-Alexander" },
  { text: "Stay calm, stay ready. Pressure is a privilege.", author: "Shai Gilgeous-Alexander" },
  { text: "The work you put in when no one's watching shows up when everyone is.", author: "Shai Gilgeous-Alexander" },

  // Dr. V — Aravind Eye Care
  { text: "Are you a leader for your own convenience, or have you been called to serve?", author: "Dr. Govindappa Venkataswamy (Dr. V)" },
  { text: "If we are going to solve the problems of this world, we have to expand our love to match it.", author: "Dr. Govindappa Venkataswamy (Dr. V)" },
  { text: "McDonald's can deliver burgers to every corner of the world. Why can't we deliver sight?", author: "Dr. Govindappa Venkataswamy (Dr. V)" },

  // Oklahoma figures
  { text: "The most beautiful things in the world cannot be seen or touched — they are felt with the heart.", author: "Wilma Mankiller, Cherokee Nation Chief" },
  { text: "We must trust our own thinking, trust our own strength.", author: "Wilma Mankiller, Cherokee Nation Chief" },
  { text: "In every crisis there is an opportunity.", author: "Wilma Mankiller, Cherokee Nation Chief" },
  { text: "I've always been a systems thinker. Look at the structure, not just the problem.", author: "Brad Henry, Oklahoma Governor" },
  { text: "Music is the shorthand of emotion.", author: "Leon Russell, Oklahoma musician" },

  // SGI / Daisaku Ikeda
  { text: "A great human revolution in just a single individual will help achieve a change in the destiny of a nation.", author: "Daisaku Ikeda" },
  { text: "Hardships strengthen us. Every challenge we overcome is a step toward a life of greater value.", author: "Daisaku Ikeda" },
  { text: "It is not the environment that shapes us, but the spirit with which we confront it.", author: "Daisaku Ikeda" },
  { text: "The greatest revolution in life is to transform suffering into strength and joy.", author: "Daisaku Ikeda" },

  // Native American / AIM
  { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Native American Proverb" },
  { text: "They tried to bury us. They didn't know we were seeds.", author: "Dennis Banks, AIM co-founder" },
  { text: "When we show our respect for other living things, they respond with respect for us.", author: "Arapaho Proverb" },
  { text: "A nation is not conquered until the hearts of its women are on the ground.", author: "Cheyenne Proverb" },
  { text: "If you talk to the animals they will talk with you and you will know each other.", author: "Chief Dan George" },

  // Indian business leaders
  { text: "I don't believe in taking right decisions. I take decisions and then make them right.", author: "Ratan Tata" },
  { text: "The world is full of magic things, patiently waiting for our senses to grow sharper.", author: "Ratan Tata" },
  { text: "Treat money as a tool, not a goal.", author: "Azim Premji" },
  { text: "Success is not just about making wealth but about making a difference.", author: "Narayana Murthy" },
  { text: "To survive, you must tell stories.", author: "Anita Roddick" },

  // Keith Haring
  { text: "Art is nothing if you don't reach every segment of the people.", author: "Keith Haring" },
  { text: "Don't worry about trying to be better than someone else. Be the best version of yourself.", author: "Keith Haring" },
  { text: "The public needs art, and it is important for people to use it.", author: "Keith Haring" },

  // David Hockney
  { text: "All you can do is work. That's what keeps you going.", author: "David Hockney" },
  { text: "I'm always interested in moving forward. You can't be afraid to change.", author: "David Hockney" },
  { text: "Every new medium gives us a new perspective on older media.", author: "David Hockney" },

  // Mitt Romney
  { text: "Character is doing the right thing when nobody's looking.", author: "Mitt Romney" },
];

// Fisher-Yates shuffle so quotes never repeat in the same order
export function getShuffledQuotes() {
  const arr = [...QUOTES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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