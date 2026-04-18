export interface LocationService {
    getLocations(): Promise<Location[]>
    fetchUserRole(): Promise<string | null> 
    getMachines(locationId: string): Promise<Machine[]>
    addMachines(machine: Machine): Promise<void|string>
    addLocations(location:Location): Promise<void|string>
    calculatePrice(kilograms: number): number
    deleteMachine(machineID: number): Promise<void>
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
  Weight_kg: number;
}