create table favorites (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  recipe_id uuid not null references recipes on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table favorites enable row level security;
create policy "voir mes favoris" on favorites for select
  using (user_id = auth.uid());
create policy "ajouter un favori parmi les recettes que je vois" on favorites for insert
  with check (user_id = auth.uid()
    and exists (select 1 from recipes where recipes.id = recipe_id));
create policy "retirer un favori" on favorites for delete
  using (user_id = auth.uid());
