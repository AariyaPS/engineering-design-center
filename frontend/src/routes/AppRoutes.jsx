import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import EngineeringCalculation from "../pages/EngineeringCalculation";
import CalculationHistory from "../pages/CalculationHistory";

import Conductors from "../pages/reference/Conductors";
import Materials from "../pages/reference/Materials";
import InstallationConditions from "../pages/reference/InstallationConditions";
import CurrentRatings from "../pages/reference/CurrentRatings";
import VoltageDrop from "../pages/reference/VoltageDrop";
import EngineeringDesigns from "../pages/EngineeringDesigns";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Main */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/calculator" element={<EngineeringCalculation />} />

        {/* Workspace */}
        <Route path="/history" element={<CalculationHistory />} />

        {/* Designs page */}
        <Route path="/designs" element={<EngineeringDesigns />} />

        {/* Reference Data */}
        <Route path="/reference/conductors" element={<Conductors />} />

        <Route path="/reference/materials" element={<Materials />} />

        <Route
          path="/reference/installation-conditions"
          element={<InstallationConditions />}
        />

        <Route path="/reference/current-ratings" element={<CurrentRatings />} />

        <Route path="/reference/voltage-drop" element={<VoltageDrop />} />

        {/* Temporary Settings page */}
        <Route
          path="/settings"
          element={
            <div>
              <h1>Settings</h1>
              <p>Application settings will be implemented here.</p>
            </div>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
