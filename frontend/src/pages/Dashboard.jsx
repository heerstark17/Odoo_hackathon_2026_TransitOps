import { useEffect, useMemo, useState } from "react";
import { MdAltRoute, MdBuild, MdDirectionsCar, MdPeople } from "react-icons/md";
import api from "../api/axios";

const label = (status) => status.replace("_", " ");

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ type: "", status: "", region: "" });

  useEffect(() => {
    api
      .get("/dashboard", { params: filters })
      .then((response) => setData(response.data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message ||
            "Could not load dashboard data.",
        ),
      );
  }, [filters]);

  const vehicleTotal = useMemo(
    () =>
      Object.values(data?.vehicleStatus || {}).reduce(
        (total, value) => total + value,
        0,
      ) || 1,
    [data],
  );

  if (error)
    return <div className="status-alert border px-4 py-3 text-sm">{error}</div>;
  if (!data)
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted">
        Loading your operations pulse…
      </div>
    );

  const k = data.kpis;
  const kpis = [
    {
      label: "Fleet roster",
      value: k.activeVehicles,
      detail: "vehicles active",
      icon: MdDirectionsCar,
    },
    {
      label: "Ready to dispatch",
      value: k.availableVehicles,
      detail: "available now",
      icon: MdAltRoute,
    },
    {
      label: "Workshop queue",
      value: k.vehiclesInMaintenance,
      detail: "assets in service",
      icon: MdBuild,
    },
    {
      label: "Active trips",
      value: k.activeTrips,
      detail: "currently dispatched",
      icon: MdAltRoute,
    },
    {
      label: "Pending trips",
      value: k.pendingTrips,
      detail: "awaiting dispatch",
      icon: MdAltRoute,
    },
    {
      label: "Crew on duty",
      value: k.driversOnDuty,
      detail: "drivers signed in",
      icon: MdPeople,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div>
          <p className="page-kicker">Dispatch board · live</p>
          <h1 className="page-title mt-2">Fleet command desk</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Read capacity at a glance, then move directly into the work that
            needs attention.
          </p>
        </div>
        <div className="surface-strong border-l-4 border-[var(--accent)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#d9e5dc]">
            Utilisation gauge
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <p className="font-display text-6xl leading-none">
              {k.fleetUtilization}%
            </p>
            <p className="max-w-32 text-right text-xs leading-5 text-[#c9d5cc]">
              of the roster is deployed or working
            </p>
          </div>
          <div className="mt-4 h-1.5 bg-white/15">
            <div
              className="h-full bg-[var(--accent)]"
              style={{ width: `${Math.min(k.fleetUtilization, 100)}%` }}
            />
          </div>
        </div>
      </header>

      <div className="surface grid gap-3 p-4 sm:grid-cols-3">
        {[
          ["type", "Vehicle type", ["TRUCK", "VAN", "BUS"]],
          ["status", "Status", ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]],
          ["region", "Region", ["NORTH", "SOUTH", "EAST", "WEST"]],
        ].map(([key, placeholder, options]) => (
          <label
            key={key}
            className="text-xs font-semibold uppercase tracking-wide text-muted"
          >
            {placeholder}
            <select
              value={filters[key]}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              className="input-control mt-1.5 rounded-md px-3 py-2 text-sm font-normal normal-case"
            >
              <option value="">All {placeholder.toLowerCase()}s</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <section className="grid border-y border-[var(--border)] sm:grid-cols-2 xl:grid-cols-7">
        {kpis.map(({ label: itemLabel, value, detail, icon: Icon }) => (
          <article
            key={itemLabel}
            className="border-b border-[var(--border)] border-t-2 border-t-[var(--accent)] px-4 py-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0 [&:nth-child(2)]:border-t-[var(--signal)] [&:nth-child(3)]:border-t-amber-400 [&:nth-child(4)]:border-t-blue-400 [&:nth-child(5)]:border-t-violet-400 [&:nth-child(6)]:border-t-rose-400 [&:nth-child(7)]:border-t-teal-400"
          >
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-semibold uppercase tracking-[.12em]">
                {itemLabel}
              </span>
              <Icon size={19} />
            </div>
            <p className="font-display mt-4 text-5xl leading-none">{value}</p>
            <p className="mt-2 text-xs text-muted">{detail}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[.82fr_1.45fr]">
        <section className="surface p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="page-kicker">Yard state</p>
              <h2 className="font-display mt-1 text-3xl">
                Vehicle availability
              </h2>
            </div>
            <span className="text-sm text-muted">{vehicleTotal} total</span>
          </div>
          <div className="mt-7 space-y-5">
            {Object.entries(data.vehicleStatus).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-medium capitalize">{label(key)}</span>
                  <span className="text-muted">{value} units</span>
                </div>
                <div className="mt-2 h-2 bg-[var(--surface-muted)]">
                  <div
                    className="h-full bg-[var(--signal)]"
                    style={{ width: `${(value / vehicleTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface overflow-hidden">
          <div className="flex items-end justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <p className="page-kicker">Manifest</p>
              <h2 className="font-display mt-1 text-3xl">Latest movements</h2>
            </div>
            <span className="text-xs font-medium text-muted">
              {data.recentTrips.length} entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="surface-muted text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  {["Trip", "Route", "Assignment", "Status"].map((column) => (
                    <th key={column} className="px-6 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.recentTrips.map((trip) => (
                  <tr key={trip._id}>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {trip.tripNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {trip.source} → {trip.destination}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {trip.vehicle?.registrationNumber} · {trip.driver?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="status-available inline-flex px-2 py-1 text-[11px] font-bold uppercase tracking-wide">
                        {label(trip.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
