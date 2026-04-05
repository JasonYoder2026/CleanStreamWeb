import { SupabaseClient } from "@supabase/supabase-js";
import type { LocationService, Location, Machine } from "../../interfaces/LocationService";
import { useAuth } from "../../di/container";

export class LocationRepository implements LocationService {
    constructor(private client: SupabaseClient) { }
    
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
        return locations as Location[];
    };

    getMachines = async (locationId: string): Promise<Machine[]> => {
    const { data: getMachines, error: getMachinesError } = await this.client
        .from("Machines")
        .select("*")
        .eq("Location_ID", parseInt(locationId));

    if (getMachinesError) {
        console.error(getMachinesError);
        throw new Error(getMachinesError.message);
    }

    return getMachines as Machine[];
};

    addMachines = async (machine: Machine): Promise<void|string>  => {
        const { error: addMachinesError } = await this.client
        .from("Machines")
        .insert({
            Name: machine.Name, 
            Price: machine.Price, 
            Runtime: machine.Runtime, 
            Status: machine.Status, 
            Location_ID: machine.Location_ID, 
            Machine_type: machine.Machine_type});

        if (addMachinesError) {
        console.error(addMachinesError);
        return(addMachinesError?.message)
        }
    }

    addLocations = async (location: Location): Promise<void|string>  => {
        const authService = useAuth()
        const Uuid = await authService.getUserID()
        const { data, error: addLocationsError } = await this.client
        .from("Locations")
        .insert({
            Address: location.Address,
            Name: location.Name,
            Latitude: location.Latitude,
            Longitude: location.Longitude,
        })
        .select("id")
        .single();
        if (addLocationsError) {
        console.error(addLocationsError);
        return(addLocationsError.message)
        }

        if (data != null && Uuid != null) {
        await this.addLocationToAdmin(data.id, Uuid)
        }
    }

    addLocationToAdmin = async (locationId:number ,uid:string): Promise<void> =>{
        const {error: addLocationToAdminError } = await this.client
        .from("Location_to_Admin")
        .insert({
            location_id: locationId,
            user_id: uid
        });

        if (addLocationToAdminError) {
        console.error(addLocationToAdminError);
        throw new Error(addLocationToAdminError.message);
        }
    }

}