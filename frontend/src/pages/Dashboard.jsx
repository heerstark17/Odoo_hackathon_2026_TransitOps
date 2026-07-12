import React from "react";
import {
  MdLocalShipping,
  MdCheckCircleOutline,
  MdAltRoute,
  MdPeopleAlt,
  MdBuild,
  MdAttachMoney,
  MdAddCircleOutline,
  MdAddRoad,
  MdEventAvailable,
  MdArrowUpward,
  MdArrowDownward,
  MdFiberManualRecord,
} from "react-icons/md";

const KPI_CARDS = [
  {
    label: "Total Vehicles",
    value: "142",
    trend: "+4.2%",
    trendUp: true,
    icon: MdLocalShipping,
    accent: "bg-cyan-500/10 text-cyan-600",
  },
  {
    label: "Available Vehicles",
    value: "89",
    trend: "+1.8%",
    trendUp: true,
    icon: MdCheckCircleOutline,
    accent: "bg-emerald-500/10 text-emerald-600",
  },
  {
    label: "Active Trips",
    value: "37",
    trend: "+6.5%",
    trendUp: true,
    icon: MdAltRoute,
    accent: "bg-indigo-500/10 text-indigo-600",
  },
  {
    label: "Drivers On Duty",
    value: "64",
    trend: "-2.1%",
    trendUp: false,
    icon: MdPeopleAlt,
    accent: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Vehicles In Maintenance",
    value: "9",
    trend: "+0.9%",
    trendUp: false,
    icon: MdBuild,
    accent: "bg-rose-500/10 text-rose-600",
  },
  {
    label: "Monthly Expenses",
    value: "₹8.4L",
    trend: "+3.4%",
    trendUp: false,
    icon: MdAttachMoney,
    accent: "bg-purple-500/10 text-purple-600",
  },
];

const FLEET_OVERVIEW = [
  { label: "Available", count: 89, total: 142, color: "bg-emerald-500" },
  { label: "On Trip", count: 37, total: 142, color: "bg-cyan-500" },
  { label: "In Shop", count: 9, total: 142, color: "bg-amber-500" },
  { label: "Retired", count: 7, total: 142, color: "bg-slate-400" },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    text: "Trip #TR-2291 dispatched — Pune to Nagpur",
    meta: "Vehicle MH-12-AB-3345 · Driver Rakesh Sharma",
    time: "12 min ago",
    color: "bg-cyan-500",
  },
  {
    id: 2,
    text: "Vehicle MH-14-CD-7712 moved to In Shop",
    meta: "Scheduled brake inspection",
    time: "48 min ago",
    color: "bg-amber-500",
  },
  {
    id: 3,
    text: "Trip #TR-2287 completed — Mumbai to Surat",
    meta: "Vehicle MH-04-GH-9021 · Driver Sunil Yadav",
    time: "1 hr ago",
    color: "bg-emerald-500",
  },
  {
    id: 4,
    text: "Driver Ramesh Patil license renewed",
    meta: "New expiry: 14 Mar 2028",
    time: "2 hr ago",
    color: "bg-indigo-500",
  },
  {
    id: 5,
    text: "Fuel log added for MH-20-XY-5567",
    meta: "142.5 L · ₹14,820",
    time: "3 hr ago",
    color: "bg-purple-500",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Add Vehicle",
    icon: MdAddCircleOutline,
    accent: "bg-cyan-500 hover:bg-cyan-600",
  },
  {
    label: "Create Trip",
    icon: MdAddRoad,
    accent: "bg-indigo-500 hover:bg-indigo-600",
  },
  {
    label: "Schedule Maintenance",
    icon: MdEventAvailable,
    accent: "bg-amber-500 hover:bg-amber-600",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, Akash — here's what's happening with your fleet today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {KPI_CARDS.map(({ label, value, trend, trendUp, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
                <Icon size={20} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  trendUp ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trendUp ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
                {trend}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fleet Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-800">Fleet Overview</h2>
          <p className="mt-0.5 text-xs text-slate-500">Current status breakdown</p>

          <div className="mt-5 space-y-4">
            {FLEET_OVERVIEW.map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{label}</span>
                  <span className="text-slate-400">{count} / {total}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">Latest fleet operations</p>

          <ul className="mt-5 space-y-4">
            {RECENT_ACTIVITY.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3">
                <span className={`mt-1.5 flex h-2 w-2 shrink-0 rounded-full ${activity.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {activity.text}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{activity.meta}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Quick Actions</h2>
        <p className="mt-0.5 text-xs text-slate-500">Common operations</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, accent }) => (
            <button
              key={label}
              className={`flex items-center justify-center gap-2 rounded-lg ${accent} px-4 py-3 text-sm font-medium text-white transition-colors`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;