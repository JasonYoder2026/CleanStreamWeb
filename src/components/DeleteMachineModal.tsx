import type { Machine } from "../interfaces/LocationService";

function DeleteConfirmModal({ machine, onConfirm, onCancel }: { machine: Machine | null; onConfirm: () => void; onCancel: () => void }) {
  if (!machine) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 style={{ margin: "0 0 0.25rem" }}>Delete machine?</h3>
        <div className="seperation-line" />
        <div className="modal-form">
          <p style={{ margin: 0, fontSize: "0.95rem" }}>
            Are you sure you want to delete <strong>{machine.Name}</strong>? This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-submit" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
