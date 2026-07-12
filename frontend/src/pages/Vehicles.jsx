import LiveTable from "../components/operations/LiveTable";
const fields = [
  {
    name: "registrationNumber",
    label: "Registration number",
    placeholder: "MH12TR1001",
    pattern: "[A-Za-z]{2}\\d{2}[A-Za-z]{1,3}\\d{4}",
    title: "Use a valid registration number, for example MH12TR1001.",
  },
  { name: "nameOrModel", label: "Name / model", minLength: 3, maxLength: 80 },
  {
    name: "type",
    label: "Vehicle type",
    type: "select",
    options: ["TRUCK", "VAN", "BUS"],
  },
  {
    name: "maxLoadCapacityKg",
    label: "Capacity (kg)",
    type: "number",
    min: "100",
    max: "100000",
  },
  { name: "odometerKm", label: "Odometer (km)", type: "number", min: "0", max: "5000000" },
  {
    name: "acquisitionCost",
    label: "Acquisition cost",
    type: "number",
    min: "50000",
    max: "100000000",
  },
  {
    name: "region",
    label: "Region",
    type: "select",
    required: false,
    options: ["NORTH", "SOUTH", "EAST", "WEST"],
  },
];
export default function Vehicles() {
  return (
    <LiveTable
      title="Fleet"
      description="A live registry of fleet assets, availability and investment."
      endpoint="/vehicles"
      collectionKey="vehicles"
      fields={fields}
      recordLabel="vehicle"
      createRoles={["FLEET_MANAGER"]}
      filters={[
        { name: "type", label: "Type", options: ["TRUCK", "VAN", "BUS"] },
        {
          name: "status",
          label: "Status",
          options: ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"],
        },
      ]}
      helperText="Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher."
      columns={[
        { label: "Registration", value: "registrationNumber" },
        { label: "Vehicle", value: "nameOrModel" },
        { label: "Type", value: "type" },
        { label: "Capacity", value: "maxLoadCapacityKg", type: "number" },
        { label: "Odometer", value: "odometerKm", type: "number" },
        { label: "Status", value: "status", type: "status" },
      ]}
    />
  );
}
