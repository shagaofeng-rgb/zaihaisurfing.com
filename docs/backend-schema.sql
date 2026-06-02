-- ZAIHAI SURFING backend schema blueprint.
-- Current implementation uses a file-backed store for fast local delivery.
-- Use this schema when migrating to Postgres / Neon / Vercel Postgres.

create table admin_users (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'admin',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  parent_id text references product_categories(id),
  description text,
  cover_image text,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  status text not null default 'published',
  updated_at timestamptz not null default now()
);

create table products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category_id text references product_categories(id),
  cover_image text,
  short_description text,
  full_description text,
  key_features jsonb not null default '[]',
  specifications jsonb not null default '[]',
  application_scenarios jsonb not null default '[]',
  price_cents integer not null default 0,
  sale_price_cents integer not null default 0,
  currency text not null default 'USD',
  sku text,
  stock integer not null default 0,
  moq integer not null default 1,
  weight_dimension text,
  shipping_info text,
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  sort_order integer not null default 0,
  show_on_home boolean not null default false,
  allow_cart boolean not null default true,
  allow_direct_order boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table media_assets (
  id text primary key,
  file_name text not null,
  url text not null,
  alt text,
  mime_type text,
  size_bytes integer not null default 0,
  usage jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table product_images (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  media_id text references media_assets(id),
  url text not null,
  alt text,
  sort_order integer not null default 0
);

create table content_posts (
  id text primary key,
  type text not null check (type in ('blog', 'news')),
  slug text not null unique,
  title text not null,
  excerpt text,
  cover_image text,
  category text,
  content text,
  publish_date timestamptz,
  author text,
  source text,
  tags jsonb not null default '[]',
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customers (
  id text primary key,
  name text,
  email text,
  phone text,
  country text,
  company text,
  customer_type text not null default 'Unknown',
  source text,
  first_visit_time timestamptz,
  last_visit_time timestamptz,
  status text not null default 'New Lead',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table carts (
  id text primary key,
  customer_id text references customers(id),
  anonymous_id text,
  session_id text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id text primary key,
  cart_id text not null references carts(id) on delete cascade,
  product_id text not null references products(id),
  quantity integer not null default 1,
  unit_price_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table checkout_sessions (
  id text primary key,
  cart_id text references carts(id),
  customer_id text references customers(id),
  checkout_step text not null default 'Checkout Started',
  contact_captured_at timestamptz,
  last_active_time timestamptz not null default now(),
  source_page text,
  traffic_source text,
  status text not null default 'Checkout Started',
  created_at timestamptz not null default now()
);

create table orders (
  id text primary key,
  order_number text not null unique,
  customer_id text references customers(id),
  customer_name text,
  customer_email text,
  customer_phone text,
  country text,
  company_name text,
  total_amount_cents integer not null default 0,
  currency text not null default 'USD',
  payment_status text not null default 'Unpaid',
  order_status text not null default 'Pending',
  shipping_status text not null default 'Pending',
  payment_method text,
  payment_transaction_id text,
  customer_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id),
  product_name text not null,
  quantity integer not null,
  unit_price_cents integer not null
);

create table payments (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  provider text not null,
  transaction_id text,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'Payment Started',
  failure_reason text,
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id text primary key,
  customer_id text references customers(id),
  name text,
  email text,
  phone text,
  country text,
  company text,
  interested_products jsonb not null default '[]',
  cart_items jsonb not null default '[]',
  checkout_step text,
  source_page text,
  traffic_source text,
  status text not null default 'New Lead',
  notes text,
  last_active_time timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table inquiries (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  company text,
  country text,
  product_requirement text,
  message text,
  source_page text,
  created_at timestamptz not null default now()
);

create table analytics_events (
  id text primary key,
  event_type text not null,
  user_id text,
  anonymous_id text,
  session_id text,
  page_url text,
  referrer text,
  product_id text,
  category_id text,
  device_type text,
  browser text,
  country text,
  region text,
  ip_hash text,
  user_agent text,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table password_reset_tokens (
  id text primary key,
  admin_user_id text not null references admin_users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_products_status_sort on products(status, sort_order);
create index idx_posts_type_status_date on content_posts(type, status, publish_date desc);
create index idx_orders_created_status on orders(created_at desc, order_status, payment_status);
create index idx_customers_email_phone on customers(email, phone);
create index idx_leads_status_last_active on leads(status, last_active_time desc);
create index idx_analytics_event_created on analytics_events(event_type, created_at desc);
create index idx_analytics_session on analytics_events(session_id, anonymous_id);
