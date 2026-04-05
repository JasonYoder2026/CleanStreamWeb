import type { CoordinateService, Coordinates, AddressParams } from "../../interfaces/CoordinateService";

// CoordinateRepository.ts
export class CoordinateRepository implements CoordinateService {
  getCoordinates = async (address: AddressParams): Promise<Coordinates | null> => {
    const query = [address.address, address.city, address.state, address.zipCode, address.country]
      .join("+")
      .replace(/\s+/g, "+");

    const url = `https://geocode.maps.co/search?q=${query}&api_key=69d2bffa6b705651191676tcw20ec1b`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result: Coordinates[] = await response.json();

      if (!result[0]) {
        return null;
      }

      const { lat, lon } = result[0];
      return { lat, lon };
    } catch (error) {
      console.error(error);
      return null;
    }
  };
}