import { supabase } from "../../lib/supabase";

export type Member = { user_id: string; display_name: string };
export type Group = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  members: Member[];
};

type GroupRow = Omit<Group, "members"> & {
  group_members: {
    user_id: string;
    profiles: { display_name: string } | null;
  }[];
};

export async function listGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from("groups")
    .select(
      "id, name, invite_code, owner_id, group_members(user_id, profiles(display_name))",
    )
    .order("name");
  if (error) throw error;
  return (data as unknown as GroupRow[]).map(({ group_members, ...g }) => ({
    ...g,
    members: group_members
      .map((m) => ({
        user_id: m.user_id,
        display_name: m.profiles?.display_name ?? "Un membre",
      }))
      .sort((a, b) => a.display_name.localeCompare(b.display_name, "fr")),
  }));
}

export async function createGroup(name: string) {
  const { error } = await supabase.rpc("create_group", {
    group_name: name.trim(),
  });
  if (error) throw error;
}

export async function joinGroup(code: string) {
  const { error } = await supabase.rpc("join_group", {
    code: code.trim().toLowerCase(),
  });
  if (error) throw error;
}

export async function renameGroup(id: string, name: string) {
  const { error } = await supabase
    .from("groups")
    .update({ name: name.trim() })
    .eq("id", id);
  if (error) throw error;
}

export async function leaveGroup(id: string) {
  const { error } = await supabase.rpc("leave_group", { gid: id });
  if (error) throw error;
}

export const inviteLink = (code: string) =>
  `${location.origin}${location.pathname}#/famiglie?code=${encodeURIComponent(code)}`;
