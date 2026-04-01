import { SupabaseClient } from "@supabase/supabase-js";
import type { LocationService, Location } from "../../interfaces/LocationService";

export class LocationRepository implements LocationService {
    constructor(private client: SupabaseClient) { }

    getLocations = async (): Promise<Location[]> => {
        const Uuid = "bea49d86-0630-44a3-a6de-c192518215aa";

        const { data: adminData, error: adminError } = await this.client
            .from("Location_to_Admin")
            .select("location_id")
            .eq("user_id", Uuid);

        if (adminError) {
            console.error(adminError);
            throw new Error(adminError.message);
        }

        const locationIDs = adminData.map((row) => row.location_id);

        const { data: locations, error: locationsError } = await this.client
            .from("Locations")
            .select("*")
            .in("id", locationIDs);

        if (locationsError) {
            console.error(locationsError);
            throw new Error(locationsError.message);
        }

        return locations as Location[];
    };
}