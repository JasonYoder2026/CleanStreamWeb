import React, { useEffect, useState } from "react";
import { useMaintenance } from "../di/container"; 
import type { Maintenance, MaintenanceService } from "../interfaces/MaintenanceService.ts";
import "../styles/MaintenancePage.css";

interface MaintenanceDashboardProps {
  maintenanceService?: MaintenanceService;
}

const MaintenanceDashboardPage: React.FC<MaintenanceDashboardProps> = ({ 
  maintenanceService: propService 
}) => {
  const { getMaintenances } = useMaintenance();
  const service = propService || getMaintenances();

  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
  try {
    setLoading(true);
    const data = await getMaintenances();
    setMaintenances(Array.isArray(data) ? data : []);
    setError(null);
  } catch (err) {
    setError("Failed to load maintenance requests");
  } finally {
    setLoading(false);
  }
};

  const filteredData = filter === "All" 
    ? maintenances 
    : maintenances.filter(m => m.category === filter);

  const categories = ["All", ...new Set(maintenances.map(m => m.category))];

  if (loading) return <div className="loading-state">Loading maintenance reports...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="maintenance-page">
      <header className="maintenance-header">
        <div>
          <h1 className="maintenance-title">Maintenance Dashboard</h1>
          <p className="maintenance-subtitle">Review user requested maintenance reports</p>
        </div>
      </header>

      <hr className="header-divider" />

      <div className="maintenance-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="maintenance-table-wrapper">
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Location</th>
              <th>Description</th>
              <th>User ID</th>
              <th>Attachment</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={`${item.user_id}-${index}`}>
                  <td className="date-cell">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`category-badge badge--${item.category.toLowerCase()}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="location-text">{item.location}</td>
                  <td className="description-cell">
                    <div className="description-text">{item.description}</div>
                  </td>
                  <td><span className="user-id-code">{item.user_id}</span></td>
                  <td>
                    {item.image_data ? (
                      <div className="attachment-actions">
                        <button 
                          className="view-btn" 
                          onClick={() => window.open(item.image_data, '_blank')}
                        >
                          View
                        </button>
                      </div>
                    ) : (
                      <span className="no-attachment">No Image</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="empty-row">
                  No maintenance records found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceDashboardPage;