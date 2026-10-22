-- À coller dans Supabase > SQL Editor > Run
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
create table group_members (
  group_id uuid references groups on delete cascade,
  user_id uuid default auth.uid() references auth.users on delete cascade,
  primary key (group_id, user_id)
);
create table recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  group_id uuid references groups on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  ingredients text not null default '',
  steps text not null default '',
  created_at timestamptz not null default now()
);

-- Fonction "security definer" pour éviter la récursion des policies
create function is_member(gid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from group_members where group_id = gid and user_id = auth.uid())
$$;

alter table groups enable row level security;
alter table group_members enable row level security;
alter table recipes enable row level security;

create policy "voir mes familles" on groups for select using (is_member(id));
create policy "voir les membres de mes familles" on group_members for select using (is_member(group_id));
create policy "voir mes recettes et celles de mes familles" on recipes for select
  using (owner_id = auth.uid() or (group_id is not null and is_member(group_id)));
create policy "créer une recette" on recipes for insert
  with check (owner_id = auth.uid() and (group_id is null or is_member(group_id)));
create policy "modifier ma recette" on recipes for update using (owner_id = auth.uid());
create policy "supprimer ma recette" on recipes for delete using (owner_id = auth.uid());

create function create_group(group_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  insert into groups (name) values (group_name) returning id into gid;
  insert into group_members (group_id) values (gid);
  return gid;
end $$;

create function join_group(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  select id into gid from groups where invite_code = code;
  if gid is null then raise exception 'Code invalide'; end if;
  insert into group_members (group_id) values (gid) on conflict do nothing;
  return gid;
end $$;
