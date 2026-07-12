import React, { useState } from "react";
import {
  MdSearch,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdVisibility,
  MdLocalShipping,
} from "react-icons/md";

const MOCK_VEHICLES = [
  {
    id: "V-1001",
    regNumber: "MH-12-AB-3345",
    model: "Tata Ace Gold",
    type: "Mini Truck",
    capacity: "750 kg",
    status: "Available",
  },
  {
    id: "V-1002",
    regNumber: "MH-14-CD-7712",
    model: "Ashok Leyland Dost+",
    type: "Light Truck",
    capacity: "1,500 kg",
    status: "In Shop",
  },
  {
    id: "V-1003",
    regNumber: "MH-04-GH-9021",
    model: "Eicher Pro 2049",
    type: "Medium Truck",
    capacity: "4,900 kg",
    status: "On Trip",
  },
  {
    id: "V-1004",
    regNumber: "MH-20-XY-5567",
    model: "Mahindra Furio 7",
    type: "Medium Truck",
    capacity: "4,000 kg",
    status: "On Trip",
  },
  {
    id: "V-1005",
    regNumber: "MH-01-JK-2210",
    model: "Tata 407 Gold SFC",
    type: "Light Truck",
    capacity: "2,500 kg",
    status: "Available",
  },
  {
    id: "V-1006",
    regNumber: "MH-31-LM-8834",
    model: "BharatBenz 1617R",
    type: "Heavy Truck",
    capacity: "10,500 kg",
    status: "Retired",
  },
  {
    id: "V-1007",
    regNumber: "MH-27-PQ-4456",
    model: "Ashok Leyland Ecomet",
    type: "Medium Truck",
    capacity: "5,500 kg",
    status: "Available",
  },
];

const STATUS_STYLES = {
  Available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "On Trip": "bg-cyan-50 text-cyan-700 border border-cyan-200",
  "In Shop": "bg-amber-50 text-amber-700 border border-amber-200",
  Retired: "bg-slate-100 text-slate-500 border border-slate-200",
};

const Vehicles = () => {
  const [search, setSearch] = useState("");

  const filteredVehicles = MOCK_VEHICLES.filter((vehicle) => {
    const query = search.toLowerCase();
    return (
      vehicle.regNumber.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Vehicles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your fleet inventory and vehicle status
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600">
          <MdAdd size={18} />
          Add Vehicle
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
            placeholder="Search by registration, model, type..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Registration Number
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Model
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Capacity
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
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600">
                        <MdLocalShipping size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {vehicle.regNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{vehicle.model}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{vehicle.type}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{vehicle.capacity}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[vehicle.status]}`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="View vehicle"
                      >
                        <MdVisibility size={17} />
                      </button>
                      <button
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600"
                        aria-label="Edit vehicle"
                      >
                        <MdEdit size={17} />
                      </button>
                      <button
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                        aria-label="Delete vehicle"
                      >
                        <MdDeleteOutline size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    No vehicles match your search.
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

export default Vehicles;