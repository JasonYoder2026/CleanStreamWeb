import { AuthRepository } from "../supabase/repositories/AuthRepository";
import type { AuthService } from "../interfaces/AuthService";
import { getSupabaseClient } from "../supabase/client";
import { RefundRepository } from "../supabase/repositories/RefundRepository";
import { MaintenanceRepository } from "../supabase/repositories/MaintenanceRepository";
import type { RefundService } from "../interfaces/RefundService";
import type { MaintenanceService } from "../interfaces/MaintenanceService";
import type { FunctionService } from "../interfaces/FunctionService";
import { EdgeFunctionRepository } from "../supabase/repositories/EdgeFunctionRepository";
import type { LocationService } from "../interfaces/LocationService";
import { LocationRepository } from "../supabase/repositories/LocationRepository";
import type { CoordinateService } from "../interfaces/CoordinateService";
import { CoordinateRepository } from "../geocodeMaps/repositories/CoordinateRepository";
import { TransactionRepository } from "../supabase/repositories/TranscationRepository";
import { EmployeeRepository } from "../supabase/repositories/EmployeeRepository";
import type { EmployeeService } from "../interfaces/EmployeeService";
import type { TrafficService } from "../interfaces/TrafficService";
import { TrafficRepository } from "../supabase/repositories/TrafficRepository";
import type { CortinaVendService } from "../interfaces/CortinaVendService";
import { CortinaVendRepository } from "../supabase/repositories/CortinaVendRepository";

const coordinateRepository: CoordinateService = new CoordinateRepository();
let authRepository: AuthService | undefined;
let refundRepository: RefundService | undefined;
let maintenanceRepository: MaintenanceService | undefined;
let functionRepository: FunctionService | undefined;
let locationRepository: LocationService | undefined;
let transactionRepository: TransactionRepository | undefined;
let trafficRepository: TrafficService | undefined;
let employeeRepository: EmployeeService | undefined;
let cortinaVendRepository: CortinaVendService | undefined;

export const useAuth = () =>
  authRepository ??= new AuthRepository(getSupabaseClient());
export const useRefunds = () =>
  refundRepository ??= new RefundRepository(getSupabaseClient());
export const useMaintenance = () =>
  maintenanceRepository ??= new MaintenanceRepository(getSupabaseClient());
export const useFunctions = () =>
  functionRepository ??= new EdgeFunctionRepository(getSupabaseClient());
export const useLocations = () =>
  locationRepository ??= new LocationRepository(getSupabaseClient());
export const useCoordinates = () => coordinateRepository;
export const useTransactions = () =>
  transactionRepository ??= new TransactionRepository(getSupabaseClient());
export const useEmployee = () =>
  employeeRepository ??= new EmployeeRepository(getSupabaseClient());
export const useTraffic = () =>
  trafficRepository ??= new TrafficRepository(getSupabaseClient());
export const useCortinaVend = () =>
  cortinaVendRepository ??= new CortinaVendRepository(getSupabaseClient());
