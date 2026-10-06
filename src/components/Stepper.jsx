import React from "react";
import { Check } from "lucide-react";

const STEPS = ["Select Room", "Guest Details", "Payment", "Confirmation"];

// current: 0..3. When current === 4 every step shows as done.
export default function Stepper({ current }) {
  return (
    <div className="bg-mint py-3 px-4">
      <div className="max-w-3xl mx-auto flex items-center">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                  i < current ? "bg-forest" : i === current ? "bg-coral" : "bg-ink/30"
                }`}
              >
                {i < current ? <Check size={13} /> : i + 1}
              </span>
              <span
                className={`hidden sm:inline text-xs ${
                  i === current ? "text-coral font-medium" : "text-ink/60"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-ink/15 mx-3" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
