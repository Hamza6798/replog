-- REPLOG initial schema. Run once in the Supabase SQL Editor.

-- Keeps updated_at current on every update
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 2 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- Create a profile automatically when someone signs up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 60));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- exercises (public, read-only) ----------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,            -- the "0001" style ID shown in the app
  name text not null,
  category text not null,
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}',
  equipment text not null,
  difficulty text not null check (difficulty in ('Beginner','Intermediate','Advanced')),
  type text not null,
  instructions text[] not null default '{}',
  mistakes text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------- workouts ----------
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null check (position >= 0),
  sets integer not null default 3 check (sets between 1 and 20),
  reps text not null default '8-12',
  target_weight numeric check (target_weight is null or target_weight >= 0),
  rest_seconds integer not null default 60 check (rest_seconds between 0 and 900),
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- programs ----------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text,
  template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  position integer not null check (position >= 0),
  name text not null,
  weekday smallint check (weekday between 0 and 6),   -- 0 = Monday
  created_at timestamptz not null default now()
);
create table public.program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references public.program_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null check (position >= 0),
  sets integer not null default 3 check (sets between 1 and 20),
  reps text not null default '8-12',
  rest_seconds integer not null default 60 check (rest_seconds between 0 and 900),
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- collections ----------
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.collection_exercises (
  collection_id uuid not null references public.collections(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, exercise_id)
);

create trigger workouts_updated before update on public.workouts for each row execute function public.set_updated_at();
create trigger programs_updated before update on public.programs for each row execute function public.set_updated_at();
create trigger collections_updated before update on public.collections for each row execute function public.set_updated_at();

-- Indexes on foreign keys
create index on public.workouts (user_id);
create index on public.workout_exercises (workout_id);
create index on public.workout_exercises (exercise_id);
create index on public.programs (user_id);
create index on public.program_days (program_id);
create index on public.program_exercises (program_day_id);
create index on public.program_exercises (exercise_id);
create index on public.collections (user_id);
create index on public.collection_exercises (exercise_id);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.programs enable row level security;
alter table public.program_days enable row level security;
alter table public.program_exercises enable row level security;
alter table public.collections enable row level security;
alter table public.collection_exercises enable row level security;

-- Exercises: anyone can read, nobody can write from the app
create policy "exercises are public" on public.exercises for select to anon, authenticated using (true);

-- Profiles: only your own row
create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Top-level user-owned tables
create policy "own workouts" on public.workouts for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own programs" on public.programs for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own collections" on public.collections for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Child tables: allowed only if the parent belongs to you
create policy "own workout exercises" on public.workout_exercises for all to authenticated
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid())))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid())));

create policy "own program days" on public.program_days for all to authenticated
  using (exists (select 1 from public.programs p where p.id = program_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.programs p where p.id = program_id and p.user_id = (select auth.uid())));

create policy "own program exercises" on public.program_exercises for all to authenticated
  using (exists (select 1 from public.program_days d join public.programs p on p.id = d.program_id
                 where d.id = program_day_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.program_days d join public.programs p on p.id = d.program_id
                 where d.id = program_day_id and p.user_id = (select auth.uid())));

create policy "own collection exercises" on public.collection_exercises for all to authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = (select auth.uid())));
