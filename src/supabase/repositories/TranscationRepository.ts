import type {TransactionService} from "../../interfaces/TransactionService";
import {SupabaseClient} from "@supabase/supabase-js";

export class TransactionRepository implements TransactionService{


    constructor(private client: SupabaseClient) {}

    getTodayRevenue = async (): Promise<number | null> => {
        let output: number = 0;
        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const {data, error} = await this.client
            .from('transactions')
            .select('amount')
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());


        if (error) {
            console.error('Error fetching total:', error);
            return null;
        }

        if (data) {
            for (const row of data) {
                output += Number(row.amount);
            }
        }

        return output;
    }
}