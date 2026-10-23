create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40)
);

insert into profiles (id, display_name)
select id, left(coalesce(
  nullif(trim(raw_user_meta_data->>'display_name'), ''),
  split_part(email, '@', 1)), 40)
from auth.users
on conflict do nothing;

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, left(coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    split_part(new.email, '@', 1)), 40))
  on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create function shares_group_with(uid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from group_members a join group_members b on a.group_id = b.group_id
    where a.user_id = auth.uid() and b.user_id = uid)
$$;

alter table profiles enable row level security;
create policy "voir mon profil, ceux de mes familles et des auteurs" on profiles for select
  using (id = auth.uid() or shares_group_with(id)
    or exists (select 1 from recipes where recipes.owner_id = profiles.id));
create policy "modifier mon profil" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

alter table recipes add constraint recipes_owner_profile_fkey
  foreign key (owner_id) references profiles on delete cascade;
alter table group_members add constraint group_members_user_profile_fkey
  foreign key (user_id) references profiles on delete cascade;

create policy "renommer ma famille" on groups for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create function leave_group(gid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from recipe_groups rg using recipes r
  where rg.group_id = gid and rg.recipe_id = r.id and r.owner_id = auth.uid();
  delete from group_members where group_id = gid and user_id = auth.uid();
end $$;

alter table recipes
  add column servings smallint check (servings between 1 and 99),
  add column prep_minutes smallint check (prep_minutes between 0 and 1440),
  add column cook_minutes smallint check (cook_minutes between 0 and 1440);
