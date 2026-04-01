import { useEffect, useState } from "react";
import "../styles/LocationsPage.css";
import { Plus } from "lucide-react";
import { useLocations } from "../di/container";
import type { Location } from "../interfaces/LocationService";

function LocationsPage() {
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
        <div className="sub-section">
          <p>Add Location:</p>
          <button name="Add location button">
            <Plus className="plus" />
          </button>
        </div>
      </div>

      <div className="seperation-line"></div>
      <div className="machine-description">
        <p>Machines:</p>
        <div className="sub-section">
          <button>
            <p>Add Machine:</p>
          </button>
        </div>
      </div>
      <ul></ul>
    </div>
  );
}

export default LocationsPage;
