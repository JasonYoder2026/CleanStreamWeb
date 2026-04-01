import { useEffect, useState } from "react";
import "../styles/LocationsPage.css";
import { useLocations } from "../di/container";
import type { Location } from "../interfaces/LocationService";

function LocationsDashBoard() {
  const [locationData, setLocationData] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationService = useLocations();
        const locations = await locationService.getLocations();
        setLocationData(locations);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div>
      <div className="top-section">
        <select className="locations-list" name="Location List" id="">
          {locationData.map((location, index) => (
            <option key={index} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
        ...
      </div>
    </div>
  );
}
