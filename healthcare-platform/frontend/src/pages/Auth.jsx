import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  Hospital,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  Activity,
  Clock,
  Bell,
  BarChart3,
} from "lucide-react";
import { authApi, setSession } from "../api/client";

const PLATFORM_POINTS = [
  {
    icon: Activity,
    title: "Smart Queue",
    text: "Predict patient waiting time and reduce crowding.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Flow",
    text: "Assign patients to doctors based on department and load.",
  },
  {
    icon: Bell,
    title: "Notifications",
    text: "Send appointment confirmations and queue updates.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    text: "Track hospital workload, queue pressure and operations.",
  },
];

function BrandMark({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid h-13 w-13 place-items-center rounded-2xl shadow-lg ${
          dark
            ? "bg-white text-blue-700 shadow-blue-950/20"
            : "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-100"
        }`}
      >
        <HeartPulse size={28} />
      </div>

      <div>
        <h1
          className={`text-3xl font-black tracking-tight ${
            dark ? "text-white" : "text-slate-950"
          }`}
        >
          MediFlow
        </h1>

        <p
          className={`text-[11px] font-black uppercase tracking-[0.22em] ${
            dark ? "text-blue-100" : "text-slate-400"
          }`}
        >
          Smart Hospital Platform
        </p>
      </div>
    </div>
  );
}

function InputField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-800">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
        <Icon size={18} className="shrink-0 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

function RoleOption({ active, icon: Icon, title, desc, value, onChange }) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border p-4 transition ${
        active
          ? "border-blue-300 bg-blue-50 ring-4 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
      }`}
    >
      <input
        type="radio"
        name="role"
        value={value}
        checked={active}
        onChange={onChange}
        className="hidden"
      />

      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid h-11 w-11 place-items-center rounded-2xl ${
            active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon size={20} />
        </div>

        {active && <CheckCircle2 size={18} className="text-blue-700" />}
      </div>

      <p className="mt-3 font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
    </label>
  );
}

function PlatformPoint({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
        <Icon size={19} />
      </div>

      <div>
        <p className="font-black text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/70">{text}</p>
      </div>
    </div>
  );
}

export default function Auth({ mode = "login" }) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (isSignup) {
        const data = await authApi.signup({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        });

        setSession(data);
        navigate("/features");
        return;
      }

      const data = await authApi.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setSession(data);
      navigate("/features");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-90px)] bg-[#f4f8fb] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[760px] max-w-[1280px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-200/80 lg:grid-cols-[1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1500&q=80"
            alt="MediFlow hospital workspace"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/90 to-slate-950" />
          <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-28 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
            <div>
              <div className="flex items-center justify-between gap-4">
                <BrandMark dark />

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Live System
                </span>
              </div>

              <div className="mt-16 max-w-xl">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  Secure hospital access
                </span>

                <h2 className="mt-6 text-5xl font-black leading-tight text-white xl:text-6xl">
                  A cleaner way to manage hospital queues.
                </h2>

                <p className="mt-5 text-base leading-8 text-white/75">
                  MediFlow connects patients, doctors and admins through queue
                  prediction, appointment confirmation, notifications and analytics.
                </p>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="text-2xl font-black text-white">24/7</p>
                  <p className="mt-1 text-xs font-bold text-white/60">
                    Monitoring
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="text-2xl font-black text-white">Live</p>
                  <p className="mt-1 text-xs font-bold text-white/60">
                    Queue ETA
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="text-2xl font-black text-white">2</p>
                  <p className="mt-1 text-xs font-bold text-white/60">
                    Roles
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-2">
                {PLATFORM_POINTS.map((item) => (
                  <PlatformPoint key={item.title} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <BrandMark />
            </div>

            <div className="mb-8">
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-100">
                {isSignup ? "Create account" : "Welcome back"}
              </span>

              <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
                {isSignup ? "Create account" : "Login to MediFlow"}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {isSignup
                  ? "Create your account and continue to the hospital dashboard."
                  : "Enter your credentials to continue your hospital workflow."}
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-red-100">
                  !
                </span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <InputField label="Full Name" icon={UserRound}>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                  />
                </InputField>
              )}

              <InputField label="Email" icon={Mail}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                />
              </InputField>

              <InputField label="Password" icon={Lock}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-blue-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputField>

              {isSignup && (
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-800">
                    Account Type
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <RoleOption
                      active={form.role === "user"}
                      icon={UserRound}
                      title="Patient"
                      desc="Access queue, appointment and notifications."
                      value="user"
                      onChange={handleChange}
                    />

                    <RoleOption
                      active={form.role === "admin"}
                      icon={ShieldCheck}
                      title="Admin"
                      desc="Manage queue, doctors and analytics."
                      value="admin"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? isSignup
                    ? "Creating account..."
                    : "Logging in..."
                  : isSignup
                  ? "Create Account"
                  : "Login"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-center text-sm leading-6 text-slate-600 ring-1 ring-slate-100">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-black text-blue-700 hover:underline"
                  >
                    Login here
                  </Link>
                </>
              ) : (
                <>
                  New to MediFlow?{" "}
                  <Link
                    to="/signup"
                    className="font-black text-blue-700 hover:underline"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-blue-50 p-4 text-center ring-1 ring-blue-100">
                <Users size={18} className="mx-auto text-blue-700" />
                <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Patients
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
                <Stethoscope size={18} className="mx-auto text-emerald-700" />
                <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Doctors
                </p>
              </div>

              <div className="rounded-2xl bg-violet-50 p-4 text-center ring-1 ring-violet-100">
                <Hospital size={18} className="mx-auto text-violet-700" />
                <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Admin
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
              <ShieldCheck size={14} />
              Secure hospital workflow access
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}