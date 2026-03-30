import type { TransactionService } from "../../interfaces/TransactionService";
import { SupabaseClient } from "@supabase/supabase-js";

export class TransactionRepository implements TransactionService {

    constructor(private client: SupabaseClient) {}

    getTodayRevenue = async (): Promise<number | null> => {
        let total: number = 0;
        const today = new Date();

        const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0, 0, 0, 0
        );

        const endOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23, 59, 59, 999
        );

        console.log("Start:", startOfDay.toISOString());
        console.log("End:", endOfDay.toISOString());

        const { data, error } = await this.client
            .from('transactions')
            .select('*')
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

        if (error) {
            console.error('Error fetching transactions:', error);
            return null;
        }

        if (!data || data.length === 0) {
            console.log("No transactions found for today.");
            return 0;
        }

        for (const row of data) {
            const amount = Number(row.amount);
            if (!isNaN(amount)) {
                total += amount;
            }
        }

        return total;
    };
}