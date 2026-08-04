import "./styles/App.css";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import RefundsPage from "./components/RefundsDashboardPage";
import MaintenancePage from "./components/MaintenanceDashboardPage";
import LocationsPage from "./components/LocationsDashboardPage";
import DashboardPage from "./components/DashboardPage";
import EmployeePage from "./components/EmployeeDashboardPage";
import CortinaPayPage from "./components/CortinaPayPage";
import PublicLayout from "./components/PublicLayout";
import PublicHomePage from "./components/PublicHomePage";
import PublicLegalPage from "./components/PublicLegalPage";
import AccountDeletionPage from "./components/AccountDeletionPage";
import SupportPage from "./components/SupportPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/privacy" element={<PublicLegalPage type="privacy" />} />
          <Route path="/terms" element={<PublicLegalPage type="terms" />} />
          <Route path="/account-deletion" element={<AccountDeletionPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/pay" element={<CortinaPayPage />} />
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
