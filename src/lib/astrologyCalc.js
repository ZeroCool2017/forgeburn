// Simple astrology calculations for Sun, Moon, Rising signs
// Based on ephemeris approximations and Placidus house calculations

export const ZODIAC_SIGNS = [
  { name: 'Aries', start: [3, 21], end: [4, 19], symbol: '♈', element: 'Fire', ruling: 'Mars' },
  { name: 'Taurus', start: [4, 20], end: [5, 20], symbol: '♉', element: 'Earth', ruling: 'Venus' },
  { name: 'Gemini', start: [5, 21], end: [6, 20], symbol: '♊', element: 'Air', ruling: 'Mercury' },
  { name: 'Cancer', start: [6, 21], end: [7, 22], symbol: '♋', element: 'Water', ruling: 'Moon' },
  { name: 'Leo', start: [7, 23], end: [8, 22], symbol: '♌', element: 'Fire', ruling: 'Sun' },
  { name: 'Virgo', start: [8, 23], end: [9, 22], symbol: '♍', element: 'Earth', ruling: 'Mercury' },
  { name: 'Libra', start: [9, 23], end: [10, 22], symbol: '♎', element: 'Air', ruling: 'Venus' },
  { name: 'Scorpio', start: [10, 23], end: [11, 21], symbol: '♏', element: 'Water', ruling: 'Pluto' },
  { name: 'Sagittarius', start: [11, 22], end: [12, 21], symbol: '♐', element: 'Fire', ruling: 'Jupiter' },
  { name: 'Capricorn', start: [12, 22], end: [1, 19], symbol: '♑', element: 'Earth', ruling: 'Saturn' },
  { name: 'Aquarius', start: [1, 20], end: [2, 18], symbol: '♒', element: 'Air', ruling: 'Uranus' },
  { name: 'Pisces', start: [2, 19], end: [3, 20], symbol: '♓', element: 'Water', ruling: 'Neptune' },
];

export function getSunSign(month, day) {
  for (let sign of ZODIAC_SIGNS) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) return sign;
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    }
  }
  return ZODIAC_SIGNS[0];
}

export function getMoonSignApprox(month, day, year) {
  // Simplified lunar month calculation
  // Moon progresses ~1 sign per 2.5 days
  const date = new Date(year, month - 1, day);
  const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / 86400000);
  const moonCycle = dayOfYear % 27.32; // Lunar month
  const signIndex = Math.floor((moonCycle / 27.32) * 12);
  return ZODIAC_SIGNS[signIndex];
}

export function getRisingSignApprox(hour, minute, latitude) {
  // Simplified: Rising sign approximation based on local time
  // In reality, this requires complex house calculations
  // We'll estimate based on hour of birth + latitude adjustment
  const birthHour = hour + minute / 60;
  const siderealBase = (birthHour / 24) * 12; // Rough sidereal hour
  const latitudeAdjust = (latitude / 90) * 2; // Latitude influence
  const signIndex = Math.floor((siderealBase + latitudeAdjust) % 12);
  return ZODIAC_SIGNS[signIndex];
}

export function getAstroInsight(sunSign, moonSign, risingSign) {
  const elements = {
    Fire: { vibe: 'action-oriented, bold, passionate', financial: 'risk-taking, growth-focused' },
    Earth: { vibe: 'practical, grounded, material', financial: 'stability-seeking, methodical' },
    Air: { vibe: 'intellectual, communicative, detached', financial: 'analytical, opportunity-aware' },
    Water: { vibe: 'intuitive, emotional, deep', financial: 'protective, legacy-focused' },
  };

  const sunElement = elements[sunSign.element];
  const moonElement = elements[moonSign.element];
  const risingElement = elements[risingSign.element];

  return {
    sun: sunSign,
    moon: moonSign,
    rising: risingSign,
    vibe: `${sunSign.name} energy (Sun) meets ${moonSign.name} intuition (Moon), presenting as ${risingSign.name} (Rising)`,
    financialType: `${sunElement.financial} instinct tempered by ${moonElement.financial} protection`,
    overall: `${sunSign.element}/${moonSign.element}/${risingSign.element}`,
  };
}

export function getCurrentTransits() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return {
    sunSign: getSunSign(month, day),
    season: getSeasonFromDate(month, day),
  };
}

function getSeasonFromDate(month, day) {
  if ((month === 3 && day >= 21) || (month === 4) || (month === 5) || (month === 6 && day < 21)) return 'Spring';
  if ((month === 6 && day >= 21) || (month === 7) || (month === 8) || (month === 9 && day < 23)) return 'Summer';
  if ((month === 9 && day >= 23) || (month === 10) || (month === 11) || (month === 12 && day < 22)) return 'Fall';
  return 'Winter';
}

export function formatBirthData(birthMonth, birthDay, birthYear, birthHour, birthMinute, birthLatitude) {
  const sunSign = getSunSign(birthMonth, birthDay);
  const moonSign = getMoonSignApprox(birthMonth, birthDay, birthYear);
  const risingSign = getRisingSignApprox(birthHour || 12, birthMinute || 0, birthLatitude || 0);
  const insight = getAstroInsight(sunSign, moonSign, risingSign);
  
  return {
    sunSign,
    moonSign,
    risingSign,
    insight,
    birthDate: `${birthMonth}/${birthDay}/${birthYear}`,
    birthTime: birthHour ? `${String(birthHour).padStart(2, '0')}:${String(birthMinute).padStart(2, '0')}` : 'Unknown',
  };
}