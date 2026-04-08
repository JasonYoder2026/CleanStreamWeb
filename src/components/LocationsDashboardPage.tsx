import { useEffect, useState } from "react";
import "../styles/LocationsPage.css";
import { Plus } from "lucide-react";
import { useLocations } from "../di/container";
import type { Location, Machine } from "../interfaces/LocationService";
import AddMachineModal from "./AddMachineModal";
import AddLocationModal from "./AddLocationModal";

const MACHINE_TYPES = ["Washer", "Dryer"];

function LocationsPage() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [machineData, setMachineData] = useState<Machine[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const locationService = useLocations();

  const fetchMachines = async (locationId: string) => {
    try {
      const machines = await locationService.getMachines(locationId);
      setMachineData(machines);
    } catch (error) {
      console.error("Failed to fetch machines:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const locations = await locationService.getLocations();
      setLocationData(locations);
      const firstLocation = locations[0];
      if (firstLocation) {
        setSelectedLocation("");
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
    const loadRole = async () => {
      const role = await locationService.fetchUserRole();
      setUserRole(role!);
    };
    loadRole();
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
          <option value="">Select a location</option>
          {locationData.map((location, index) => (
            <option key={index} value={location.id.toString()}>
              {location.Name}
            </option>
          ))}
        </select>
        {userRole == "Owner" && (
          <div className="sub-section">
            <p>Add Location:</p>
            <button
              name="Add location button"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <Plus className="plus" />
            </button>
          </div>
        )}
      </div>

      <div className="seperation-line"></div>

      <div className="machine-description">
        <p>Machines:</p>
        {userRole == "Owner" && (
          <div className="sub-section">
            <button onClick={() => setIsMachineModalOpen(true)}>
              <Plus size={15} />
              <p>Add Machine</p>
            </button>
          </div>
        )}
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
        isOpen={isMachineModalOpen}
        onClose={() => setIsMachineModalOpen(false)}
        onSuccess={() => fetchMachines(selectedLocation)}
        machineTypes={MACHINE_TYPES}
        locations={locationData.map((l) => ({
          id: l.id,
          name: l.Name,
        }))}
      />
      <AddLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSuccess={() => fetchLocations()}
      />
    </div>
  );
}

export default LocationsPage;
