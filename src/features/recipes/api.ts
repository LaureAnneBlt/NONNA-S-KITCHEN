import { supabase } from '../../lib/supabase';
import { compressImage } from '../../lib/image';

const BUCKET = 'recipe-photos';

export type Ingredient = { name: string; quantity: string; unit: string };
export type Recipe = {
  id: string; owner_id: string; group_id: string | null;
  title: string; ingredients: Ingredient[]; steps: string;
  photo_path: string | null; created_at: string;
};
export type NewRecipe = Pick<Recipe, 'title' | 'ingredients' | 'steps' | 'group_id'> & { photo: File | null };

export const photoUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export async function listRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function uploadPhoto(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  const path = `${user!.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await compressImage(file), { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  return path;
}

export async function createRecipe({ photo, ...recipe }: NewRecipe) {
  const photo_path = photo ? await uploadPhoto(photo) : null;
  const { error } = await supabase.from('recipes').insert({ ...recipe, photo_path });
  if (error) {
    if (photo_path) await supabase.storage.from(BUCKET).remove([photo_path]);
    throw error;
  }
}

export async function deleteRecipe(recipe: Recipe) {
  const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
  if (error) throw error;
  if (recipe.photo_path) await supabase.storage.from(BUCKET).remove([recipe.photo_path]);
}
