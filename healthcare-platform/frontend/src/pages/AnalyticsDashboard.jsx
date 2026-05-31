import { useEffect, useState } from "react";
import { hospitalApi } from "../api/client";
import {
  Activity,
  AlertTriangle,
  AreaChart,
  BarChart3,
  CalendarClock,
  Clock,
  HeartPulse,
  Hospital,
  PieChart,
  RefreshCcw,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  Users,
  BrainCircuit,
  Siren,
  Gauge,
  Sparkles,
  Database,
  ArrowUpRight,
  Ambulance,
  ClipboardCheck,
  LineChart,
} from "lucide-react";

const FEATURE_IMAGES = [
  {
    title: "Live Patient Analytics",
    desc: "Monitor total queue, walk-ins, confirmed appointments and completion rate.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
    icon: Activity,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "Department Load Tracking",
    desc: "Compare patient pressure across departments using online and walk-in data.",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
    icon: Hospital,
    gradient: "from-violet-600 to-indigo-500",
  },
  {
    title: "Emergency Risk Monitoring",
    desc: "Identify high-priority and critical cases before queues become overloaded.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
    icon: Siren,
    gradient: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Workload Insights",
    desc: "Understand doctor load using patient count and consultation duration.",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Wait-Time Intelligence",
    desc: "Analyze predicted waiting time by department and queue status.",
    image:
      "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=900&q=80",
    icon: Clock,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Operational Alerts",
    desc: "Detect risk signals from queue pressure, doctor availability and urgency.",
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80",
    icon: ShieldAlert,
    gradient: "from-rose-500 to-red-500",
  },
];

function SectionHeader({ title, desc, icon: Icon = Sparkles, badge }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Icon size={19} />
        </span>

        <div>
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          {desc && (
            <p className="mt-1 max-w-3xl text-sm leading-7 text-slate-500">
              {desc}
            </p>
          )}
        </div>
      </div>

      {badge && (
        <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">
          {badge}
        </span>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient = "from-blue-600 to-cyan-500",
  glow = "shadow-blue-100",
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-xl ${glow} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
    >
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition group-hover:opacity-25`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            {label}
          </p>

          <h2 className="mt-3 text-4xl font-black text-slate-950 tabular-nums">
            {value}
          </h2>

          {sub && (
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {sub}
            </p>
          )}
        </div>

        <span
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}
        >
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, value, desc, gradient }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-5 text-white shadow-xl`}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/15 blur-xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-black tabular-nums">{value}</h3>

          <p className="mt-1 text-sm leading-5 text-white/80">{desc}</p>
        </div>

        <span className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}

function FeatureCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="group relative min-h-[245px] overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      <div
        className={`absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}
      >
        <Icon size={22} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h3 className="text-lg font-black">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/80">{item.desc}</p>
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  max = 100,
  gradient = "from-blue-600 to-cyan-400",
  height = "h-3",
}) {
  const width = max > 0 ? Math.min(100, Math.max(0, (Number(value || 0) / max) * 100)) : 0;

  return (
    <div className={`${height} overflow-hidden rounded-full bg-slate-100`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function DonutChart({ data, centerLabel = "Total" }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  if (!total) {
    return (
      <div className="rounded-3xl bg-slate-50 py-12 text-center text-sm font-semibold text-slate-400">
        No chart data available
      </div>
    );
  }

  let cumulative = 0;
  const r = 43;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex flex-wrap items-center gap-7">
      <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0 drop-shadow-sm">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="13" />

        {data.map((item, index) => {
          const pct = Number(item.value || 0) / total;
          const offset = circumference * (1 - cumulative - pct);
          const dash = Math.max(0, circumference * pct - 3);

          const circle = (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={item.color}
              strokeWidth="13"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          );

          cumulative += pct;
          return circle;
        })}

        <text
          x="56"
          y="54"
          textAnchor="middle"
          style={{ fontSize: 19, fontWeight: 900, fill: "#0f172a" }}
        >
          {total}
        </text>

        <text
          x="56"
          y="70"
          textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 800, fill: "#64748b" }}
        >
          {centerLabel}
        </text>
      </svg>

      <div className="min-w-[170px] flex-1 space-y-2">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: item.color }}
            />

            <span className="font-bold text-slate-600">{item.label}</span>

            <span className="ml-auto font-black text-slate-950 tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalChart({ title, data, emptyText }) {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="space-y-4">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>

      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-black text-slate-700">{item.label}</span>
              <span className="font-black text-slate-950 tabular-nums">
                {item.value}
                {item.suffix || ""}
              </span>
            </div>

            <ProgressBar
              value={item.value}
              max={max}
              gradient={item.gradient || "from-blue-600 to-cyan-400"}
            />
          </div>
        ))
      ) : (
        <p className="rounded-3xl bg-slate-50 py-10 text-center text-sm font-semibold text-slate-400">
          {emptyText}
        </p>
      )}
    </div>
  );
}

function TrendChart({ data }) {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  const points = data
    .map((item, index) => {
      const x = 18 + index * (224 / Math.max(1, data.length - 1));
      const y = 126 - (Number(item.value || 0) / max) * 86;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-xl shadow-blue-100">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
            Operational Trend
          </p>
          <h3 className="mt-1 text-2xl font-black">Live hospital flow</h3>
        </div>

        <span className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          <LineChart size={20} />
        </span>
      </div>

      <svg viewBox="0 0 260 150" className="h-40 w-full overflow-visible">
        {[40, 70, 100, 130].map((y) => (
          <line
            key={y}
            x1="12"
            x2="248"
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        ))}

        <polyline
          points={`${points} 242,140 18,140`}
          fill="rgba(103,232,249,0.12)"
          stroke="none"
        />

        <polyline
          points={points}
          fill="none"
          stroke="#67e8f9"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((item, index) => {
          const [x, y] = points.split(" ")[index].split(",");

          return (
            <circle
              key={item.label}
              cx={x}
              cy={y}
              r="4"
              fill="#ffffff"
              stroke="#67e8f9"
              strokeWidth="3"
            />
          );
        })}
      </svg>

      <div className="mt-2 grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-blue-100">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function AlertCard({ alert }) {
  const isHigh = String(alert.type || "").toLowerCase().includes("high");
  const isCritical = String(alert.type || "").toLowerCase().includes("critical");

  const style = isCritical
    ? "border-red-200 bg-red-50 text-red-700"
    : isHigh
    ? "border-orange-200 bg-orange-50 text-orange-700"
    : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{alert.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {alert.description}
          </p>
        </div>

        <span className={`rounded-full border px-3 py-1 text-xs font-black ${style}`}>
          {alert.type}
        </span>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const data = await hospitalApi.analyticsOverview();
      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const summary = analytics?.summary || {};
  const departmentLoad = analytics?.department_load || [];
  const departmentWaitTimes = analytics?.department_wait_times || [];
  const doctorWorkload = analytics?.doctor_workload || [];
  const operationalMetrics = analytics?.operational_metrics || [];
  const recentAlerts = analytics?.recent_alerts || [];
  const urgencyBreakdown = analytics?.urgency_breakdown || {};
  const statusBreakdown = analytics?.status_breakdown || {};

  const urgencyData = [
    {
      label: "Low",
      value: urgencyBreakdown.Low || 0,
      color: "#10b981",
    },
    {
      label: "Medium",
      value: urgencyBreakdown.Medium || 0,
      color: "#f59e0b",
    },
    {
      label: "High",
      value: urgencyBreakdown.High || 0,
      color: "#f97316",
    },
    {
      label: "Critical",
      value: urgencyBreakdown.Critical || 0,
      color: "#ef4444",
    },
  ];

  const statusData = [
    {
      label: "Waiting",
      value: statusBreakdown.waiting || 0,
      color: "#2563eb",
    },
    {
      label: "In Consult",
      value: statusBreakdown.in_consultation || 0,
      color: "#7c3aed",
    },
    {
      label: "Completed",
      value: statusBreakdown.completed || 0,
      color: "#059669",
    },
    {
      label: "Cancelled",
      value: statusBreakdown.cancelled || 0,
      color: "#94a3b8",
    },
  ];

  const departmentLoadChart = departmentLoad.slice(0, 6).map((dept) => ({
    label: dept.name,
    value: Number(dept.load || 0),
    suffix: "%",
    gradient:
      Number(dept.load || 0) >= 75
        ? "from-red-500 to-orange-400"
        : Number(dept.load || 0) >= 45
        ? "from-amber-500 to-orange-400"
        : "from-blue-600 to-cyan-400",
  }));

  const departmentWaitChart = departmentWaitTimes.slice(0, 6).map((dept) => ({
    label: dept.name,
    value: Number(dept.average_wait_time || 0),
    suffix: "m",
    gradient:
      Number(dept.average_wait_time || 0) >= 45
        ? "from-red-500 to-orange-400"
        : Number(dept.average_wait_time || 0) >= 25
        ? "from-amber-500 to-orange-400"
        : "from-emerald-500 to-teal-400",
  }));

  const doctorLoadChart = doctorWorkload.slice(0, 6).map((doctor) => ({
    label: doctor.name,
    value: Number(doctor.load || 0),
    suffix: "%",
    gradient:
      Number(doctor.load || 0) >= 75
        ? "from-red-500 to-orange-400"
        : Number(doctor.load || 0) >= 45
        ? "from-amber-500 to-orange-400"
        : "from-indigo-600 to-blue-400",
  }));

  const trendData = [
    {
      label: "Queue",
      value: Number(summary.total_patients || 0),
    },
    {
      label: "Waiting",
      value: Number(summary.waiting_count || 0),
    },
    {
      label: "Consult",
      value: Number(summary.in_consultation_count || 0),
    },
    {
      label: "Done",
      value: Number(summary.completion_rate || 0),
    },
    {
      label: "Risk",
      value: Number(summary.risk_score || 0),
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[370px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 p-7 text-white sm:p-9 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <BrainCircuit size={15} />
                  Hospital Intelligence
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Supabase + FastAPI Live Data
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Analytics Dashboard
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Track patient load, department waiting time, doctor workload,
                queue pressure and operational risk from one intelligent hospital
                analytics screen.
              </p>

              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                <InsightCard
                  icon={Users}
                  title="Patients"
                  value={summary.total_patients ?? 0}
                  desc="Total queue records"
                  gradient="from-blue-600 to-cyan-500"
                />

                <InsightCard
                  icon={Clock}
                  title="Avg Wait"
                  value={`${summary.average_wait_time ?? 0}m`}
                  desc="Across queue entries"
                  gradient="from-amber-500 to-orange-400"
                />

                <InsightCard
                  icon={ShieldAlert}
                  title="Risk"
                  value={`${summary.risk_score ?? 0}%`}
                  desc="Operational risk score"
                  gradient="from-red-500 to-rose-500"
                />
              </div>
            </div>

            <div className="relative min-h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                alt="Analytics dashboard"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-4 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Live Summary
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {summary.active_doctors ?? 0} active doctors •{" "}
                      {summary.high_priority_count ?? 0} high-priority cases
                    </p>
                  </div>

                  <button
                    onClick={loadAnalytics}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-lg transition hover:bg-blue-50 disabled:opacity-60"
                  >
                    <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
                    {loading ? "Refreshing" : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-lg shadow-red-50">
            <AlertTriangle size={18} className="shrink-0 text-red-600" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            icon={Users}
            label="Total Patients"
            value={summary.total_patients ?? 0}
            sub="Online queue records"
            gradient="from-blue-600 to-cyan-400"
            glow="shadow-blue-100"
          />

          <MetricCard
            icon={Clock}
            label="Average Wait"
            value={`${summary.average_wait_time ?? 0}m`}
            sub="Across queue entries"
            gradient="from-amber-500 to-orange-400"
            glow="shadow-amber-100"
          />

          <MetricCard
            icon={AlertTriangle}
            label="High Priority"
            value={summary.high_priority_count ?? 0}
            sub="High and critical urgency"
            gradient="from-red-500 to-orange-400"
            glow="shadow-red-100"
          />

          <MetricCard
            icon={TrendingUp}
            label="Queue Pressure"
            value={`${summary.queue_pressure ?? 0}%`}
            sub="Waiting load vs capacity"
            gradient="from-violet-600 to-indigo-500"
            glow="shadow-violet-100"
          />
        </section>

        <section className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            icon={Activity}
            label="Waiting"
            value={summary.waiting_count ?? 0}
            sub="Patients waiting"
            gradient="from-sky-500 to-blue-500"
            glow="shadow-sky-100"
          />

          <MetricCard
            icon={Stethoscope}
            label="In Consultation"
            value={summary.in_consultation_count ?? 0}
            sub="Currently active"
            gradient="from-indigo-600 to-violet-500"
            glow="shadow-indigo-100"
          />

          <MetricCard
            icon={CalendarClock}
            label="Confirmed"
            value={summary.confirmed_count ?? 0}
            sub="Confirmed appointments"
            gradient="from-emerald-500 to-teal-400"
            glow="shadow-emerald-100"
          />

          <MetricCard
            icon={Hospital}
            label="Active Doctors"
            value={summary.active_doctors ?? 0}
            sub="Available doctors"
            gradient="from-green-500 to-lime-400"
            glow="shadow-green-100"
          />
        </section>

        <section className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            icon={Users}
            label="Walk-in Load"
            value={summary.total_walkin_load ?? 0}
            sub="From admin patient count"
            gradient="from-cyan-500 to-blue-500"
            glow="shadow-cyan-100"
          />

          <MetricCard
            icon={Gauge}
            label="Avg Consultation"
            value={`${summary.average_consultation_time ?? 0}m`}
            sub="Average doctor duration"
            gradient="from-purple-600 to-fuchsia-500"
            glow="shadow-purple-100"
          />

          <MetricCard
            icon={HeartPulse}
            label="Completion Rate"
            value={`${summary.completion_rate ?? 0}%`}
            sub="Completed consultations"
            gradient="from-emerald-500 to-green-400"
            glow="shadow-emerald-100"
          />

          <MetricCard
            icon={ShieldAlert}
            label="Risk Score"
            value={`${summary.risk_score ?? 0}%`}
            sub="Queue + emergency risk"
            gradient="from-rose-500 to-red-500"
            glow="shadow-rose-100"
          />
        </section>

        <section className="mt-8">
          <SectionHeader
            title="Hospital Intelligence Features"
            desc="A visual overview of what this analytics dashboard measures and why it helps hospital operations."
            icon={Sparkles}
            badge="6 analytics modules"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_IMAGES.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr_1.05fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded-2xl bg-blue-50 p-2 text-blue-600">
                <PieChart size={18} />
              </span>

              <h3 className="text-base font-black text-slate-950">
                Urgency Breakdown
              </h3>
            </div>

            <DonutChart data={urgencyData} centerLabel="urgency" />
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded-2xl bg-violet-50 p-2 text-violet-600">
                <Activity size={18} />
              </span>

              <h3 className="text-base font-black text-slate-950">
                Queue Status
              </h3>
            </div>

            <DonutChart data={statusData} centerLabel="status" />
          </div>

          <TrendChart data={trendData} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Department Workload"
              desc="Combines walk-in patients, online queue patients and active doctors."
              icon={BarChart3}
              badge="DB connected"
            />

            <div className="space-y-5">
              {departmentLoad.map((dept) => (
                <div
                  key={dept.name}
                  className="rounded-3xl border border-slate-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        {dept.name}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {dept.patients} total patients • {dept.walkin_patients} walk-ins •{" "}
                        {dept.queue_patients} online queue • {dept.active_doctors}/
                        {dept.doctor_count} doctors active
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                      {dept.load}% load
                    </span>
                  </div>

                  <ProgressBar
                    value={dept.load}
                    max={100}
                    gradient={
                      Number(dept.load || 0) >= 75
                        ? "from-red-500 to-orange-400"
                        : Number(dept.load || 0) >= 45
                        ? "from-amber-500 to-orange-400"
                        : "from-blue-600 to-cyan-400"
                    }
                  />
                </div>
              ))}

              {departmentLoad.length === 0 && (
                <p className="rounded-3xl bg-slate-50 py-12 text-center text-sm font-semibold text-slate-400">
                  No department analytics available yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Average Waiting Time"
              desc="Predicted wait time grouped by department."
              icon={Clock}
            />

            <HorizontalChart
              title="Department Wait Time"
              data={departmentWaitChart}
              emptyText="No department wait-time data available yet."
            />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Patient Flow Overview"
              desc="Shows online queue patients and walk-in patients entered by admin."
              icon={ClipboardCheck}
              badge="Live DB Data"
            />

            <div className="space-y-5">
              {departmentLoad.map((dept) => {
                const totalPatients = Number(dept.patients || 0);
                const walkins = Number(dept.walkin_patients || 0);
                const online = Number(dept.queue_patients || 0);

                const onlinePercent =
                  totalPatients > 0 ? Math.round((online / totalPatients) * 100) : 0;

                const walkinPercent =
                  totalPatients > 0 ? Math.round((walkins / totalPatients) * 100) : 0;

                return (
                  <div
                    key={dept.name}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-950">
                          {dept.name}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {totalPatients} total patients • {online} online queue •{" "}
                          {walkins} walk-ins • {dept.average_wait_time} min avg wait
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                        {dept.load}% load
                      </span>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-full bg-white ring-1 ring-slate-100">
                      <div className="flex h-4">
                        <div
                          className="bg-blue-600"
                          style={{ width: `${onlinePercent}%` }}
                          title="Online queue patients"
                        />
                        <div
                          className="bg-cyan-300"
                          style={{ width: `${walkinPercent}%` }}
                          title="Walk-in patients"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-600" />
                        Online Queue: {online}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-cyan-300" />
                        Walk-ins: {walkins}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-white ring-1 ring-slate-200" />
                        Doctors Active: {dept.active_doctors}/{dept.doctor_count}
                      </div>
                    </div>
                  </div>
                );
              })}

              {departmentLoad.length === 0 && (
                <p className="rounded-3xl bg-slate-50 py-12 text-center text-sm font-semibold text-slate-400">
                  No patient flow data available yet.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-slate-200/70">
            <img
              src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=80"
              alt="Hospital operations"
              className="h-52 w-full object-cover"
            />

            <div className="p-6">
              <SectionHeader
                title="Operational Alerts"
                desc="Generated from current database values such as wait time, queue pressure, unavailable doctors and high-priority cases."
                icon={AlertTriangle}
              />

              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <AlertCard key={alert.title} alert={alert} />
                ))}

                {recentAlerts.length === 0 && (
                  <p className="rounded-3xl bg-emerald-50 py-10 text-center text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                    No active operational alerts right now.
                  </p>
                )}
              </div>

              <div className="mt-5 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5 ring-1 ring-blue-100">
                <h3 className="font-black text-slate-950">Why this is useful</h3>

                <p className="mt-2 text-sm leading-7 text-slate-500">
                  This section shows how busy each department is, how many patients came online,
                  how many are walk-ins, and how this affects waiting time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Doctor Workload"
              desc="Based on current patient count and consultation time."
              icon={Stethoscope}
            />

            <HorizontalChart
              title="Doctor Load Chart"
              data={doctorLoadChart}
              emptyText="No doctor workload data available yet."
            />

            <div className="mt-6 space-y-4">
              {doctorWorkload.map((doctor) => (
                <div
                  key={doctor.name}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        {doctor.name}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {doctor.department} • {doctor.patient_count} patients •{" "}
                        {doctor.consultation_minutes} min each
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
                        doctor.is_available
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}
                    >
                      {doctor.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-600">
                    <span>Base wait: {doctor.base_wait} min</span>
                    <span>Load: {doctor.load}%</span>
                  </div>

                  <div className="mt-3">
                    <ProgressBar
                      value={doctor.load}
                      max={100}
                      gradient={
                        Number(doctor.load || 0) >= 75
                          ? "from-red-500 to-orange-400"
                          : Number(doctor.load || 0) >= 45
                          ? "from-amber-500 to-orange-400"
                          : "from-indigo-600 to-blue-400"
                      }
                    />
                  </div>
                </div>
              ))}

              {doctorWorkload.length === 0 && (
                <p className="rounded-3xl bg-slate-50 py-12 text-center text-sm font-semibold text-slate-400">
                  No doctor workload data available yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Queue Breakdown & Operational Metrics"
              desc="Summarized queue status, urgency levels and system-level metrics."
              icon={PieChart}
            />

            <div className="grid gap-4">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 ring-1 ring-emerald-100">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                    <HeartPulse size={20} />
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      Low / Medium / High / Critical
                    </p>

                    <h3 className="text-xl font-black text-slate-950">
                      {urgencyBreakdown.Low || 0} / {urgencyBreakdown.Medium || 0} /{" "}
                      {urgencyBreakdown.High || 0} / {urgencyBreakdown.Critical || 0}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5 ring-1 ring-blue-100">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                    <Activity size={20} />
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      Queue Status
                    </p>

                    <h3 className="text-xl font-black text-slate-950">
                      W:{statusBreakdown.waiting || 0} • C:
                      {statusBreakdown.in_consultation || 0} • Done:
                      {statusBreakdown.completed || 0} • Cancelled:
                      {statusBreakdown.cancelled || 0}
                    </h3>
                  </div>
                </div>
              </div>

              {operationalMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                >
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                    {metric.label}
                  </p>

                  <h3 className="mt-2 text-3xl font-black text-slate-950">
                    {metric.value}
                    {metric.suffix}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {metric.description}
                  </p>
                </div>
              ))}

              {operationalMetrics.length === 0 && (
                <p className="rounded-3xl bg-slate-50 py-10 text-center text-sm font-semibold text-slate-400">
                  No operational metrics available yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="relative min-h-[260px]">
              <img
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80"
                alt="Analytics source"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20 backdrop-blur">
                  <Database size={14} />
                  Live DB Data
                </span>

                <h3 className="mt-3 text-2xl font-black">
                  Analytics Source Tables
                </h3>
              </div>
            </div>

            <div className="p-7 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
                    <AreaChart size={24} />
                    Connected Data Pipeline
                  </h2>

                  <p className="mt-4 max-w-4xl text-sm leading-8 text-slate-600">
                    This analytics page is connected to Supabase through FastAPI and calculates
                    values from queue_entries, doctors, departments and symptom_submissions.
                    Department waiting time is calculated by grouping queue entries by department
                    and averaging estimated wait minutes.
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                  <ArrowUpRight size={14} />
                  Live DB Data
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100">
                  <p className="text-2xl font-black text-slate-950">
                    queue_entries
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Queue status and wait time
                  </p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                  <p className="text-2xl font-black text-slate-950">doctors</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Availability and workload
                  </p>
                </div>

                <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
                  <p className="text-2xl font-black text-slate-950">
                    departments
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Load and capacity grouping
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}