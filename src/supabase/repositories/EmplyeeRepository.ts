import { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "../../di/container";
import type { EmployeeService, AdminForm, EmployeeRecord } from "../../interfaces/EmployeeService";


export class EmployeeRepository implements EmployeeService {
    constructor(private client: SupabaseClient) { }

    changeUserRole = async (email: string): Promise<string> => {
        const { data: userData, error: userError } = await this.client
            .from("profiles")
            .update({ roles: 'Admin' })
            .eq("email", email)
            .select('id')

        if (userError) {
            console.error(userError);
            throw new Error(userError.message);
        }
        return userData[0]?.id
    }

    assignAdminLocation = async (form: AdminForm): Promise<void> => {
        const userID = await this.changeUserRole(form.email)
        const { error: assignError } = await this.client
            .from("Location_to_Admin")
            .insert({ location_id: form.locationID, user_id: userID })

        if (assignError) {
            console.error(assignError);
            throw new Error(assignError.message);
        }
    }

    fetchEmployees = async (locationIDs: number[]): Promise<EmployeeRecord[]> => {
        const authService = useAuth()
        const Uuid = await authService.getUserID()
        const { data: employeeData, error: employeeDataError } = await this.client
            .from("Location_to_Admin")
            .select(`
                location_id,
                profiles (
                    full_name,
                    email
                )
            `)
            .neq("user_id", Uuid)
            .in("location_id", locationIDs)

        if (employeeDataError) {
            console.error(employeeDataError);
            throw new Error(employeeDataError.message);
        }

    return employeeData.map(entry => ({
    locationID: entry.location_id,
    name: (entry.profiles as any)?.full_name,
    email: (entry.profiles as any)?.email,
}))
}
}