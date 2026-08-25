import { createClient } from "@supabase/supabase-js";

const cookiePairs = (value = "") =>
  Object.fromEntries(value.split(";").map(part => part.trim().split(/=(.*)/, 2)).filter(([key]) => key));

export function customerDataConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getCustomerDataAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Customer accounts are being configured. Please try again shortly.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getCustomerAccessToken(cookieHeader?: string) {
  return cookiePairs(cookieHeader).alraheem_customer_access ?? null;
}

export function getCustomerRefreshToken(cookieHeader?: string) {
  return cookiePairs(cookieHeader).alraheem_customer_refresh ?? null;
}

export async function getAuthenticatedCustomer(cookieHeader?: string) {
  const accessToken = getCustomerAccessToken(cookieHeader);
  if (!accessToken) return null;
  const admin = getCustomerDataAdmin();
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

export const customerCookie = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
  maxAge: maxAgeSeconds * 1000,
});
