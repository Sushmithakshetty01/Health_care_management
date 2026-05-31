import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Activity,
  LogOut,
  Menu,
  X,
  Bell,
  Wifi,
  Shield,
  Zap,
  Clock,
  ChevronRight,
  HeartPulse,
  Hospital,
  BarChart3,
  Stethoscope,
  CalendarClock,
  Sparkles,
  LayoutDashboard,
  Mail,
} from "lucide-react";
import { getUser, logout } from "../api/client";

const PUBLIC_LINKS = [
  { label: "Home", to: "/", icon: Hospital },
  { label: "Features", to: "/features", icon: Sparkles },
];

const USER_LINKS = [
  { label: "Features", to: "/features", icon: LayoutDashboard },
  { label: "Symptoms", to: "/symptoms", icon: HeartPulse },
  { label: "My Queue", to: "/dashboard", icon: Clock },
  { label: "Notifications", to: "/notifications-dashboard", icon: Mail },
];

const ADMIN_LINKS = [
  { label: "Features", to: "/features", icon: LayoutDashboard },
  { label: "Admin", to: "/admin", icon: Hospital },
  { label: "Analytics", to: "/analytics-dashboard", icon: BarChart3 },
  { label: "Notifications", to: "/notifications-dashboard", icon: Bell },
];

function Logo({ user }) {
  return (
    <Link
      to={user ? "/features" : "/"}
      className="group flex shrink-0 items-center gap-3"
    >
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-100 transition group-hover:scale-105">
          <Activity size={24} strokeWidth={2.4} />
        </div>

        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400 shadow-lg shadow-emerald-400/50" />
      </div>

      <div>
        <div className="flex items-center gap-1 leading-none">
          <span className="text-2xl font-black tracking-tight text-slate-950">
            Medi
          </span>

          <span className="text-2xl font-black tracking-tight text-blue-700">
            Flow
          </span>
        </div>

        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Smart Hospital Operations
        </p>
      </div>
    </Link>
  );
}

function NavLinkItem({ link, onClick }) {
  const Icon = link.icon;

  return (
    <Link
      to={link.to}
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
    >
      <Icon
        size={16}
        className="text-slate-400 transition group-hover:text-blue-700"
      />
      {link.label}
    </Link>
  );
}

function UserAvatar({ user }) {
  const name = user?.full_name || user?.name || user?.email || "User";

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="hidden items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 sm:flex">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-blue-100">
        {initials || "U"}
      </div>

      <div className="max-w-[150px]">
        <p className="truncate text-sm font-black text-slate-950">{name}</p>

        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {user?.role || "User"}
        </p>
      </div>
    </div>
  );
}

function SystemPill() {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 lg:flex">
      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-400/70" />
      Online
    </div>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = getUser();

  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user ? (isAdmin ? ADMIN_LINKS : USER_LINKS) : PUBLIC_LINKS;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950">
      <header className="relative z-50 border-b border-blue-100 bg-white/95 shadow-lg shadow-blue-100/40 backdrop-blur-2xl">
        <div className="mx-auto flex h-[82px] max-w-[1500px] items-center gap-5 px-4 sm:px-6 lg:px-8">
          <Logo user={user} />

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {links.map((link) => (
              <NavLinkItem key={link.to} link={link} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <SystemPill />

                <Link
                  to="/notifications-dashboard"
                  className="relative hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700 sm:flex"
                >
                  <Bell size={18} />

                  <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                </Link>

                <UserAvatar user={user} />

                <button
                  onClick={handleLogout}
                  className="hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-black text-slate-600 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 md:inline-flex"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 md:flex">
                  <Zap size={14} />
                  Smart Platform
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 md:flex">
                  <Shield size={14} />
                  Secure Access
                </div>

                <Link
                  to="/login"
                  className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:inline-flex"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl sm:inline-flex"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 lg:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl shadow-slate-200/60 lg:hidden">
            <div className="mx-auto max-w-[1500px] space-y-2">
              {links.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={17} className="text-blue-600" />
                      {link.label}
                    </span>

                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>
                );
              })}

              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                >
                  <span className="flex items-center gap-3">
                    <LogOut size={17} />
                    Logout
                  </span>

                  <ChevronRight size={16} />
                </button>
              ) : (
                <div className="grid gap-2 pt-3 sm:grid-cols-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center text-sm font-black text-white shadow-lg shadow-blue-100"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
              <Activity size={20} />
            </div>

            <div>
              <p className="text-lg font-black text-white">MediFlow</p>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                © 2025 · Smart Hospital Operations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { icon: Wifi, label: "Live Data" },
              { icon: Shield, label: "Secure" },
              { icon: Zap, label: "Smart Engine" },
              { icon: Clock, label: "24 / 7" },
              { icon: Stethoscope, label: "Doctor Flow" },
              { icon: CalendarClock, label: "Queue ETA" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-400"
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}