import React, { useState } from "react";
import { MdCheck, MdClose, MdSecurity, MdBusiness, MdSave } from "react-icons/md";

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

const MODULES = [
  "Dashboard",
  "Vehicles",
  "Drivers",
  "Trips",
  "Maintenance",
  "Fuel Logs",
  "Reports",
];

const PERMISSIONS = {
  "Fleet Manager": {
    Dashboard: true,
    Vehicles: true,
    Drivers: true,
    Trips: true,
    Maintenance: true,
    "Fuel Logs": true,
    Reports: true,
  },
  Dispatcher: {
    Dashboard: true,
    Vehicles: true,
    Drivers: true,
    Trips: true,
    Maintenance: false,
    "Fuel Logs": false,
    Reports: false,
  },
  "Safety Officer": {
    Dashboard: true,
    Vehicles: false,
    Drivers: true,
    Trips: false,
    Maintenance: true,
    "Fuel Logs": false,
    Reports: true,
  },
  "Financial Analyst": {
    Dashboard: true,
    Vehicles: false,
    Drivers: false,
    Trips: false,
    Maintenance: false,
    "Fuel Logs": true,
    Reports: true,
  },
};

const Settings = () => {
  const [companyName, setCompanyName] = useState("TransitOps Logistics Pvt. Ltd.");
  const [adminEmail, setAdminEmail] = useState("admin@transitops.com");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // Mock save only — no backend wired up.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage role permissions and company configuration
        </p>
      </div>

      {/* RBAC Permissions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600">
            <MdSecurity size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Role Permissions</h2>
            <p className="text-xs text-slate-500">Module access by role</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>
                {MODULES.map((module) => (
                  <th
                    key={module}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {module}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLES.map((role) => (
                <tr key={role} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{role}</td>
                  {MODULES.map((module) => {
                    const allowed = PERMISSIONS[role][module];
                    return (
                      <td key={module} className="px-4 py-3.5 text-center">
                        {allowed ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <MdCheck size={16} />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                            <MdClose size={16} />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Settings Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
            <MdBusiness size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Company Settings</h2>
            <p className="text-xs text-slate-500">Organization details used across the platform</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 max-w-md space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Admin Email</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
            >
              <MdSave size={16} />
              Save Changes
            </button>
            {saved && (
              <span className="text-xs font-medium text-emerald-600">Changes saved.</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;