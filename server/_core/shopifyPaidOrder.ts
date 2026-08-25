import crypto from "node:crypto";
import { getCustomerDataAdmin } from "./customerData";
import { SHOPIFY_API_VERSION } from "./shopify";

type ShopifyPaidLine = { id: number | string; product_id: number | string | null; title?: string; quantity?: number; price?: string };
export type ShopifyPaidOrder = {
  id: number | string;
  name?: string;
  email?: string | null;
  contact_email?: string | null;
  currency?: string;
  total_price?: string;
  financial_status?: string;
  processed_at?: string | null;
  created_at?: string | null;
  line_items?: ShopifyPaidLine[];
};

let cachedAdminToken: { value: string; expiresAt: number } | null = null;

function getLegacyAdminToken() { return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? ""; }
function getClientId() { return process.env.SHOPIFY_CLIENT_ID ?? ""; }
function getClientSecret() { return process.env.SHOPIFY_CLIENT_SECRET ?? ""; }
function getWebhookSecret() { return process.env.SHOPIFY_WEBHOOK_API_SECRET ?? getClientSecret(); }
function getStoreDomain() { return process.env.SHOPIFY_STORE_DOMAIN ?? ""; }

/**
 * Shopify Dev Dashboard apps exchange their client credentials for a short-lived
 * Admin API token. The token is never sent to the storefront browser and is
 * refreshed one minute before Shopify's 24-hour expiry.
 */
export async function getShopifyAdminAccessToken() {
  const legacyToken = getLegacyAdminToken();
  if (legacyToken) return legacyToken;
  if (cachedAdminToken && Date.now() < cachedAdminToken.expiresAt - 60_000) return cachedAdminToken.value;

  const domain = getStoreDomain();
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  if (!domain || !clientId || !clientSecret) throw new Error("Shopify server credentials are incomplete.");

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!response.ok) throw new Error(`Shopify token request failed with HTTP ${response.status}.`);
  const payload = await response.json() as { access_token?: string; expires_in?: number };
  if (!payload.access_token || !payload.expires_in) throw new Error("Shopify token response was incomplete.");
  cachedAdminToken = { value: payload.access_token, expiresAt: Date.now() + payload.expires_in * 1_000 };
  return cachedAdminToken.value;
}

export function resetShopifyAdminTokenCache() {
  cachedAdminToken = null;
}

export function verifyShopifyWebhook(rawBody: Buffer, hmacHeader?: string) {
  const secret = getWebhookSecret();
  if (!secret || !hmacHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  const received = Buffer.from(hmacHeader, "utf8");
  const computed = Buffer.from(expected, "utf8");
  return received.length === computed.length && crypto.timingSafeEqual(received, computed);
}

export const REFERRAL_DISCOUNT_PERCENT = 17;

async function createReferralDiscount(code: string) {
  const domain = getStoreDomain();
  const token = await getShopifyAdminAccessToken();
  if (!domain || !token) throw new Error("Shopify reward configuration is incomplete.");
  const query = `mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode { id }
      userErrors { message field }
    }
  }`;
  const variables = {
    basicCodeDiscount: {
      title: `ALRAHEEM referral reward — ${REFERRAL_DISCOUNT_PERCENT}% off`,
      code,
      startsAt: new Date().toISOString(),
      usageLimit: 1,
      appliesOncePerCustomer: true,
      customerSelection: { all: true },
      customerGets: {
        value: { percentage: REFERRAL_DISCOUNT_PERCENT / 100 },
        items: { all: true },
      },
    },
  };
  const response = await fetch(`https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Shopify reward request failed with HTTP ${response.status}.`);
  const payload = await response.json() as { data?: { discountCodeBasicCreate?: { codeDiscountNode?: { id: string }; userErrors?: Array<{ message: string }> } }; errors?: Array<{ message: string }> };
  const result = payload.data?.discountCodeBasicCreate;
  const failure = payload.errors?.[0]?.message ?? result?.userErrors?.[0]?.message;
  if (failure || !result?.codeDiscountNode?.id) throw new Error(failure ?? "Shopify did not create the referral reward.");
  return result.codeDiscountNode.id;
}

function customerEmail(order: ShopifyPaidOrder) {
  return (order.email || order.contact_email || "").trim().toLowerCase();
}

export async function processShopifyPaidOrder(order: ShopifyPaidOrder, webhookId: string) {
  const email = customerEmail(order);
  const orderId = String(order.id);
  if (!email || !orderId) throw new Error("Paid-order payload does not contain an order id and customer email.");
  const admin = getCustomerDataAdmin();
  const { data: prior } = await admin.from("processed_shopify_webhooks").select("webhook_id").eq("webhook_id", webhookId).maybeSingle();
  if (prior) return { duplicate: true, rewardIssued: false };

  const { data: profile } = await admin.from("customer_profiles").select("id,referred_by").eq("email", email).maybeSingle();
  const { data: storedOrder, error: orderError } = await admin.from("shopify_orders").upsert({
    shopify_order_id: orderId,
    customer_id: profile?.id ?? null,
    customer_email: email,
    order_number: order.name ?? null,
    currency: order.currency || "PKR",
    total_amount: order.total_price ?? null,
    financial_status: order.financial_status || "paid",
    paid_at: order.processed_at || order.created_at || new Date().toISOString(),
  }, { onConflict: "shopify_order_id" }).select("id").single();
  if (orderError || !storedOrder) throw new Error("The paid order could not be recorded.");

  const items = (order.line_items ?? []).filter(item => item.product_id).map(item => ({
    order_id: storedOrder.id,
    shopify_line_item_id: String(item.id),
    shopify_product_id: String(item.product_id),
    product_title: item.title || "Purchased item",
    quantity: Math.max(1, Number(item.quantity) || 1),
    unit_price: item.price ?? null,
  }));
  if (items.length) {
    const { error: itemError } = await admin.from("shopify_order_items").upsert(items, { onConflict: "order_id,shopify_line_item_id" });
    if (itemError) throw new Error("The purchased items could not be recorded.");
  }

  let rewardIssued = false;
  if (profile?.referred_by) {
    const { data: existingReward } = await admin.from("referral_rewards").select("id").eq("referred_customer_id", profile.id).limit(1);
    if (!existingReward?.length) {
      const code = `ARC786-${profile.referred_by.replaceAll("-", "").slice(0, 6).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const discountId = await createReferralDiscount(code);
      const { error: rewardError } = await admin.from("referral_rewards").insert({
        referrer_id: profile.referred_by,
        referred_customer_id: profile.id,
        qualifying_order_id: storedOrder.id,
        shopify_discount_id: discountId,
        discount_code: code,
        discount_percent: REFERRAL_DISCOUNT_PERCENT,
      });
      if (rewardError) throw new Error("The approved referral reward could not be stored.");
      rewardIssued = true;
    }
  }
  await admin.from("processed_shopify_webhooks").insert({ webhook_id: webhookId, topic: "orders/paid" });
  return { duplicate: false, rewardIssued };
}
