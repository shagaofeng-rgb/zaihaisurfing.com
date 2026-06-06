-- ZAIHAI customer account and order visibility migration draft.
-- Apply through the production database migration tool, not by editing data manually.

create table if not exists customer_users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  name text not null,
  first_name text,
  last_name text,
  country text,
  email_verified_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id text primary key,
  user_id text not null references customer_users(id) on delete cascade,
  token_hash text not null unique,
  token_type text not null default 'password_reset',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table orders add column if not exists user_id text references customer_users(id);
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists tracking_url text;
alter table orders add column if not exists estimated_delivery_at timestamptz;
alter table orders add column if not exists customer_visible_note text;

create unique index if not exists idx_orders_order_no_unique on orders(order_no);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_customer_email on orders(lower(customer_email));

alter table payments add column if not exists paid_at timestamptz;
create unique index if not exists idx_payments_transaction_id_unique
  on payments(transaction_id)
  where transaction_id is not null and transaction_id <> '';

alter table shipments add column if not exists tracking_url text;
alter table shipments add column if not exists estimated_delivery_at timestamptz;
alter table shipments add column if not exists customer_visible_note text;
alter table shipments add column if not exists internal_note text;
create index if not exists idx_shipments_order_id on shipments(order_id);

-- Rollback guide:
-- 1. Disable account routes or deploy the previous commit.
-- 2. Drop the indexes added above if needed.
-- 3. Keep customer/order columns until data export is complete; dropping them may lose customer bindings.
