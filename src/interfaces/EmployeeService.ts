export interface EmployeeService {
    assignAdminLocation(form: AdminForm): Promise<void>
    fetchEmployees(locationID: number[]): Promise<EmployeeRecord[]>
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