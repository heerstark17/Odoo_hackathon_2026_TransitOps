import React, { useState } from "react";
import {
  MdLocalShipping,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdBadge,
  MdAltRoute,
  MdSpeed,
  MdVerified,
} from "react-icons/md";

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

const HIGHLIGHTS = [
  { icon: MdAltRoute, text: "Real-time trip dispatch & tracking" },
  { icon: MdSpeed, text: "Live fleet utilization insights" },
  { icon: MdVerified, text: "Driver compliance & safety scoring" },
];

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim() || !form.role) {
      setError("Please fill in all fields to continue.");
      return;
    }

    setIsSubmitting(true);
    // Mock authentication only — no backend wired up.
    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Mock sign in:", form);
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left Side - Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0F172A] px-12 py-10 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
            <MdLocalShipping className="text-cyan-400" size={22} />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-white">TransitOps</p>
            <p className="text-xs text-slate-400">Smart Transport Platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Run your fleet with clarity, not chaos.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            TransitOps brings vehicles, drivers, trips, and costs into a single
            operations view — built for logistics teams that can't afford
            downtime or guesswork.
          </p>

          <div className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="text-cyan-400" size={18} />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © 2026 TransitOps. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Card */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Mobile brand */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
            <MdLocalShipping className="text-cyan-600" size={22} />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-800">TransitOps</p>
            <p className="text-xs text-slate-500">Smart Transport Platform</p>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your fleet dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
              <div className="relative">
                <MdEmail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
              <div className="relative">
                <MdLock
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
              <div className="relative">
                <MdBadge
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={form.role}
                  onChange={handleChange("role")}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">Select your role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-xs font-medium text-cyan-600 hover:text-cyan-700">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Mock authentication — no data leaves this session.
        </p>
      </div>
    </div>
  );
};

export default Login;