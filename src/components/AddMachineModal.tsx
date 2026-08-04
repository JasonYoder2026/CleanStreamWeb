import { useState } from "react";
import "../styles/LocationPageModals.css";
import { useLocations } from "../di/container";
import type { Machine, WasherSizeRate } from "../interfaces/LocationService";
import { X, Check, AlertCircle } from "lucide-react";

interface LocationOption {
  id: number;
  name: string;
}
interface MachineFormData {
  machineName: string;
  machineWeight: number;
  machineRunTime: number;
  machineType: string;
  machineLocation: number | "";
  washerSizeRateId: number | "";
}
interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  machineTypes: string[];
  locations: LocationOption[];
}

const emptyForm = (): MachineFormData => ({
  machineName: "",
  machineWeight: 0,
  machineRunTime: 0,
  machineType: "",
  machineLocation: "",
  washerSizeRateId: "",
});

export default function AddMachineModal({ isOpen, onClose, onSuccess, machineTypes, locations }: AddMachineModalProps) {
  const [form, setForm] = useState<MachineFormData>(emptyForm());
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [washerRates, setWasherRates] = useState<WasherSizeRate[]>([]);
  const locationService = useLocations();

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (id === "machineLocation") {
      setForm((prev) => ({ ...prev, washerSizeRateId: "" }));
      void locationService.getWasherSizeRates(Number(value)).then((rates) =>
        setWasherRates(rates.filter((rate) => rate.is_active && !rate.review_required)),
      ).catch((error) => setErrorMessage(error instanceof Error ? error.message : "Unable to load washer rates."));
    }
  };

  const handleClose = () => {
    setForm(emptyForm());
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    try {
      const selectedRate = washerRates.find((rate) => rate.id === Number(form.washerSizeRateId));
      if (form.machineType === "Washer" && !selectedRate) {
        setErrorMessage("Select a reviewed washer size rate.");
        return;
      }
      const machine: Machine = {
        id: 0,
        Name: form.machineName,
        Weight_kg: selectedRate?.capacity_kg ?? Number(form.machineWeight),
        Runtime: form.machineType === "Dryer" ? 5 : Number(form.machineRunTime),
        Status: "idle",
        Location_ID: Number(form.machineLocation),
        Machine_type: form.machineType,
        Price: selectedRate ? selectedRate.price_cents / 100 : 0.25,
        washer_size_rate_id: selectedRate?.id ?? null,
      };
      const result = await locationService.addMachines(machine);
      if (typeof result === "string") {
        setErrorMessage(result);
        return;
      }
      onSuccess?.();
      setIsSuccess(true);
      setTimeout(handleClose, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
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
            <p className="success-title">Machine Added!</p>
            <p className="success-subtitle">{form.machineName || "Machine"} has been added successfully.</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-card">
        <div className="top-section">
          <p>Add Machine</p>
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
            <label className="form-label" htmlFor="machineName">
              Machine Name
            </label>
            <input className="form-input" id="machineName" type="text" placeholder="e.g. Washer #3" value={form.machineName} onChange={handleChange} />
          </div>

          {form.machineType === "Washer" && (
            <div className="form-group">
              <label className="form-label" htmlFor="washerSizeRateId">Washer Size</label>
              <select className="form-select" id="washerSizeRateId" value={form.washerSizeRateId} onChange={handleChange}>
                <option value="" disabled>Select a configured size…</option>
                {washerRates.map((rate) => <option key={rate.id} value={rate.id}>{rate.size_label} · {rate.capacity_kg} kg · ${(rate.price_cents / 100).toFixed(2)}</option>)}
              </select>
              {washerRates.length === 0 && <span className="field-note">Add and review a washer rate for this location first.</span>}
            </div>
          )}

          <div className="form-row">
            {[
              { id: "machineWeight", label: "Weight", placeholder: "0" },
              {
                id: "machineRunTime",
                label: "Run Time (Minutes)",
                placeholder: "0",
              },
            ].map(({ id, label, placeholder }) => (
              <div className="form-group" key={id}>
                <label className="form-label" htmlFor={id}>
                  {label}
                </label>
                <input className="form-input" id={id} type="number" min="0" placeholder={placeholder} value={form[id as keyof MachineFormData]} onChange={handleChange} />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="machineType">
              Machine Type
            </label>
            <select className="form-select" id="machineType" value={form.machineType} onChange={handleChange}>
              <option value="" disabled>
                Select a type…
              </option>
              {machineTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="machineLocation">
              Location
            </label>
            <select className="form-select" id="machineLocation" value={form.machineLocation} onChange={handleChange}>
              <option value="" disabled>
                Select a location…
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            Add Machine
          </button>
        </div>
      </div>
    </div>
  );
}
