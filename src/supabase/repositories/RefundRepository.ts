import type { Refund, RefundService } from "../../interfaces/RefundService";
import { SupabaseClient } from "@supabase/supabase-js";

export class RefundRepository implements RefundService {
    constructor(private client: SupabaseClient) {}

    async getRefunds(): Promise<Refund[]> {
        const { data, error } = await this.client
            .from("refunds")
            .select("uuid");

        if (error || data === null) throw error;
         
        return data.map(row => ({
            id: row.uuid
        }));
    }
}