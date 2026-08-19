export type CalculatorMode = 'range' | 'potential';
export type KnownEndpoint = 'low' | 'high';

export interface RangeLevelResult {
  level: string;
  percentage: number;
  price: number;
  formattedPrice: string;
  isBoundary?: 'low' | 'high';
}

export interface PotentialScenarioResult {
  assumption: string;
  percentage: number;
  targetPrice: number;
  formattedPrice: string;
  formulaNote: string;
}

export interface RangeCalculationOutput {
  dayHigh: number;
  dayLow: number;
  range: number;
  levels: RangeLevelResult[];
}

export interface PotentialCalculationOutput {
  endpointType: KnownEndpoint;
  knownPrice: number;
  observedPrice: number;
  direction: 'high' | 'low';
  scenarios: PotentialScenarioResult[];
}
