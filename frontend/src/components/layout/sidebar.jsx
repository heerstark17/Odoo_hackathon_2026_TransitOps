import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdLocalShipping,
  MdPeople,
  MdAltRoute,
  MdBuild,
  MdLocalGasStation,
  MdReceiptLong,
  MdBarChart,
  MdMenu,
  MdClose,
} from "react-icons/md";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: MdDashboard, end: true },
  { label: "Vehicles", to: "/vehicles", icon: MdLocalShipping },
  { label: "Drivers", to: "/drivers", icon: MdPeople },
  { label: "Trips", to: "/trips", icon: MdAltRoute },
  { label: "Maintenance", to: "/maintenance", icon: MdBuild },
  { label: "Fuel Logs", to: "/fuel-logs", icon: MdLocalGasStation },
  { label: "Expenses", to: "/expenses", icon: MdReceiptLong },
  { label: "Reports", to: "/reports", icon: MdBarChart },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMobileMenu = () => setIsOpen(false);

  const linkClasses = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
      isActive
        ? "bg-slate-800 text-cyan-400 border-l-4 border-cyan-400 pl-2"
        : "text-slate-300 hover:bg-slate-800/60 hover:text-white border-l-4 border-transparent pl-2",
    ].join(" ");

  return (
    <>
      {/* Mobile top bar toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-[#0F172A] border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <MdLocalShipping className="text-cyan-400" size={24} />
          <span className="text-white font-semibold tracking-wide">
            TransitOps
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-200 p-2 rounded-md hover:bg-slate-800"
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
          "fixed md:static top-0 left-0 z-40 h-full md:h-screen w-64",
          "bg-[#0F172A] border-r border-slate-800 flex flex-col",
          "transform transition-transform duration-200 ease-in-out",
          "pt-16 md:pt-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Logo section */}
        <div className="hidden md:flex items-center gap-3 px-5 py-6 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
            <MdLocalShipping className="text-cyan-400" size={22} />
          </div>
          <div>
            <p className="text-white font-bold leading-tight tracking-wide text-base">
              TransitOps
            </p>
            <p className="text-slate-500 text-xs">Smart Transport Platform</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
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