-- Kamen: Phase 1 schema.
-- All tables have row level security on and no policies, so only the server
-- (service role key) can read or write them. Guests never talk to the database directly.

create extension if not exists pgcrypto;

-- One booking on Airbnb, Booking.com or direct.
create table stays (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('airbnb', 'booking', 'direct')),
  platform_ref text,
  guest_name text,
  check_in date not null,
  check_out date not null check (check_out > check_in),
  guest_count int check (guest_count > 0),
  -- Secret token for the guest's pre-check-in link (/checkin/<token>)
  checkin_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now()
);

-- Passport details for the mandatory eVisitor registration.
-- Legal purpose only: never joined to marketing data or used for emails.
create table registrations (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  nationality text not null,
  document_type text not null check (document_type in ('passport', 'id_card')),
  document_number text not null,
  created_at timestamptz not null default now()
);

-- E-signature of the rental policy and damage price list.
create table policy_signatures (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays (id) on delete cascade,
  policy_version text not null,
  signed_name text not null,
  ip_address text,
  user_agent text,
  signed_at timestamptz not null default now()
);

-- Damage card hold. Stripe stores the card; we keep only references.
create table card_holds (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays (id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'eur',
  status text not null default 'pending'
    check (status in ('pending', 'held', 'captured', 'partially_captured', 'released', 'failed')),
  updated_at timestamptz not null default now()
);

-- Timestamped turnover photos for damage evidence. Files live in Supabase Storage.
create table turnover_photos (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays (id) on delete cascade,
  room text not null,
  storage_path text not null,
  taken_at timestamptz not null default now(),
  note text
);

-- Guests who opted in from the NFC/QR tag or the pre-check-in flow.
create table guest_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  language text,
  source text not null check (source in ('tag', 'tv', 'checkin')),
  stay_id uuid references stays (id) on delete set null,
  -- Exact consent wording the guest agreed to, and when (GDPR proof of consent)
  consent_text text not null,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  -- Host-only: guests we would like back. Only these ever get a rebooking code.
  want_back boolean,
  host_notes text,
  created_at timestamptz not null default now()
);

-- Private, single-use rebooking codes for guests marked want_back.
create table offer_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  contact_id uuid not null references guest_contacts (id) on delete cascade,
  percent_off int not null check (percent_off between 1 and 50),
  valid_from date not null,
  valid_until date not null check (valid_until >= valid_from),
  -- Months the code can be used for, e.g. {10,11,12,1,2,3,4,5}; peak months left out
  valid_months int[] not null default '{10,11,12,1,2,3,4,5}',
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table stays enable row level security;
alter table registrations enable row level security;
alter table policy_signatures enable row level security;
alter table card_holds enable row level security;
alter table turnover_photos enable row level security;
alter table guest_contacts enable row level security;
alter table offer_codes enable row level security;

create index on stays (check_in);
create index on registrations (stay_id);
create index on policy_signatures (stay_id);
create index on card_holds (stay_id);
create index on turnover_photos (stay_id);
