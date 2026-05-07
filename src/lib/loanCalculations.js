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
  { text: "You're not perfect, sport. And let me save you the suspense — neither is your balance sheet. But the question is whether you're perfect for the life you want.", author: "Good Will Hunting (adapted)" },
  { text: "It's not your fault.", author: "Good Will Hunting" },
  { text: "Most days I wish I never met you — the debt. Because then I could sleep at night.", author: "Good Will Hunting (adapted)" },
  { text: "Do you like apples? I paid off that card. How do you like them apples?", author: "Good Will Hunting (adapted)" },
  { text: "Real loss is only possible when you've loved something more than yourself. Love your future self more than this debt.", author: "Good Will Hunting (adapted)" },
  { text: "You'll have bad times, but it'll always wake you up to the good stuff you weren't paying attention to.", author: "Good Will Hunting" },
  { text: "Some people can't believe in themselves until someone else believes in them first.", author: "Good Will Hunting" },

  // Moneyball / Billy Beane / Michael Lewis
  { text: "Adapt or die.", author: "Billy Beane, Moneyball" },
  { text: "Your goal shouldn't be to buy players. Your goal should be to buy wins.", author: "Billy Beane, Moneyball" },
  { text: "The market for baseball players is an irrational one. So is the market for everything else.", author: "Michael Lewis, Moneyball" },
  { text: "People operate with beliefs and biases. To the extent you can eliminate both and replace with data, you gain a competitive advantage.", author: "Billy Beane, Moneyball" },
  { text: "Anybody who's not using statistics is going to get left behind.", author: "Moneyball" },
  { text: "The first thing I learned was that there's an answer in the data if you know how to look for it.", author: "Moneyball" },
  { text: "We're not selling jeans here. We're finding value where no one else is looking.", author: "Moneyball (adapted)" },
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

  // Tracy Chapman
  { text: "All that you have is your soul.", author: "Tracy Chapman" },
  { text: "I had a feeling I could be someone. Be someone.", author: "Tracy Chapman" },
  { text: "Don't you know, talking about a revolution — it sounds like a whisper at first.", author: "Tracy Chapman" },
  { text: "Fast car — sometimes you just need a way out, and that's okay. Then you build your way back.", author: "Tracy Chapman" },
  { text: "We've got to make a decision — leave tonight or live and die this way.", author: "Tracy Chapman" },
  { text: "Why do the babies starve when there's enough food to feed the world? Ask the same about wealth.", author: "Tracy Chapman" },
  { text: "The revolution starts with you changing your relationship to money.", author: "Tracy Chapman (adapted)" },

  // Radiohead
  { text: "Everything in its right place.", author: "Radiohead" },
  { text: "For a minute there, I lost myself. Then I found the spreadsheet.", author: "Radiohead (adapted)" },
  { text: "You do it to yourself — and that's what really hurts.", author: "Radiohead" },
  { text: "Fitter, happier, more productive — one payment at a time.", author: "Radiohead (adapted)" },
  { text: "Just because you feel it doesn't mean it's there — unless it's on the balance sheet.", author: "Radiohead" },
  { text: "No surprises, please. Know your numbers.", author: "Radiohead (adapted)" },
  { text: "How to disappear completely — that's what debt does to your future if you let it.", author: "Radiohead (adapted)" },
  { text: "I'm not living. I'm just killing time. Until the debt is gone.", author: "Radiohead (adapted)" },

  // Pavement
  { text: "Range life. Cut your costs, find your range, live in it.", author: "Pavement (adapted)" },
  { text: "Gold soundz — the sound of a zero balance.", author: "Pavement (adapted)" },
  { text: "Stop breathing, start living — once the debt stops breathing down your neck.", author: "Pavement (adapted)" },
  { text: "Crooked rain, crooked rain — even the mess has a pattern if you look.", author: "Pavement (adapted)" },
  { text: "Silence is golden but so is a paid-off loan.", author: "Pavement (adapted)" },
  { text: "Stereo — two channels: what you owe and what you own.", author: "Pavement (adapted)" },

  // Built to Spill
  { text: "You have to know where you've been to know where you're going.", author: "Built to Spill (adapted)" },
  { text: "Some things last a long time. Make sure your savings is one of them.", author: "Built to Spill (adapted)" },
  { text: "Carry the zero — don't let it carry you.", author: "Built to Spill (adapted)" },
  { text: "I want to see movies of my dreams — debt-free ones.", author: "Built to Spill (adapted)" },
  { text: "Whatever people say, the numbers don't lie.", author: "Built to Spill (adapted)" },
  { text: "Big dipper, little dipper — even stars navigate by fixed points. Find yours.", author: "Built to Spill (adapted)" },

  // They Might Be Giants
  { text: "Older — you're going to get older anyway. Make it count.", author: "They Might Be Giants" },
  { text: "Birdhouse in your soul — build something that outlasts the debt.", author: "They Might Be Giants" },
  { text: "Istanbul, not Constantinople — names change. So do your finances, if you work at it.", author: "They Might Be Giants (adapted)" },
  { text: "The sun is a mass of incandescent gas — and debt is a mass of accumulated choices. Choices change.", author: "They Might Be Giants (adapted)" },
  { text: "Flood — when the numbers rise, you rise with them.", author: "They Might Be Giants (adapted)" },
  { text: "Particle man, triangle man — which one are you? Be the one who does the math.", author: "They Might Be Giants (adapted)" },
  { text: "Ana Ng — somewhere out there, someone paid off their last loan today.", author: "They Might Be Giants (adapted)" },

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
  { text: "Greenwood District rebuilt from ash. If an entire community can do that, you can rebuild your finances.", author: "Tulsa, Oklahoma — Greenwood" },
  { text: "The oil derricks are gone. The architecture remains. Build things that last.", author: "Tulsa, Oklahoma" },
  { text: "Sunburst patterns in terrazzo floors — every detail in an Art Deco building was intentional. Be intentional.", author: "Tulsa Art Deco" },
  { text: "Oklahoma has always been about starting over on hard ground. That's not a weakness. That's a skill.", author: "Tulsa, Oklahoma" },

  // Caddo Nation — words, phrases, and adapted wisdom
  { text: "Nah nah kah-ha — All things come back to where they began.", author: "Caddo Nation (traditional)" },
  { text: "The land holds the memory. So does the ledger — know both.", author: "Caddo Nation (adapted)" },
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
  { text: "Wíčhoni — to live fully is to have no debt to your own spirit.", author: "Caddo Nation (adapted)" },
  { text: "When you clear your debts, you clear the path for those who walk behind you.", author: "Caddo Nation (elder wisdom)" },

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
  { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Lakota Nation" },
  { text: "They tried to bury us. They didn't know we were seeds.", author: "Dennis Banks, AIM co-founder" },
  { text: "When we show our respect for other living things, they respond with respect for us.", author: "Arapaho Nation" },
  { text: "A nation is not conquered until the hearts of its women are on the ground.", author: "Cheyenne Nation" },
  { text: "If you talk to the animals they will talk with you and you will know each other.", author: "Chief Dan George, Tsleil-Waututh Nation" },

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

  // Donald Judd
  { text: "Design has to work. Art does not.", author: "Donald Judd" },
  { text: "The whole idea of a corner of anything is that it is a limit — define it, then exceed it.", author: "Donald Judd" },
  { text: "Space is made by the artist or architect. It is not found or packaged.", author: "Donald Judd" },
  { text: "Everything exists in a specific space. Know where you are.", author: "Donald Judd" },

  // Moneyball / Billy Beane / Michael Lewis
  { text: "Adapt or die.", author: "Billy Beane, Moneyball" },
  { text: "Your goal shouldn't be to buy players. Your goal should be to buy wins.", author: "Billy Beane, Moneyball" },
  { text: "The market for baseball players is an irrational one. So is the market for everything else.", author: "Michael Lewis, Moneyball" },
  { text: "People in both fields operate with beliefs and biases. To the extent you can eliminate both and replace with data, you gain a competitive advantage.", author: "Billy Beane, Moneyball" },
  { text: "It's hard not to be romantic about baseball. It's hard not to be romantic about compound interest too.", author: "Moneyball (adapted)" },

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

  // Mathematicians & scientists with diverse abilities
  { text: "A mathematician, like a painter or poet, is a maker of patterns.", author: "G.H. Hardy" },
  { text: "Do not worry about your difficulties in mathematics. I can assure you mine are still greater.", author: "Albert Einstein" },
  { text: "There is no royal road to geometry.", author: "Euclid" },
  { text: "In mathematics you don't understand things. You just get used to them.", author: "John von Neumann" },
  { text: "The essence of mathematics is its freedom.", author: "Georg Cantor" },
  { text: "Pure mathematics is, in its way, the poetry of logical ideas.", author: "Albert Einstein" },
  { text: "Mathematics is the language in which God has written the universe.", author: "Galileo Galilei" },
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