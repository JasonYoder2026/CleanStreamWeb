import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const getSupabaseClient = (): SupabaseClient => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase env vars");
    }

    return createClient(supabaseUrl, supabaseKey);
};