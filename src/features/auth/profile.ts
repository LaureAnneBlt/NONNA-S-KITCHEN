import { supabase } from "../../lib/supabase";

export async function getDisplayName(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data.display_name;
}

export async function setDisplayName(userId: string, name: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name.trim() })
    .eq("id", userId);
  if (error) throw error;
}
