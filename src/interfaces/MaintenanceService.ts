export interface MaintenanceService {
    getMaintenances(): Promise<Maintenance[]>
}

export interface Maintenance {
    userId: string,
    category: string,
    description: string;
    date: string;
    location: string;
    image_data: string;
}