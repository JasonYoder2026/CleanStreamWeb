import { AuthRepository } from "../supabase/repositories/AuthRepository";
import type { AuthService } from "../interfaces/AuthService";
import { RefundRepository } from "../supabase/repositories/RefundRepository";
import type { RefundService } from "../interfaces/RefundService";
import type { FunctionService } from "../interfaces/FunctionService";
import { EdgeFunctionRepository } from "../supabase/repositories/EdgeFunctionRepository";
import { TransactionRepository } from "../supabase/repositories/TranscationRepository";
import type { TrafficService } from "../interfaces/TrafficService";
import { TrafficRepository } from "../supabase/repositories/TrafficRepository";
import supabase from "../supabase/client";


const authRepository: AuthService = new AuthRepository(supabase);
const refundRepository: RefundService = new RefundRepository(supabase);
const functionRepository: FunctionService = new EdgeFunctionRepository(
  supabase,
);
const transactionRepository: TransactionRepository = new TransactionRepository(
  supabase,
);
const trafficRepository: TrafficService = new TrafficRepository(supabase);

export const useAuth = () => authRepository;
export const useRefunds = () => refundRepository;
export const useFunctions = () => functionRepository;
export const useTransactions = () => transactionRepository;
export const useTraffic = () => trafficRepository;
