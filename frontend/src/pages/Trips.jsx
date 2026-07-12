import { useEffect, useState } from "react";
import { MdCheck, MdCancel, MdPlayArrow } from "react-icons/md";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const initial = {
  tripNumber: "",
  source: "",
  destination: "",
  vehicle: "",
  driver: "",
  cargoWeightKg: "",
  plannedDistanceKm: "",
  plannedStartAt: "",
  estimatedArrivalAt: "",
  revenue: "",
};
const statusClass = {
  DRAFT: "status-neutral",
  DISPATCHED: "status-on-trip",
  COMPLETED: "status-available",
  CANCELLED: "status-alert",
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const canManage = ["FLEET_MANAGER", "DISPATCHER"].includes(user?.role);
  const load = async () => {
    try {
      const [tripResponse, vehicleResponse, driverResponse] = await Promise.all(
        [
          api.get("/trips"),
          api.get("/vehicles?status=AVAILABLE"),
          api.get("/drivers/available"),
        ],
      );
      setTrips(tripResponse.data.trips || []);
      setVehicles(vehicleResponse.data.vehicles || []);
      setDrivers(driverResponse.data.drivers || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load trip operations.",
      );
    }
  };
  useEffect(() => {
    load();
  }, []);
  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle._id === form.vehicle,
  );
  const overage = Math.max(
    Number(form.cargoWeightKg || 0) -
      Number(selectedVehicle?.maxLoadCapacityKg || 0),
    0,
  );
  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const create = async (event) => {
    event.preventDefault();
    if (overage) return;
    setBusy(true);
    try {
      await api.post("/trips", form);
      setForm(initial);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not create trip.",
      );
    } finally {
      setBusy(false);
    }
  };
  const action = async (trip, kind) => {
    try {
      if (kind === "complete") {
        const endOdometerKm = window.prompt("Enter final odometer (km):");
        const fuelConsumedLiters = window.prompt(
          "Enter fuel consumed (liters):",
        );
        if (endOdometerKm === null || fuelConsumedLiters === null) return;
        await api.patch(`/trips/${trip._id}/complete`, {
          endOdometerKm,
          fuelConsumedLiters,
        });
      } else await api.patch(`/trips/${trip._id}/${kind}`);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Trip transition failed.",
      );
    }
  };
  return (
    <div className="space-y-6">
      <header>
        <p className="page-kicker">Dispatch control</p>
        <h1 className="page-title mt-2">Trip dispatcher</h1>
        <p className="mt-3 text-sm text-muted">
          Build an assignment on the left, then follow every move on the live
          board.
        </p>
      </header>
      {error && (
        <div className="status-alert border px-4 py-3 text-sm">{error}</div>
      )}
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.35fr]">
        <section className="surface h-fit p-5">
          <p className="page-kicker">Create trip</p>
          <div className="mt-4 grid grid-cols-4 gap-1">
            {["Draft", "Dispatched", "Completed", "Cancelled"].map(
              (step, index) => (
                <div key={step}>
                  <div
                    className={`h-1 ${index === 0 ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  />
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-wide text-muted">
                    {step}
                  </span>
                </div>
              ),
            )}
          </div>
          {canManage ? (
            <form onSubmit={create} className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["tripNumber", "Trip number", "text"],
                ["source", "Source", "text"],
                ["destination", "Destination", "text"],
                ["cargoWeightKg", "Cargo weight (kg)", "number"],
                ["plannedDistanceKm", "Planned distance (km)", "number"],
                ["plannedStartAt", "Planned start", "datetime-local"],
              ].map(([key, label, type]) => (
                <label
                  key={key}
                  className="text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {label}
                  <input
                    required
                    type={type}
                    value={form[key]}
                    onChange={change(key)}
                    className="input-control mt-1.5 rounded-md px-3 py-2 text-sm font-normal"
                  />
                </label>
              ))}
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                Vehicle
                <select
                  required
                  value={form.vehicle}
                  onChange={change("vehicle")}
                  className="input-control mt-1.5 rounded-md px-3 py-2 text-sm font-normal"
                >
                  <option value="">Available vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.registrationNumber} ·{" "}
                      {Number(vehicle.maxLoadCapacityKg).toLocaleString()} kg
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                Driver
                <select
                  required
                  value={form.driver}
                  onChange={change("driver")}
                  className="input-control mt-1.5 rounded-md px-3 py-2 text-sm font-normal"
                >
                  <option value="">Available driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} · {driver.licenseCategory}
                    </option>
                  ))}
                </select>
              </label>
              {overage > 0 && (
                <div className="status-alert border p-3 text-xs leading-5 sm:col-span-2">
                  Cargo exceeds vehicle capacity:{" "}
                  {selectedVehicle?.maxLoadCapacityKg} kg capacity ·{" "}
                  {form.cargoWeightKg} kg requested · {overage} kg over.
                </div>
              )}
              <button
                disabled={busy || overage > 0}
                className="accent-button mt-2 rounded-md py-3 text-sm font-semibold disabled:opacity-50 sm:col-span-2"
              >
                {busy ? "Creating…" : "Create draft trip"}
              </button>
            </form>
          ) : (
            <p className="mt-5 text-sm text-muted">
              Your role can monitor the board but cannot create trips.
            </p>
          )}
          <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-muted">
            On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver
            Available.
          </p>
        </section>
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="page-kicker">Live board</p>
              <h2 className="font-display mt-1 text-3xl">Current movements</h2>
            </div>
            <span className="text-xs text-muted">{trips.length} trips</span>
          </div>
          {trips.map((trip) => (
            <article
              key={trip._id}
              className="surface border-l-4 border-l-[var(--accent)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{trip.tripNumber}</p>
                  <p className="mt-1 text-sm text-muted">
                    {trip.source} → {trip.destination}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {trip.vehicle?.registrationNumber || "Unassigned"} ·{" "}
                    {trip.driver?.name || "Awaiting driver"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass[trip.status]}`}
                  >
                    {trip.status}
                  </span>
                  <p className="mt-2 text-xs text-muted">
                    {trip.estimatedArrivalAt
                      ? `ETA ${new Date(trip.estimatedArrivalAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                      : trip.status === "DRAFT"
                        ? "Awaiting dispatch"
                        : "In progress"}
                  </p>
                  {canManage && (
                    <div className="mt-3 flex justify-end gap-2">
                      {trip.status === "DRAFT" && (
                        <>
                          <button
                            onClick={() => action(trip, "dispatch")}
                            className="status-on-trip p-2"
                            title="Dispatch"
                          >
                            <MdPlayArrow />
                          </button>
                          <button
                            onClick={() => action(trip, "cancel")}
                            className="status-alert p-2"
                            title="Cancel"
                          >
                            <MdCancel />
                          </button>
                        </>
                      )}
                      {trip.status === "DISPATCHED" && (
                        <>
                          <button
                            onClick={() => action(trip, "complete")}
                            className="status-available p-2"
                            title="Complete"
                          >
                            <MdCheck />
                          </button>
                          <button
                            onClick={() => action(trip, "cancel")}
                            className="status-alert p-2"
                            title="Cancel"
                          >
                            <MdCancel />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
