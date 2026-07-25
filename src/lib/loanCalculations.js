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
      // Highest minimum payment first — frees up cash flow fastest
      return [...loans].sort((a, b) => (b.minimum_payment || 0) - (a.minimum_payment || 0));
    default:
      return loans;
  }
}

export function calculateMinimumOnlyPayoff(loans) {
  return calculatePayoffSchedule(loans, 0, 'avalanche');
}

export const STRATEGIES = [
  { id: 'momentum', name: 'Momentum', description: 'Smart hybrid — balances quick wins with interest savings', icon: '⛓️' },
  { id: 'avalanche', name: 'Avalanche', description: 'Highest interest first — mathematically optimal', icon: '💧' },
  { id: 'snowball', name: 'Snowball', description: 'Smallest balance first — psychological wins', icon: '⚪' },
  { id: 'blitz', name: 'Cash Flow', description: 'Highest minimum payment first — frees up monthly cash fastest', icon: '💥' },
];

export const QUOTES = [
  // Future (rapper)
  { text: "I turned my pain into progress.", author: "Future" },
  { text: "Leveling up is a lifestyle, not a moment.", author: "Future" },
  { text: "Mask off. Face your numbers.", author: "Future" },
  { text: "Every move I make is intentional. Every payment should be too.", author: "Future" },
  { text: "I came from nothing. Debt is just another nothing to overcome.", author: "Future" },
  { text: "Used to count pennies, now I'm counting purpose.", author: "Future" },
  { text: "They didn't believe in the vision. The balance sheet will.", author: "Future" },
  { text: "Life is good when you're living on your own terms.", author: "Future" },

  // Good Will Hunting
  { text: "It's not your fault.", author: "Good Will Hunting" },
  { text: "You'll have bad times, but it'll always wake you up to the good stuff you weren't paying attention to.", author: "Good Will Hunting" },
  { text: "Some people can't believe in themselves until someone else believes in them first.", author: "Good Will Hunting" },

  // Moneyball / Billy Beane / Michael Lewis
  { text: "Adapt or die.", author: "Billy Beane, Moneyball" },
  { text: "Your goal shouldn't be to buy players. Your goal should be to buy wins.", author: "Billy Beane, Moneyball" },
  { text: "The market for baseball players is an irrational one. So is the market for everything else.", author: "Michael Lewis, Moneyball" },
  { text: "People operate with beliefs and biases. To the extent you can eliminate both and replace with data, you gain a competitive advantage.", author: "Billy Beane, Moneyball" },
  { text: "Anybody who's not using statistics is going to get left behind.", author: "Moneyball" },
  { text: "The first thing I learned was that there's an answer in the data if you know how to look for it.", author: "Moneyball" },
  { text: "The inability to envision a certain kind of person doing a certain kind of thing is the problem.", author: "Michael Lewis, Moneyball" },

  // Warby Parker founders (Neil Blumenthal & Dave Gilboa)
  { text: "Every problem is an opportunity in disguise.", author: "Neil Blumenthal, Warby Parker" },
  { text: "Build something that's genuinely good for people, and the business will follow.", author: "Neil Blumenthal, Warby Parker" },
  { text: "We asked: why does this have to cost so much? The answer was: it doesn't.", author: "Dave Gilboa, Warby Parker" },
  { text: "Constraints force creativity. We didn't have money, so we had to think differently.", author: "Dave Gilboa, Warby Parker" },
  { text: "Don't accept the status quo just because it's the status quo.", author: "Neil Blumenthal, Warby Parker" },
  { text: "A business can scale and still have a soul.", author: "Warby Parker" },

  // Dolly Parton
  { text: "If you want the rainbow, you gotta put up with the rain.", author: "Dolly Parton" },
  { text: "It costs a lot of money to look this cheap.", author: "Dolly Parton" },
  { text: "I'm not going to limit myself just because people won't accept the fact that I can do something else.", author: "Dolly Parton" },
  { text: "Find out who you are and do it on purpose.", author: "Dolly Parton" },
  { text: "The way I see it, if you want the rainbow, you gotta put up with the rain.", author: "Dolly Parton" },
  { text: "I'm a tough old bird. Debt doesn't scare me — it motivates me.", author: "Dolly Parton" },
  { text: "You'll never do a whole lot unless you're brave enough to try.", author: "Dolly Parton" },

  // Kacey Musgraves
  { text: "Follow your arrow wherever it points.", author: "Kacey Musgraves" },
  { text: "You can't be everyone's cup of tea. Some people prefer coffee.", author: "Kacey Musgraves" },
  { text: "Step off the beaten track. It doesn't have to be the fast lane.", author: "Kacey Musgraves" },
  { text: "Slow burn — the best things take the time they take.", author: "Kacey Musgraves" },
  { text: "I think a lot of life is figuring out which things matter and which things don't.", author: "Kacey Musgraves" },
  { text: "Rainbow — after all, it's been a long time coming.", author: "Kacey Musgraves" },
  { text: "Golden hour. That's what freedom feels like when you finally get there.", author: "Kacey Musgraves" },
  { text: "Same trailer, different park. Your zip code doesn't define your worth.", author: "Kacey Musgraves" },
  { text: "There's a light that shines in the darkness. Find it.", author: "Kacey Musgraves" },

  // Tracy Chapman
  { text: "All that you have is your soul.", author: "Tracy Chapman" },
  { text: "I had a feeling I could be someone. Be someone.", author: "Tracy Chapman" },
  { text: "Don't you know, talking about a revolution — it sounds like a whisper at first.", author: "Tracy Chapman" },
  { text: "Fast car — sometimes you just need a way out, and that's okay. Then you build your way back.", author: "Tracy Chapman" },
  { text: "We've got to make a decision — leave tonight or live and die this way.", author: "Tracy Chapman" },
  { text: "Why do the babies starve when there's enough food to feed the world? Ask the same about wealth.", author: "Tracy Chapman" },

  // Radiohead
  { text: "Everything in its right place.", author: "Radiohead" },
  { text: "You do it to yourself — and that's what really hurts.", author: "Radiohead" },
  { text: "Just because you feel it doesn't mean it's there — unless it's on the balance sheet.", author: "Radiohead" },

  // Athletes through adversity
  { text: "I've missed more than 9,000 shots. I've lost almost 300 games. I've failed over and over. That is why I succeed.", author: "Michael Jordan" },
  { text: "You have to expect things of yourself before you can do them.", author: "Michael Jordan" },
  { text: "Hard days are the best because that's when champions are made.", author: "Gabby Douglas" },
  { text: "I didn't come this far to only come this far.", author: "Serena Williams" },
  { text: "Every time you stay out late, every time you sleep in, every time you miss a workout — I know something you don't.", author: "Lance Armstrong (on adversity)" },
  { text: "You can't put a limit on anything. The more you dream, the farther you get.", author: "Michael Phelps" },
  { text: "Somewhere behind the athlete you've become, the hours of practice, and the coaches who pushed you — is a little kid who fell in love with the game.", author: "Mia Hamm" },
  { text: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
  { text: "The only way to prove you're a good sport is to lose.", author: "Ernie Banks" },
  { text: "It's not whether you get knocked down — it's whether you get up.", author: "Vince Lombardi" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { text: "Pressure is a privilege — it only comes to those who earn it.", author: "Billie Jean King" },
  { text: "Do you know what my favorite part of the game is? The opportunity to play.", author: "Mike Singletary" },
  { text: "Adversity causes some men to break; others to break records.", author: "William Arthur Ward" },
  { text: "I hated every minute of training. But I said, don't quit. Suffer now and live the rest of your life as a champion.", author: "Muhammad Ali" },
  { text: "Float like a butterfly, sting like a bee — hit your debt with the same precision.", author: "Muhammad Ali (adapted)" },
  { text: "If my mind can conceive it and my heart can believe it, then I can achieve it.", author: "Muhammad Ali" },
  { text: "I work hard every single day. Not some days. Every single day.", author: "Wayde van Niekerk" },
  { text: "Doubt me, watch me work.", author: "Coco Gauff" },
  { text: "Every loss teaches you something a win never could.", author: "Coco Gauff" },

  // Tulsa Art Deco
  { text: "Tulsa built skyscrapers in the middle of the prairie and called it civilization. Build your future the same way.", author: "Tulsa, Oklahoma" },
  { text: "The Boston Avenue Methodist Church doesn't ask permission to be magnificent. Neither should you.", author: "Tulsa Art Deco" },
  { text: "The Philtower was built during the oil boom — proof that vision outlasts the boom itself.", author: "Tulsa, Oklahoma" },
  { text: "Art Deco said: geometry is beauty, and repetition is rhythm. Apply that to your payment plan.", author: "Tulsa Art Deco" },
  { text: "Greenwood rebuilt from ash and became Black Wall Street again — not by waiting, but by working.", author: "Greenwood District, Tulsa" },
  { text: "The oil derricks are gone. The architecture remains. Build things that last.", author: "Tulsa, Oklahoma" },
  { text: "Sunburst patterns in terrazzo floors — every detail in an Art Deco building was intentional. Be intentional.", author: "Tulsa Art Deco" },
  { text: "Oklahoma has always been about starting over on hard ground. That's not a weakness. That's a skill.", author: "Tulsa, Oklahoma" },
  { text: "The prairies teach patience. The red earth teaches roots. Tulsa teaches both.", author: "Tulsa, Oklahoma" },
  { text: "We didn't ask to be in the middle. We built monuments anyway.", author: "Tulsa (cultural)" },
  { text: "Cain's Ballroom was built to last. So was the people who danced there. So can your financial future.", author: "Cain's Ballroom, Tulsa" },
  { text: "The Brady Theater still stands. The music is still there if you listen.", author: "Tulsa (cultural)" },
  { text: "Woody Guthrie knew: this land is your land, but first you have to own yourself.", author: "Woody Guthrie, Tulsa (adapted)" },
  { text: "The Gilcrease Museum holds the story. The story is: we persisted.", author: "Tulsa (cultural)" },

  // Caddo Nation — words, phrases, and adapted wisdom
  { text: "Nah nah kah-ha — All things come back to where they began.", author: "Caddo Nation (traditional)" },
  { text: "A bird does not ask permission to migrate home. Neither should you.", author: "Caddo Nation (traditional)" },
  { text: "What you carry, carry lightly. What you owe, settle honestly.", author: "Caddo Nation (traditional)" },
  { text: "Haa'ish — it is well. And it will be well again.", author: "Caddo Nation" },
  { text: "Kuhti' — stand up. You are not done yet.", author: "Caddo Nation (traditional)" },
  { text: "Nah wi' — we are together. No debt is carried alone.", author: "Caddo Nation (traditional)" },
  { text: "Sáa'ni — be strong. The river bends but does not break.", author: "Caddo Nation (traditional)" },
  { text: "Hayhu — hello, future self. I have been working for you.", author: "Caddo Nation (adapted)" },
  { text: "Dáhsini — keep going forward. The trail is still there.", author: "Caddo Nation (traditional)" },
  { text: "The Red River does not ask if it is tired. It moves.", author: "Caddo Nation (Caddo Homeland)" },
  { text: "Borrow nothing from tomorrow that you cannot repay with today's action.", author: "Caddo Nation (elder saying)" },
  { text: "The cedars at Binger have stood through drought and flood. So will you.", author: "Caddo Nation (Anadarko, Oklahoma)" },
  { text: "When you clear your debts, you clear the path for those who walk behind you.", author: "Caddo Nation (elder wisdom)" },
  { text: "The Caddos knew: a man with his own land is a man with his own story.", author: "Caddo Nation (historical)" },
  { text: "Haa nah — the people. Us. Together. Building.", author: "Caddo Nation (traditional)" },
  { text: "Listen to the water. It knows about patience and persistence.", author: "Caddo Nation (water wisdom)" },
  { text: "We are still here. We will still be here. Make decisions that prove it.", author: "Caddo Nation (resilience)" },

  // Greenwood District / Black Wall Street — Tulsa, Oklahoma
  { text: "Black Wall Street was not a miracle. It was what happens when a community decides to own its economy.", author: "Greenwood District, Tulsa" },
  { text: "They burned it down in 1921. By 1922 they were rebuilding. That is what economic resilience looks like.", author: "Greenwood District, Tulsa" },
  { text: "Ownership is the foundation of freedom. Greenwood knew this before it was fashionable.", author: "Greenwood District, Tulsa" },
  { text: "The people of Greenwood built banks, hospitals, law offices, and schools — not because it was easy, but because it was necessary.", author: "Greenwood District, Tulsa" },
  { text: "What Greenwood built in one generation tells us what is possible in one generation. Including yours.", author: "Greenwood District, Tulsa" },
  { text: "Destruction is loud. Rebuilding is quiet, daily, and deliberate. Like paying off a loan.", author: "Greenwood District, Tulsa" },
  { text: "Greenwood Avenue did not wait for permission to prosper. Neither should you.", author: "Greenwood District, Tulsa" },
  { text: "O.W. Gurley bought land on Greenwood Avenue with one intention: to sell only to Black families, so the wealth would stay in the community.", author: "O.W. Gurley, Greenwood founder" },
  { text: "The Stradford Hotel stood six stories tall and employed Black workers exclusively. Build something that tall with your own hands.", author: "J.B. Stradford, Greenwood District" },
  { text: "Mabel Little ran a beauty salon that became a community anchor on Greenwood Ave. Small business is not small.", author: "Mabel Little, Greenwood District" },
  { text: "After the massacre, residents filed for reparations, rebuilt anyway, and kept going. The audacity of that is the point.", author: "Greenwood District, Tulsa" },
  { text: "Dr. A.C. Jackson was described as the most able Negro surgeon in America — and Greenwood was his home. Excellence doesn't wait for a perfect environment.", author: "Dr. A.C. Jackson, Greenwood District" },
  { text: "The Dreamland Theatre on Greenwood Ave screened films for the community when the rest of Tulsa wouldn't. Build your own stage.", author: "Greenwood District, Tulsa" },
  { text: "Greenwood was a closed economic loop: the dollar circulated within the community 36 times before leaving. Stack your loops.", author: "Greenwood District, Tulsa" },
  { text: "They called it Black Wall Street because wealth concentrated there through intention, not accident.", author: "Greenwood District, Tulsa" },
  { text: "The lesson of 1921 isn't only tragedy — it's that they built it once, so you know it's buildable.", author: "Greenwood District, Tulsa" },

  // Charly Crockett
  { text: "I've been down so long, down don't bother me.", author: "Charly Crockett" },
  { text: "Ain't nobody gonna save you but yourself.", author: "Charly Crockett" },
  { text: "All I got is this song and the road I walk.", author: "Charly Crockett" },
  { text: "Trouble comes in waves. Learn to read the water.", author: "Charly Crockett" },
  { text: "I learned more from hard times than any classroom ever taught me.", author: "Charly Crockett" },
  { text: "The only thing between me and broke is the music. And I choose the music every time.", author: "Charly Crockett" },

  // Marfa, TX
  { text: "Marfa taught me: the most radical thing you can do is simplify.", author: "Marfa, TX" },
  { text: "In the high desert, everything unnecessary burns away. Only the essential remains.", author: "Marfa, TX" },
  { text: "Donald Judd moved to the middle of nowhere and built something eternal. So can you.", author: "Marfa, TX" },
  { text: "The Chinati Foundation exists because someone said: this matters, even if no one comes.", author: "Marfa, TX" },
  { text: "There's a kind of clarity that only comes from distance and silence. Seek it.", author: "Marfa, TX" },
  { text: "The Trans-Pecos doesn't negotiate. It just is. Be like that with your money.", author: "Marfa, TX" },

  // Mexico City
  { text: "Mexico City runs on creativity, chaos, and will. So can your finances.", author: "Ciudad de México" },
  { text: "Frida Kahlo painted through more pain than most people ever know. Keep going.", author: "Ciudad de México" },
  { text: "In Coyoacán, time moves differently. That's the energy — slow, intentional, rooted.", author: "Ciudad de México" },
  { text: "The mercado has everything you need. So does your budget — if you know how to look.", author: "Ciudad de México" },
  { text: "Mezcal is made from a plant that survives the harshest conditions. That's you.", author: "Oaxaca / México" },

  // Tokyo
  { text: "Tokyo: 14 million people moving with precision and purpose. You can manage a budget.", author: "Tokyo" },
  { text: "Wabi-sabi — the beauty of imperfect, impermanent, incomplete. Embrace where you are.", author: "Tokyo / Japanese aesthetics" },
  { text: "In Japan, a repaired thing is more beautiful for having been broken. Kintsugi.", author: "Tokyo / Kintsugi" },
  { text: "The Shinkansen doesn't rush — it simply never wastes a second. Be efficient, not frantic.", author: "Tokyo" },
  { text: "Konbini culture: everything you actually need, nothing you don't. Design your budget like that.", author: "Tokyo" },
  { text: "Omotenashi — hospitality so deep it asks nothing in return. Give that to your future self.", author: "Tokyo" },

  // Hot Springs / Natural thermal pools
  { text: "The springs have been here longer than the debt. Go find them when you need perspective.", author: "Hot Springs, AR" },
  { text: "Water doesn't fight the rock. It finds the path and keeps moving.", author: "Natural Hot Springs" },
  { text: "There is healing that happens when you stop planning and just soak.", author: "Natural Hot Springs" },
  { text: "Geothermal — slow heat, deep source. Sustainable. Like good financial habits.", author: "Natural Hot Springs" },

  // Debt & freedom classics
  { text: "The chains of debt are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "A man in debt is so far a slave.", author: "Ralph Waldo Emerson" },
  { text: "Debt is the worst poverty.", author: "Thomas Fuller" },
  { text: "Every time you borrow money, you're robbing your future self.", author: "Nathan W. Morris" },
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
  { text: "My wealth has come from a combination of living in America, some lucky genes, and compound interest.", author: "Warren Buffett" },
  { text: "The best thing you can do is let your money work for you — or against you. Choose which.", author: "Compound Interest Wisdom" },
  { text: "Compound interest doesn't care if you believe in it. It works anyway.", author: "Financial Reality" },
  { text: "Start early. The first dollar you invest has more time to compound than the thousandth.", author: "Compound Growth Principle" },
  { text: "Debt compounds against you. Wealth compounds for you. Which will you choose to build?", author: "Financial Choice (adapted)" },
  { text: "Small percentages over long time create big numbers. This is not opinion — it's mathematics.", author: "Compound Math" },
  { text: "A 1% annual return over 30 years is 35% cumulative. A 5% return is 338%. Time is the secret ingredient.", author: "Exponential Growth" },
  { text: "You don't need to be a genius to understand compound interest. You just need to understand it.", author: "Practical Wisdom" },
  { text: "Every day you don't pay off debt, the debt is paying off you — via compound interest.", author: "Debt Reality" },
  { text: "Compound interest is time travel for your money. The sooner you start, the further it goes.", author: "Time Value of Money" },
  { text: "The rich get richer because they understand this one concept. The poor stay poor because they don't.", author: "Wealth Gap Reality" },
  { text: "Compound interest on debt is like gravity — it pulls you down relentlessly unless you fight it.", author: "Debt Metaphor" },
  { text: "Your interest rate is your growth rate. Negative growth (debt) still grows — just toward you.", author: "Interest Mathematics" },
  { text: "Thirty years of compound growth beats thirty days of luck.", author: "Long-term vs. Short-term" },
  { text: "If you understand exponents, you understand why compound interest is unavoidable wealth.", author: "Mathematical Truth" },
  { text: "The math of compound interest is patient. It works whether you're patient or not.", author: "Exponential Patience" },
  { text: "Doubling every ten years means you're rich in thirty. This isn't motivation — it's inevitability.", author: "Rule of 72 (adapted)" },
  { text: "Interest compounds in your favor or against you. The direction depends on you.", author: "Choice and Consequence" },
  { text: "Compound interest is the difference between retiring at 40 and retiring at 70. Choose wisely.", author: "Life Trajectory" },
  { text: "Every month you carry a balance is a month the interest compounds. Every month you pay it off is a month you reclaim.", author: "Monthly Choice" },
  { text: "Compound interest doesn't judge. It multiplies whatever you give it — wealth or debt.", author: "Impartial Mathematics" },
  { text: "The earliest investor wins, not the smartest. Time beats intellect in the compounding game.", author: "Early Bird Advantage" },
  { text: "Your debt balance is a living thing. Unless you feed it to zero, it grows on its own.", author: "Debt Organism Metaphor" },
  { text: "Compound interest on savings is your friend. Compound interest on debt is your enemy. Be intentional about which you cultivate.", author: "Intentional Compounding" },

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
  { text: "A 1% improvement every day leads to being 37 times better by year's end.", author: "James Clear" },
  { text: "The first mistake is never the one that ruins you. It's the spiral of repeated mistakes that follows.", author: "James Clear" },
  { text: "Make it obvious. Make it attractive. Make it easy. Make it satisfying.", author: "James Clear" },
  { text: "You don't have to be the victim of your environment. You can also be the architect of it.", author: "James Clear" },

  // Systems Thinking
  { text: "A system is never the sum of its parts. It is the product of their interactions.", author: "Russell Ackoff" },
  { text: "Every system is perfectly designed to get the results it gets.", author: "W. Edwards Deming" },
  { text: "The behavior of a system cannot be known just by knowing the elements of which the system is made.", author: "Donella Meadows" },
  { text: "You can't change the game if you're trapped inside the rules of it.", author: "Donella Meadows" },
  { text: "Leverage points are places in a system where a small shift can produce big changes.", author: "Donella Meadows" },
  { text: "The greatest leverage is often found in the most counterintuitive places.", author: "Donella Meadows" },
  { text: "Problems cannot be solved with the same level of thinking that created them.", author: "Albert Einstein" },
  { text: "Don't push growth — remove the factors limiting growth.", author: "Peter Senge" },
  { text: "Today's problems come from yesterday's solutions.", author: "Peter Senge" },
  { text: "The system will push back. Learn to read the feedback, not fight it.", author: "Peter Senge" },

  // Marsha Linehan (DBT)
  { text: "You can't go back and change the beginning, but you can start where you are and change the ending.", author: "C.S. Lewis" },
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
  { text: "The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.", author: "Helen Keller" },
  { text: "We must trust our own thinking, trust our own strength.", author: "Wilma Mankiller, Cherokee Nation Chief" },
  { text: "In every crisis there is an opportunity.", author: "Wilma Mankiller, Cherokee Nation Chief" },
  { text: "I've always been a systems thinker. Look at the structure, not just the problem.", author: "Brad Henry, Oklahoma Governor" },
  { text: "Music is the shorthand of emotion.", author: "Leo Tolstoy" },

  // SGI / Daisaku Ikeda
  { text: "A great human revolution in just a single individual will help achieve a change in the destiny of a nation.", author: "Daisaku Ikeda" },
  { text: "Hardships strengthen us. Every challenge we overcome is a step toward a life of greater value.", author: "Daisaku Ikeda" },
  { text: "It is not the environment that shapes us, but the spirit with which we confront it.", author: "Daisaku Ikeda" },
  { text: "The greatest revolution in life is to transform suffering into strength and joy.", author: "Daisaku Ikeda" },

  // Specific Indigenous leaders & known sources (not generic "Native American wisdom")
  { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Lakota Nation" },
  { text: "They tried to bury us. They didn't know we were seeds.", author: "Dennis Banks, AIM co-founder" },
  { text: "If you talk to the animals they will talk with you and you will know each other.", author: "Chief Dan George, Tsleil-Waututh Nation" },
  { text: "We are all related. The debt you carry affects everyone. Clear it for all.", author: "Mitakuye Oyasin (We Are All Related)" },

  // Indian business leaders
  { text: "I don't believe in taking right decisions. I take decisions and then make them right.", author: "Ratan Tata" },
  { text: "The world is full of magic things, patiently waiting for our senses to grow sharper.", author: "W.B. Yeats" },
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
  { text: "Character is doing the right thing when nobody's looking.", author: "J.C. Watts" },

  // Daria (MTV)
  { text: "I don't have low self-esteem. I have low esteem for everyone else.", author: "Daria Morgendorffer" },
  { text: "My goal is not to wake up at 40 with the bitter realization that I've wasted my life in a job I hate.", author: "Daria Morgendorffer" },
  { text: "It's not that I'm antisocial. I just have nothing to say to people who have nothing to say.", author: "Daria Morgendorffer" },
  { text: "I say if you're going to do something, be honest about it.", author: "Daria Morgendorffer" },
  { text: "I like having low expectations. It's the only way I'm ever pleasantly surprised.", author: "Daria Morgendorffer" },
  { text: "Is it lonely being the only sane person in the room? Probably. But it beats the alternative.", author: "Daria Morgendorffer" },
  { text: "The only thing worse than being talked about is not being talked about. Unless they're discussing your debt.", author: "Jane Lane, Daria" },
  { text: "It's a crazy world. You either laugh or you owe someone money.", author: "Jane Lane, Daria" },
  { text: "I'm not a misanthrope. I just have a finely tuned sense of who deserves my time.", author: "Daria Morgendorffer" },
  { text: "Self-esteem is for people who haven't done the math.", author: "Daria Morgendorffer" },
  { text: "The key to being a well-adjusted adult is to pay your debts and have no illusions.", author: "Daria Morgendorffer" },
  { text: "Why join the rat race when you can observe it from a safe, ironic distance?", author: "Daria Morgendorffer" },
  { text: "I've got art, I've got sarcasm, and I've got a plan. That's more than most people.", author: "Jane Lane, Daria" },
  { text: "Money is just society's way of keeping score in a game I didn't agree to play.", author: "Jane Lane, Daria" },
  { text: "Debt is just a polite word for someone else owning a piece of your future.", author: "Jane Lane, Daria" },
  { text: "If you want to feel better about your finances, just compare them to your emotional state.", author: "Jane Lane, Daria" },
  { text: "Fashion club rule #1: Never let them see you sweat. Financial rule #1: Same.", author: "Quinn Morgendorffer, Daria" },
  { text: "Looking good is a full-time job. So is compound interest, apparently.", author: "Quinn Morgendorffer, Daria" },
  { text: "I have a very strict rule: I never worry about anything I can accessorize my way out of.", author: "Quinn Morgendorffer, Daria" },
  { text: "I'd give you advice, but it would require me to care about the outcome.", author: "Mr. DeMartino, Daria" },
  { text: "Would someone — ANYONE — in this class like to explain why they are CHOOSING financial illiteracy?!", author: "Mr. DeMartino, Daria" },
  { text: "The CORRECT answer, Mr. O'Neill, is that you cannot borrow your way to freedom.", author: "Mr. DeMartino, Daria" },
  { text: "Money doesn't buy happiness. But it does buy the specific brand of misery you prefer.", author: "Tom Sloane, Daria" },
  { text: "Old money stays old because it doesn't do anything reckless. Like carry a balance.", author: "Tom Sloane, Daria" },
  { text: "The problem with the rat race is that even if you win, you're still a rat in debt.", author: "Mr. O'Neill, Daria" },
  { text: "Let's visualize a future where we all make our minimum payments on time. Feel that?", author: "Mr. O'Neill, Daria" },

  // Winona Ryder — real life & films
  { text: "I think too much. I think ahead. I think behind. I think sideways. I think it all. If it existed, I've thought of it.", author: "Winona Ryder" },
  { text: "I wasn't at my best, but I never stopped trying to fight my way back.", author: "Winona Ryder" },
  { text: "I still have a long way to go, but I'm already so far from where I used to be — and that's the point.", author: "Winona Ryder" },
  { text: "When you're young, you're not afraid of what comes next. You're excited by it.", author: "Winona Ryder" },
  { text: "I'm not really a part of any scene. I've always felt like an outsider.", author: "Winona Ryder" },
  // Beetlejuice
  { text: "I myself am strange and unusual.", author: "Lydia Deetz, Beetlejuice" },
  // Reality Bites
  { text: "I was really going to be something by the age of 23.", author: "Lelaina Pierce, Reality Bites" },
  // Girl, Interrupted
  { text: "Crazy isn't being broken or swallowing a dark secret. It's you or me, amplified.", author: "Susanna, Girl, Interrupted" },
  { text: "Have you ever confused a dream with life? Have you ever stolen something when you had the cash?", author: "Susanna, Girl, Interrupted" },
  { text: "I know what it's like to want to die. How it hurts to smile. How you try to fit in but you can't. But you'll never really know.", author: "Susanna, Girl, Interrupted" },
  // Little Women
  { text: "I want to do something splendid — something heroic or wonderful that won't be forgotten after I'm dead.", author: "Jo March, Little Women (Winona Ryder)" },
  { text: "I find it poor logic to say that because women are good, women should vote. Men do not vote because they are good; they vote because they are men, and women should vote, not because we are angels, but because we are human.", author: "Jo March, Little Women" },

  // Donald Judd
  { text: "Design has to work. Art does not.", author: "Donald Judd" },
  { text: "The whole idea of a corner of anything is that it is a limit — define it, then exceed it.", author: "Donald Judd" },
  { text: "Space is made by the artist or architect. It is not found or packaged.", author: "Donald Judd" },
  { text: "Everything exists in a specific space. Know where you are.", author: "Donald Judd" },
  { text: "A simple form can be thought of in the same way as a simple substance like salt or sugar.", author: "Donald Judd" },
  { text: "Actual space is intrinsically more powerful and specific than paint on a flat surface.", author: "Donald Judd" },
  { text: "The main thing is to make something specific. Any specific thing.", author: "Donald Judd" },
  { text: "If the thing is made, it is there. The specificity is unavoidable.", author: "Donald Judd" },
  { text: "Material, form, color, surface — all literal. All real. Not metaphor.", author: "Donald Judd" },

  // Moneyball — film & book (expanded)
  { text: "Adapt or die.", author: "Billy Beane, Moneyball" },
  { text: "Your goal shouldn't be to buy players. Your goal should be to buy wins. Figure out what winning is and buy that.", author: "Billy Beane, Moneyball" },
  { text: "The market for baseball players is an irrational one. So is the market for everything else.", author: "Michael Lewis, Moneyball" },
  { text: "People in both fields operate with beliefs and biases. To the extent you can eliminate both and replace with data, you gain a competitive advantage.", author: "Billy Beane, Moneyball" },
  { text: "You get on base, we win. You don't, we lose. The math of it is simple. Everything else is noise.", author: "Billy Beane, Moneyball" },
  { text: "There are rich teams and there are poor teams, and then there's fifty feet of crap, and then there's us. We work with what we've got.", author: "Billy Beane, Moneyball" },
  { text: "The problem we're trying to solve is that there are rich teams and poor teams. Some are winning unfairly. We have to find a way to win anyway.", author: "Peter Brand, Moneyball" },
  { text: "People who run ball clubs think in terms of buying players. Your mistake is doing the same thing.", author: "Peter Brand, Moneyball" },

  // 400m Track Stars
  { text: "The race is not always to the swift, but to those who keep on running.", author: "Michael Johnson" },
  { text: "You can't put a limit on anything. The more you dream, the farther you get.", author: "Michael Johnson" },
  { text: "I work hard every single day. Not some days. Every single day.", author: "Wayde van Niekerk" },
  { text: "Records are meant to be broken. That's why they exist.", author: "Wayde van Niekerk" },
  { text: "Pain is temporary. Quitting lasts forever.", author: "Sanya Richards-Ross" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Sanya Richards-Ross" },

  // Nobel Prize winners (diverse / interesting)
  { text: "If you want to learn something, read about it. If you want to understand something, write about it. If you want to master something, teach it.", author: "Yogi Bhajan (attributed)" },
  { text: "The more I study science, the more I believe in God — and in the system underneath it all.", author: "Albert Einstein" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Malala Yousafzai" },
  { text: "When the whole world is silent, even one voice becomes powerful.", author: "Malala Yousafzai" },
  { text: "The function of education is to teach one to think intensively and to think critically.", author: "Martin Luther King Jr." },
  { text: "One must always maintain one's connection to the past and yet ceaselessly pull away from it.", author: "Gaston Bachelard" },
  { text: "The good news is that the moment you decide that what you know is more important than what you have been taught to believe, you will have shifted gears.", author: "Buckminster Fuller" },
  { text: "You never change things by fighting the existing reality. Build a new model that makes the old one obsolete.", author: "Buckminster Fuller" },

  // Atul Gawande
  { text: "Better is possible. It does not require genius. It requires diligence, and a willingness to try.", author: "Atul Gawande" },
  { text: "We always hope for the easy fix: the one simple change that will erase a problem. But few things in life work this way.", author: "Atul Gawande" },
  { text: "The most dangerous thing in medicine is a doctor who is certain.", author: "Atul Gawande" },
  { text: "Good checklists are efficient. They're quick and easy to use and they save lives.", author: "Atul Gawande" },

  // Kacey Musgraves
  { text: "Follow your arrow wherever it points.", author: "Kacey Musgraves" },
  { text: "You can't be everyone's cup of tea. Some people prefer coffee.", author: "Kacey Musgraves" },
  { text: "Rainbow after the storm — there's always something on the other side.", author: "Kacey Musgraves" },
  { text: "Same trailer, different park. Your zip code doesn't define your worth.", author: "Kacey Musgraves" },

  // Sam Presti (OKC Thunder GM)
  { text: "Process over results. If the process is sound, the results will follow.", author: "Sam Presti" },
  { text: "We're not trying to win a press conference. We're trying to win a championship.", author: "Sam Presti" },
  { text: "Draft picks are currency. Protect them like assets.", author: "Sam Presti" },
  { text: "Patience is not passive. It's an active strategy.", author: "Sam Presti" },

  // Benjamin Hardy (Be Your Future Self Now)
  { text: "Your future self is your greatest asset. Invest in them daily.", author: "Benjamin Hardy" },
  { text: "The person you are today is not the person you have to be tomorrow.", author: "Benjamin Hardy" },
  { text: "Every dollar of debt is a vote against your future self.", author: "Benjamin Hardy" },
  { text: "Personality is not fixed. Neither is your financial situation.", author: "Benjamin Hardy" },
  { text: "You are always moving toward something. Make sure it's the life you actually want.", author: "Benjamin Hardy" },
  { text: "Commitment creates clarity. Decide who you're becoming and act accordingly.", author: "Benjamin Hardy" },
  { text: "Your environment shapes your behavior more than your willpower. Design it intentionally.", author: "Benjamin Hardy" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is today — especially with your debt.", author: "Benjamin Hardy" },

  // Cardi B
  { text: "I don't dance now, I make money moves.", author: "Cardi B" },
  { text: "Be careful. Everything you put out into the world comes back.", author: "Cardi B" },
  { text: "I worked hard. I hustled. I prayed. Nothing was handed to me.", author: "Cardi B" },
  { text: "They never thought I'd make it. Now they watch.", author: "Cardi B" },
  { text: "Success is the best revenge and compound interest is the best strategy.", author: "Cardi B" },
  { text: "I said what I said. My credit score agrees.", author: "Cardi B" },
  { text: "Know your worth. Then add interest.", author: "Cardi B" },

  // Future
  { text: "I turned my pain into progress.", author: "Future" },
  { text: "Leveling up is a lifestyle, not a moment.", author: "Future" },
  { text: "The grind doesn't stop. The debt shouldn't either — pay it.", author: "Future" },
  { text: "I came from nothing. Debt is just another nothing to overcome.", author: "Future" },
  { text: "Mask off. Face your numbers.", author: "Future" },
  { text: "Every move I make is intentional. Every payment should be too.", author: "Future" },

  // Clueless (1995)
  { text: "As if! You think debt just disappears? Cher would have a plan.", author: "Cher Horowitz, Clueless" },
  { text: "I gave that credit card a full makeover — starting with a zero balance.", author: "Cher Horowitz, Clueless" },
  { text: "You're a virgin who can't drive — and apparently can't read a loan statement.", author: "Murray, Clueless" },
  { text: "Do you prefer 'financial survivor' or 'debt-free'? I'm going with debt-free.", author: "Cher Horowitz, Clueless" },
  { text: "She's a Monet — looks fine from far away but up close it's a mess. Don't be a Monet budget.", author: "Cher Horowitz, Clueless" },
  { text: "You see how picky I am about my shoes and they only go on my feet. Be that picky about debt.", author: "Cher Horowitz, Clueless" },

  // Legally Blonde (2001)
  { text: "What, like it's hard? Paying off debt just takes a plan and a good conditioner routine.", author: "Elle Woods, Legally Blonde" },
  { text: "I once had to judge a Chanel suit from a Calvin Klein — trust me, I can read a balance sheet.", author: "Elle Woods, Legally Blonde" },
  { text: "The bend and snap works every time — so does compound interest, for or against you.", author: "Elle Woods, Legally Blonde" },
  { text: "The rules of hair care are simple and finite. So are the rules of debt payoff.", author: "Elle Woods, Legally Blonde" },

  // 90s / Gen-X culture
  { text: "Be excellent to each other — starting with your financial future.", author: "Bill & Ted's Excellent Adventure" },
  { text: "Grunge was about authenticity. So is knowing exactly how much you owe.", author: "90s Seattle (cultural)" },
  { text: "The 90s taught us: alternative is not a genre, it's a posture. Debt freedom is your alternative.", author: "90s Gen X (cultural)" },

  // Skating Polly — Stop Digging
  { text: "Stop digging yourself deeper. The only way is up and out.", author: "Skating Polly, Stop Digging" },
  { text: "It's not about where you started. It's about refusing to stay.", author: "Skating Polly" },

  // JD Samson (Le Tigre / MEN)
  { text: "We built community out of nothing. You can build a debt-free life out of a plan.", author: "JD Samson" },
  { text: "Art and survival look the same when you're broke. Keep making moves.", author: "JD Samson" },

  // Bratmobile
  { text: "We were angry and broke. Now we're just strategic.", author: "Bratmobile (cultural)" },

  // Megan Thee Stallion
  { text: "Protect your peace. Pay off your debt. Both require discipline.", author: "Megan Thee Stallion" },

  // Japanese baseball players (notable)
  { text: "Preparation is everything. I prepare for every at-bat the way you should prepare for every payment.", author: "Shohei Ohtani" },
  { text: "Don't think about what you can't do. Think about what you can do right now.", author: "Ichiro Suzuki" },
  { text: "Even if you fail seven times, stand up eight.", author: "Ichiro Suzuki (Japanese proverb, practiced)" },
  { text: "Hard work and preparation — that is the only path I know.", author: "Hideki Matsui" },
  { text: "Baseball taught me: you will fail. What matters is whether you show up the next day.", author: "Yu Darvish" },

  // OKC Thunder players
  { text: "I don't care about the doubt. I care about the work.", author: "Shai Gilgeous-Alexander, OKC Thunder" },
  { text: "Be yourself. Be consistent. The results will come.", author: "Shai Gilgeous-Alexander, OKC Thunder" },
  { text: "We're building something. Every win adds up. So does every dollar.", author: "Mark Daigneault, OKC Thunder Coach" },
  { text: "Championship culture starts with discipline in the small moments.", author: "Mark Daigneault, OKC Thunder Coach" },

  // Mitt Romney
  { text: "I've been in business long enough to know: cash flow is everything.", author: "Mitt Romney" },

  // Bernie Sanders
  { text: "The middle class built this country. Debt shouldn't be the reward.", author: "Bernie Sanders" },
  { text: "Working families should not spend their lives in debt to the wealthy few.", author: "Bernie Sanders" },

  // Stephen King — On Writing
  { text: "Writing is telepathy. Two minds meeting across space and time without speaking aloud.", author: "Stephen King, On Writing" },
  { text: "You've got a table covered with red cloth. On it, a cage with a white rabbit marked with the number 8. We're close. We're having a meeting of minds.", author: "Stephen King, On Writing (The Room)" },

  // Remove this section — generic "Indigenous elder" and "Native American wisdom" without specific attribution

  // Debt collections history — looking back
  { text: "The ancient Code of Hammurabi set a maximum debt term of three years. Even 1754 BCE knew: debt cannot be forever.", author: "Code of Hammurabi, 1754 BCE" },
  { text: "The Jubilee year in Leviticus — every 50 years, all debts cancelled. The system once imagined a reset.", author: "Leviticus 25 (historical)" },
  { text: "Indigenous land was 'purchased' for debt and trinkets. The history of debt is a history of power.", author: "American colonial debt history" },
  { text: "Sharecroppers were trapped in debt to landowners who set the prices. Know who holds the ledger.", author: "Post-Civil War sharecropping history" },
  { text: "The company store kept miners in permanent debt. Your lender is not your landlord. You have choices they didn't.", author: "Company store history, 1800s" },
  { text: "Greenwood was burned because Black wealth threatened the debt economy that white supremacy depended on.", author: "Tulsa Race Massacre, 1921 (historical)" },
  { text: "Redlining wasn't just about neighborhoods. It was about who got to build credit and who was locked out.", author: "Federal Housing Administration, 1930s-1960s history" },
  { text: "The GI Bill gave returning soldiers loans and education — but not Black veterans. The gap was designed.", author: "GI Bill inequity, 1944 (historical)" },
  { text: "Credit scoring wasn't standardized until 1989. FICO is younger than most adults in debt right now.", author: "FICO history, 1989" },
  { text: "Payday lending was made legal state by state in the 1990s. 400% APR was a legislative choice, not a law of nature.", author: "Payday loan deregulation, 1990s history" },

  // Silent Bob / Clerks / Kevin Smith universe
  { text: "...", author: "Silent Bob (he nods in agreement with your payoff plan)" },

  // Good Will Hunting (Matt Damon / Ben Affleck)
  { text: "You wasted $150,000 on an education you coulda got for $1.50 in late fees at the public library.", author: "Will Hunting, Good Will Hunting" },

  // Reality Bites (1994)
  { text: "We graduate. We owe. We work. But we don't stop.", author: "Reality Bites (cultural)" },

  // Lowrider culture / Chicano culture
  { text: "A lowrider is a work of art. So is a life lived debt-free on your own terms.", author: "Lowrider culture (East LA)" },
  { text: "We take what we have and make it beautiful. The car, the neighborhood, the future.", author: "Lowrider culture (East LA)" },
  { text: "Brown Pride means building wealth for our community, dollar by dollar.", author: "Chicano financial resilience (cultural)" },
  { text: "Slow ride, steady progress. The lowrider philosophy applies to debt payoff.", author: "Lowrider culture (cultural)" },
  { text: "The impala doesn't apologize. Neither should your financial ambition.", author: "Lowrider culture (cultural)" },

  // Megan Thee Stallion — more
  { text: "I went from sleeping on the floor to buying the building. Document the journey.", author: "Megan Thee Stallion" },
  { text: "I put my degrees on the wall because I earned them — not because someone handed them.", author: "Megan Thee Stallion" },
  { text: "I am my own brand, my own business, my own boss. You can be too.", author: "Megan Thee Stallion" },

  // Dolly Parton
  { text: "It costs a lot of money to look this cheap. Manage accordingly.", author: "Dolly Parton" },
  { text: "The way I see it, if you want the rainbow, you gotta put up with the rain — and the interest payments.", author: "Dolly Parton" },
  { text: "I'm a businesswoman. I just look like a showgirl. Know your numbers either way.", author: "Dolly Parton" },

  // Kim Gordon (Sonic Youth / solo)
  { text: "I'm not afraid of being a girl in a band, a business, or a balance sheet.", author: "Kim Gordon" },
  { text: "I've been making things on my own terms for decades. That's the only way I know.", author: "Kim Gordon" },

  // Black business owners — notable and historical
  { text: "I was the first Black self-made female millionaire in America. I built it with a comb and sheer will.", author: "Madam C.J. Walker" },
  { text: "Don't sit down and wait for the opportunities to come. Get up and make them.", author: "Madam C.J. Walker" },
  { text: "I got my start by giving myself a start.", author: "Madam C.J. Walker" },
  { text: "Build your business on the foundation of service and substance. The rest follows.", author: "Robert F. Smith, Vista Equity Partners" },
  { text: "Greenwood proved: when Black people control their dollars, they multiply.", author: "Greenwood District legacy" },
  { text: "The gap is not talent. The gap is access to capital. Close it yourself if you have to.", author: "Daymond John, FUBU" },
  { text: "Power is not given. It is taken — one strategic move at a time.", author: "Daymond John" },
  { text: "The big secret in life is that there is no big secret. Whatever your goal, you can get there if you're willing to work.", author: "Oprah Winfrey" },
  { text: "I had to make my own living and my own opportunity. But I made it.", author: "Madam C.J. Walker" },

  // Mathematicians & scientists with diverse abilities
  { text: "A mathematician, like a painter or poet, is a maker of patterns.", author: "G.H. Hardy" },
  { text: "Do not worry about your difficulties in mathematics. I can assure you mine are still greater.", author: "Albert Einstein" },
  { text: "There is no royal road to geometry.", author: "Euclid" },
  { text: "In mathematics you don't understand things. You just get used to them.", author: "John von Neumann" },
  { text: "The essence of mathematics is its freedom.", author: "Georg Cantor" },
  { text: "Pure mathematics is, in its way, the poetry of logical ideas.", author: "Albert Einstein" },
  { text: "Mathematics is the language in which God has written the universe.", author: "Galileo Galilei" },

  // Gary
  { text: "Don't be a dumb ass.", author: "Gary" },

  // Clairo
  { text: "I want to make things that feel like home.", author: "Clairo" },
  { text: "Softness is not weakness. It's a choice.", author: "Clairo" },

  // Sam Presti & OKC Thunder
  { text: "You control what you control. Everything else is noise.", author: "Sam Presti" },
  { text: "The Thunder is built on draft picks and long-term vision, not shortcuts.", author: "Sam Presti" },

  // Tulsa, Greenwood, Black Wall Street
  { text: "Greenwood Avenue had the highest concentration of Black-owned businesses in America. They rebuilt it twice.", author: "Black Wall Street History" },
  { text: "What was burned down in 1921 was rebuilt. Debt is the same — you break free by breaking even.", author: "Tulsa Resilience" },
  { text: "The money you don't owe is the freedom they can't take from you.", author: "Greenwood Wisdom" },
  { text: "Generational wealth starts with zero debt. Generational freedom starts with refusing the trap.", author: "Black Economics" },

  // Cranberries
  { text: "Dolores taught us: pain is universal, but so is resilience.", author: "Dolores O'Riordan" },

  // Atlanta Black Business Owners & Leaders
  { text: "Magic City wasn't built on debt. It was built on vision, hustle, and knowing the room.", author: "Magic City (Atlanta legacy)" },
  { text: "Atlanta taught me: build what you own, not what owns you.", author: "Atlanta Business Wisdom" },
  { text: "The difference between surviving and thriving is ownership. Own your debt payoff.", author: "Atlanta Entrepreneur Ethos" },

  // Andre 3000 / Outkast
  { text: "I'm a synthesizer of ideas. Synthesize your financial data.", author: "Andre 3000" },
  { text: "The way I see it, everything is a system. Master yours.", author: "Andre 3000" },

  // Gemma Chan
  { text: "Precision is everything. Be precise with your money.", author: "Gemma Chan" },

  // Daria Characters
  { text: "Fashion club rule #1: Never let them see you sweat. Financial rule #1: Same.", author: "Quinn Morgendorffer, Daria" },
  { text: "Looking good is a full-time job. So is compound interest, apparently.", author: "Quinn Morgendorffer, Daria" },
  { text: "I have a very strict rule: I never worry about anything I can accessorize my way out of.", author: "Quinn Morgendorffer, Daria" },
  { text: "I'd give you advice, but it would require me to care about the outcome.", author: "Mr. DeMartino, Daria" },
  { text: "Would someone — ANYONE — in this class like to explain why they are CHOOSING financial illiteracy?!", author: "Mr. DeMartino, Daria" },
  { text: "The CORRECT answer, Mr. O'Neill, is that you cannot borrow your way to freedom.", author: "Mr. DeMartino, Daria" },
  { text: "Money doesn't buy happiness. But it does buy the specific brand of misery you prefer.", author: "Tom Sloane, Daria" },
  { text: "Old money stays old because it doesn't do anything reckless. Like carry a balance.", author: "Tom Sloane, Daria" },
  { text: "The problem with the rat race is that even if you win, you're still a rat in debt.", author: "Mr. O'Neill, Daria" },
  { text: "Let's visualize a future where we all make our minimum payments on time. Feel that?", author: "Mr. O'Neill, Daria" },

  // Famous Data Scientists
  { text: "In God we trust. Everyone else must bring data.", author: "William Edwards Deming" },
  { text: "The plural of anecdote is not data — and your gut feeling is definitely not a financial plan.", author: "Roger Branigin (attributed)" },
  { text: "All models are wrong, but some are useful. Your balance sheet is a model. Make it useful.", author: "George E. P. Box" },
  { text: "Data-driven decisions beat emotional ones 10 times out of 10. Look at your numbers.", author: "Data Science Principle" },
  { text: "The best time to start analyzing your finances is now. The second best is before you got here.", author: "Data Science Wisdom" },
  { text: "Correlation is not causation, but compound interest is predictable. Trust the math.", author: "Data Analyst (adapted)" },
  { text: "Your data tells a story. Make sure yours is about freedom, not slavery.", author: "Data Science Philosophy" },
  { text: "Bias in data leads to bad outcomes. Bias in your budget does too. Check both.", author: "Data Science Ethics (adapted)" },
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

export function estimatePayoffDate(loan, extraBudget = 0, strategy = 'momentum') {
  if (loan.current_balance <= 0) {
    return { date: new Date(), months: 0, isPaid: true };
  }

  let balance = loan.current_balance;
  let month = 0;
  const now = new Date();

  while (balance > 0.01 && month < 600) {
    month++;
    const interest = (balance * (loan.interest_rate / 100)) / 12;
    const payment = Math.min(loan.minimum_payment + extraBudget, balance + interest);
    balance = balance + interest - payment;
  }

  const payoffDate = new Date(now.getFullYear(), now.getMonth() + month, 1);
  return { date: payoffDate, months: month, isPaid: false };
}