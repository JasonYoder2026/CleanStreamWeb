import type { Maintenance, MaintenanceService } from "../../interfaces/MaintenanceService.ts";
import { SupabaseClient } from "@supabase/supabase-js";

export class MaintenanceRepository implements MaintenanceService {
    constructor(private client: SupabaseClient) {}

    getMaintenances = async (): Promise<Maintenance[]> => {
        const sevenDaysAgo = new Date();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(sevenDaysAgo.getDate() - 14);
        const { data, error } = await this.client
            .from("Maintenances")
            .select(`
                userId,
                category,
                description,
                date,
                location,
                image_data,
                `)
            .gte("date", twoWeeksAgo.toISOString());


        if (error || data === null) throw error;
         
        return data.map((row: any)=> ({
            userId: row.userId,
            category: row.category,
            description: row.description,
            date: row.date,
            location: row.location,
            image_data: row.image_data,
        }));
    }
}