import { supabase } from "../../lib/supabase";
import { compressImage } from "../../lib/image";
import type { Ingredient } from "./format";

export type { Ingredient } from "./format";
export { formatIngredient } from "./format";

const BUCKET = "recipe-photos";

export type Recipe = {
  id: string;
  owner_id: string;
  title: string;
  ingredients: Ingredient[];
  steps: string;
  photo_path: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  created_at: string;
  group_ids: string[];
  author: string;
};
export type RecipeInput = Pick<
  Recipe,
  | "title"
  | "ingredients"
  | "steps"
  | "group_ids"
  | "servings"
  | "prep_minutes"
  | "cook_minutes"
>;
export type PhotoChange = { file: File | null; remove: boolean };

type RecipeRow = Omit<Recipe, "group_ids" | "author"> & {
  recipe_groups: { group_id: string }[];
  profiles: { display_name: string } | null;
};
const SELECT = "*, recipe_groups(group_id), profiles(display_name)";
const toRecipe = ({ recipe_groups, profiles, ...r }: RecipeRow): Recipe => ({
  ...r,
  group_ids: recipe_groups.map((g) => g.group_id),
  author: profiles?.display_name ?? "Un membre",
});

export const photoUrl = (path: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const removePhoto = (path: string) =>
  supabase.storage.from(BUCKET).remove([path]);

export async function listRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as RecipeRow[]).map(toRecipe);
}

export async function getRecipe(id: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from("recipes")
    .select(SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return toRecipe(data as unknown as RecipeRow);
}

async function uploadPhoto(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = `${user!.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await compressImage(file), {
      contentType: "image/jpeg",
      cacheControl: "31536000",
    });
  if (error) throw error;
  return path;
}

export async function setRecipeGroups(recipeId: string, groupIds: string[]) {
  const removal = supabase
    .from("recipe_groups")
    .delete()
    .eq("recipe_id", recipeId);
  const { error: delError } = groupIds.length
    ? await removal.not("group_id", "in", `(${groupIds.join(",")})`)
    : await removal;
  if (delError) throw delError;
  if (groupIds.length) {
    const { error } = await supabase.from("recipe_groups").upsert(
      groupIds.map((group_id) => ({ recipe_id: recipeId, group_id })),
      { onConflict: "recipe_id,group_id", ignoreDuplicates: true },
    );
    if (error) throw error;
  }
}

export async function createRecipe(
  { group_ids, ...recipe }: RecipeInput,
  photo: File | null,
): Promise<string> {
  const photo_path = photo ? await uploadPhoto(photo) : null;
  const { data, error } = await supabase
    .from("recipes")
    .insert({ ...recipe, photo_path })
    .select("id")
    .single();
  if (error) {
    if (photo_path) await removePhoto(photo_path);
    throw error;
  }
  try {
    await setRecipeGroups(data.id, group_ids);
  } catch (e) {
    await supabase.from("recipes").delete().eq("id", data.id);
    if (photo_path) await removePhoto(photo_path);
    throw e;
  }
  return data.id;
}

export async function updateRecipe(
  recipe: Recipe,
  { group_ids, ...input }: RecipeInput,
  photo: PhotoChange,
) {
  let photo_path = recipe.photo_path;
  let uploaded: string | null = null;
  if (photo.file) photo_path = uploaded = await uploadPhoto(photo.file);
  else if (photo.remove) photo_path = null;

  const { error } = await supabase
    .from("recipes")
    .update({ ...input, photo_path })
    .eq("id", recipe.id);
  if (error) {
    if (uploaded) await removePhoto(uploaded);
    throw error;
  }
  await setRecipeGroups(recipe.id, group_ids);
  if (recipe.photo_path && recipe.photo_path !== photo_path)
    await removePhoto(recipe.photo_path);
}

export async function deleteRecipe(recipe: Recipe) {
  const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
  if (error) throw error;
  if (recipe.photo_path) await removePhoto(recipe.photo_path);
}
