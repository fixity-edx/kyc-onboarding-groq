import React from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

export default function Stepper({ steps=[], current=0 }){
  return (
    <div className="glass rounded-panel p-5">
      <div className="flex items-center gap-3">
        {steps.map((s, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={s.key || idx} className="flex-1">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  "w-9 h-9 rounded-full flex items-center justify-center border",
                  done ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200" :
                  active ? "bg-white/10 border-white/20 text-white" :
                  "bg-slate-950/40 border-white/10 text-slate-400"
                )}>
                  {done ? <Check size={18}/> : idx+1}
                </div>
                <div className={clsx("text-sm font-semibold", active ? "text-white" : "text-slate-300")}>{s.label}</div>
              </div>
              {idx < steps.length-1 ? <div className="h-1 bg-white/10 rounded-full mt-3" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  );
}
