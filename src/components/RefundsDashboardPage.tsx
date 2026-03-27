import { useEffect, useState } from "react";
import "../styles/refundsPage.css";
import type {Refund, RefundStatus} from '../interfaces/RefundService'
import { useRefunds, useFunctions } from '../di/container';

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

const {getRefunds} = useRefunds();
const {callFunction} = useFunctions();

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchRefunds = async() => {
      try {
        const data = await getRefunds();
        setRefunds(data);
      } catch (err) {
        console.log(err);
        setError("Failed to load refunds");
      } finally {
        setLoading(false);
      }
    };
    fetchRefunds();
  }, []);

  const handleSubmit = async () => {
    if (!modal || !actionSelected) return;
    setSubmitting(true);

    try {
      const {transactionId, customerId, amount} = modal.refund;
      await callFunction(
        actionSelected === "approve" ? "approveRefund" : "denyRefund",
        { transactionId, customerId, amount, note: reason }
      );


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
      {loading && <div className="loading">Loading refunds...</div>}
      {error && <div className="error">{error}</div>}
      { !loading && !error &&(
      <div className="refunds-table-wrapper">
        <table className="refunds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Refund Attempts</th>
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
                </td>
                <td>
                  <div className="attempts">{refund.attempts}</div>
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
      )}

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
                {submitting ? "Submitting…" : "Submit"}
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