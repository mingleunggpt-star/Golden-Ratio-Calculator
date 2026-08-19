import React, { useState } from 'react';
import { calculateRange } from '../utils/calculator';
import { RangeCalculationOutput } from '../types';
import { Calculator, RotateCcw, Copy, Check, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

export const RangeCalculator: React.FC = () => {
  const [dayHigh, setDayHigh] = useState<string>('');
  const [dayLow, setDayLow] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RangeCalculationOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const highTrimmed = dayHigh.trim();
    const lowTrimmed = dayLow.trim();

    if (!highTrimmed || !lowTrimmed) {
      setError('Please enter both Day High and Day Low.');
      setResult(null);
      return;
    }

    const high = parseFloat(highTrimmed);
    const low = parseFloat(lowTrimmed);

    if (isNaN(high) || isNaN(low) || !isFinite(high) || !isFinite(low)) {
      setError('Please enter valid numeric prices.');
      setResult(null);
      return;
    }

    if (high <= 0 || low <= 0) {
      setError('Price values must be greater than zero.');
      setResult(null);
      return;
    }

    if (high <= low) {
      setError('Day High must be higher than Day Low.');
      setResult(null);
      return;
    }

    const calcResult = calculateRange(high, low);
    setResult(calcResult);
  };

  const handleReset = () => {
    setDayHigh('');
    setDayLow('');
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const loadExample = () => {
    setDayHigh('100.00');
    setDayLow('80.00');
    setError(null);
    const calcResult = calculateRange(100, 80);
    setResult(calcResult);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `Stock Range Calculator (Range Mode)`,
      `Day High: HK$${result.dayHigh.toFixed(2)}`,
      `Day Low: HK$${result.dayLow.toFixed(2)}`,
      `Spread (Range): HK$${result.range.toFixed(2)}`,
      `--- Fibonacci Levels ---`,
      ...result.levels.map((l) => `${l.level.padEnd(8)} : ${l.formattedPrice}`),
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6" id="range-calculator-section">
      <form onSubmit={handleCalculate} className="space-y-5">
        {/* Preset helper */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Enter Daily Price Range
          </span>
          <button
            type="button"
            onClick={loadExample}
            id="btn-range-example"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Example (100 / 80)
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="input-day-high"
              className="block text-sm font-semibold text-slate-700"
            >
              Day High
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="text-sm font-medium text-slate-400">HK$</span>
              </div>
              <input
                id="input-day-high"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                placeholder="e.g. 100.00"
                value={dayHigh}
                onChange={(e) => {
                  setDayHigh(e.target.value);
                  if (error) setError(null);
                }}
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all"
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-slate-500">Highest price of the session</p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="input-day-low"
              className="block text-sm font-semibold text-slate-700"
            >
              Day Low
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="text-sm font-medium text-slate-400">HK$</span>
              </div>
              <input
                id="input-day-low"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                placeholder="e.g. 80.00"
                value={dayLow}
                onChange={(e) => {
                  setDayLow(e.target.value);
                  if (error) setError(null);
                }}
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all"
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-slate-500">Lowest price of the session</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            id="range-error-alert"
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
            id="btn-range-calculate"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Calculator className="w-5 h-5" />
            Calculate
          </button>
          <button
            type="button"
            id="btn-range-reset"
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
          id="range-results-card"
          className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all animate-in fade-in duration-200"
        >
          {/* Result Header */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Fibonacci Range Levels
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Range Spread:{' '}
                <span className="font-semibold text-slate-700">
                  HK${result.range.toFixed(2)}
                </span>{' '}
                (Low HK${result.dayLow.toFixed(2)} → High HK${result.dayHigh.toFixed(2)})
              </p>
            </div>
            <button
              type="button"
              id="btn-copy-range-results"
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
            <table className="w-full text-left border-collapse" id="range-results-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-5">Fibonacci Level</th>
                  <th className="py-3 px-5 text-right">Calculated Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {result.levels.map((row) => {
                  const isBoundary = row.isBoundary;
                  const is50 = row.level === '50.0%';
                  const isGolden = row.level === '61.8%' || row.level === '38.2%';

                  return (
                    <tr
                      key={row.level}
                      className={`transition-colors hover:bg-slate-50/80 ${
                        isBoundary ? 'bg-slate-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-5 flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-800">
                          {row.level}
                        </span>
                        {row.level === '0%' && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            Day Low
                          </span>
                        )}
                        {row.level === '100%' && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            Day High
                          </span>
                        )}
                        {is50 && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                            Midpoint
                          </span>
                        )}
                        {isGolden && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">
                            Golden Ratio
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right font-mono text-base font-semibold text-slate-900">
                        {row.formattedPrice}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50/60 px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
            Formula: <code className="font-mono text-slate-700">Price = Day Low + (Day High - Day Low) × Ratio</code>
          </div>
        </div>
      )}
    </div>
  );
};
