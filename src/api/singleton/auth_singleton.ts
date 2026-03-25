// api/models/auth_singleton.ts
import supabase from "../supabase-client";
import { SupabaseAuthService } from "../models/supabase_auth_service";

export const authenticator = new SupabaseAuthService(supabase);