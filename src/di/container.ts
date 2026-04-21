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

const supabase = getSupabaseClient();
const authRepository: AuthService = new AuthRepository(supabase);
const refundRepository: RefundService = new RefundRepository(supabase);
const maintenanceRepository: MaintenanceService = new MaintenanceRepository(supabase);
const functionRepository: FunctionService = new EdgeFunctionRepository(supabase);
const locationRepository: LocationService = new LocationRepository(supabase);
const coordinateRepository: CoordinateService = new CoordinateRepository();
const transactionRepository: TransactionRepository = new TransactionRepository(
  supabase,
);
const trafficRepository: TrafficService = new TrafficRepository(supabase);
const employeeRepository: EmployeeService = new EmployeeRepository(supabase);

export const useAuth = () => authRepository;
export const useRefunds = () => refundRepository;
export const useMaintenance = () => maintenanceRepository;
export const useFunctions = () => functionRepository;
export const useLocations = () => locationRepository;
export const useCoordinates = () => coordinateRepository;
export const useTransactions = () => transactionRepository;
export const useEmployee = () => employeeRepository;
export const useTraffic = () => trafficRepository;
