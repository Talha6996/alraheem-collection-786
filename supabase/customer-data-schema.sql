-- ALRAHEEM COLLECTION 786: private customer and referral data.
-- Apply this script in Supabase SQL Editor once its dashboard execution issue is resolved.
-- No demo reviews, ratings, purchases, rewards, or customer records are created here.

create extension if not exists pgcrypto;

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  city text,
  address_line text,
  preferences jsonb not null default '{}'::jsonb,
  referral_code text not null unique,
  referred_by uuid references public.customer_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopify_orders (
  id uuid primary key default gen_random_uuid(),
  shopify_order_id text not null unique,
  customer_id uuid references public.customer_profiles(id) on delete set null,
  customer_email text not null,
  order_number text,
  currency text not null default 'PKR',
  total_amount numeric(12,2),
  financial_status text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.shopify_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shopify_orders(id) on delete cascade,
  shopify_line_item_id text not null,
  shopify_product_id text not null,
  product_title text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2),
  unique(order_id, shopify_line_item_id)
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  shopify_product_id text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 10 and 1200),
  verified_purchase boolean not null default false,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(customer_id, shopify_product_id)
);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.customer_profiles(id) on delete cascade,
  referred_customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  qualifying_order_id uuid not null unique references public.shopify_orders(id) on delete cascade,
  shopify_discount_id text,
  discount_code text not null unique,
  discount_percent numeric(5,2) not null default 17 check (discount_percent > 0 and discount_percent <= 100),
  status text not null default 'issued' check (status in ('issued', 'used', 'expired')),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create table if not exists public.processed_shopify_webhooks (
  webhook_id text primary key,
  topic text not null,
  processed_at timestamptz not null default now()
);

create index if not exists shopify_orders_customer_id_idx on public.shopify_orders(customer_id);
create index if not exists shopify_orders_customer_email_idx on public.shopify_orders(customer_email);
create index if not exists shopify_order_items_product_idx on public.shopify_order_items(shopify_product_id);
create index if not exists product_reviews_product_idx on public.product_reviews(shopify_product_id, status, created_at desc);
create index if not exists referral_rewards_referrer_idx on public.referral_rewards(referrer_id, created_at desc);

alter table public.customer_profiles enable row level security;
alter table public.shopify_orders enable row level security;
alter table public.shopify_order_items enable row level security;
alter table public.product_reviews enable row level security;
alter table public.referral_rewards enable row level security;
alter table public.processed_shopify_webhooks enable row level security;

create policy "customers read own profile" on public.customer_profiles for select using (auth.uid() = id);
create policy "customers update own profile" on public.customer_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "customers read own orders" on public.shopify_orders for select using (auth.uid() = customer_id);
create policy "customers read own order items" on public.shopify_order_items for select using (
  exists (select 1 from public.shopify_orders o where o.id = order_id and o.customer_id = auth.uid())
);
create policy "public reads published verified reviews" on public.product_reviews for select using (status = 'published' and verified_purchase = true);
create policy "customers read own rewards" on public.referral_rewards for select using (auth.uid() = referrer_id);

create or replace function public.create_customer_profile()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  supplied_code text;
  referrer uuid;
begin
  supplied_code := nullif(new.raw_user_meta_data ->> 'referred_by_code', '');
  select id into referrer from public.customer_profiles where referral_code = supplied_code;
  insert into public.customer_profiles (id, email, full_name, referral_code, referred_by)
  values (
    new.id,
    lower(new.email),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    upper(substr(replace(new.id::text, '-', ''), 1, 8)),
    referrer
  );
  return new;
end;
$$;

drop trigger if exists on_customer_auth_created on auth.users;
create trigger on_customer_auth_created
after insert on auth.users
for each row execute procedure public.create_customer_profile();
