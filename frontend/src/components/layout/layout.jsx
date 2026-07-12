import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:ml-0">
        <Navbar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;