import "./styles/App.css";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import RefundsPage from "./components/RefundsDashboardPage";
import MaintenancePage from "./components/MaintenanceDashboardPage";
import LocationsPage from "./components/LocationsDashboardPage";
import DashboardPage from "./components/DashboardPage";
import EmployeePage from "./components/EmployeeDashboardPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <div>
                <DashboardPage />
              </div>
            }
          />
          <Route path="refunds" element={<RefundsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="employees" element={<EmployeePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
