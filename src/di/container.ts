import { AuthRepository } from "../supabase/repositories/AuthRepository";
import type { AuthService } from "../interfaces/AuthService";
import supabase from "../supabase/client";
import { RefundRepository } from "../supabase/repositories/RefundRepository";
import type { RefundService } from "../interfaces/RefundService";
import type { FunctionService } from "../interfaces/FunctionService";
import { EdgeFunctionRepository } from "../supabase/repositories/EdgeFunctionRepository";
import { TrafficRepository } from "../supabase/repositories/TrafficRepository";
import type { TrafficService } from "../interfaces/TrafficService";

const authRepository: AuthService = new AuthRepository(supabase);
const refundRepository: RefundService = new RefundRepository(supabase);
const functionRepository: FunctionService = new EdgeFunctionRepository(
  supabase,
);
const trafficRepository: TrafficService = new TrafficRepository(supabase);

export const useAuth = () => authRepository;
export const useRefunds = () => refundRepository;
export const useFunctions = () => functionRepository;
export const useTraffic = () => trafficRepository;
