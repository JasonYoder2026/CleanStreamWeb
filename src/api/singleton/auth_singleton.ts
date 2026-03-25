// api/models/auth_singleton.ts
import supabase from "../supabase-client";
import { SupabaseAuthService } from "../supabase_auth_service";
import type {AuthService} from "../services/auth_service";

export const authenticator:AuthService = new SupabaseAuthService(supabase);