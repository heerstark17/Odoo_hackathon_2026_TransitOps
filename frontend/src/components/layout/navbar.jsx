import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MdSearch,
  MdNotificationsNone,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

const ROUTE_MAP = {
  "": { title: "Dashboard", breadcrumb: ["Home", "Dashboard"] },
  vehicles: { title: "Fleet", breadcrumb: ["Home", "Fleet"] },
  drivers: { title: "Drivers", breadcrumb: ["Home", "Drivers"] },
  trips: { title: "Trips", breadcrumb: ["Home", "Trips"] },
  maintenance: { title: "Maintenance", breadcrumb: ["Home", "Maintenance"] },
  "fuel-logs": {
    title: "Fuel & Expenses",
    breadcrumb: ["Home", "Fuel & Expenses"],
  },
  reports: { title: "Analytics", breadcrumb: ["Home", "Analytics"] },
  settings: { title: "Settings", breadcrumb: ["Home", "Settings"] },
};

const roleLabel = (role) =>
  role?.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const Navbar = () => {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const { user, logout } = useAuth();
  const notificationCount = 3;

  const segment = location.pathname.split("/")[1] || "";
  const { title, breadcrumb } = ROUTE_MAP[segment] || {
    title: "Dashboard",
    breadcrumb: ["Home", "Dashboard"],
  };

  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 w-full border-b border-[var(--border)] bg-[var(--background)]">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Left: Title + Breadcrumb */}
        <div className="flex min-w-0 flex-col justify-center pl-12 md:pl-0">
          <h1 className="font-display truncate text-2xl font-semibold">
            {title}
          </h1>
          <nav className="hidden sm:flex items-center text-xs text-slate-400">
            {breadcrumb.map((crumb, idx) => (
              <span key={crumb} className="flex items-center">
                {idx > 0 && (
                  <MdKeyboardArrowRight
                    size={14}
                    className="mx-1 text-slate-300"
                  />
                )}
                <span
                  className={
                    idx === breadcrumb.length - 1
                      ? "text-slate-500 font-medium"
                      : "text-slate-400"
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <MdSearch
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search vehicles, drivers, trips..."
              className="input-control rounded-md py-2 pl-10 pr-4 text-sm placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <button
            className="relative p-2 text-muted hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
            aria-label="Notifications"
          >
            <MdNotificationsNone size={22} />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 border-l border-[var(--border)] pl-3 md:pl-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-strong)]">
              {initials}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {roleLabel(user?.role)}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="hidden border-b border-[var(--accent)] px-1 py-1 text-xs font-medium text-[var(--accent-strong)] sm:block"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <MdSearch
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className="input-control rounded-md py-2 pl-10 pr-4 text-sm placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
