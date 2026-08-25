import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  customerCookie,
  getAuthenticatedCustomer,
  getCustomerDataAdmin,
} from "../_core/customerData";
import { publicProcedure, router } from "../_core/trpc";

const customerInput = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

async function requireCustomer(cookieHeader?: string) {
  const user = await getAuthenticatedCustomer(cookieHeader);
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Please sign in to continue." });
  return user;
}

export const customerRouter = router({
  register: publicProcedure
    .input(customerInput.extend({ fullName: z.string().trim().min(2).max(120), referralCode: z.string().trim().max(32).optional() }))
    .mutation(async ({ input, ctx }) => {
      const admin = getCustomerDataAdmin();
      const { data, error } = await admin.auth.signUp({
        email: input.email.toLowerCase(),
        password: input.password,
        options: { data: { full_name: input.fullName, referred_by_code: input.referralCode?.toUpperCase() } },
      });
      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      if (data.session) {
        ctx.res.cookie("alraheem_customer_access", data.session.access_token, customerCookie(data.session.expires_in ?? 3600));
        ctx.res.cookie("alraheem_customer_refresh", data.session.refresh_token, customerCookie(60 * 60 * 24 * 30));
      }
      return { requiresEmailConfirmation: !data.session, customerId: data.user?.id ?? null };
    }),
  login: publicProcedure.input(customerInput).mutation(async ({ input, ctx }) => {
    const admin = getCustomerDataAdmin();
    const { data, error } = await admin.auth.signInWithPassword({ email: input.email.toLowerCase(), password: input.password });
    if (error || !data.session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
    ctx.res.cookie("alraheem_customer_access", data.session.access_token, customerCookie(data.session.expires_in ?? 3600));
    ctx.res.cookie("alraheem_customer_refresh", data.session.refresh_token, customerCookie(60 * 60 * 24 * 30));
    return { success: true };
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie("alraheem_customer_access", customerCookie(-1));
    ctx.res.clearCookie("alraheem_customer_refresh", customerCookie(-1));
    return { success: true };
  }),
  me: publicProcedure.query(async ({ ctx }) => {
    const user = await getAuthenticatedCustomer(ctx.req.headers.cookie);
    if (!user) return null;
    const admin = getCustomerDataAdmin();
    const { data: profile } = await admin.from("customer_profiles").select("id,email,full_name,phone,city,address_line,preferences,referral_code,referred_by,created_at").eq("id", user.id).maybeSingle();
    const { data: orders } = await admin.from("shopify_orders").select("id,order_number,currency,total_amount,financial_status,paid_at,created_at").eq("customer_id", user.id).order("created_at", { ascending: false });
    const { data: rewards } = await admin.from("referral_rewards").select("discount_code,discount_percent,status,created_at").eq("referrer_id", user.id).order("created_at", { ascending: false });
    return { profile, orders: orders ?? [], rewards: rewards ?? [] };
  }),
  updatePreferences: publicProcedure
    .input(z.object({ fullName: z.string().trim().min(2).max(120), phone: z.string().trim().max(32).optional(), city: z.string().trim().max(80).optional(), addressLine: z.string().trim().max(300).optional(), preferences: z.record(z.string(), z.string()).default({}) }))
    .mutation(async ({ input, ctx }) => {
      const user = await requireCustomer(ctx.req.headers.cookie);
      const admin = getCustomerDataAdmin();
      const { error } = await admin.from("customer_profiles").update({ full_name: input.fullName, phone: input.phone || null, city: input.city || null, address_line: input.addressLine || null, preferences: input.preferences, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your preferences could not be saved." });
      return { success: true };
    }),
  reviews: publicProcedure.input(z.object({ productId: z.string().min(1).max(80) })).query(async ({ input }) => {
    const admin = getCustomerDataAdmin();
    const { data, error } = await admin.from("product_reviews").select("id,rating,body,created_at,customer_profiles(full_name)").eq("shopify_product_id", input.productId).eq("status", "published").eq("verified_purchase", true).order("created_at", { ascending: false });
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Reviews could not be loaded." });
    return data ?? [];
  }),
  submitReview: publicProcedure.input(z.object({ productId: z.string().min(1).max(80), rating: z.number().int().min(1).max(5), body: z.string().trim().min(10).max(1200) })).mutation(async ({ input, ctx }) => {
    const user = await requireCustomer(ctx.req.headers.cookie);
    const admin = getCustomerDataAdmin();
    const { data: purchased } = await admin.from("shopify_order_items").select("id,shopify_orders!inner(customer_id)").eq("shopify_product_id", input.productId).eq("shopify_orders.customer_id", user.id).limit(1);
    if (!purchased?.length) throw new TRPCError({ code: "FORBIDDEN", message: "A verified purchase of this product is required before reviewing it." });
    const { error } = await admin.from("product_reviews").upsert({ customer_id: user.id, shopify_product_id: input.productId, rating: input.rating, body: input.body, verified_purchase: true, updated_at: new Date().toISOString() }, { onConflict: "customer_id,shopify_product_id" });
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your verified review could not be saved." });
    return { success: true };
  }),
});
