import { QUOTES } from './loanCalculations';

const CUSTOM_QUOTES_KEY = 'chainforge_custom_quotes';
const DISABLED_QUOTES_KEY = 'chainforge_disabled_quotes';

export function getCustomQuotes() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_QUOTES_KEY)) || [];
  } catch { return []; }
}

export function saveCustomQuotes(quotes) {
  localStorage.setItem(CUSTOM_QUOTES_KEY, JSON.stringify(quotes));
}

export function getDisabledQuoteIndices() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISABLED_QUOTES_KEY)) || []);
  } catch { return new Set(); }
}

export function saveDisabledQuoteIndices(set) {
  localStorage.setItem(DISABLED_QUOTES_KEY, JSON.stringify([...set]));
}

// Returns all active quotes (built-in + custom), shuffled
export function getAllActiveQuotes() {
  const disabled = getDisabledQuoteIndices();
  const builtIn = QUOTES.filter((_, i) => !disabled.has(i));
  const custom = getCustomQuotes();
  const all = [...builtIn, ...custom];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

// Groups for the manager UI
export const QUOTE_GROUPS = [
  { id: 'caddo', label: 'Caddo Nation', filter: q => q.author?.includes('Caddo') },
  { id: 'greenwood', label: 'Greenwood / Black Wall Street', filter: q => q.author?.includes('Greenwood') || q.author?.includes('O.W. Gurley') || q.author?.includes('Stradford') || q.author?.includes('Mabel Little') || q.author?.includes('A.C. Jackson') || q.author?.includes('Dreamland') },
  { id: 'tulsa', label: 'Tulsa Art Deco', filter: q => (q.author?.includes('Tulsa') || q.author?.includes('Oklahoma') || q.author?.includes('Art Deco')) && !q.author?.includes('Greenwood') },
  { id: 'charly', label: 'Charly Crockett', filter: q => q.author?.includes('Crockett') },
  { id: 'marfa', label: 'Marfa / West Texas', filter: q => q.author?.includes('Marfa') || q.author?.includes('Trans-Pecos') },
  { id: 'mexico', label: 'Mexico City / Oaxaca', filter: q => q.author?.includes('México') || q.author?.includes('Mexico') || q.author?.includes('Oaxaca') },
  { id: 'tokyo', label: 'Tokyo / Japan', filter: q => q.author?.includes('Tokyo') || q.author?.includes('Japan') || q.author?.includes('Kintsugi') },
  { id: 'daria', label: 'Daria', filter: q => q.author?.includes('Daria') || q.author?.includes('Jane Lane') || q.author?.includes('Quinn') || q.author?.includes("DeMartino") || q.author?.includes("O'Neill") || q.author?.includes('Tom Sloane') },
  { id: 'clueless', label: 'Clueless', filter: q => q.author?.includes('Clueless') || q.author?.includes('Cher Horowitz') || q.author?.includes('Murray,') },
  { id: 'legally_blonde', label: 'Legally Blonde', filter: q => q.author?.includes('Legally Blonde') || q.author?.includes('Elle Woods') },
  { id: '90s', label: '90s / Gen-X Pop Culture', filter: q => q.author?.includes('Bill & Ted') || q.author?.includes('Matrix') || q.author?.includes('Toy Story') || q.author?.includes('Lion King') || q.author?.includes('Forrest Gump') || q.author?.includes('Jerry Maguire') || q.author?.includes('Terminator') || q.author?.includes('Titanic') || q.author?.includes('Spider-Man') || q.author?.includes('90s') || q.author?.includes('Sleepless') || q.author?.includes('You\'ve Got Mail') || q.author?.includes('Nike') || q.author?.includes('Seattle (cultural)') || q.author?.includes('Gen X') },
  { id: 'skating_polly', label: 'Skating Polly / Riot Grrrl', filter: q => q.author?.includes('Skating Polly') || q.author?.includes('Bratmobile') || q.author?.includes('JD Samson') || q.author?.includes('Le Tigre') },
  { id: 'megan', label: 'Megan Thee Stallion', filter: q => q.author?.includes('Megan Thee Stallion') },
  { id: 'indie_rock', label: 'Indie / Alt Rock (Sonic Youth, Pavement, Built to Spill)', filter: q => q.author?.includes('Sonic Youth') || q.author?.includes('Pavement') || q.author?.includes('Built to Spill') },
  { id: 'japanese_baseball', label: 'Japanese Baseball', filter: q => q.author?.includes('Shohei Ohtani') || q.author?.includes('Ichiro Suzuki') || q.author?.includes('Hideki Matsui') || q.author?.includes('Yu Darvish') },
  { id: 'rickey_sobers', label: 'Rickey Sobers (NBA)', filter: q => q.author?.includes('Rickey Sobers') },
  { id: 'okc_thunder', label: 'OKC Thunder', filter: q => q.author?.includes('OKC Thunder') || q.author?.includes('Daigneault') || q.author?.includes('Shai') || q.author?.includes('Chet Holmgren') || q.author?.includes('Luguentz') || q.author?.includes('Jalen Williams') },
  { id: 'politicians', label: 'Bernie, Romney & Hasan Piker', filter: q => q.author?.includes('Bernie Sanders') || q.author?.includes('Mitt Romney') || q.author?.includes('Hasan Piker') },
  { id: 'indigenous', label: 'Indigenous / Native American', filter: q => q.author?.includes('Indigenous') || q.author?.includes('Native American') || q.author?.includes('Haudenosaunee') },
  { id: 'debt_history', label: 'Debt History', filter: q => q.author?.includes('Hammurabi') || q.author?.includes('Leviticus') || q.author?.includes('sharecropping') || q.author?.includes('Redlining') || q.author?.includes('GI Bill') || q.author?.includes('FICO') || q.author?.includes('debtor') || q.author?.includes('Payday loan') || q.author?.includes('colonial debt') || q.author?.includes('Race Massacre') || q.author?.includes('company store') },
  { id: 'kevin_smith', label: 'Silent Bob / Kevin Smith Universe', filter: q => q.author?.includes('Silent Bob') || q.author?.includes('Dante Hicks') || q.author?.includes('Randal Graves') || q.author?.includes('Clerks') || q.author?.includes('Mallrats') || q.author?.includes('Chasing Amy') },
  { id: 'good_will_hunting', label: 'Good Will Hunting', filter: q => q.author?.includes('Good Will Hunting') || q.author?.includes('Will Hunting') },
  { id: 'foxfire', label: 'Foxfire (1996)', filter: q => q.author?.includes('Foxfire') || q.author?.includes('Legs,') },
  { id: 'reality_bites', label: 'Reality Bites', filter: q => q.author?.includes('Reality Bites') || q.author?.includes('Lelaina') || q.author?.includes('Troy Dyer') },
  { id: 'haunted_mansion', label: 'Haunted Mansion', filter: q => q.author?.includes('Haunted Mansion') || q.author?.includes('Ghost Host') || q.author?.includes('Madame Leota') },
  { id: 'lowrider', label: 'Lowrider / Chicano Culture', filter: q => q.author?.includes('Lowrider') || q.author?.includes('East LA') || q.author?.includes('Chicano') || q.author?.includes('George Barris') },
  { id: 'chuck_berry', label: 'Chuck Berry', filter: q => q.author?.includes('Chuck Berry') },
  { id: 'dolly', label: 'Dolly Parton', filter: q => q.author?.includes('Dolly Parton') },
  { id: 'miley', label: 'Miley Cyrus', filter: q => q.author?.includes('Miley Cyrus') },
  { id: 'cali', label: 'Cali Roots (Sublime, RHCP, Kendrick)', filter: q => q.author?.includes('Sublime') || q.author?.includes('Red Hot Chili Peppers') || q.author?.includes('Kendrick Lamar') },
  { id: 'kim_gordon', label: 'Kim Gordon', filter: q => q.author?.includes('Kim Gordon') },
  { id: 'all_over_me', label: 'All Over Me (1997)', filter: q => q.author?.includes('All Over Me') },
  { id: 'black_business', label: 'Black Business Builders', filter: q => q.author?.includes('Madam C.J. Walker') || q.author?.includes('Daymond John') || q.author?.includes('Robert F. Smith') || q.author?.includes('Bob Johnson') || q.author?.includes('Magic Johnson') || q.author?.includes('Greenwood District legacy') || q.author?.includes('Jay-Z') || q.author?.includes('Oprah Winfrey') },
  { id: 'winona', label: 'Winona Ryder', filter: q => q.author?.includes('Winona') || q.author?.includes('Lydia Deetz') || q.author?.includes('Lelaina') || q.author?.includes('Susanna') || q.author?.includes('Veronica, Heathers') || q.author?.includes('Jo March') || q.author?.includes('Edward Scissorhands') },
  { id: 'future', label: 'Future', filter: q => q.author === 'Future' },
  { id: 'music', label: 'Music (Radiohead, Pavement, etc.)', filter: q => ['Radiohead','Pavement','Built to Spill','Tracy Chapman','Kacey Musgraves','Dolly Parton','Charly Crockett','Cardi B','Grimes'].some(a => q.author?.includes(a)) },
  { id: 'gary', label: 'Gary', filter: q => q.author === 'Gary' },
  { id: 'finance', label: 'Finance & Systems Thinking', filter: q => ['Buffett','Graham','JL Collins','Ken Honda','James Clear','Donella','Peter Senge','Meadows','Ackoff','Deming','Benjamin Hardy'].some(a => q.author?.includes(a)) },
  { id: 'moneyball', label: 'Moneyball / Billy Beane', filter: q => q.author?.includes('Beane') || q.author?.includes('Moneyball') || q.author?.includes('Michael Lewis') },
  { id: 'gwh', label: 'Good Will Hunting', filter: q => q.author?.includes('Good Will Hunting') },
  { id: 'athletes', label: 'Athletes', filter: q => ['Jordan','Phelps','Ali','Gauff','Serena','Lombardi','Billie Jean','Mia Hamm','Wayde','Johnson','Richards','Shai','Niekerk'].some(a => q.author?.includes(a)) },
];