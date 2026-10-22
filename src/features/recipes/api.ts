import { supabase } from '../../lib/supabase';

export type Recipe = {
  id: string; owner_id: string; group_id: string | null;
  title: string; ingredients: string; steps: string; created_at: string;
};
export type NewRecipe = Pick<Recipe, 'title' | 'ingredients' | 'steps' | 'group_id'>;

export async function listRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createRecipe(recipe: NewRecipe) {
  const { error } = await supabase.from('recipes').insert(recipe);
  if (error) throw error;
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}
