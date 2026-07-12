import { useCallback, useEffect, useState } from "react";
import { MdAdd, MdClose, MdRefresh, MdSearch } from "react-icons/md";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const pretty = (value) => String(value || "—").replaceAll("_", " ");
const EMPTY_ARRAY = [];
const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const currency = (value) =>
  value === null || value === undefined
    ? "—"
    : `₹${Number(value).toLocaleString("en-IN")}`;
const statusClass = (value = "") =>
  ({
    AVAILABLE: "status-available",
    ON_TRIP: "status-on-trip",
    IN_SHOP: "status-active",
    RETIRED: "status-neutral",
    ACTIVE: "status-active",
    CLOSED: "status-available",
    DRAFT: "status-neutral",
    DISPATCHED: "status-on-trip",
    COMPLETED: "status-available",
    CANCELLED: "status-alert",
    OFF_DUTY: "status-neutral",
    SUSPENDED: "status-alert",
  })[value] || "status-neutral";

export default function LiveTable({
  title,
  description,
  endpoint,
  collectionKey,
  columns,
  fields = EMPTY_ARRAY,
  related = EMPTY_ARRAY,
  createRoles = EMPTY_ARRAY,
  filters = EMPTY_ARRAY,
  helperText = "",
  recordLabel,
}) {
  const [items, setItems] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const { user } = useAuth();
  const canCreate = !createRoles.length || createRoles.includes(user?.role);
  const singularRecordLabel =
    recordLabel || (title.endsWith("s") ? title.slice(0, -1) : title);
  const blank = Object.fromEntries(
    fields.map((field) => [field.name, field.defaultValue ?? ""]),
  );
  const [form, setForm] = useState(blank);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [main, ...lists] = await Promise.all([
        api.get(endpoint, { params: filterValues }),
        ...related.map((item) => api.get(item.endpoint)),
      ]);
      setItems(main.data[collectionKey] || []);
      setLookups(
        Object.fromEntries(
          related.map((item, i) => [
            item.name,
            lists[i].data[item.collectionKey] || [],
          ]),
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load data. Start the API and sign in again.",
      );
    } finally {
      setLoading(false);
    }
  }, [collectionKey, endpoint, filterValues, related]);
  useEffect(() => {
    load();
  }, [load]);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== ""),
      );
      await api.post(endpoint, payload);
      setOpen(false);
      setForm(blank);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this record.");
    } finally {
      setSaving(false);
    }
  };
  const visible = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-kicker">Operations register · live</p>
          <h1 className="page-title mt-2">{title}</h1>
          <p className="mt-3 text-sm text-muted">{description}</p>
        </div>
        {fields.length > 0 && canCreate && (
          <button
            onClick={() => setOpen(true)}
            className="accent-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold"
          >
            <MdAdd size={18} />
            Add record
          </button>
        )}
      </div>
      {error && (
        <div className="status-alert border px-4 py-3 text-sm">{error}</div>
      )}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
          {filters.map((filter) => (
            <label
              key={filter.name}
              className="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              {filter.label}
              <select
                value={filterValues[filter.name] || ""}
                onChange={(event) =>
                  setFilterValues((current) => ({
                    ...current,
                    [filter.name]: event.target.value,
                  }))
                }
                className="input-control ml-2 rounded-md px-2 py-1.5 text-sm font-normal normal-case"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option
                    value={option.value || option}
                    key={option.value || option}
                  >
                    {option.label || String(option).replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="input-control rounded-md py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-[var(--accent-strong)]"
          >
            <MdRefresh />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[var(--surface-strong)] text-[11px] uppercase tracking-wider text-[#d9e5dc]">
              <tr>
                {columns.map((column) => (
                  <th key={column.label} className="px-4 py-2.5 font-semibold">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    Loading live data…
                  </td>
                </tr>
              ) : visible.length ? (
                visible.map((item) => (
                  <tr
                    key={item._id}
                    className="transition-colors hover:bg-[var(--accent-soft)]/35"
                  >
                    {columns.map((column) => {
                      const value =
                        typeof column.value === "function"
                          ? column.value(item)
                          : item[column.value];
                      return (
                        <td
                          key={column.label}
                          className="px-4 py-3 text-sm text-[var(--text-primary)]"
                        >
                          {column.render ? (
                            column.render(item, value)
                          ) : column.type === "status" ? (
                            <span
                              className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass(value)}`}
                            >
                              {pretty(value)}
                            </span>
                          ) : column.type === "date" ? (
                            date(value)
                          ) : column.type === "currency" ? (
                            currency(value)
                          ) : column.type === "number" ? (
                            Number(value || 0).toLocaleString("en-IN")
                          ) : (
                            value || "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {helperText && (
        <p className="border-l-2 border-[var(--accent)] pl-3 text-xs leading-5 text-muted">
          {helperText}
        </p>
      )}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <form
            onSubmit={submit}
            className="surface max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-3xl">
                  Add {singularRecordLabel}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Records are saved directly to the TransitOps API.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted hover:bg-[var(--surface-muted)]"
              >
                <MdClose size={22} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label
                  key={field.name}
                  className={`block text-sm font-medium ${field.full ? "sm:col-span-2" : ""}`}
                >
                  {field.label}
                  <Field
                    field={field}
                    value={form[field.name]}
                    onChange={(value) =>
                      setForm((old) => ({ ...old, [field.name]: value }))
                    }
                    options={lookups[field.optionsKey] || field.options || []}
                  />
                </label>
              ))}
            </div>
            <button
              disabled={saving}
              className="accent-button mt-6 w-full rounded-md py-3 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving…" : `Create ${singularRecordLabel}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ field, value, onChange, options }) {
  const className =
    "input-control mt-1.5 rounded-md px-3 py-2.5 text-sm font-normal";
  if (field.type === "select")
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.required !== false}
        className={className}
      >
        <option value="">Select {field.label}</option>
        {options.map((option) => {
          const value = option._id || option.value || option;
          const label =
            option.label ||
            option.name ||
            option.registrationNumber ||
            option.value ||
            option;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    );
  if (field.type === "textarea")
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        rows="3"
      />
    );
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={field.type || "text"}
      required={field.required !== false}
      min={field.min}
      max={field.max}
      minLength={field.minLength}
      maxLength={field.maxLength}
      pattern={field.pattern}
      title={field.title}
      placeholder={field.placeholder}
      className={className}
    />
  );
}
