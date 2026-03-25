import { useState } from "react";
import "../styles/RefundsPage.css";
import type {Refund, RefundStatus} from '../models/Refund';

const MOCK_REFUNDS: Refund[] = [
  {
    id: "RFD-001",
    customerName: "Marcus Webb",
    email: "marcus.webb@email.com",
    machineId: "W-04",
    amount: 4.5,
    reason: "Machine stopped mid-cycle and did not complete wash.",
    date: "2025-03-22",
    status: "pending",
  },
  {
    id: "RFD-002",
    customerName: "Priya Nair",
    email: "priya.n@email.com",
    machineId: "D-11",
    amount: 3.0,
    reason: "Dryer door would not seal. Clothes remained damp.",
    date: "2025-03-21",
    status: "pending",
  },
  {
    id: "RFD-003",
    customerName: "Jordan Ellis",
    email: "j.ellis@email.com",
    machineId: "W-02",
    amount: 4.5,
    reason: "Payment was charged twice for the same cycle.",
    date: "2025-03-20",
    status: "approved",
  },
  {
    id: "RFD-004",
    customerName: "Tanya Okafor",
    email: "tanyaok@email.com",
    machineId: "W-07",
    amount: 4.5,
    reason: "App showed machine available but it was already in use.",
    date: "2025-03-19",
    status: "denied",
  },
  {
    id: "RFD-005",
    customerName: "Samuel Brandt",
    email: "sbrandt@email.com",
    machineId: "D-03",
    amount: 3.0,
    reason: "Machine did not start despite successful payment.",
    date: "2025-03-18",
    status: "pending",
  },
];

const STATUS_LABEL: Record<RefundStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
};

interface ModalState {
  refund: Refund;
  action: "approve" | "deny" | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>(MOCK_REFUNDS);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [actionSelected, setActionSelected] = useState<"approve" | "deny" | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState<RefundStatus | "all">("all");

  const openModal = (refund: Refund) => {
    setModal({ refund, action: null });
    setActionSelected(null);
    setReason("");
  };

  const closeModal = () => {
    setModal(null);
    setActionSelected(null);
    setReason("");
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!modal || !actionSelected) return;
    setSubmitting(true);

    try {
      // TODO: Replace with actual Supabase edge function call
      // await supabase.functions.invoke('handle-refund', {
      //   body: { refundId: modal.refund.id, action: actionSelected, reason }
      // });

      await new Promise((res) => setTimeout(res, 900)); // mock latency

      setRefunds((prev) =>
        prev.map((r) =>
          r.id === modal.refund.id
            ? { ...r, status: actionSelected === "approve" ? "approved" : "denied" }
            : r
        )
      );

      showToast(
        actionSelected === "approve"
          ? `Refund ${modal.refund.id} approved.`
          : `Refund ${modal.refund.id} denied.`,
        "success"
      );
      closeModal();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === "all" ? refunds : refunds.filter((r) => r.status === filter);
  const counts = {
    all: refunds.length,
    pending: refunds.filter((r) => r.status === "pending").length,
    approved: refunds.filter((r) => r.status === "approved").length,
    denied: refunds.filter((r) => r.status === "denied").length,
  };

  return (
    <div className="refunds-page">
      {/* Header */}
      <div className="refunds-header">
        <div>
          <h1 className="refunds-title">Refund Requests</h1>
          <p className="refunds-subtitle">Review and respond to customer refund submissions</p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="refunds-filters">
        {(["all", "pending", "approved", "denied"] as const).map((f) => (
          <button
            key={f}
            className={`filter-pill filter-pill--${f} ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="pill-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="refunds-table-wrapper">
        <table className="refunds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Machine</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-row">
                  No refunds in this category.
                </td>
              </tr>
            )}
            {filtered.map((refund) => (
              <tr key={refund.id} className={`table-row status-row--${refund.status}`}>
                <td className="refund-id">{refund.id}</td>
                <td>
                  <div className="customer-name">{refund.customerName}</div>
                  <div className="customer-email">{refund.email}</div>
                </td>
                <td>
                  <span className="machine-badge">{refund.machineId}</span>
                </td>
                <td className="amount">${refund.amount.toFixed(2)}</td>
                <td className="reason-cell">
                  <span className="reason-text">{refund.reason}</span>
                </td>
                <td className="date-cell">{formatDate(refund.date)}</td>
                <td>
                  <span className={`status-badge status-badge--${refund.status}`}>
                    {STATUS_LABEL[refund.status]}
                  </span>
                </td>
                <td>
                  {refund.status === "pending" ? (
                    <button className="respond-btn" onClick={() => openModal(refund)}>
                      Respond
                    </button>
                  ) : (
                    <span className="resolved-label">Resolved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Respond to Refund</h2>
                <p className="modal-refund-id">{modal.refund.id}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-info">
              <div className="modal-info-row">
                <span className="info-label">Customer</span>
                <span className="info-value">{modal.refund.customerName}</span>
              </div>
              <div className="modal-info-row">
                <span className="info-label">Machine</span>
                <span className="info-value">{modal.refund.machineId}</span>
              </div>
              <div className="modal-info-row">
                <span className="info-label">Amount</span>
                <span className="info-value">${modal.refund.amount.toFixed(2)}</span>
              </div>
              <div className="modal-info-row">
                <span className="info-label">Reason</span>
                <span className="info-value reason-full">{modal.refund.reason}</span>
              </div>
            </div>

            <div className="modal-section-label">Decision</div>
            <div className="modal-actions">
              <button
                className={`decision-btn approve-btn ${actionSelected === "approve" ? "selected" : ""}`}
                onClick={() => setActionSelected("approve")}
              >
                ✓ Approve
              </button>
              <button
                className={`decision-btn deny-btn ${actionSelected === "deny" ? "selected" : ""}`}
                onClick={() => setActionSelected("deny")}
              >
                ✕ Deny
              </button>
            </div>

            <div className="modal-section-label">
              Note <span className="optional-label">(optional)</span>
            </div>
            <textarea
              className="reason-input"
              placeholder="Add a note to the customer..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                className={`submit-btn ${!actionSelected ? "disabled" : ""} ${actionSelected ? `submit-btn--${actionSelected}` : ""}`}
                onClick={handleSubmit}
                disabled={!actionSelected || submitting}
              >
                {submitting ? "Submitting…" : "Submit Decision"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}