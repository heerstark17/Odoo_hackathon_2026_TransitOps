import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdLocalShipping,
  MdPeople,
  MdAltRoute,
  MdBuild,
  MdLocalGasStation,
  MdBarChart,
  MdMenu,
  MdClose,
  MdSettings,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/",
    icon: MdDashboard,
    end: true,
    roles: ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    label: "Fleet",
    to: "/vehicles",
    icon: MdLocalShipping,
    roles: ["FLEET_MANAGER", "DISPATCHER"],
  },
  {
    label: "Drivers",
    to: "/drivers",
    icon: MdPeople,
    roles: ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"],
  },
  {
    label: "Trips",
    to: "/trips",
    icon: MdAltRoute,
    roles: ["FLEET_MANAGER", "DISPATCHER"],
  },
  {
    label: "Maintenance",
    to: "/maintenance",
    icon: MdBuild,
    roles: ["FLEET_MANAGER"],
  },
  {
    label: "Fuel & Expenses",
    to: "/fuel-logs",
    icon: MdLocalGasStation,
    roles: ["FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"],
  },
  {
    label: "Analytics",
    to: "/reports",
    icon: MdBarChart,
    roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"],
  },
  {
    label: "Settings",
    to: "/settings",
    icon: MdSettings,
    roles: ["FLEET_MANAGER"],
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const closeMobileMenu = () => setIsOpen(false);
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const linkClasses = ({ isActive }) =>
    [
      "group flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150",
      isActive
        ? "border-[var(--accent)] bg-white/10 pl-3 text-white"
        : "border-transparent text-[#b7c5ba] hover:bg-white/5 hover:text-white",
    ].join(" ");

  return (
    <>
      {/* Mobile top bar toggle */}
      <div className="surface-strong fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <MdLocalShipping className="text-[var(--accent)]" size={24} />
          <span className="text-white font-semibold tracking-wide">
            TransitOps
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed md:sticky md:top-0 top-0 left-0 z-40 h-full md:h-screen w-64 shrink-0",
          "surface-strong border-r border-white/10 flex flex-col",
          "transform transition-transform duration-200 ease-in-out",
          "pt-16 md:pt-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:!translate-x-0",
        ].join(" ")}
      >
        {/* Logo section */}
        <div className="hidden items-center gap-3 border-b border-white/10 px-5 py-6 md:flex">
          <div className="flex h-10 w-10 items-center justify-center bg-[var(--accent)] text-white">
            <MdLocalShipping size={22} />
          </div>
          <div>
            <p className="text-white font-bold leading-tight tracking-wide text-base">
              TransitOps
            </p>
            <p className="text-xs text-[#b7c5ba]">Smart Transport Platform</p>
          </div>
        </div>

        {/* Nav items */}
        <nav
          aria-label="Primary navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        >
          {visibleItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMobileMenu}
              className={linkClasses}
            >
              <Icon size={20} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
