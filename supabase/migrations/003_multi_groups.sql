create table recipe_groups (
  recipe_id uuid not null references recipes on delete cascade,
  group_id uuid not null references groups on delete cascade,
  primary key (recipe_id, group_id)
);
create index recipe_groups_group_idx on recipe_groups (group_id);

insert into recipe_groups (recipe_id, group_id)
select id, group_id from recipes where group_id is not null;

create function owns_recipe(rid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from recipes where id = rid and owner_id = auth.uid())
$$;
create function recipe_in_my_group(rid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from recipe_groups rg join group_members gm on gm.group_id = rg.group_id
    where rg.recipe_id = rid and gm.user_id = auth.uid())
$$;

alter table recipe_groups enable row level security;

drop policy "voir mes recettes et celles de mes familles" on recipes;
drop policy "créer une recette" on recipes;
create policy "voir mes recettes et celles de mes familles" on recipes for select
  using (owner_id = auth.uid() or recipe_in_my_group(id));
create policy "créer une recette" on recipes for insert with check (owner_id = auth.uid());

create policy "voir les partages" on recipe_groups for select
  using (is_member(group_id) or owns_recipe(recipe_id));
create policy "partager ma recette avec mes familles" on recipe_groups for insert
  with check (owns_recipe(recipe_id) and is_member(group_id));
create policy "retirer un partage" on recipe_groups for delete using (owns_recipe(recipe_id));

alter table recipes drop column group_id;
