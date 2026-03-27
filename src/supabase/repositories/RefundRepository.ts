import type { Refund, RefundService } from "../../interfaces/RefundService";
import { SupabaseClient } from "@supabase/supabase-js";

export class RefundRepository implements RefundService {
    constructor(private client: SupabaseClient) {}

    getRefunds = async (): Promise<Refund[]> => {
        const { data, error } = await this.client
            .from("Refunds")
            .select(`
                refund_id,
                transaction_id,
                amount,
                description,
                date,
                status,
                profiles (
                    id,
                    full_name,
                    refund_attempts
                )
                `);


        if (error || data === null) throw error;
         
        return data.map((row: any)=> ({
            id: ("R" + row.refund_id),
            customerName: row.profiles.full_name,
            customerId: row.profiles.id,
            transactionId: row.transaction_id,
            amount: row.amount,
            reason: row.description,
            date: row.date,
            status: row.status,
            attempts: row.profiles.refund_attempts
        }));
    }
}