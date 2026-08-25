import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

function nextViewerCount(current: number) {
  const change = Math.floor(Math.random() * 9) - 4;
  return Math.min(47, Math.max(3, current + (change || 1)));
}

export function SimulatedViewerCount({ seed }: { seed: string }) {
  const [count, setCount] = useState(() => 8 + Array.from(seed).reduce((total, character) => total + character.charCodeAt(0), 0) % 27);

  useEffect(() => {
    const interval = window.setInterval(() => setCount(current => nextViewerCount(current)), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f2ede4] px-3 py-2 text-[10px] font-bold uppercase tracking-[.09em] text-[#58708a]" title="Simulated activity indicator — it does not report real visitor traffic."><Eye size={14} className="text-[#bb492d]" aria-hidden="true" /><span><b className="tabular-nums text-[#123f72]">{count}</b> activity preview</span><span className="normal-case tracking-normal text-slate-500">(simulated)</span></p>;
}
