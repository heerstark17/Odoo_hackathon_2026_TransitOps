import LiveTable from "../components/operations/LiveTable";
const fields = [
  { name: "name", label: "Driver name" },
  { name: "licenseNumber", label: "License number" },
  {
    name: "licenseCategory",
    label: "License category",
    placeholder: "HMV or LMV",
  },
  { name: "licenseExpiryDate", label: "License expiry", type: "date" },
  { name: "contactNumber", label: "Contact number" },
  {
    name: "safetyScore",
    label: "Safety score",
    type: "number",
    min: "0",
    defaultValue: "100",
  },
];
export default function Drivers() {
  return (
    <LiveTable
      title="Drivers"
      description="Compliance-ready driver profiles and safety status."
      endpoint="/drivers"
      collectionKey="drivers"
      fields={fields}
      createRoles={["FLEET_MANAGER", "SAFETY_OFFICER"]}
      filters={[
        {
          name: "status",
          label: "Quick status",
          options: ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"],
        },
      ]}
      helperText="Expired license or Suspended status → blocked from trip assignment."
      columns={[
        { label: "Driver", value: "name" },
        { label: "License", value: "licenseNumber" },
        { label: "Category", value: "licenseCategory" },
        {
          label: "Expires",
          value: "licenseExpiryDate",
          render: (item) => (
            <span>
              {new Date(item.licenseExpiryDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {new Date(item.licenseExpiryDate) < new Date() && (
                <b className="status-alert ml-2 px-1.5 py-0.5 text-[10px]">
                  EXPIRED
                </b>
              )}
            </span>
          ),
        },
        { label: "Safety", value: (item) => `${item.safetyScore}/100` },
        { label: "Status", value: "status", type: "status" },
      ]}
    />
  );
}
