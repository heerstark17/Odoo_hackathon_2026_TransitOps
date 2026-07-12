import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/axios";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/analytics")
      .then((response) => setData(response.data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message ||
            "Analytics is available to Fleet Managers and Financial Analysts.",
        ),
      );
  }, []);

  if (error)
    return <div className="status-alert border px-4 py-3 text-sm">{error}</div>;
  if (!data)
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted">
        Calculating fleet performance…
      </div>
    );

  const metrics = [
    ["Fuel efficiency", `${data.kpis.fuelEfficiencyKmPerLiter} km/L`],
    ["Operational cost", money(data.kpis.operationalCost)],
    ["Fleet revenue", money(data.kpis.revenue)],
    ["Vehicle ROI", `${data.kpis.vehicleRoiPercent}%`],
  ];
  const chart = data.monthlyRevenue.map((item) => ({
    ...item,
    label: new Date(item.year, item.month - 1).toLocaleString("en", {
      month: "short",
    }),
  }));

  return (
    <div className="space-y-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="page-kicker">Finance ledger · live</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Cost, revenue &amp; return</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              A financial readout of completed trips, fuel usage and maintenance
              activity.
            </p>
          </div>
          <p className="font-display text-3xl text-[var(--accent-strong)]">
            FY 2026
          </p>
        </div>
      </header>
      <section className="grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="bg-[var(--surface)] px-5 py-6">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">
              {label}
            </p>
            <p className="font-display mt-3 text-4xl leading-none">{value}</p>
          </article>
        ))}
      </section>
      <p className="border-l-2 border-[var(--accent)] pl-3 text-xs text-muted">
        ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost.
      </p>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <section className="surface p-6">
          <p className="page-kicker">Revenue runway</p>
          <h2 className="font-display mt-1 text-3xl">Monthly billing</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#d6d0c5" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#647067", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  tick={{ fill: "#647067", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => money(value)}
                  cursor={{ fill: "#ebe7df" }}
                />
                <Bar dataKey="revenue" fill="#d95d39" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <aside className="surface-strong p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#d9e5dc]">
            Cost watch
          </p>
          <h2 className="font-display mt-1 text-3xl">Highest-cost assets</h2>
          <div className="mt-8 space-y-6">
            {data.costliestVehicles.map((item) => (
              <div key={item.vehicle._id}>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-semibold">
                    {item.vehicle.registrationNumber}
                  </span>
                  <span className="text-[#d9e5dc]">{money(item.cost)}</span>
                </div>
                <div className="mt-2 h-1.5 bg-white/15">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{
                      width: `${(item.cost / (data.costliestVehicles[0]?.cost || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
