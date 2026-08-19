import React, { useState } from 'react';
import { calculatePotential } from '../utils/calculator';
import { KnownEndpoint, PotentialCalculationOutput } from '../types';
import {
  Calculator,
  RotateCcw,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export const PotentialCalculator: React.FC = () => {
  const [endpointType, setEndpointType] = useState<KnownEndpoint>('low');
  const [knownPrice, setKnownPrice] = useState<string>('');
  const [observedPrice, setObservedPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PotentialCalculationOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const knownTrimmed = knownPrice.trim();
    const observedTrimmed = observedPrice.trim();

    if (!knownTrimmed || !observedTrimmed) {
      setError(
        `Please enter both Known ${endpointType === 'low' ? 'Low' : 'High'} and Observed Price.`
      );
      setResult(null);
      return;
    }

    const known = parseFloat(knownTrimmed);
    const observed = parseFloat(observedTrimmed);

    if (isNaN(known) || isNaN(observed) || !isFinite(known) || !isFinite(observed)) {
      setError('Please enter valid numeric prices.');
      setResult(null);
      return;
    }

    if (known <= 0 || observed <= 0) {
      setError('Price values must be greater than zero.');
      setResult(null);
      return;
    }

    if (endpointType === 'low') {
      if (observed <= known) {
        setError('Observed price must be higher than the known Low.');
        setResult(null);
        return;
      }
    } else {
      if (observed >= known) {
        setError('Observed price must be lower than the known High.');
        setResult(null);
        return;
      }
    }

    const calcResult = calculatePotential(endpointType, known, observed);
    setResult(calcResult);
  };

  const handleReset = () => {
    setKnownPrice('');
    setObservedPrice('');
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const handleToggleEndpoint = (type: KnownEndpoint) => {
    setEndpointType(type);
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const loadExample = () => {
    if (endpointType === 'low') {
      setKnownPrice('80.00');
      setObservedPrice('84.72');
      setError(null);
      const calcResult = calculatePotential('low', 80, 84.72);
      setResult(calcResult);
    } else {
      setKnownPrice('100.00');
      setObservedPrice('92.36');
      setError(null);
      const calcResult = calculatePotential('high', 100, 92.36);
      setResult(calcResult);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const directionTitle = result.direction === 'high' ? 'Potential Highs' : 'Potential Lows';
    const text = [
      `Stock Range Calculator (Potential Mode)`,
      `Known ${result.endpointType === 'low' ? 'Low' : 'High'}: HK$${result.knownPrice.toFixed(2)}`,
      `Observed Price: HK$${result.observedPrice.toFixed(2)}`,
      `Target Direction: ${directionTitle}`,
      `--- Fibonacci Scenarios ---`,
      ...result.scenarios.map((s) => `${s.assumption.padEnd(8)} : ${s.formattedPrice}`),
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isLow = endpointType === 'low';

  return (
    <div className="space-y-6" id="potential-calculator-section">
      <form onSubmit={handleCalculate} className="space-y-5">
        {/* Endpoint Selector & Preset Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Known Endpoint
            </label>
            <button
              type="button"
              onClick={loadExample}
              id="btn-potential-example"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isLow ? 'Load Test Example (80 / 84.72)' : 'Load Test Example (100 / 92.36)'}
            </button>
          </div>

          {/* Segmented Control for Known High | Known Low */}
          <div
            className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl gap-1 text-sm font-semibold"
            role="radiogroup"
            aria-label="Known Endpoint"
          >
            <button
              type="button"
              id="btn-select-known-low"
              role="radio"
              aria-checked={isLow}
              onClick={() => handleToggleEndpoint('low')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
                isLow
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className={`w-4 h-4 ${isLow ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Known Low</span>
              <span className="text-xs font-normal text-slate-500 hidden sm:inline">(Find Highs)</span>
            </button>

            <button
              type="button"
              id="btn-select-known-high"
              role="radio"
              aria-checked={!isLow}
              onClick={() => handleToggleEndpoint('high')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
                !isLow
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className={`w-4 h-4 ${!isLow ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>Known High</span>
              <span className="text-xs font-normal text-slate-500 hidden sm:inline">(Find Lows)</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="input-known-price"
              className="block text-sm font-semibold text-slate-700"
            >
              Known Price ({isLow ? 'Low' : 'High'})
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="text-sm font-medium text-slate-400">HK$</span>
              </div>
              <input
                id="input-known-price"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                placeholder={isLow ? 'e.g. 80.00' : 'e.g. 100.00'}
                value={knownPrice}
                onChange={(e) => {
                  setKnownPrice(e.target.value);
                  if (error) setError(null);
                }}
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all"
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-slate-500">
              {isLow ? 'Established support / swing low' : 'Established resistance / swing high'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="input-observed-price"
              className="block text-sm font-semibold text-slate-700"
            >
              Observed Price
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="text-sm font-medium text-slate-400">HK$</span>
              </div>
              <input
                id="input-observed-price"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                placeholder={isLow ? 'e.g. 84.72' : 'e.g. 92.36'}
                value={observedPrice}
                onChange={(e) => {
                  setObservedPrice(e.target.value);
                  if (error) setError(null);
                }}
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all"
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-slate-500">
              {isLow ? 'Current price (> Known Low)' : 'Current price (< Known High)'}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            id="potential-error-alert"
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="submit"
            id="btn-potential-calculate"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Calculator className="w-5 h-5" />
            Calculate All Scenarios
          </button>
          <button
            type="button"
            id="btn-potential-reset"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Reset
          </button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <div
          id="potential-results-card"
          className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all animate-in fade-in duration-200"
        >
          {/* Result Header */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                {result.direction === 'high' ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    Potential Highs
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-rose-600" />
                    Potential Lows
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Known {result.endpointType === 'low' ? 'Low' : 'High'}:{' '}
                <span className="font-semibold text-slate-700">
                  HK${result.knownPrice.toFixed(2)}
                </span>{' '}
                • Observed:{' '}
                <span className="font-semibold text-slate-700">
                  HK${result.observedPrice.toFixed(2)}
                </span>
              </p>
            </div>
            <button
              type="button"
              id="btn-copy-potential-results"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Copy results to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Result Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="potential-results-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-5">Fibonacci Assumption</th>
                  <th className="py-3 px-5 text-right">
                    {result.direction === 'high' ? 'Potential High' : 'Potential Low'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {result.scenarios.map((row) => {
                  const is50 = row.assumption === '50.0%';
                  const is618 = row.assumption === '61.8%';
                  const is236 = row.assumption === '23.6%';

                  return (
                    <tr
                      key={row.assumption}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 text-base">
                            {row.assumption}
                          </span>
                          {is618 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">
                              Golden Ratio
                            </span>
                          )}
                          {is50 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                              Midpoint
                            </span>
                          )}
                          {is236 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                              Shallow Retracement
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{row.formulaNote}</p>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-base font-bold text-slate-900">
                        {row.formattedPrice}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Interpretation Guide Box */}
          <div className="bg-slate-50/70 p-4 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>How to interpret these results:</span>
            </div>
            <p className="leading-relaxed pl-5">
              Each row displays what the implied {result.direction === 'high' ? 'High' : 'Low'} would be if the observed price of <strong className="text-slate-800">HK${result.observedPrice.toFixed(2)}</strong> corresponds to that specific Fibonacci ratio.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
