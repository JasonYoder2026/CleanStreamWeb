export interface LocationService {
    getLocations(): Promise<Location[]>
    getMachines(locationId: string): Promise<Machine[]>
    addMachines(machine: Machine): Promise<void>
}

export interface Location {
  id: number;
  Address: string;
  Name: string;
  Longitude: number;
  Latitude: number;
}

export interface Machine {
  id: number;
  Name: string;
  Price: number;
  Runtime: number;
  Status: string;
  Location_ID: number;
  Machine_type: string;
}