import { useState } from "react";
import { MdEmail, MdLocalShipping, MdLock } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
const loginRoles = [
  ["FLEET_MANAGER", "Fleet Manager"],
  ["DISPATCHER", "Dispatcher"],
  ["SAFETY_OFFICER", "Safety Officer"],
  ["FINANCIAL_ANALYST", "Financial Analyst"],
];
const registerRoles = loginRoles.slice(1);
const platformCapabilities = [
  ["Fleet visibility", "Track vehicles, availability and maintenance in real time."],
  ["Trip control", "Plan assignments and keep every movement on schedule."],
  ["Cost clarity", "Monitor fuel, expenses and operational performance."],
  ["Safer operations", "Keep driver records and compliance in one place."],
];
export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    token: "",
  });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        await login(form);
        navigate("/");
      } else if (mode === "register") {
        await register(form);
        navigate("/");
      } else if (mode === "forgot") {
        const { data } = await api.post("/auth/forgot-password", {
          email: form.email,
        });
        setForm((current) => ({ ...current, token: data.resetToken || "" }));
        setMode("reset");
      } else {
        const { data } = await api.post(`/auth/reset-password/${form.token}`, {
          password: form.password,
        });
        localStorage.setItem("transitops_token", data.token);
        window.location.assign("/");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to complete this request.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="grid min-h-screen w-full md:grid-cols-2">
        <section className="bg-[#eee7dc] p-8 text-[#17241f] sm:p-12 lg:p-16">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-[var(--accent)] text-white">
              <MdLocalShipping />
            </span>
            <b>TransitOps</b>
          </div>
          <div className="mt-20 max-w-xl">
            <p className="page-kicker">Transit operations, connected</p>
            <h1 className="font-display mt-4 text-5xl leading-none sm:text-6xl">
              One-stop solution
              <br />
              for fleet management.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#4c554f]">
              Bring your vehicles, drivers, trips and costs together in one
              clear operational workspace.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {platformCapabilities.map(([title, description]) => (
                <article
                  key={title}
                  className="border-l-2 border-[var(--accent)] bg-black/5 px-4 py-3"
                >
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-5 text-[#4c554f]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="surface-strong flex items-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
          <h2 className="font-display text-4xl">
            {mode === "login"
              ? "Sign in to your account"
              : mode === "register"
                ? "Create an account"
                : mode === "forgot"
                  ? "Reset password"
                  : "Choose a new password"}
          </h2>
          {error && (
            <p className="status-alert mt-5 border px-3 py-2 text-sm">
              {error}
            </p>
          )}
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "register" && (
              <Field
                label="Full name"
                value={form.name}
                onChange={update("name")}
              />
            )}{" "}
            {mode !== "reset" && (
              <Field
                label="Email"
                type="email"
                icon={MdEmail}
                value={form.email}
                onChange={update("email")}
              />
            )}{" "}
            {["login", "register"].includes(mode) && (
              <label className="block text-sm">
                Role
                <select
                  required
                  value={form.role}
                  onChange={update("role")}
                  className="auth-input mt-1.5"
                >
                  {" "}
                  <option value="">Select your role</option>
                  {(mode === "login" ? loginRoles : registerRoles).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            )}{" "}
            {mode !== "forgot" && (
              <Field
                label={mode === "reset" ? "New password" : "Password"}
                type="password"
                icon={MdLock}
                value={form.password}
                onChange={update("password")}
              />
            )}{" "}
            {mode === "reset" && (
              <Field
                label="Reset token"
                value={form.token}
                onChange={update("token")}
              />
            )}{" "}
            {mode === "login" && (
              <div className="flex justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />{" "}
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[#ef9b7f]"
                >
                  Forgot password?
                </button>
              </div>
            )}
            <button
              disabled={busy}
              className="accent-button w-full rounded-md py-3 text-sm font-semibold disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign In"
                  : mode === "register"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Request reset"
                      : "Reset password"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-[#b7c5ba]">
            {mode === "login" ? (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-medium text-[#ef9b7f] hover:text-white"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-medium text-[#ef9b7f] hover:text-white"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}
function Field({ label, type = "text", value, onChange, icon: Icon }) {
  return (
    <label className="block text-sm">
      {label}
      <div className="relative mt-1.5">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b7c5ba]" />
        )}
        <input
          required
          type={type}
          value={value}
          onChange={onChange}
          className={`auth-input ${Icon ? "auth-input-with-icon" : ""}`}
        />
      </div>
    </label>
  );
}
