import { SupabaseAuthRepository } from "../supabase/repositories/AuthRepository";
import type {AuthService} from "../interfaces/auth_service";

const authRepository:AuthService = new SupabaseAuthRepository();

export const useAuth = () => authRepository;