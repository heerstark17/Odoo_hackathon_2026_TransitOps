import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../pages/Auth/Login";
import Settings from "../pages/Settings/Settings";
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Drivers from "../pages/Drivers";
import Trips from "../pages/Trips";
import Maintenance from "../pages/Maintenance";
import FuelLogs from "../pages/FuelLogs";
import Expenses from "../pages/Expenses";
import Reports from "../pages/Reports";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="trips" element={<Trips />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="fuel-logs" element={<FuelLogs />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;