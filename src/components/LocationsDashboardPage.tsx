import { useEffect, useState } from "react";
import {getSupabaseClient} from "../supabase/client";
import "../styles/LocationsPage.css";
import { Plus } from "lucide-react";

interface locationinformation {
  id: number;
  Address: string;
  Name: string;
  longitude: number;
  latitude: number;
}

function LocationsDashBoard() {
  const [locationData, setLocationData] = useState<locationinformation[]>([]);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    const Uuid = "bea49d86-0630-44a3-a6de-c192518215aa";

    // Get location IDs for this admin
    const { data: adminData, error: adminError } = await getSupabaseClient()
      .from("Location_to_Admin")
      .select("location_id")
      .eq("user_id", Uuid);

    if (adminError) {
      console.error(adminError);
      return;
    }

    const locationIDs = adminData.map((row) => row.location_id);

    //Fetch location names using their IDs
    const { data: locations, error: locationsError } = await getSupabaseClient()
      .from("Locations")
      .select("*")
      .in("id", locationIDs);

    if (locationsError) {
      console.error(locationsError);
      return;
    }

    setLocationData(locations);
  };

  return (
    <div>
      <div className="top-section">
        <select className="locations-list" name="Location List" id="">
          {locationData.map((location, index) => (
            <option key={index} value={location.Name}>
              {location.Name}
            </option>
          ))}
        </select>
        <div className="sub-section">
          <p>Add Location:</p>
          <button>
            <Plus className="plus" />
          </button>
        </div>
      </div>

      <div className="seperation-line"></div>
      <div className="machine-description">
        <p>Machines:</p>
        <div className="sub-section">
          <p>Add Machine:</p>
          <button>
            <Plus className="plus" />
          </button>
        </div>
      </div>
      <ul></ul>
    </div>
  );
}

export default LocationsDashBoard;
