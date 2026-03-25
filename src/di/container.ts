import { SupabaseAuthRepository } from "../supabase/repositories/AuthRepository";
import type {AuthService} from "../interfaces/auth_service";
import supabase from '../supabase/client';

const authRepository:AuthService = new SupabaseAuthRepository(supabase);

export const useAuth = () => authRepository;