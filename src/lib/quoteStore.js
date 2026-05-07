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
  { id: 'winona', label: 'Winona Ryder', filter: q => q.author?.includes('Winona') || q.author?.includes('Lydia Deetz') || q.author?.includes('Lelaina') || q.author?.includes('Susanna') || q.author?.includes('Veronica, Heathers') || q.author?.includes('Jo March') || q.author?.includes('Edward Scissorhands') },
  { id: 'future', label: 'Future', filter: q => q.author === 'Future' },
  { id: 'music', label: 'Music (Radiohead, Pavement, etc.)', filter: q => ['Radiohead','Pavement','Built to Spill','Tracy Chapman','Kacey Musgraves','Dolly Parton','Charly Crockett','Cardi B','Grimes'].some(a => q.author?.includes(a)) },
  { id: 'finance', label: 'Finance & Systems Thinking', filter: q => ['Buffett','Graham','JL Collins','Ken Honda','James Clear','Donella','Peter Senge','Meadows','Ackoff','Deming','Benjamin Hardy'].some(a => q.author?.includes(a)) },
  { id: 'moneyball', label: 'Moneyball / Billy Beane', filter: q => q.author?.includes('Beane') || q.author?.includes('Moneyball') || q.author?.includes('Michael Lewis') },
  { id: 'gwh', label: 'Good Will Hunting', filter: q => q.author?.includes('Good Will Hunting') },
  { id: 'athletes', label: 'Athletes', filter: q => ['Jordan','Phelps','Ali','Gauff','Serena','Lombardi','Billie Jean','Mia Hamm','Wayde','Johnson','Richards','Shai','Niekerk'].some(a => q.author?.includes(a)) },
];