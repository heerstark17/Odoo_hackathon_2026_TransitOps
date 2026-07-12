import React, { useState, useMemo } from "react";
import {
  MdAdd,
  MdClose,
  MdAltRoute,
  MdCheckCircleOutline,
  MdCancel,
  MdSocialDistance,
  MdEdit,
  MdDeleteOutline,
  MdVisibility,
  MdErrorOutline,
} from "react-icons/md";

const MOCK_VEHICLES = [
  { id: "VH-01", regNumber: "MH-12-AB-3345", capacity: 750, status: "Available" },
  { id: "VH-02", regNumber: "MH-04-GH-9021", capacity: 4900, status: "On Trip" },
  { id: "VH-03", regNumber: "MH-27-PQ-4456", capacity: 5500, status: "Available" },
];

const MOCK_DRIVERS = [
  { id: "DR-01", name: "Rakesh Sharma", licenseExpiry: "2027-05-14", status: "On Trip" },
  { id: "DR-02", name: "Sunil Yadav", licenseExpiry: "2026-12-10", status: "Available" },
  { id: "DR-03", name: "Vikram Singh", licenseExpiry: "2026-08-02", status: "Available" },
  { id: "DR-04", name: "Ajay Deshmukh", licenseExpiry: "2025-11-19", status: "Available" },
];

const INITIAL_TRIPS = [
  {
    id: "TR-2291",
    vehicle: "MH-12-AB-3345",
    driver: "Rakesh Sharma",
    source: "Pune",
    destination: "Nagpur",
    cargoWeight: 620,
    distance: 712,
    status: "Dispatched",
  },
  {
    id: "TR-2287",
    vehicle: "MH-04-GH-9021",
    driver: "Sunil Yadav",
    source: "Mumbai",
    destination: "Surat",
    cargoWeight: 3800,
    distance: 284,
    status: "Completed",
  },
  {
    id: "TR-2279",
    vehicle: "MH-27-PQ-4456",
    driver: "Vikram Singh",
    source: "Nashik",
    destination: "Aurangabad",
    cargoWeight: 1900,
    distance: 205,
    status: "Completed",
  },
  {
    id: "TR-2265",
    vehicle: "MH-27-PQ-4456",
    driver: "Vikram Singh",
    source: "Kolhapur",
    destination: "Belagavi",
    cargoWeight: 4100,
    distance: 98,
    status: "Cancelled",
  },
  {
    id: "TR-2301",
    vehicle: "—",
    destination: "Indore",
    source: "Bhopal",
    driver: "—",
    cargoWeight: 0,
    distance: 190,
    status: "Draft",
  },
];

const STATUS_STYLES = {
  Draft: "bg-slate-100 text-slate-500 border border-slate-200",
  Dispatched: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

const isLicenseExpired = (expiryStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(expiryStr) < today;
};

const emptyForm = {
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeight: "",
  distance: "",
};

const Trips = () => {
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => {
    const active = trips.filter((t) => t.status === "Dispatched").length;
    const completed = trips.filter((t) => t.status === "Completed").length;
    const cancelled = trips.filter((t) => t.status === "Cancelled").length;
    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    return { active, completed, cancelled, totalDistance };
  }, [trips]);

  const STAT_CARDS = [
    {
      label: "Active Trips",
      value: stats.active,
      icon: MdAltRoute,
      accent: "bg-cyan-500/10 text-cyan-600",
    },
    {
      label: "Completed Trips",
      value: stats.completed,
      icon: MdCheckCircleOutline,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Cancelled Trips",
      value: stats.cancelled,
      icon: MdCancel,
      accent: "bg-rose-500/10 text-rose-600",
    },
    {
      label: "Total Distance",
      value: `${stats.totalDistance.toLocaleString()} km`,
      icon: MdSocialDistance,
      accent: "bg-indigo-500/10 text-indigo-600",
    },
  ];

  const openModal = () => {
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Live validation — recalculated on every form change
  const { errors, isFormComplete } = useMemo(() => {
    const validationErrors = [];
    const vehicle = MOCK_VEHICLES.find((v) => v.id === form.vehicleId);
    const driver = MOCK_DRIVERS.find((d) => d.id === form.driverId);
    const cargoWeight = Number(form.cargoWeight);

    const formComplete = Boolean(
      form.source.trim() &&
        form.destination.trim() &&
        form.vehicleId &&
        form.driverId &&
        form.cargoWeight &&
        form.distance
    );

    if (vehicle && cargoWeight > vehicle.capacity) {
      validationErrors.push(
        `Cargo exceeds capacity — ${vehicle.regNumber} max is ${vehicle.capacity} kg.`
      );
    }
    if (vehicle && vehicle.status === "On Trip") {
      validationErrors.push(`Vehicle ${vehicle.regNumber} is already assigned to another trip.`);
    }
    if (driver && driver.status === "On Trip") {
      validationErrors.push(`Driver ${driver.name} is already assigned to another trip.`);
    }
    if (driver && isLicenseExpired(driver.licenseExpiry)) {
      validationErrors.push(`Driver ${driver.name}'s license has expired.`);
    }

    return { errors: validationErrors, isFormComplete: formComplete };
  }, [form]);

  const canSubmit = isFormComplete && errors.length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const vehicle = MOCK_VEHICLES.find((v) => v.id === form.vehicleId);
    const driver = MOCK_DRIVERS.find((d) => d.id === form.driverId);

    const newTrip = {
      id: `TR-${2300 + trips.length + 1}`,
      vehicle: vehicle.regNumber,
      driver: driver.name,
      source: form.source,
      destination: form.destination,
      cargoWeight: Number(form.cargoWeight),
      distance: Number(form.distance),
      status: "Draft",
    };

    setTrips((prev) => [newTrip, ...prev]);
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Trips Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Dispatch, track, and manage fleet trips
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
        >
          <MdAdd size={18} />
          Create Trip
        </button>
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
              <Icon size={20} />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Trips Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Trip ID</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Driver</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Source</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Destination</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Cargo Weight</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Distance</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map((trip) => (
                <tr key={trip.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{trip.id}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{trip.vehicle}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{trip.driver}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{trip.source}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{trip.destination}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {trip.cargoWeight ? `${trip.cargoWeight} kg` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{trip.distance} km</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[trip.status]}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="View trip">
                        <MdVisibility size={17} />
                      </button>
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600" aria-label="Edit trip">
                        <MdEdit size={17} />
                      </button>
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Delete trip">
                        <MdDeleteOutline size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-800">Create Trip</h2>
              <button
                onClick={closeModal}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close modal"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              {errors.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <ul className="space-y-1">
                    {errors.map((err) => (
                      <li key={err} className="flex items-start gap-1.5 text-xs text-rose-700">
                        <MdErrorOutline size={14} className="mt-0.5 shrink-0" />
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Source</label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={handleChange("source")}
                    placeholder="e.g. Pune"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Destination</label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={handleChange("destination")}
                    placeholder="e.g. Nagpur"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Vehicle</label>
                <select
                  value={form.vehicleId}
                  onChange={handleChange("vehicleId")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">Select vehicle</option>
                  {MOCK_VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} — {v.capacity} kg ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Driver</label>
                <select
                  value={form.driverId}
                  onChange={handleChange("driverId")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">Select driver</option>
                  {MOCK_DRIVERS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    value={form.cargoWeight}
                    onChange={handleChange("cargoWeight")}
                    placeholder="e.g. 620"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Distance (km)</label>
                  <input
                    type="number"
                    value={form.distance}
                    onChange={handleChange("distance")}
                    placeholder="e.g. 712"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;