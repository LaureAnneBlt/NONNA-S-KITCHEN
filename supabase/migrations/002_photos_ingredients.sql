
alter table recipes add column ingredients_json jsonb not null default '[]';
update recipes set ingredients_json = coalesce((
  select jsonb_agg(jsonb_build_object('name', l, 'quantity', '', 'unit', ''))
  from unnest(string_to_array(recipes.ingredients, E'\n')) as l where trim(l) <> ''
), '[]'::jsonb);
alter table recipes drop column ingredients;
alter table recipes rename column ingredients_json to ingredients;

alter table recipes add column photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-photos', 'recipe-photos', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

create policy "envoyer une photo dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "supprimer ses photos" on storage.objects for delete to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
