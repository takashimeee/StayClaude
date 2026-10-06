import { Minus, Plus } from "lucide-react";

export default function GuestStepper({ label, value, min, max, onChange, tone = "cream", hint }) {
  const bg = tone === "cream" ? "bg-cream" : "bg-white";
  const btn = tone === "cream" ? "bg-white" : "bg-mint";
  return (
    <div>
      <span className="block text-xs text-ink/60 mb-2">{label}</span>
      <div className={`flex items-center justify-between ${bg} rounded-full px-3 py-2`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className={`h-7 w-7 rounded-full ${btn} text-forest flex items-center justify-center disabled:opacity-30`}
        >
          <Minus size={14} />
        </button>
        <span className="text-sm">
          {value}
          {hint && value === 0 && <span className="text-ink/40"> · {hint}</span>}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className={`h-7 w-7 rounded-full ${btn} text-forest flex items-center justify-center disabled:opacity-30`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
