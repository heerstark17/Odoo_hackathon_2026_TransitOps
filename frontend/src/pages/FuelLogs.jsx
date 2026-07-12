import React, { useMemo } from "react";
import {
  MdLocalGasStation,
  MdAttachMoney,
  MdSpeed,
  MdCalendarToday,
  MdDirectionsCar,
} from "react-icons/md";

const MOCK_FUEL_LOGS = [
  { id: "FL-901", vehicle: "MH-12-AB-3345", liters: 62.4, cost: 6490, date: "2026-07-11" },
  { id: "FL-902", vehicle: "MH-04-GH-9021", liters: 142.5, cost: 14820, date: "2026-07-10" },
  { id: "FL-903", vehicle: "MH-20-XY-5567", liters: 98.2, cost: 10215, date: "2026-07-09" },
  { id: "FL-904", vehicle: "MH-01-JK-2210", liters: 54.8, cost: 5698, date: "2026-07-08" },
  { id: "FL-905", vehicle: "MH-27-PQ-4456", liters: 118.6, cost: 12335, date: "2026-07-07" },
  { id: "FL-906", vehicle: "MH-14-CD-7712", liters: 71.3, cost: 7415, date: "2026-07-06" },
  { id: "FL-907", vehicle: "MH-12-AB-3345", liters: 58.9, cost: 6126, date: "2026-07-03" },
];

const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const FuelLogs = () => {
  const stats = useMemo(() => {
    const totalLiters = MOCK_FUEL_LOGS.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = MOCK_FUEL_LOGS.reduce((sum, log) => sum + log.cost, 0);
    const avgCostPerLiter = totalCost / totalLiters;
    return {
      totalLiters,
      totalCost,
      avgCostPerLiter,
      entries: MOCK_FUEL_LOGS.length,
    };
  }, []);

  const SUMMARY_CARDS = [
    {
      label: "Total Fuel Logged",
      value: `${stats.totalLiters.toFixed(1)} L`,
      icon: MdLocalGasStation,
      accent: "bg-cyan-500/10 text-cyan-600",
    },
    {
      label: "Total Fuel Cost",
      value: formatCurrency(Math.round(stats.totalCost)),
      icon: MdAttachMoney,
      accent: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Avg. Cost / Liter",
      value: `₹${stats.avgCostPerLiter.toFixed(2)}`,
      icon: MdSpeed,
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Log Entries",
      value: stats.entries,
      icon: MdCalendarToday,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Fuel Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track fuel consumption and cost across the fleet
        </p>
      </div>

      {/* Fuel Summary Cards */}
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

      {/* Fuel Logs Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Liters</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Cost</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_FUEL_LOGS.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <MdDirectionsCar size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{log.vehicle}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{log.liters.toFixed(1)} L</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(log.cost)}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(log.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FuelLogs;