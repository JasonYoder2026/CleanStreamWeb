import "./styles/App.css";
import Login from "./components/LoginPage";
import HomePage from "./components/HomePage";
import RefundsPage from "./components/RefundsDashboardPage";
import LocationsPage from "./components/LocationsDashboardPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />}>
          <Route index element={<div>Dashboard</div>} />
          <Route path="refunds" element={<RefundsPage />} />
          <Route path="locations" element={<LocationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
