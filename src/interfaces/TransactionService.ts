export interface TransactionService {
    getTodayRevenue(): Promise<Number | null>;
}