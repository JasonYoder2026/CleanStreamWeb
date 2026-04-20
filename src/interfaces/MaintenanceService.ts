export interface MaintenanceService {
    getMaintenances(): Promise<Maintenance[]>
}

export interface Maintenance {
    user_id: string,
    category: string,
    description: string;
    created_at: string;
    location: string;
    image_data: string;
}