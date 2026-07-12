import React, { useMemo } from "react";
import {
  MdAttachMoney,
  MdLocalGasStation,
  MdBuild,
  MdReceiptLong,
  MdDirectionsCar,
  MdEdit,
  MdDeleteOutline,
  MdVisibility,
} from "react-icons/md";

const MOCK_EXPENSES = [
  { id: "EX-701", category: "Fuel", vehicle: "MH-12-AB-3345", amount: 6490, date: "2026-07-11", status: "Approved" },
  { id: "EX-702", category: "Maintenance", vehicle: "MH-14-CD-7712", amount: 4200, date: "2026-07-10", status: "Approved" },
  { id: "EX-703", category: "Toll", vehicle: "MH-04-GH-9021", amount: 1850, date: "2026-07-10", status: "Pending" },
  { id: "EX-704", category: "Insurance", vehicle: "MH-01-JK-2210", amount: 18500, date: "2026-07-09", status: "Approved" },
  { id: "EX-705", category: "Fuel", vehicle: "MH-20-XY-5567", amount: 10215, date: "2026-07-09", status: "Approved" },
  { id: "EX-706", category: "Miscellaneous", vehicle: "MH-27-PQ-4456", amount: 950, date: "2026-07-08", status: "Rejected" },
  { id: "EX-707", category: "Maintenance", vehicle: "MH-31-LM-8834", amount: 9600, date: "2026-07-08", status: "Pending" },
  { id: "EX-708", category: "Toll", vehicle: "MH-12-AB-3345", amount: 1240, date: "2026-07-07", status: "Approved" },
  { id: "EX-709", category: "Fuel", vehicle: "MH-01-JK-2210", amount: 5698, date: "2026-07-06", status: "Approved" },
  { id: "EX-710", category: "Miscellaneous", vehicle: "MH-04-GH-9021", amount: 620, date: "2026-07-05", status: "Approved" },
];

const STATUS_STYLES = {
  Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  Rejected: "bg-rose-50 text-rose-700 border border-rose-200",
};

const CATEGORY_STYLES = {
  Fuel: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  Maintenance: "bg-amber-50 text-amber-700 border border-amber-200",
  Insurance: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Toll: "bg-purple-50 text-purple-700 border border-purple-200",
  Miscellaneous: "bg-slate-100 text-slate-500 border border-slate-200",
};

const CATEGORY_DOT = {
  Fuel: "bg-cyan-500",
  Maintenance: "bg-amber-500",
  Insurance: "bg-indigo-500",
  Toll: "bg-purple-500",
  Miscellaneous: "bg-slate-400",
};

const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Expenses = () => {
  const stats = useMemo(() => {
    const total = MOCK_EXPENSES.reduce((sum, e) => sum + e.amount, 0);
    const fuel = MOCK_EXPENSES.filter((e) => e.category === "Fuel").reduce((sum, e) => sum + e.amount, 0);
    const maintenance = MOCK_EXPENSES.filter((e) => e.category === "Maintenance").reduce((sum, e) => sum + e.amount, 0);
    const other = total - fuel - maintenance;
    return { total, fuel, maintenance, other };
  }, []);

  const categoryBreakdown = useMemo(() => {
    const totals = {};
    MOCK_EXPENSES.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, []);

  const recentActivity = useMemo(
    () =>
      [...MOCK_EXPENSES]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    []
  );

  const SUMMARY_CARDS = [
    { label: "Total Expenses", value: formatCurrency(stats.total), icon: MdAttachMoney, accent: "bg-purple-500/10 text-purple-600" },
    { label: "Fuel Expenses", value: formatCurrency(stats.fuel), icon: MdLocalGasStation, accent: "bg-cyan-500/10 text-cyan-600" },
    { label: "Maintenance Expenses", value: formatCurrency(stats.maintenance), icon: MdBuild, accent: "bg-amber-500/10 text-amber-600" },
    { label: "Other Expenses", value: formatCurrency(stats.other), icon: MdReceiptLong, accent: "bg-slate-500/10 text-slate-600" },
  ];

  const maxCategoryAmount = categoryBreakdown[0]?.amount || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Expenses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Operational cost tracking across fuel, maintenance, and overheads
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expense Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-800">Expense Breakdown</h2>
          <p className="mt-0.5 text-xs text-slate-500">Totals by category</p>

          <div className="mt-5 space-y-4">
            {categoryBreakdown.map(({ category, amount }) => (
              <div key={category}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[category]}`} />
                    {category}
                  </span>
                  <span className="text-slate-400">{formatCurrency(amount)}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${CATEGORY_DOT[category]}`}
                    style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expense Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800">Recent Expense Activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">Latest recorded expenses</p>

          <ul className="mt-5 space-y-4">
            {recentActivity.map((expense) => (
              <li key={expense.id} className="flex items-start gap-3">
                <span className={`mt-1.5 flex h-2 w-2 shrink-0 rounded-full ${CATEGORY_DOT[expense.category]}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {expense.category} — {expense.vehicle}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {expense.id} · {formatCurrency(expense.amount)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{formatDate(expense.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expense Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Expense ID</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_EXPENSES.map((expense) => (
                <tr key={expense.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{expense.id}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_STYLES[expense.category]}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <MdDirectionsCar size={16} />
                      </div>
                      <span className="text-sm text-slate-600">{expense.vehicle}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(expense.amount)}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(expense.date)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[expense.status]}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="View expense">
                        <MdVisibility size={17} />
                      </button>
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600" aria-label="Edit expense">
                        <MdEdit size={17} />
                      </button>
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Delete expense">
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

export default Expenses;