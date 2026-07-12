import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MdLocalShipping,
  MdLocalGasStation,
  MdAttachMoney,
  MdSpeed,
} from "react-icons/md";

const FLEET_UTILIZATION = [
  { name: "Available", value: 89, color: "#10b981" },
  { name: "On Trip", value: 37, color: "#06b6d4" },
  { name: "In Shop", value: 9, color: "#f59e0b" },
  { name: "Retired", value: 7, color: "#94a3b8" },
];

const FUEL_EFFICIENCY = [
  { month: "Feb", kmpl: 8.4 },
  { month: "Mar", kmpl: 8.7 },
  { month: "Apr", kmpl: 8.2 },
  { month: "May", kmpl: 9.1 },
  { month: "Jun", kmpl: 8.9 },
  { month: "Jul", kmpl: 9.4 },
];

const MONTHLY_EXPENSES = [
  { month: "Feb", fuel: 210000, maintenance: 84000, toll: 32000 },
  { month: "Mar", fuel: 228000, maintenance: 61000, toll: 35000 },
  { month: "Apr", fuel: 195000, maintenance: 97000, toll: 30000 },
  { month: "May", fuel: 241000, maintenance: 72000, toll: 38000 },
  { month: "Jun", fuel: 233000, maintenance: 58000, toll: 36000 },
  { month: "Jul", fuel: 252000, maintenance: 90000, toll: 41000 },
];

const VEHICLE_PERFORMANCE = [
  { vehicle: "MH-12-AB", distance: 8420, trips: 24 },
  { vehicle: "MH-04-GH", distance: 11250, trips: 19 },
  { vehicle: "MH-20-XY", distance: 9680, trips: 22 },
  { vehicle: "MH-01-JK", distance: 6540, trips: 17 },
  { vehicle: "MH-27-PQ", distance: 10120, trips: 21 },
];

const SUMMARY_CARDS = [
  { label: "Fleet Utilization", value: "72%", icon: MdLocalShipping, accent: "bg-cyan-500/10 text-cyan-600" },
  { label: "Avg. Fuel Efficiency", value: "8.8 km/l", icon: MdLocalGasStation, accent: "bg-emerald-500/10 text-emerald-600" },
  { label: "Monthly Operational Cost", value: "₹3.83L", icon: MdAttachMoney, accent: "bg-purple-500/10 text-purple-600" },
  { label: "Avg. Distance / Vehicle", value: "9,202 km", icon: MdSpeed, accent: "bg-amber-500/10 text-amber-600" },
];

const currencyFormatter = (value) => `₹${(value / 1000).toFixed(0)}k`;

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fleet performance, cost, and efficiency insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
              <Icon size={20} />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fleet Utilization - Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Fleet Utilization</h2>
          <p className="mt-0.5 text-xs text-slate-500">Current vehicle status breakdown</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FLEET_UTILIZATION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {FLEET_UTILIZATION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Efficiency - Line Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Fuel Efficiency</h2>
          <p className="mt-0.5 text-xs text-slate-500">Average km/l across the fleet</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FUEL_EFFICIENCY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[7, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="kmpl"
                  name="km/l"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#06b6d4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Expenses - Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Monthly Expenses</h2>
          <p className="mt-0.5 text-xs text-slate-500">Fuel, maintenance & toll costs</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_EXPENSES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={currencyFormatter} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                <Legend />
                <Bar dataKey="fuel" name="Fuel" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="toll" name="Toll" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Performance - Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Vehicle Performance</h2>
          <p className="mt-0.5 text-xs text-slate-500">Distance covered by top vehicles</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VEHICLE_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="vehicle" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="distance" name="Distance (km)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;