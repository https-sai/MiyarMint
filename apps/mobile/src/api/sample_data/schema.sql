create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('student', 'educator', 'admin')) not null default 'student',
  display_name text,
  push_token text,
  created_at timestamptz default now()
);

create table classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text unique not null,
  educator_id uuid references profiles(id),
  created_at timestamptz default now()
);

create table classroom_members (
  classroom_id uuid references classrooms(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (classroom_id, student_id)
);

create table portfolios (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  cash_balance numeric not null default 100000,
  created_at timestamptz default now()
);

create table halal_stock_list (
  ticker text primary key,
  company_name text,
  status text check (status in ('compliant', 'non_compliant', 'under_review')) not null,
  last_screened_at timestamptz
);

create table trades (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios(id) on delete cascade,
  ticker text references halal_stock_list(ticker),
  side text check (side in ('buy', 'sell')) not null,
  quantity numeric not null,
  price numeric not null,
  executed_at timestamptz default now()
);

-- Run once against an existing project:
-- alter table profiles add column if not exists push_token text;
