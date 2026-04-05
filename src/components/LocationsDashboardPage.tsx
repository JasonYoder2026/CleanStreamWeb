import { useEffect, useState } from "react";
import "../styles/LocationsPage.css";
import { Plus } from "lucide-react";
import { useLocations } from "../di/container";
import type { Location, Machine } from "../interfaces/LocationService";
import AddMachineModal from "./AddMachineModal";

const MACHINE_TYPES = ["Washer", "Dryer"];

function LocationsPage() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [machineData, setMachineData] = useState<Machine[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const locationService = useLocations();

  const fetchMachines = async (locationId: string) => {
    try {
      const machines = await locationService.getMachines(locationId);
      setMachineData(machines);
    } catch (error) {
      console.error("Failed to fetch machines:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locations = await locationService.getLocations();
        setLocationData(locations);
        const firstLocation = locations[0];
        if (firstLocation) {
          const id = firstLocation.id.toString();
          setSelectedLocation(id);
          await fetchMachines(id);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchData();
  }, []);

  const handleLocationChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    await fetchMachines(locationId);
  };

  return (
    <div>
      <div className="top-section">
        <select
          className="locations-list"
          name="Location List"
          value={selectedLocation}
          onChange={handleLocationChange}
        >
          {locationData.map((location, index) => (
            <option key={index} value={location.id.toString()}>
              {location.Name}
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
          <button onClick={() => setIsModalOpen(true)}>
            <Plus size={15} />
            <p>Add Machine</p>
          </button>
        </div>
      </div>

      <div className="machine-table-wrapper">
        <table className="machine-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {machineData.length === 0 && (
              <tr>
                <td colSpan={4} className="machine-empty-row">
                  No machines at this location.
                </td>
              </tr>
            )}
            {machineData.map((machine, index) => (
              <tr key={index} className="machine-row">
                <td className="machine-name">{machine.Name}</td>
                <td>{machine.Machine_type}</td>
                <td>
                  <span>{machine.Status}</span>
                </td>
                <td>${machine.Price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddMachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        machineTypes={MACHINE_TYPES}
        locations={locationData.map((l) => ({
          id: l.id.toString(),
          name: l.Name,
        }))}
      />
    </div>
  );
}

export default LocationsPage;
