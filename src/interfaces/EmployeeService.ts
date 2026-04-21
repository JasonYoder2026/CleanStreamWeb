export interface EmployeeService {
    assignAdminLocation(form: AdminForm): Promise<void>
    fetchEmployees(locationID: number[]): Promise<EmployeeRecord[]>
    removeAdminLocation(email: string): Promise<void>
}

export interface AdminForm {
    email: string
    locationID: number
}

export type EmployeeRecord = {
    locationID: number
    name: string
    email: string
}