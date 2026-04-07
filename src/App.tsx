import "./styles/App.css";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import TrafficPage from "./components/TrafficDashboardPage";
import RefundsPage from "./components/RefundsDashboardPage";
import LocationsPage from "./components/LocationsDashboardPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardPage from "./components/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home/*"
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
          <Route path="locations" element={<LocationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
