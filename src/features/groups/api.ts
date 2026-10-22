import { supabase } from '../../lib/supabase';

export type Group = { id: string; name: string; invite_code: string };

export async function listGroups(): Promise<Group[]> {
  const { data, error } = await supabase.from('groups').select('id, name, invite_code').order('name');
  if (error) throw error;
  return data;
}

export async function createGroup(name: string) {
  const { error } = await supabase.rpc('create_group', { group_name: name });
  if (error) throw error;
}

export async function joinGroup(code: string) {
  const { error } = await supabase.rpc('join_group', { code: code.trim() });
  if (error) throw error;
}
