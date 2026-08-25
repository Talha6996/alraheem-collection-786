import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export function VerifiedReviews({ productId }: { productId: string }) {
  const utils = trpc.useUtils();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const { data: account } = trpc.customer.me.useQuery(undefined, { retry: false });
  const { data: reviews = [], isLoading } = trpc.customer.reviews.useQuery({ productId });
  const submit = trpc.customer.submitReview.useMutation({
    onSuccess: async () => {
      setBody("");
      await utils.customer.reviews.invalidate({ productId });
      toast.success("Your verified review is now visible.");
    },
    onError: error => toast.error("Your review could not be submitted.", { description: error.message }),
  });

  return <section className="mt-16 border-t border-[#d8d0c2] pt-12" aria-labelledby="verified-reviews-heading">
    <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
      <div><p className="eyebrow"><span />From verified buyers</p><h2 id="verified-reviews-heading" className="font-serif text-4xl text-[#123f72]">Worn. <i>Reviewed.</i></h2><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Reviews appear only after a matching paid order has been verified. We never publish made-up buyer feedback.</p></div>
      <div className="space-y-4">{isLoading ? <p className="text-sm text-slate-500">Loading verified reviews…</p> : reviews.length ? reviews.map(review => {
        const reviewer = Array.isArray(review.customer_profiles) ? review.customer_profiles[0] : review.customer_profiles;
        return <article key={review.id} className="border border-[#d8d0c2] bg-[#fdfbf6] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-1 text-[#bb492d]" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? "currentColor" : "none"} />)}</div><span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#318060]"><CheckCircle2 size={13} /> Verified purchase</span></div><p className="mt-4 text-sm leading-6 text-slate-700">{review.body}</p><p className="mt-4 text-[10px] font-extrabold uppercase tracking-[.11em] text-[#58708a]">{reviewer?.full_name || "Verified buyer"} · {new Date(review.created_at).toLocaleDateString()}</p></article>;
      }) : <p className="border border-dashed border-[#d8d0c2] bg-[#fdfbf6] p-5 text-sm leading-6 text-slate-500">No verified-buyer reviews have been published for this piece yet.</p>}
      {account?.profile ? <form className="border border-[#123f72]/20 bg-[#eef3f7] p-5" onSubmit={event => { event.preventDefault(); submit.mutate({ productId, rating, body }); }}><p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-[#123f72]">Leave a verified review</p><div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" className="p-1 text-[#bb492d]" aria-label={`${value} stars`} onClick={() => setRating(value)}><Star size={19} fill={value <= rating ? "currentColor" : "none"} /></button>)}</div><textarea className="mt-3 min-h-24 w-full border border-[#c5d1dc] bg-white p-3 text-sm outline-none focus:border-[#123f72]" value={body} onChange={event => setBody(event.target.value)} minLength={10} maxLength={1200} placeholder="Share your experience with this piece (minimum 10 characters)." required /><button className="button-primary mt-3" disabled={submit.isPending}>{submit.isPending ? "Submitting…" : "Submit verified review"}</button></form> : <p className="text-sm leading-6 text-slate-500">Already purchased this piece? <Link href="/account" className="font-bold text-[#123f72] underline underline-offset-4">Sign in to leave your verified review.</Link></p>}</div>
    </div>
  </section>;
}
