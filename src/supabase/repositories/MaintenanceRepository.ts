import type { Maintenance, MaintenanceService } from "../../interfaces/MaintenanceService.ts";
import { SupabaseClient } from "@supabase/supabase-js";

export class MaintenanceRepository implements MaintenanceService {
    constructor(private client: SupabaseClient) {}

    getMaintenances = async (): Promise<Maintenance[]> => {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const { data, error } = await this.client
            .from("Maintenance")
            .select("*");

        if (error) throw error;
        if (data === null) return [];
          
        return data.map((row: any) => ({
            user_id: row.user_id,
            category: row.category,
            description: row.description,
            created_at: row.created_at,
            location: row.location,
            image_data: row.image_data
        }));
    }
}