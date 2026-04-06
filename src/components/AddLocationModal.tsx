import { useState } from "react";
import "../styles/LocationPageModals.css";
import { X, Check, AlertCircle } from "lucide-react";
import { useCoordinates, useLocations } from "../di/container";

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

interface LocationFormData {
  locationName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const emptyForm = (): LocationFormData => ({
  locationName: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
});

export default function AddLocationModal({
  isOpen,
  onClose,
  onSuccess,
}: AddLocationModalProps) {
  const [form, setForm] = useState<LocationFormData>(emptyForm());
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const coordinateService = useCoordinates();
  const locationService = useLocations();

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleClose = () => {
    setForm(emptyForm());
    setIsSuccess(false);
    setErrorMessage(null);
    onSuccess?.();
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    try {
      const coordinates = await coordinateService.getCoordinates({
        address: form.streetAddress,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
      });

      if (coordinates == null) {
        setErrorMessage(
          "Could not find coordinates for this address. Please check the address and try again.",
        );
        return;
      }

      const result = await locationService.addLocations({
        id: 0,
        Name: form.locationName,
        Address: form.streetAddress + ", " + form.city + ", " + form.state,
        Longitude: coordinates.lon,
        Latitude: coordinates.lat,
      });

      if (typeof result === "string") {
        setErrorMessage(result);
        return;
      }

      setIsSuccess(true);
      setTimeout(handleClose, 1500);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  if (isSuccess)
    return (
      <div className="modal-backdrop">
        <div className="modal-card">
          <div className="success-state">
            <div className="success-icon">
              <Check strokeWidth={3} size={22} color="#fff" />
            </div>
            <p className="success-title">Location Added!</p>
            <p className="success-subtitle">
              {form.locationName || "Location"} has been added successfully.
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-card">
        <div className="top-section">
          <p>Add Location</p>
          <button onClick={handleClose} aria-label="Close modal">
            <X />
          </button>
        </div>

        <div className="seperation-line" />

        {errorMessage && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="locationName">
              Location Name
            </label>
            <input
              className="form-input"
              id="locationName"
              type="text"
              placeholder="e.g. Downtown Laundromat"
              value={form.locationName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="streetAddress">
              Street Address
            </label>
            <input
              className="form-input"
              id="streetAddress"
              type="text"
              placeholder="e.g. 123 Main St"
              value={form.streetAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="city">
                City
              </label>
              <input
                className="form-input"
                id="city"
                type="text"
                placeholder="e.g. Chicago"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="state">
                State
              </label>
              <select
                className="form-select"
                id="state"
                value={form.state}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select…
                </option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="zipCode">
                ZIP Code
              </label>
              <input
                className="form-input"
                id="zipCode"
                type="text"
                placeholder="e.g. 60601"
                maxLength={10}
                value={form.zipCode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="country">
                Country
              </label>
              <select
                className="form-select"
                id="country"
                value={form.country}
                onChange={handleChange}
              >
                <option value="US">US</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            Add Location
          </button>
        </div>
      </div>
    </div>
  );
}
