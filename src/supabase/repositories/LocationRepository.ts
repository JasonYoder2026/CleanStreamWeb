import { SupabaseClient } from "@supabase/supabase-js";
import type { LocationService, Location, Machine } from "../../interfaces/LocationService";
import { useAuth } from "../../di/container";

export class LocationRepository implements LocationService {
    constructor(private client: SupabaseClient) { }
    private locations: Location[] | null = [];

    getLocations = async (): Promise<Location[]> => {
        const authService = useAuth()
        const Uuid = await authService.getUserID()

        const { data: adminData, error: adminError } = await this.client
            .from("Location_to_Admin")
            .select("location_id")
            .eq("user_id", Uuid?.toString());
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
        this.locations = locations as Location[]
        return locations as Location[];
    };

    getMachines = async (locationId: string): Promise<Machine[]> => {
    const { data: machines, error: machinesError } = await this.client
        .from("Machines")
        .select("*")
        .eq("Location_ID", parseInt(locationId));

    if (machinesError) {
        console.error(machinesError);
        throw new Error(machinesError.message);
    }

    return machines as Machine[];
};
}