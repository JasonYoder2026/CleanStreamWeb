import TodayRevenue from "../components/TodayRevenue";
import MonthlyIncome from "../components/MonthlyIncome";
import TrafficWidget from "../components/TrafficWidget";
import "../styles/DashboardPage.css";

function DashBoard() {
  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">{getCurrentDate()}</p>
      </div>

      <div className="dashboard-grid">
        <TodayRevenue />
        <MonthlyIncome />
        <TrafficWidget />
      </div>
    </div>
  );
}

export default DashBoard;
