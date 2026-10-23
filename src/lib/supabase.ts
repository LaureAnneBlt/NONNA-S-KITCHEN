import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key)
  throw new Error("Variables VITE_SUPABASE_* manquantes (voir .env.example)");

const hash = new URLSearchParams(window.location.hash.slice(1));
export const arrivedFromRecoveryLink = hash.get("type") === "recovery";
export const authLinkError = hash.get("error_description");

export const supabase = createClient(url, key);
