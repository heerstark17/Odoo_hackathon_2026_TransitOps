import LiveTable from "../components/operations/LiveTable";
const fields = [
  { name: "vehicle", label: "Vehicle", type: "select", optionsKey: "vehicles" },
  { name: "maintenanceType", label: "Service type" },
  { name: "cost", label: "Cost", type: "number", min: "0" },
  {
    name: "odometerKm",
    label: "Odometer (km)",
    type: "number",
    min: "0",
    required: false,
  },
  { name: "openedAt", label: "Service date", type: "date", required: false },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    full: true,
    required: false,
  },
];
export default function Maintenance() {
  return (
    <LiveTable
      title="Maintenance"
      description="Opening a maintenance log automatically places an available vehicle in the shop."
      endpoint="/maintenance"
      collectionKey="maintenanceLogs"
      fields={fields}
      recordLabel="maintenance log"
      createRoles={["FLEET_MANAGER"]}
      related={[
        {
          name: "vehicles",
          endpoint: "/vehicles?status=AVAILABLE",
          collectionKey: "vehicles",
        },
      ]}
      columns={[
        { label: "Vehicle", value: (item) => item.vehicle?.registrationNumber },
        { label: "Service", value: "maintenanceType" },
        { label: "Opened", value: "openedAt", type: "date" },
        { label: "Cost", value: "cost", type: "currency" },
        { label: "Status", value: "status", type: "status" },
      ]}
    />
  );
}
