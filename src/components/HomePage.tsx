import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./DashboardPage";
import RefundsDashboard from "./RefundsDashboardPage";


function HomePage() {
  return (
    <div className="app-container">
      <TopBar />
      <SideBar />

      <div className="content">
        <Routes>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/home/refunds" element={<RefundsDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default HomePage;
