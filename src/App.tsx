import React, { useState } from 'react';
import { CalculatorMode, KnownEndpoint, RangeCalculationOutput, PotentialCalculationOutput } from './types';
import { calculateRange, calculatePotential } from './utils/calculator';
import {
  Calculator,
  RotateCcw,
  Copy,
  Check,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

export default function App() {
  // Mode state
  const [activeMode, setActiveMode] = useState<CalculatorMode>('range');

  // Range mode inputs
  const [dayHigh, setDayHigh] = useState<string>('');
  const [dayLow, setDayLow] = useState<string>('');

  // Potential mode inputs
  const [potentialType, setPotentialType] = useState<KnownEndpoint>('low');
  const [knownPrice, setKnownPrice] = useState<string>('');
  const [observedPrice, setObservedPrice] = useState<string>('');

  // Status & output state
  const [error, setError] = useState<string | null>(null);
  const [rangeResult, setRangeResult] = useState<RangeCalculationOutput | null>(null);
  const [potentialResult, setPotentialResult] = useState<PotentialCalculationOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Switch modes
  const handleSwitchMode = (mode: CalculatorMode) => {
    setActiveMode(mode);
    setError(null);
    setCopied(false);
  };

  // Switch potential known endpoint
  const handleSwitchPotentialType = (type: KnownEndpoint) => {
    setPotentialType(type);
    setError(null);
    setPotentialResult(null);
    setCopied(false);
  };

  // Calculate logic
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setCopied(false);

    if (activeMode === 'range') {
      const highTrimmed = dayHigh.trim();
      const lowTrimmed = dayLow.trim();

      if (!highTrimmed || !lowTrimmed) {
        setError('Please enter both Day High and Day Low.');
        setRangeResult(null);
        return;
      }

      const high = parseFloat(highTrimmed);
      const low = parseFloat(lowTrimmed);

      if (isNaN(high) || isNaN(low) || !isFinite(high) || !isFinite(low)) {
        setError('Please enter valid numeric prices.');
        setRangeResult(null);
        return;
      }

      if (high <= 0 || low <= 0) {
        setError('Price values must be greater than zero.');
        setRangeResult(null);
        return;
      }

      if (high <= low) {
        setError('Day High must be higher than Day Low.');
        setRangeResult(null);
        return;
      }

      const result = calculateRange(high, low);
      setRangeResult(result);
    } else {
      const knownTrimmed = knownPrice.trim();
      const observedTrimmed = observedPrice.trim();

      if (!knownTrimmed || !observedTrimmed) {
        setError(
          `Please enter both Known ${potentialType === 'low' ? 'Low' : 'High'} and Observed Price.`
        );
        setPotentialResult(null);
        return;
      }

      const known = parseFloat(knownTrimmed);
      const observed = parseFloat(observedTrimmed);

      if (isNaN(known) || isNaN(observed) || !isFinite(known) || !isFinite(observed)) {
        setError('Please enter valid numeric prices.');
        setPotentialResult(null);
        return;
      }

      if (known <= 0 || observed <= 0) {
        setError('Price values must be greater than zero.');
        setPotentialResult(null);
        return;
      }

      if (potentialType === 'low') {
        if (observed <= known) {
          setError('Observed price must be higher than the known Low.');
          setPotentialResult(null);
          return;
        }
      } else {
        if (observed >= known) {
          setError('Observed price must be lower than the known High.');
          setPotentialResult(null);
          return;
        }
      }

      const result = calculatePotential(potentialType, known, observed);
      setPotentialResult(result);
    }
  };

  // Reset fields
  const handleReset = () => {
    if (activeMode === 'range') {
      setDayHigh('');
      setDayLow('');
      setRangeResult(null);
    } else {
      setKnownPrice('');
      setObservedPrice('');
      setPotentialResult(null);
    }
    setError(null);
    setCopied(false);
  };

  // Preset example loader
  const handleLoadExample = () => {
    setError(null);
    setCopied(false);
    if (activeMode === 'range') {
      setDayHigh('100.00');
      setDayLow('80.00');
      const result = calculateRange(100, 80);
      setRangeResult(result);
    } else {
      if (potentialType === 'low') {
        setKnownPrice('80.00');
        setObservedPrice('84.72');
        const result = calculatePotential('low', 80, 84.72);
        setPotentialResult(result);
      } else {
        setKnownPrice('100.00');
        setObservedPrice('92.36');
        const result = calculatePotential('high', 100, 92.36);
        setPotentialResult(result);
      }
    }
  };

  // Copy result table
  const handleCopy = () => {
    if (activeMode === 'range' && rangeResult) {
      const text = [
        `Stock Range Calculator (Range Mode)`,
        `Day High: HK$${rangeResult.dayHigh.toFixed(2)}`,
        `Day Low: HK$${rangeResult.dayLow.toFixed(2)}`,
        `Range Spread: HK$${rangeResult.range.toFixed(2)}`,
        `--- Fibonacci Levels ---`,
        ...rangeResult.levels.map((l) => `${l.level.padEnd(8)} : ${l.formattedPrice}`),
      ].join('\n');

      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else if (activeMode === 'potential' && potentialResult) {
      const directionTitle = potentialResult.direction === 'high' ? 'Potential Highs' : 'Potential Lows';
      const text = [
        `Stock Range Calculator (Potential Mode)`,
        `Known ${potentialResult.endpointType === 'low' ? 'Low' : 'High'}: HK$${potentialResult.knownPrice.toFixed(2)}`,
        `Observed Price: HK$${potentialResult.observedPrice.toFixed(2)}`,
        `Target Direction: ${directionTitle}`,
        `--- Fibonacci Scenarios ---`,
        ...potentialResult.scenarios.map((s) => `${s.assumption.padEnd(8)} : ${s.formattedPrice}`),
      ].join('\n');

      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const hasResult = activeMode === 'range' ? Boolean(rangeResult) : Boolean(potentialResult);

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800 flex items-center justify-center p-3 sm:p-6 md:p-8">
      {/* Sleek Main Container Card */}
      <div
        id="sleek-calculator-container"
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/60 transition-all min-h-[640px]"
      >
        {/* Sleek Dark Header */}
        <header className="bg-slate-900 text-white p-6 sm:p-8 pb-8 sm:pb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Stock Range Calculator</span>
            </h1>
            <p className="text-slate-400 mt-1 font-medium text-sm sm:text-base">
              Fibonacci Price Calculator for HK Stocks
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 self-start sm:self-auto bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Deterministic JS Engine • HK$</span>
          </div>
        </header>

        {/* Split Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar / Form Controls */}
          <aside className="w-full md:w-[380px] lg:w-[400px] border-b md:border-b-0 md:border-r border-slate-100 p-6 sm:p-8 flex flex-col gap-6 bg-white shrink-0">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl" role="tablist">
              <button
                id="tab-range"
                role="tab"
                aria-selected={activeMode === 'range'}
                onClick={() => handleSwitchMode('range')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  activeMode === 'range'
                    ? 'bg-white shadow-sm text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Range
              </button>
              <button
                id="tab-potential"
                role="tab"
                aria-selected={activeMode === 'potential'}
                onClick={() => handleSwitchMode('potential')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  activeMode === 'potential'
                    ? 'bg-white shadow-sm text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Potential
              </button>
            </div>

            {/* Quick preset button */}
            <div className="flex items-center justify-between -mt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {activeMode === 'range' ? 'Retracement Mode' : 'Target Price Mode'}
              </span>
              <button
                type="button"
                id="btn-load-example"
                onClick={handleLoadExample}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {activeMode === 'range'
                    ? 'Load (100 / 80)'
                    : potentialType === 'low'
                    ? 'Load (80 / 84.72)'
                    : 'Load (100 / 92.36)'}
                </span>
              </button>
            </div>

            {/* Form Inputs Container */}
            <form onSubmit={handleCalculate} className="space-y-5 flex-1 flex flex-col justify-between">
              {/* Range Inputs */}
              {activeMode === 'range' ? (
                <div id="range-inputs" className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="day-high"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Day High
                    </label>
                    <div className="relative rounded-xl">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-sm font-semibold text-slate-400">HK$</span>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="day-high"
                        placeholder="0.00"
                        value={dayHigh}
                        onChange={(e) => {
                          setDayHigh(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full pl-13 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400 text-base"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="day-low"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Day Low
                    </label>
                    <div className="relative rounded-xl">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-sm font-semibold text-slate-400">HK$</span>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="day-low"
                        placeholder="0.00"
                        value={dayLow}
                        onChange={(e) => {
                          setDayLow(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full pl-13 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400 text-base"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Potential Inputs */
                <div id="potential-inputs" className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Known Endpoint
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        id="type-low"
                        onClick={() => handleSwitchPotentialType('low')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          potentialType === 'low'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        KNOWN LOW
                      </button>
                      <button
                        type="button"
                        id="type-high"
                        onClick={() => handleSwitchPotentialType('high')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          potentialType === 'high'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        KNOWN HIGH
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      id="known-label"
                      htmlFor="known-price"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      {potentialType === 'low' ? 'Known Low Price' : 'Known High Price'}
                    </label>
                    <div className="relative rounded-xl">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-sm font-semibold text-slate-400">HK$</span>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="known-price"
                        placeholder="0.00"
                        value={knownPrice}
                        onChange={(e) => {
                          setKnownPrice(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full pl-13 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400 text-base"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="observed-price"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Observed Price
                    </label>
                    <div className="relative rounded-xl">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-sm font-semibold text-slate-400">HK$</span>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="observed-price"
                        placeholder="0.00"
                        value={observedPrice}
                        onChange={(e) => {
                          setObservedPrice(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full pl-13 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400 text-base"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div
                  id="error-box"
                  role="alert"
                  className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2.5 animate-in fade-in duration-150"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  id="btn-calculate"
                  className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-base"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Calculate</span>
                </button>
                <button
                  type="button"
                  id="btn-reset"
                  onClick={handleReset}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-semibold rounded-xl transition-all border border-slate-200/80 cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Fields</span>
                </button>
              </div>
            </form>
          </aside>

          {/* Right Main Content Area / Calculation Output */}
          <main className="flex-1 bg-slate-50 p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center overflow-y-auto">
            {!hasResult ? (
              /* Empty State */
              <div id="empty-state" className="text-center max-w-sm mx-auto py-12">
                <div className="w-20 h-20 bg-slate-200/80 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-inner">
                  <Layers className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-500">Enter values to calculate</h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Calculate Fibonacci price targets for HK stocks instantly using pure client-side mathematics.
                </p>
              </div>
            ) : (
              /* Results View */
              <div id="results-view" className="w-full max-w-lg mx-auto space-y-4 animate-in fade-in duration-200">
                {/* Result Title & Badges */}
                <div className="flex items-center justify-between">
                  <h2 id="result-title" className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span>
                      {activeMode === 'range'
                        ? 'Fibonacci Range Levels'
                        : potentialResult?.direction === 'high'
                        ? 'Potential Highs'
                        : 'Potential Lows'}
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      REAL-TIME
                    </span>
                  </h2>

                  <button
                    type="button"
                    id="btn-copy-results"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                    title="Copy table to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Range Mode Table */}
                {activeMode === 'range' && rangeResult && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100/60 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>
                        Spread (Range): <strong className="text-slate-800 font-mono">HK${rangeResult.range.toFixed(2)}</strong>
                      </span>
                      <span>
                        Low <strong className="text-slate-800 font-mono">{rangeResult.dayLow.toFixed(2)}</strong> → High <strong className="text-slate-800 font-mono">{rangeResult.dayHigh.toFixed(2)}</strong>
                      </span>
                    </div>
                    <table className="w-full text-left" id="range-results-table">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th id="table-col-1" className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Level
                          </th>
                          <th id="table-col-2" className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody id="results-body" className="divide-y divide-slate-100 text-sm">
                        {rangeResult.levels.map((row) => {
                          const isBoundary = row.isBoundary;
                          const is50 = row.level === '50.0%';
                          const isGolden = row.level === '61.8%' || row.level === '38.2%';

                          return (
                            <tr
                              key={row.level}
                              className={`transition-colors hover:bg-slate-50/80 ${
                                isBoundary ? 'bg-slate-50/40 font-semibold' : ''
                              }`}
                            >
                              <td className="px-6 py-3.5 flex items-center gap-2">
                                <span className="font-mono font-medium text-slate-700">{row.level}</span>
                                {row.level === '0%' && (
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                    Day Low
                                  </span>
                                )}
                                {row.level === '100%' && (
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                    Day High
                                  </span>
                                )}
                                {is50 && (
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                    Midpoint
                                  </span>
                                )}
                                {isGolden && (
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                                    Golden Ratio
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-3.5 text-right font-mono text-base font-bold text-slate-900">
                                {row.formattedPrice}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Potential Mode Table */}
                {activeMode === 'potential' && potentialResult && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100/60 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>
                        Known {potentialResult.endpointType === 'low' ? 'Low' : 'High'}:{' '}
                        <strong className="text-slate-800 font-mono">HK${potentialResult.knownPrice.toFixed(2)}</strong>
                      </span>
                      <span>
                        Observed:{' '}
                        <strong className="text-slate-800 font-mono">HK${potentialResult.observedPrice.toFixed(2)}</strong>
                      </span>
                    </div>
                    <table className="w-full text-left" id="potential-results-table">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Assumption
                          </th>
                          <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                            {potentialResult.direction === 'high' ? 'Potential High' : 'Potential Low'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {potentialResult.scenarios.map((row) => {
                          const is50 = row.assumption === '50.0%';
                          const is618 = row.assumption === '61.8%';

                          return (
                            <tr key={row.assumption} className="transition-colors hover:bg-slate-50/80">
                              <td className="px-6 py-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-800">{row.assumption}</span>
                                  {is618 && (
                                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                                      Golden Ratio
                                    </span>
                                  )}
                                  {is50 && (
                                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                      Midpoint
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{row.formulaNote}</p>
                              </td>
                              <td className="px-6 py-3.5 text-right font-mono text-base font-bold text-slate-900">
                                {row.formattedPrice}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sub-note / Interpretation Guide */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Calculation Details:</span>
                  </div>
                  <p className="leading-relaxed pl-5 text-slate-500">
                    {activeMode === 'range'
                      ? 'Formula: Level Price = Day Low + (Day High - Day Low) × Fibonacci Percentage.'
                      : `Each row shows the implied ${
                          potentialResult?.direction === 'high' ? 'High' : 'Low'
                        } if the observed price of HK$${potentialResult?.observedPrice.toFixed(
                          2
                        )} represents that Fibonacci percentage.`}
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
