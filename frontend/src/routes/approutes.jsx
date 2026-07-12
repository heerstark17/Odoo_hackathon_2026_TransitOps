import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/layout";
import Login from "../pages/Auth/Login";
import Settings from "../pages/Settings/Settings";
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Drivers from "../pages/Drivers";
import Trips from "../pages/Trips";
import Maintenance from "../pages/Maintenance";
import FuelLogs from "../pages/FuelLogs";
import Reports from "../pages/Reports";
import { useAuth } from "../context/AuthContext";

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300">
        Loading TransitOps…
      </div>
    );
  return user ? <Layout /> : <Navigate to="/login" replace />;
};

const PublicLogin = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <Login />;
};

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicLogin />} />
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<RoleRoute roles={["FLEET_MANAGER", "DISPATCHER"]}><Vehicles /></RoleRoute>} />
        <Route path="drivers" element={<RoleRoute roles={["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"]}><Drivers /></RoleRoute>} />
        <Route path="trips" element={<RoleRoute roles={["FLEET_MANAGER", "DISPATCHER"]}><Trips /></RoleRoute>} />
        <Route path="maintenance" element={<RoleRoute roles={["FLEET_MANAGER"]}><Maintenance /></RoleRoute>} />
        <Route path="fuel-logs" element={<RoleRoute roles={["FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"]}><FuelLogs /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute roles={["FLEET_MANAGER", "FINANCIAL_ANALYST"]}><Reports /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute roles={["FLEET_MANAGER"]}><Settings /></RoleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
