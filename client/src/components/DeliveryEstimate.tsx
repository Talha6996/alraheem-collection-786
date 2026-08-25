import { useState } from "react";
import { Truck } from "lucide-react";

const ESTIMATES: Record<string, string> = {
  Karachi: "2–4 working days",
  Lahore: "2–4 working days",
  Islamabad: "2–4 working days",
  Rawalpindi: "2–4 working days",
  Faisalabad: "3–5 working days",
  Multan: "3–5 working days",
  Peshawar: "3–5 working days",
  Quetta: "4–6 working days",
  "Other Pakistan city": "3–6 working days",
};

export function DeliveryEstimate() {
  const [city, setCity] = useState("");
  return <div className="mt-7 border-y border-[#d8d0c2] py-5"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72]"><Truck size={15} /> Delivery estimate</div><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center"><label className="sr-only" htmlFor="delivery-city">Choose your city</label><select id="delivery-city" className="min-h-10 border border-[#d8d0c2] bg-white px-3 text-sm text-[#123f72]" value={city} onChange={event => setCity(event.target.value)}><option value="">Choose your city</option>{Object.keys(ESTIMATES).map(item => <option key={item} value={item}>{item}</option>)}</select>{city ? <p className="text-sm font-bold text-[#123f72]">Estimated arrival: <span className="text-[#bb492d]">{ESTIMATES[city]}</span></p> : <p className="text-xs text-slate-500">Standard delivery is PKR 250 across Pakistan.</p>}</div><p className="mt-2 text-[11px] leading-5 text-slate-500">Estimate only. The final delivery timing is confirmed at checkout or by our WhatsApp team.</p></div>;
}
