export interface CoordinateService{
    getCoordinates(address: AddressParams): Promise<Coordinates | null>
}

export interface AddressParams {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}