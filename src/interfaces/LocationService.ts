export interface LocationService {
    getLocations(): Promise<Location[]>
    getMachines(locationId: string): Promise<Machine[]>
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
  Runtime: string;
  Status: string;
  Location_ID: number;
  Machine_type: string;
}