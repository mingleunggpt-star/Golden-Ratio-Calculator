import {
  RangeCalculationOutput,
  PotentialCalculationOutput,
  KnownEndpoint,
  RangeLevelResult,
  PotentialScenarioResult
} from '../types';

export const FIBONACCI_RANGE_LEVELS = [
  { label: '0%', ratio: 0.0, isBoundary: 'low' as const },
  { label: '23.6%', ratio: 0.236 },
  { label: '38.2%', ratio: 0.382 },
  { label: '50.0%', ratio: 0.500 },
  { label: '61.8%', ratio: 0.618 },
  { label: '76.4%', ratio: 0.764 },
  { label: '100%', ratio: 1.0, isBoundary: 'high' as const },
];

export const FIBONACCI_POTENTIAL_LEVELS = [
  { label: '23.6%', ratio: 0.236 },
  { label: '38.2%', ratio: 0.382 },
  { label: '50.0%', ratio: 0.500 },
  { label: '61.8%', ratio: 0.618 },
  { label: '76.4%', ratio: 0.764 },
];

/**
 * Format a number as HK$XX.XX with exactly 2 decimal places
 */
export function formatHKD(val: number): string {
  if (isNaN(val) || !isFinite(val)) return 'HK$0.00';
  // Use toFixed(2) as required
  return `HK$${val.toFixed(2)}`;
}

/**
 * Calculate Fibonacci price levels for a given Day High and Day Low
 */
export function calculateRange(dayHigh: number, dayLow: number): RangeCalculationOutput {
  const range = dayHigh - dayLow;

  const levels: RangeLevelResult[] = FIBONACCI_RANGE_LEVELS.map((item) => {
    // Level Price = Day Low + (Day High - Day Low) * Fibonacci Percentage
    const price = dayLow + range * item.ratio;
    return {
      level: item.label,
      percentage: item.ratio,
      price,
      formattedPrice: formatHKD(price),
      isBoundary: item.isBoundary,
    };
  });

  return {
    dayHigh,
    dayLow,
    range,
    levels,
  };
}

/**
 * Calculate potential Highs or Lows given a known endpoint and an observed price
 */
export function calculatePotential(
  endpointType: KnownEndpoint,
  knownPrice: number,
  observedPrice: number
): PotentialCalculationOutput {
  if (endpointType === 'low') {
    // Known Low -> Calculate Potential Highs
    // Potential High = Low + (Observed Price - Low) / Fibonacci Percentage
    const scenarios: PotentialScenarioResult[] = FIBONACCI_POTENTIAL_LEVELS.map((item) => {
      const targetPrice = knownPrice + (observedPrice - knownPrice) / item.ratio;
      return {
        assumption: item.label,
        percentage: item.ratio,
        targetPrice,
        formattedPrice: formatHKD(targetPrice),
        formulaNote: `If ${formatHKD(observedPrice)} is ${item.label} level, implied High is ${formatHKD(targetPrice)}`,
      };
    });

    return {
      endpointType,
      knownPrice,
      observedPrice,
      direction: 'high',
      scenarios,
    };
  } else {
    // Known High -> Calculate Potential Lows
    // Potential Low = (Observed Price - Fibonacci Percentage * High) / (1 - Fibonacci Percentage)
    const scenarios: PotentialScenarioResult[] = FIBONACCI_POTENTIAL_LEVELS.map((item) => {
      const targetPrice = (observedPrice - item.ratio * knownPrice) / (1 - item.ratio);
      return {
        assumption: item.label,
        percentage: item.ratio,
        targetPrice,
        formattedPrice: formatHKD(targetPrice),
        formulaNote: `If ${formatHKD(observedPrice)} is ${item.label} level, implied Low is ${formatHKD(targetPrice)}`,
      };
    });

    return {
      endpointType,
      knownPrice,
      observedPrice,
      direction: 'low',
      scenarios,
    };
  }
}
