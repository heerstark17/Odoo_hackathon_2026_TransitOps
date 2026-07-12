import { useEffect, useState } from "react";
import LiveTable from "../components/operations/LiveTable";
import api from "../api/axios";
const vehicleRelation = [
  { name: "vehicles", endpoint: "/vehicles", collectionKey: "vehicles" },
];
const fuelFields = [
  { name: "vehicle", label: "Vehicle", type: "select", optionsKey: "vehicles" },
  { name: "liters", label: "Liters", type: "number", min: "0.01" },
  { name: "cost", label: "Cost", type: "number", min: "0" },
  { name: "date", label: "Date", type: "date", required: false },
  {
    name: "odometerKm",
    label: "Odometer (km)",
    type: "number",
    min: "0",
    required: false,
  },
  { name: "fuelStation", label: "Fuel station", required: false },
];
const expenseFields = [
  { name: "vehicle", label: "Vehicle", type: "select", optionsKey: "vehicles" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "TOLL", label: "Toll" },
      { value: "PARKING", label: "Parking" },
      { value: "OTHER", label: "Other" },
    ],
  },
  { name: "amount", label: "Amount", type: "number", min: "0" },
  { name: "expenseDate", label: "Expense date", type: "date", required: false },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    full: true,
    required: false,
  },
];
const roles = ["FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"];
export default function FuelLogs() {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    api
      .get("/expenses/summary")
      .then((response) => setSummary(response.data))
      .catch(() => setSummary(null));
  }, []);
  const total = summary?.totalOperationalCost ?? summary?.totalCost ?? 0;
  return (
    <div className="space-y-8">
      <header>
        <p className="page-kicker">Operating ledger</p>
        <h1 className="page-title mt-2">Fuel &amp; expense management</h1>
        <p className="mt-3 text-sm text-muted">
          Capture every refuel, toll and incidental operating cost in one place.
        </p>
      </header>
      <LiveTable
        title="Fuel logs"
        description="Fuel consumption and odometer records."
        endpoint="/fuel-logs"
        collectionKey="fuelLogs"
        fields={fuelFields}
        related={vehicleRelation}
        createRoles={roles}
        columns={[
          {
            label: "Vehicle",
            value: (item) => item.vehicle?.registrationNumber,
          },
          { label: "Liters", value: (item) => `${item.liters} L` },
          { label: "Cost", value: "cost", type: "currency" },
          { label: "Date", value: "date", type: "date" },
        ]}
      />
      <LiveTable
        title="Other expenses (Toll / Misc)"
        description="Tolls, parking and other non-fuel spend."
        endpoint="/expenses"
        collectionKey="expenses"
        fields={expenseFields}
        related={vehicleRelation}
        createRoles={roles}
        columns={[
          {
            label: "Vehicle",
            value: (item) => item.vehicle?.registrationNumber,
          },
          { label: "Category", value: "category", type: "status" },
          { label: "Amount", value: "amount", type: "currency" },
          { label: "Date", value: "expenseDate", type: "date" },
        ]}
      />
      <footer className="surface-strong flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-[var(--accent)] px-5 py-4">
        <span className="text-sm text-[#d9e5dc]">
          Total Operational Cost (Auto) = Fuel + Maintenance
        </span>
        <strong className="font-display text-3xl">
          ₹{Number(total).toLocaleString("en-IN")}
        </strong>
      </footer>
    </div>
  );
}
