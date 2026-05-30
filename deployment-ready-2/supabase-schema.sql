create table if not exists events (
  id bigserial primary key,
  name text not null,
  description text,
  date_time timestamptz,
  venue text,
  max_teams integer default 0,
  team_size integer default 4,
  fees numeric default 0,
  is_paid boolean default false,
  registration_deadline timestamptz,
  category text,
  status text default 'Active',
  upi_id text,
  payment_note text,
  created_at timestamptz default now()
);

create table if not exists registrations (
  id bigserial primary key,
  event_id bigint references events(id) on delete cascade,
  team_name text not null,
  team_members jsonb default '[]'::jsonb,
  payment_status text default 'pending',
  verification_status text default 'pending',
  transaction_id text,
  upi_reference text,
  payment_proof_path text,
  captain_file_path text,
  registration_id text,
  rejection_reason text,
  verified_at timestamptz,
  created_at timestamptz default now()
);
