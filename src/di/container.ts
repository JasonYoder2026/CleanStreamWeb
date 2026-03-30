import { AuthRepository } from "../supabase/repositories/AuthRepository";
import type {AuthService} from "../interfaces/AuthService";
import supabase from '../supabase/client';
import { RefundRepository } from "../supabase/repositories/RefundRepository";
import type { RefundService } from "../interfaces/RefundService";
import type { FunctionService } from "../interfaces/FunctionService";
import { EdgeFunctionRepository } from "../supabase/repositories/EdgeFunctionRepository";

const authRepository:AuthService = new AuthRepository(supabase);
const refundRepository: RefundService = new RefundRepository(supabase);
const functionRepository: FunctionService = new EdgeFunctionRepository(supabase);

export const useAuth = () => authRepository;
export const useRefunds = () => refundRepository;
export const useFunctions = () => functionRepository;