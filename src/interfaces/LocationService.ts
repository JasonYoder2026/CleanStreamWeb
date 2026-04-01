export interface LocationService {
    getLocations(): Promise<Location[]>
}

export interface Location {
  id: number;
  address: string;
  name: string;
  longitude: number;
  latitude: number;
}