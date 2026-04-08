import { AuthRepository } from "../supabase/repositories/AuthRepository";
import type {AuthService} from "../interfaces/AuthService";
import supabase from '../supabase/client';
import { RefundRepository } from "../supabase/repositories/RefundRepository";
import type { RefundService } from "../interfaces/RefundService";
import type { FunctionService } from "../interfaces/FunctionService";
import { EdgeFunctionRepository } from "../supabase/repositories/EdgeFunctionRepository";
import type { LocationService } from "../interfaces/LocationService";
import { LocationRepository } from "../supabase/repositories/LocationRepository";
import type { CoordinateService } from "../interfaces/CoordinateService";
import { CoordinateRepository } from "../geocodeMaps/repositories/CoordinateRepository";
import {TransactionRepository} from "../supabase/repositories/TranscationRepository";

const authRepository:AuthService = new AuthRepository(supabase);
const refundRepository: RefundService = new RefundRepository(supabase);
const functionRepository: FunctionService = new EdgeFunctionRepository(supabase);
const locationRepository: LocationService = new LocationRepository(supabase);
const coordinateRepository: CoordinateService = new CoordinateRepository();
const transactionRepository:TransactionRepository = new TransactionRepository(supabase);

export const useAuth = () => authRepository;
export const useRefunds = () => refundRepository;
export const useFunctions = () => functionRepository;
export const useLocations = () => locationRepository;
export const useCoordinates = () => coordinateRepository;
export const useTransactions = () => transactionRepository;
