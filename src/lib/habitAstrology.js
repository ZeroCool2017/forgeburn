// Map spending habits to astrological elements & archetypes
// Educational linking between personality (birth chart) and behavior (spending)

export const ELEMENT_TRAITS = {
  fire: { label: 'Fire', traits: 'Action, passion, impulsive', spendingRisk: 'Rapid-fire purchases, experience-driven' },
  earth: { label: 'Earth', traits: 'Practical, stable, methodical', spendingRisk: 'Maintenance costs, delayed purchases' },
  air: { label: 'Air', traits: 'Ideas, communication, scattered', spendingRisk: 'Subscriptions, learning tools, novelty' },
  water: { label: 'Water', traits: 'Emotional, intuitive, protective', spendingRisk: 'Self-care, comfort, people-focused' },
};

const HABIT_ARCHETYPE_MAP = {
  // Habit pattern -> which element naturally gravitates here
  presence_over_things: 'water',      // Emotional, introspective
  energy_investment: 'fire',           // Active, action-oriented
  nourishment: 'earth',                // Grounded, physical
  momentum_building: 'fire',           // Drive, passion
  growth_exploration: 'air',           // Curiosity, learning
  wellbeing_ritual: 'water',           // Self-care, emotional
  learning_expansion: 'air',           // Intellectual
};

export function analyzeHabitVsChart(habits, birthChart) {
  // Returns insights about how their habits align/misalign with their chart
  if (!habits?.length || !birthChart) return null;

  const sunElement = birthChart.sunSign.element;
  const moonElement = birthChart.moonSign.element;
  const risingElement = birthChart.risingSign.element;

  const chartElements = [sunElement, moonElement, risingElement];
  const habitElements = habits.map(h => HABIT_ARCHETYPE_MAP[h.pattern] || 'earth');

  // Find dominant elements in chart vs habits
  const chartDominant = mostCommon(chartElements);
  const habitDominant = mostCommon(habitElements);

  const isAligned = chartDominant === habitDominant;
  const mismatchedHabits = habits.filter(h => HABIT_ARCHETYPE_MAP[h.pattern] !== chartDominant);

  return {
    chartElement: chartDominant,
    habitElement: habitDominant,
    isAligned,
    alignment: isAligned ? 'harmonious' : 'educational',
    mismatchedHabits,
    insight: generateInsight(birthChart, habits, chartDominant, habitDominant, isAligned),
  };
}

function mostCommon(arr) {
  const counts = {};
  arr.forEach(el => counts[el] = (counts[el] || 0) + 1);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function generateInsight(chart, habits, chartElem, habitElem, isAligned) {
  const chartLabel = ELEMENT_TRAITS[chartElem]?.label || 'mixed';
  const habitLabel = ELEMENT_TRAITS[habitElem]?.label || 'mixed';

  if (isAligned) {
    return `Your ${chartLabel} nature (${chart.sunSign.name} Sun) naturally gravitates toward ${habitLabel} spending patterns. This is your authentic rhythm. Trust it, but watch for excess.`;
  } else {
    return `Your ${chartLabel} nature (${chart.sunSign.name} Sun) is learning through ${habitLabel} patterns. This is growth—you're developing balance. Notice what each teaches you.`;
  }
}

export function habitToAstrologyMetaphor(habit) {
  // Turn a habit into an astrological metaphor
  const patterns = {
    presence_over_things: 'Moon\'s wisdom: value the intangible',
    energy_investment: 'Mars fuel: active momentum',
    nourishment: 'Venus pleasure: embodied care',
    momentum_building: 'Sun\'s will: forward motion',
    growth_exploration: 'Mercury curiosity: learning impulse',
    wellbeing_ritual: 'Saturn discipline: protective structure',
    learning_expansion: 'Jupiter expansion: intellectual feast',
  };
  return patterns[habit] || 'A pattern worth understanding';
}