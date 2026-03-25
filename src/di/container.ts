import { AuthRepository } from "../supabase/repositories/AuthRepository";
import type {AuthService} from "../interfaces/AuthService";
import supabase from '../supabase/client';
import { RefundRepository } from "../supabase/repositories/RefundRepository";
import type { RefundService } from "../interfaces/RefundService";

const authRepository:AuthService = new AuthRepository(supabase);
const refundRepository: RefundService = new RefundRepository(supabase);

export const useAuth = () => authRepository;
export const useRefunds = () => refundRepository;