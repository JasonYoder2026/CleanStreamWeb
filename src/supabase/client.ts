import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase env vars");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getSupabaseClient = (): SupabaseClient => supabase;