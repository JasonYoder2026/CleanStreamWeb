import type { EmployeeRecord } from "../interfaces/EmployeeService";

function DeleteEmployeeModal({ employee, onConfirm, onCancel }: { employee: EmployeeRecord | null; onConfirm: () => void; onCancel: () => void }) {
  if (!employee) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 style={{ margin: "0 0 0.25rem" }}>Remove employee?</h3>
        <div className="seperation-line" />
        <div className="modal-form">
          <p style={{ margin: 0, fontSize: "0.95rem" }}>
            Are you sure you want to remove <strong>{employee.name}</strong>? This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-submit" onClick={onConfirm}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteEmployeeModal;
