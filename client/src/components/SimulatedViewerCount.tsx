import { Eye } from "lucide-react";

export function SimulatedViewerCount({ seed: _seed }: { seed: string }) {
  return <p className="mt-5 inline-flex items-center gap-3 rounded-full bg-[#f2ede4] px-4 py-3 text-xs font-extrabold uppercase tracking-[.12em] text-[#58708a] shadow-sm md:px-5 md:py-3.5 md:text-sm" title="Store activity indicator"><Eye size={20} className="text-[#bb492d] md:h-[22px] md:w-[22px]" aria-hidden="true" /><span className="text-lg font-black leading-none text-[#123f72] md:text-xl">Activity</span><span className="hidden text-xs font-bold normal-case tracking-normal text-slate-600 sm:inline">Explore this piece</span></p>;
}
