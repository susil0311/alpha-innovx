import { useEffect, useMemo, useState } from "react";
import { Activity, BrainCircuit, Languages, Play, RotateCcw, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { calculateSimulation, type SimulationInput } from "../data";
import type { RiskState } from "../data";
import { calculateXGBoostProbability, xgboostModelDescription } from "../ml/xgboost";

const initialInput: SimulationInput = {
  rain15mm: 42,
  soilSaturation: 91,
  riverRiseM30: 0.64,
  debrisLikelihood: 0.92,
  sensorConfidence: 0.85,
  slopeSusceptibility: 0.82,
  forecastRain6h: 62,
};

type ModelEngine = "rules" | "xgboost";

const stateStyles: Record<RiskState, string> = {
  RED: "bg-[#fde9e7] text-[#b42318]",
  ORANGE: "bg-[#fff1e5] text-[#c25f1c]",
  YELLOW: "bg-[#fff8d9] text-[#946d0a]",
  GREEN: "bg-[#e1f5ec] text-[#187c55]",
};

export function SimulationPanel({ onApply }: { onApply: (input: SimulationInput) => void }) {
  const [input, setInput] = useState(initialInput);
  const [engine, setEngine] = useState<ModelEngine>("xgboost");
  const [xgboostProbability, setXgboostProbability] = useState<number | null>(null);
  const rulePrediction = useMemo(() => calculateSimulation(input), [input]);

  useEffect(() => {
    let active = true;
    setXgboostProbability(null);
    calculateXGBoostProbability(input).then(probability => {
      if (active) setXgboostProbability(probability);
    }).catch(() => {
      if (active) setXgboostProbability(rulePrediction.probability);
    });
    return () => { active = false; };
  }, [input, rulePrediction.probability]);

  const probability = engine === "xgboost" && xgboostProbability !== null ? xgboostProbability : rulePrediction.probability;
  const state: RiskState = probability >= 0.8 ? "RED" : probability >= 0.6 ? "ORANGE" : probability >= 0.4 ? "YELLOW" : "GREEN";
  const confidence = Math.max(0.5, Math.min(0.96, input.sensorConfidence - (input.sensorConfidence < 0.75 ? 0.08 : 0)));
  const leadTimeMinutes = state === "RED" ? 20 : state === "ORANGE" ? 45 : state === "YELLOW" ? 90 : 180;
  const factors = rulePrediction.factors;
  const update = (key: keyof SimulationInput, value: number) => setInput(current => ({ ...current, [key]: value }));
  const reset = () => setInput(initialInput);
  const issueText = state === "RED"
    ? "Move low-bank households now and prepare the approved alert."
    : state === "ORANGE"
      ? "Prepare shelters, traffic control, and assisted movement."
      : state === "YELLOW"
        ? "Increase monitoring and verify vulnerable households."
        : "Continue normal monitoring and keep the route ready.";

  return <section className="mb-5 rounded-2xl border border-[#b9ccc9] bg-white p-4 shadow-panel lg:p-5">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-lg bg-[#e2f0ed] text-[#0f766e]"><SlidersHorizontal className="size-4" /></div><div><div className="text-[9px] font-bold uppercase tracking-[.16em] text-[#8a9aa8]">Demonstration mode · multi-source inputs</div><h2 className="text-sm font-bold">Test the warning engine</h2></div></div>
      <div className="flex flex-wrap gap-2"><div className="flex rounded-lg border border-[#d8e1e8] bg-[#f7fafb] p-1"><button onClick={() => setEngine("xgboost")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold ${engine === "xgboost" ? "bg-[#0b1f33] text-white" : "text-[#607285]"}`}><BrainCircuit className="size-3.5" /> XGBoost</button><button onClick={() => setEngine("rules")} className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold ${engine === "rules" ? "bg-[#0b1f33] text-white" : "text-[#607285]"}`}>Rules</button></div><button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-[#d8e1e8] px-2.5 py-2 text-[10px] font-bold text-[#607285]"><RotateCcw className="size-3.5" /> Reset</button><button onClick={() => onApply(input)} className="flex items-center gap-1.5 rounded-lg bg-[#0b1f33] px-3 py-2 text-[10px] font-bold text-white"><Play className="size-3.5" /> Apply to map</button></div>
    </div>
    <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#f7fafb] px-3 py-2 text-[10px] text-[#607285]"><BrainCircuit className="size-3.5 text-[#0f766e]" /><span><b className="text-[#243447]">{engine === "xgboost" ? "XGBoost active" : "Transparent rules active"}</b> · {engine === "xgboost" ? xgboostModelDescription : "weighted baseline for operator comparison"}</span>{engine === "xgboost" && xgboostProbability === null && <span className="ml-auto text-[#c25f1c]">Loading model…</span>}</div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {([['rain15mm', 'Rainfall / 15 min', `${input.rain15mm} mm`, 0, 80, 1], ['soilSaturation', 'Soil saturation', `${input.soilSaturation}%`, 0, 100, 1], ['riverRiseM30', 'River rise / 30 min', `${input.riverRiseM30.toFixed(2)} m`, 0, 1, 0.01], ['debrisLikelihood', 'Debris likelihood', `${Math.round(input.debrisLikelihood * 100)}%`, 0, 1, 0.01], ['slopeSusceptibility', 'Slope susceptibility', `${Math.round(input.slopeSusceptibility * 100)}%`, 0, 1, 0.01], ['forecastRain6h', 'Forecast rainfall / 6 h', `${input.forecastRain6h} mm`, 0, 160, 1]] as const).map(([key, label, value, min, max, step]) => <label key={key} className="rounded-xl border border-[#e5ebef] bg-[#f9fbfc] p-3"><div className="mb-2 flex items-center justify-between text-[10px] font-bold"><span>{label}</span><span className="tabular text-[#0f766e]">{value}</span></div><input type="range" min={min} max={max} step={step} value={input[key]} onChange={event => update(key, Number(event.target.value))} className="w-full accent-[#0f766e]" /></label>)}
      </div>
      <div className="rounded-xl border border-[#d8e1e8] bg-[#f7fafb] p-4"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#8493a0]"><Activity className="size-3.5 text-[#0f766e]" /> {engine === "xgboost" ? "XGBoost result" : "Calculated result"}</div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stateStyles[state]}`}>{state}</span></div><div className="flex items-end gap-4"><div><div className="text-4xl font-bold tabular text-[#0b1f33]">{Math.round(probability * 100)}%</div><div className="text-[10px] text-[#607285]">flash-flood probability</div></div><div><div className="text-2xl font-bold tabular text-[#c25f1c]">{leadTimeMinutes} min</div><div className="text-[10px] text-[#607285]">actionable lead time</div></div></div><div className="mt-4 space-y-2">{factors.map(factor => <div key={factor.label}><div className="mb-1 flex justify-between text-[10px]"><span>{factor.label}</span><b>{Math.round(factor.value * 100)}%</b></div><div className="h-1.5 rounded-full bg-[#e5ebef]"><div className="h-1.5 rounded-full bg-[#0f766e]" style={{ width: `${factor.value * 100}%` }} /></div></div>)}</div><div className="mt-4 flex items-start gap-2 rounded-lg bg-white p-3 text-[10px] leading-4 text-[#607285]"><ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-[#c25f1c]" />{issueText}</div></div>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e5ebef] pt-3 text-[10px] text-[#607285]"><span className="font-bold uppercase tracking-[.12em] text-[#8493a0]">Data quality</span><b className="text-[#0f766e]">{Math.round(confidence * 100)}%</b><span>· confidence is reduced when sensors are stale or degraded</span><button onClick={() => onApply(input)} className="ml-auto flex items-center gap-1 font-bold text-[#0f766e]"><Languages className="size-3.5" /> Preview bilingual alert</button></div>
  </section>;
}

export default SimulationPanel;
