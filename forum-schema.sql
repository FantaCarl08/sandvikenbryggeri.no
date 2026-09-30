create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'Anonym'
    check (char_length(btrim(author)) between 1 and 40),
  body text not null
    check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.forum_posts enable row level security;

revoke all on table public.forum_posts from anon;
grant select on table public.forum_posts to anon;
grant insert (author, body) on table public.forum_posts to anon;

drop policy if exists "Anyone can read forum posts" on public.forum_posts;
create policy "Anyone can read forum posts"
  on public.forum_posts for select
  to anon
  using (true);

drop policy if exists "Anyone can publish forum posts" on public.forum_posts;
create policy "Anyone can publish forum posts"
  on public.forum_posts for insert
  to anon
  with check (
    char_length(btrim(author)) between 1 and 40
    and char_length(btrim(body)) between 1 and 1000
  );

grant usage on schema public to anon;
grant select, insert on table public.forum_posts to anon;
