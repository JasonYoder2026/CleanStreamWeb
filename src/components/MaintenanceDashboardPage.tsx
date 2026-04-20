import React, { useEffect, useState } from "react";
import type { Maintenance, MaintenanceService } from "../interfaces/MaintenanceService.ts";
import "./MaintenanceDashboard.css";

interface MaintenanceDashboardProps {
  maintenanceService: MaintenanceService;
}

const MaintenanceDashboardPage: React.FC<MaintenanceDashboardProps> = ({ 
  maintenanceService 
}) => {
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
      const data = await maintenanceService.getMaintenances();
      setMaintenances(data);
      setError(null);
    } catch (err) {
      setError("Failed to load maintenance requests");
      console.error(err);
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Maintenance Dashboard</h1>
          <p>Review and manage facility maintenance reports</p>
        </div>
      </header>

      <div className="filter-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
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
                <tr key={`${item.userId}-${index}`}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge--${item.category.toLowerCase()}`}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.location}</td>
                  <td className="text-truncate">{item.description}</td>
                  <td>{item.userId}</td>
                  <td>
                    {item.image_data ? (
                      <button 
                        className="btn-view" 
                        onClick={() => window.open(item.image_data, '_blank')}
                      >
                        View Image
                      </button>
                    ) : (
                      <span className="text-muted">No Image</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="empty-state">
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