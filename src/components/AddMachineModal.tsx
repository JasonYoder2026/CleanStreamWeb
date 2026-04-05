import { useState } from "react";
import "../styles/AddMachineModal.css";

interface LocationOption {
  id: string;
  name: string;
}

interface MachineFormData {
  machineName: string;
  machinePrice: string;
  machineRunTime: string;
  machineType: string;
  machineLocation: string;
}

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: MachineFormData) => void;
  machineTypes: string[];
  locations: LocationOption[];
}

const emptyForm = (): MachineFormData => ({
  machineName: "",
  machinePrice: "",
  machineRunTime: "",
  machineType: "",
  machineLocation: "",
});

export default function AddMachineModal({
  isOpen,
  onClose,
  onSubmit,
  machineTypes,
  locations,
}: AddMachineModalProps) {
  const [form, setForm] = useState<MachineFormData>(emptyForm());

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setForm(emptyForm());
    onClose();
  };

  const handleSubmit = () => {
    onSubmit?.(form);
    handleClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-card">
        <div className="top-section">
          <p>Add Machine</p>
          <button onClick={handleClose} aria-label="Close modal">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="#222"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="seperation-line" />

        <div className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="machineName">
              Machine Name
            </label>
            <input
              className="form-input"
              id="machineName"
              name="machineName"
              type="text"
              placeholder="e.g. Washer #3"
              value={form.machineName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="machinePrice">
                Price ($)
              </label>
              <input
                className="form-input"
                id="machinePrice"
                name="machinePrice"
                type="number"
                min="0"
                placeholder="0.00"
                value={form.machinePrice}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="machineRunTime">
                Run Time (Minutes)
              </label>
              <input
                className="form-input"
                id="machineRunTime"
                name="machineRunTime"
                type="number"
                min="0"
                placeholder="0"
                value={form.machineRunTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="machineType">
              Machine Type
            </label>
            <select
              className="form-select"
              id="machineType"
              name="machineType"
              value={form.machineType}
              onChange={handleChange}
            >
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
            <select
              className="form-select"
              id="machineLocation"
              name="machineLocation"
              value={form.machineLocation}
              onChange={handleChange}
            >
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
