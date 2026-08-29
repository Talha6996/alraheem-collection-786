import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";

const STARTER: Message = { role: "assistant", content: "Welcome to ALRAHEEM COLLECTION 786. I can help you browse categories, explain delivery, or guide you to WhatsApp ordering." };

export function StoreGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const guide = trpc.guide.ask.useMutation({
    onSuccess: ({ answer, category, products }) => setMessages(current => [...current, { role: "assistant", content: answer, category, products }]),
    onError: () => setMessages(current => [...current, { role: "assistant", content: "I’m unable to answer that just now. Please message our team on WhatsApp for help." }]),
  });

  const send = (message: string) => {
    const history = messages
      .filter(item => item.role !== "system")
      .slice(-6)
      .map(item => ({ role: item.role === "assistant" ? "assistant" as const : "user" as const, content: item.content }));
    setMessages(current => [...current, { role: "user", content: message }]);
    guide.mutate({ message, history });
  };

  return <div className="fixed bottom-5 left-5 z-40"><button type="button" onClick={() => setOpen(true)} aria-label="Open store guide" className={`inline-flex min-h-12 items-center gap-2 rounded-full bg-[#123f72] px-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#fffdf9] shadow-lg shadow-[#123f72]/25 transition hover:-translate-y-0.5 ${open ? "hidden" : ""}`}><MessageCircle size={18} /> Store guide</button>{open ? <section className="absolute bottom-0 left-0 flex w-[min(92vw,390px)] flex-col overflow-hidden border border-[#d8d0c2] bg-[#fffdf9] shadow-2xl"><header className="flex items-center justify-between bg-[#123f72] px-4 py-3 text-[#fffdf9]"><div><p className="text-sm font-bold">Store guide</p><p className="text-[10px] text-[#cbd6e2]">Quick help while you browse</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close store guide" className="rounded-full p-2 hover:bg-white/10"><X size={18} /></button></header><AIChatBox messages={messages} onSendMessage={send} isLoading={guide.isPending} height="470px" className="rounded-none border-0 shadow-none" placeholder="Ask about delivery, products, or ordering" suggestedPrompts={["How does delivery work?", "How can I order on WhatsApp?", "Show me jewellery categories"]} /></section> : null}</div>;
}
