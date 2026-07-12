import React, { useState } from "react";
import {
  MdSearch,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdVisibility,
  MdPerson,
  MdWarningAmber,
} from "react-icons/md";

const MOCK_DRIVERS = [
  {
    id: "D-2001",
    name: "Rakesh Sharma",
    licenseNumber: "MH12-20180045678",
    licenseExpiry: "2027-05-14",
    contact: "+91 98765 43210",
    safetyScore: 92,
    status: "On Trip",
  },
  {
    id: "D-2002",
    name: "Sunil Yadav",
    licenseNumber: "MH04-20150098231",
    licenseExpiry: "2026-07-28",
    contact: "+91 91234 56780",
    safetyScore: 87,
    status: "On Trip",
  },
  {
    id: "D-2003",
    name: "Ramesh Patil",
    licenseNumber: "MH14-20190076543",
    licenseExpiry: "2026-06-30",
    contact: "+91 99887 66554",
    safetyScore: 78,
    status: "Available",
  },
  {
    id: "D-2004",
    name: "Vikram Singh",
    licenseNumber: "MH20-20170034521",
    licenseExpiry: "2026-08-02",
    contact: "+91 90909 80808",
    safetyScore: 95,
    status: "Available",
  },
  {
    id: "D-2005",
    name: "Ajay Deshmukh",
    licenseNumber: "MH31-20160012398",
    licenseExpiry: "2025-11-19",
    contact: "+91 93456 12378",
    safetyScore: 64,
    status: "Off Duty",
  },
  {
    id: "D-2006",
    name: "Prakash Jadhav",
    licenseNumber: "MH01-20140056712",
    licenseExpiry: "2026-09-10",
    contact: "+91 97654 32109",
    safetyScore: 55,
    status: "Suspended",
  },
  {
    id: "D-2007",
    name: "Manoj Kumar Verma",
    licenseNumber: "MH27-20200098765",
    licenseExpiry: "2028-01-22",
    contact: "+91 96543 21098",
    safetyScore: 89,
    status: "Available",
  },
];

const STATUS_STYLES = {
  Available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "On Trip": "bg-cyan-50 text-cyan-700 border border-cyan-200",
  "Off Duty": "bg-slate-100 text-slate-500 border border-slate-200",
  Suspended: "bg-rose-50 text-rose-700 border border-rose-200",
};

const DAY_MS = 24 * 60 * 60 * 1000;

const getExpiryState = (expiryDateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  const daysRemaining = Math.round((expiry - today) / DAY_MS);

  if (daysRemaining < 0) return "expired";
  if (daysRemaining <= 30) return "expiring";
  return "valid";
};

const EXPIRY_STYLES = {
  expired: "bg-red-50 text-red-700 border border-red-200",
  expiring: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  valid: "text-slate-600",
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const safetyScoreColor = (score) => {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-rose-600";
};

const Drivers = () => {
  const [search, setSearch] = useState("");

  const filteredDrivers = MOCK_DRIVERS.filter((driver) => {
    const query = search.toLowerCase();
    return (
      driver.name.toLowerCase().includes(query) ||
      driver.licenseNumber.toLowerCase().includes(query) ||
      driver.contact.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Drivers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage driver roster, licenses, and safety performance
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600">
          <MdAdd size={18} />
          Add Driver
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-sm">
          <MdSearch
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, license, contact..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      {/* Driver Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Driver Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  License Number
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  License Expiry
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact Number
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Safety Score
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.map((driver) => {
                const expiryState = getExpiryState(driver.licenseExpiry);
                return (
                  <tr key={driver.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <MdPerson size={16} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {driver.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {driver.licenseNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${EXPIRY_STYLES[expiryState]}`}
                      >
                        {expiryState !== "valid" && <MdWarningAmber size={13} />}
                        {formatDate(driver.licenseExpiry)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{driver.contact}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-semibold ${safetyScoreColor(driver.safetyScore)}`}>
                        {driver.safetyScore}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[driver.status]}`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          aria-label="View driver"
                        >
                          <MdVisibility size={17} />
                        </button>
                        <button
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600"
                          aria-label="Edit driver"
                        >
                          <MdEdit size={17} />
                        </button>
                        <button
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                          aria-label="Delete driver"
                        >
                          <MdDeleteOutline size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                    No drivers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Drivers;