import React, { useMemo } from "react";
import {
  MdAdd,
  MdBuild,
  MdSchedule,
  MdHourglassEmpty,
  MdCheckCircleOutline,
  MdAttachMoney,
  MdEdit,
  MdDeleteOutline,
  MdVisibility,
  MdDirectionsCar,
} from "react-icons/md";

const MOCK_RECORDS = [
  {
    id: "MT-501",
    vehicle: "MH-14-CD-7712",
    issue: "Brake pad replacement",
    cost: 4200,
    date: "2026-07-10",
    status: "In Progress",
  },
  {
    id: "MT-502",
    vehicle: "MH-31-LM-8834",
    issue: "Engine oil & filter change",
    cost: 2800,
    date: "2026-07-08",
    status: "Completed",
  },
  {
    id: "MT-503",
    vehicle: "MH-04-GH-9021",
    issue: "Suspension inspection",
    cost: 5600,
    date: "2026-07-15",
    status: "Scheduled",
  },
  {
    id: "MT-504",
    vehicle: "MH-12-AB-3345",
    issue: "Tyre replacement (all 4)",
    cost: 18400,
    date: "2026-07-05",
    status: "Completed",
  },
  {
    id: "MT-505",
    vehicle: "MH-20-XY-5567",
    issue: "AC compressor repair",
    cost: 7200,
    date: "2026-07-18",
    status: "Scheduled",
  },
  {
    id: "MT-506",
    vehicle: "MH-27-PQ-4456",
    issue: "Clutch plate replacement",
    cost: 9600,
    date: "2026-07-09",
    status: "In Progress",
  },
];

const STATUS_STYLES = {
  Scheduled: "bg-amber-50 text-amber-700 border border-amber-200",
  "In Progress": "bg-cyan-50 text-cyan-700 border border-cyan-200",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const formatCurrency = (value) =>
  `₹${value.toLocaleString("en-IN")}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Maintenance = () => {
  const stats = useMemo(() => {
    const scheduled = MOCK_RECORDS.filter((r) => r.status === "Scheduled").length;
    const inProgress = MOCK_RECORDS.filter((r) => r.status === "In Progress").length;
    const completed = MOCK_RECORDS.filter((r) => r.status === "Completed").length;
    const totalCost = MOCK_RECORDS.reduce((sum, r) => sum + r.cost, 0);
    return { scheduled, inProgress, completed, totalCost };
  }, []);

  const OVERVIEW_CARDS = [
    {
      label: "Scheduled",
      value: stats.scheduled,
      icon: MdSchedule,
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: MdHourglassEmpty,
      accent: "bg-cyan-500/10 text-cyan-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: MdCheckCircleOutline,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Total Maintenance Cost",
      value: formatCurrency(stats.totalCost),
      icon: MdAttachMoney,
      accent: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Maintenance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track vehicle service records and upcoming work
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600">
          <MdAdd size={18} />
          Add Maintenance
        </button>
      </div>

      {/* Maintenance Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_CARDS.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
              <Icon size={20} />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Maintenance Records Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Issue</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Cost</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_RECORDS.map((record) => (
                <tr key={record.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <MdDirectionsCar size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{record.vehicle}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{record.issue}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(record.cost)}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(record.date)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="View record">
                        <MdVisibility size={17} />
                      </button>
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600" aria-label="Edit record">
                        <MdEdit size={17} />
                      </button>
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Delete record">
                        <MdDeleteOutline size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;