export interface TransactionService {
    getTodayRevenue(): Promise<Number | null>;
    subscribeToTodayRevenue(onUpdate: (total: number) => void): () => void;
}