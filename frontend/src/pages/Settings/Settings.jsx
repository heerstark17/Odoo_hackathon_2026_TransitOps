import { useState } from "react";
import { MdSave } from "react-icons/md";
const roles = [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst",
];
const modules = ["Fleet", "Drivers", "Trips", "Fuel/Exp.", "Analytics"];
const matrix = {
  "Fleet Manager": ["full", "full", "full", "full", "full"],
  Dispatcher: ["full", "view", "full", "full", "–"],
  "Safety Officer": ["–", "full", "view", "–", "view"],
  "Financial Analyst": ["view", "–", "–", "full", "full"],
};
export default function Settings() {
  const [form, setForm] = useState({
    depot: "Central Depot",
    currency: "INR",
    distance: "Kilometres",
  });
  const [saved, setSaved] = useState(false);
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  return (
    <div className="space-y-7">
      <header>
        <p className="page-kicker">Administration</p>
        <h1 className="page-title mt-2">Settings &amp; RBAC</h1>
      </header>
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <section className="surface p-6">
          <p className="page-kicker">General settings</p>
          <h2 className="font-display mt-1 text-3xl">Depot preferences</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
            className="mt-6 space-y-4"
          >
            {[
              ["depot", "Depot Name"],
              ["currency", "Currency"],
              ["distance", "Distance Unit"],
            ].map(([key, label]) => (
              <label key={key} className="block text-sm">
                {label}
                <input
                  value={form[key]}
                  onChange={update(key)}
                  className="input-control mt-1.5 rounded-md px-3 py-2.5"
                />
              </label>
            ))}
            <button className="accent-button flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold">
              <MdSave />
              Save settings
            </button>
            {saved && (
              <p className="text-xs text-[#80dfbd]">
                Saved locally for this session.
              </p>
            )}
          </form>
        </section>
        <section className="surface overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <p className="page-kicker">Access reference</p>
            <h2 className="font-display mt-1 text-3xl">Role matrix</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="surface-muted text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3">Role</th>
                  {modules.map((module) => (
                    <th key={module} className="px-4 py-3 text-center">
                      {module}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {roles.map((role) => (
                  <tr key={role}>
                    <td className="px-5 py-4 text-sm font-semibold">{role}</td>
                    {matrix[role].map((access, index) => (
                      <td
                        key={modules[index]}
                        className="px-4 py-4 text-center"
                      >
                        <span
                          className={
                            access === "full"
                              ? "status-available px-2 py-1 text-xs"
                              : access === "view"
                                ? "status-on-trip px-2 py-1 text-xs"
                                : "status-neutral px-2 py-1 text-xs"
                          }
                        >
                          {access === "full" ? "✓" : access}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
