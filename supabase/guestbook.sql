-- ─────────────────────────────────────────────────────────────
--  haya.exe guestbook: Supabase database setup
--
--  Run this once in your Supabase project's SQL Editor.
--  It creates the guestbook table, lets visitors read and sign
--  it (never edit or delete), and adds a small spam guard.
--  Delete entries from the Table Editor to moderate.
--
--  If you change the name or message limits here, update
--  guestbook.nameMax / messageMax in src/data/config.ts too.
-- ─────────────────────────────────────────────────────────────

-- the guestbook table
create table public.guestbook (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 32),
  message text not null check (char_length(message) between 1 and 500)
);

-- turn on row level security: nothing is allowed unless a policy says so
alter table public.guestbook enable row level security;

-- visitors can read every entry
create policy "anyone can read the guestbook"
  on public.guestbook for select
  to anon, authenticated
  using (true);

-- visitors can add entries
create policy "anyone can sign the guestbook"
  on public.guestbook for insert
  to anon, authenticated
  with check (true);

-- visitors may only read, and only fill in name + message when signing
-- (id and the date are set by the database, so nobody can fake them)
revoke all on public.guestbook from anon, authenticated;
grant select on public.guestbook to anon, authenticated;
grant insert (name, message) on public.guestbook to anon, authenticated;

-- tidy up spaces, and slow down floods: max 10 new entries per minute overall
create function public.guestbook_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := btrim(new.name);
  new.message := btrim(new.message);
  if (select count(*) from public.guestbook
      where created_at > now() - interval '1 minute') >= 10 then
    raise exception 'the guestbook is busy, try again in a minute';
  end if;
  return new;
end;
$$;

create trigger guestbook_before_insert
  before insert on public.guestbook
  for each row execute function public.guestbook_before_insert();