import { useEffect, useState } from "react";
import { hospitalApi } from "../api/client";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarClock,
  Plus,
  Camera,
  RefreshCcw,
  Stethoscope,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  CircleDot,
  Siren,
  ShieldCheck,
  ClipboardCheck,
  Ambulance,
  BrainCircuit,
  Gauge,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const URGENCY_COLORS = {
  Critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  High: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
    border: "border-orange-200",
  },
  Medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    border: "border-amber-200",
  },
  Low: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
};

const STATUS_STYLES = {
  waiting: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Waiting",
  },
  in_consultation: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    label: "In Consult",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Completed",
  },
  cancelled: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    label: "Cancelled",
  },
};

const DASHBOARD_IMAGES = [
  {
    title: "Smart Queue Prediction",
    desc: "Tracks live load, consultation duration and urgency to estimate patient waiting time.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    icon: BrainCircuit,
    color: "from-blue-600 to-cyan-500",
  },
  {
    title: "Emergency Prioritization",
    desc: "Highlights high-risk cases so staff can respond faster during peak crowding.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
    icon: Siren,
    color: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Availability",
    desc: "Shows active doctors, off-duty staff and current patient load in one admin view.",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    color: "from-violet-600 to-fuchsia-500",
  },
  {
    title: "Appointment Tracking",
    desc: "Separates confirmed and pending appointments for smoother front-desk operations.",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80",
    icon: CalendarClock,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Operations Analytics",
    desc: "Visual queue charts help admins understand bottlenecks and department pressure.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    icon: BarChart3,
    color: "from-indigo-600 to-blue-500",
  },
  {
    title: "Ambulance & Critical Flow",
    desc: "A clear triage-focused layout supports emergency and fast-track decision making.",
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80",
    icon: Ambulance,
    color: "from-rose-500 to-red-500",
  },

  {
  title: "Telemedicine",
  desc: "Manage consultations, reports and prescriptions.",
  image:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=900&q=80",
  icon: Camera,
  color: "from-cyan-500 to-blue-500",
  path: "/admin/telemedicine",
},
  
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient = "from-blue-500 to-cyan-500",
  glow = "shadow-blue-100",
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/70 bg-white p-5 shadow-lg ${glow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition-opacity group-hover:opacity-25`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            {label}
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-950 tabular-nums">
            {value}
          </h2>

          {sub && <p className="mt-1 text-xs font-semibold text-slate-500">{sub}</p>}
        </div>

        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <Icon size={21} />
        </span>
      </div>
    </div>
  );
}

function UrgencyBadge({ urgency }) {
  const s = URGENCY_COLORS[urgency] || URGENCY_COLORS.Low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {urgency}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.waiting;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function MiniBar({ value, max, color = "bg-blue-500" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function WaitTimeGauge({ minutes }) {
  const level = minutes <= 15 ? "low" : minutes <= 40 ? "mid" : "high";

  const colors = {
    low: "text-emerald-700 bg-emerald-50 ring-emerald-100",
    mid: "text-amber-700 bg-amber-50 ring-amber-100",
    high: "text-red-700 bg-red-50 ring-red-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black tabular-nums ring-1 ${colors[level]}`}
    >
      <Clock size={12} />
      {minutes}m
    </span>
  );
}

function SectionHeader({ title, desc, count, icon: Icon = Sparkles }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Icon size={18} />
        </span>

        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>

          {desc && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {desc}
            </p>
          )}
        </div>
      </div>

      {count !== undefined && (
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
          {count} total
        </span>
      )}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((a, b) => a + b.value, 0);

  if (!total) {
    return (
      <p className="py-8 text-center text-sm font-semibold text-slate-400">
        No data available
      </p>
    );
  }

  let cumulative = 0;
  const r = 42;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0 drop-shadow-sm">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="13" />

        {data.map((d, i) => {
          const pct = d.value / total;
          const offset = circumference * (1 - cumulative - pct);
          const dash = Math.max(0, circumference * pct - 3);

          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="13"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          );

          cumulative += pct;
          return el;
        })}

        <text
          x="56"
          y="54"
          textAnchor="middle"
          style={{ fontSize: 20, fontWeight: 900, fill: "#0f172a" }}
        >
          {total}
        </text>

        <text
          x="56"
          y="70"
          textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 800, fill: "#64748b" }}
        >
          patients
        </text>
      </svg>

      <div className="min-w-[150px] flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="font-bold text-slate-600">{d.label}</span>
            <span className="ml-auto font-black text-slate-950 tabular-nums">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBarsChart({ title, data, emptyText }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-bold text-slate-700">{item.label}</span>
              <span className="font-black text-slate-950 tabular-nums">
                {item.value}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${
                  item.gradient || "from-blue-500 to-cyan-400"
                }`}
                style={{ width: `${Math.min(100, (item.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm font-semibold text-slate-400">
          {emptyText}
        </p>
      )}
    </div>
  );
}

function TrendChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  const points = data
    .map((d, i) => {
      const x = 18 + i * (224 / Math.max(1, data.length - 1));
      const y = 126 - (d.value / max) * 86;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-5 text-white shadow-xl shadow-blue-100">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
            Queue Trend
          </p>
          <h3 className="mt-1 text-2xl font-black">Live patient flow</h3>
        </div>

        <span className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          <TrendingUp size={20} />
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
          points={points}
          fill="none"
          stroke="#67e8f9"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline points={`${points} 242,140 18,140`} fill="rgba(103,232,249,0.12)" stroke="none" />

        {data.map((d, i) => {
          const [x, y] = points.split(" ")[i].split(",");

          return (
            <circle
              key={d.label}
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
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function FeatureImageCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="group relative min-h-[245px] overflow-hidden rounded-3xl bg-slate-900 shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />

      <div
        className={`absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
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

function InsightCard({ icon: Icon, title, value, desc, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-5 text-white shadow-xl`}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
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

export default function Admin() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [patientCounts, setPatientCounts] = useState({});
  const [activeTab, setActiveTab] = useState("queue");
  const [queueFilter, setQueueFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    department_id: "",
    specialization: "",
    consultation_minutes: 15,
    current_patient_count: 0,
    is_available: true,
  });

  async function loadData() {
    setIsLoading(true);

    try {
      setError("");

      const [deptData, doctorData, queueData, appointmentData] = await Promise.all([
        hospitalApi.departments(),
        hospitalApi.doctors(),
        hospitalApi.adminQueue(),
        hospitalApi.adminAppointments().catch(() => []),
      ]);

      setDepartments(Array.isArray(deptData) ? deptData : []);

      const safeDoctors = Array.isArray(doctorData) ? doctorData : [];
      setDoctors(safeDoctors);

      const counts = {};
      safeDoctors.forEach((doc) => {
        counts[doc.id] = doc.current_patient_count ?? 0;
      });

      setPatientCounts(counts);
      setQueue(Array.isArray(queueData) ? queueData : []);
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
    } catch (err) {
      setError(err.message || "Unable to load admin data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateDoctor(e) {
    e.preventDefault();

    try {
      setError("");

      await hospitalApi.createDoctor({
        ...form,
        consultation_minutes: Number(form.consultation_minutes),
        current_patient_count: Number(form.current_patient_count),
      });

      setForm({
        full_name: "",
        department_id: "",
        specialization: "",
        consultation_minutes: 15,
        current_patient_count: 0,
        is_available: true,
      });

      loadData();
    } catch (err) {
      setError(err.message || "Could not add doctor");
    }
  }

  async function updateStatus(queueId, status) {
    try {
      setError("");
      await hospitalApi.updateQueueStatus(queueId, status);
      loadData();
    } catch (err) {
      setError(err.message || "Could not update queue status");
    }
  }

  async function toggleDoctorAvailability(doctorId, isAvailable) {
    try {
      setError("");
      await hospitalApi.updateDoctorAvailability(doctorId, isAvailable);
      loadData();
    } catch (err) {
      setError(err.message || "Could not update doctor availability");
    }
  }

  async function updatePatientCount(doctorId) {
    try {
      setError("");

      const count = Number(patientCounts[doctorId] || 0);

      if (count < 0) {
        setError("Patient count cannot be negative");
        return;
      }

      await hospitalApi.updateDoctorPatientCount(doctorId, count);
      loadData();
    } catch (err) {
      setError(err.message || "Could not update patient count");
    }
  }

  const waitingCount = queue.filter((q) => q.status === "waiting").length;
  const inConsultationCount = queue.filter((q) => q.status === "in_consultation").length;
  const completedCount = queue.filter((q) => q.status === "completed").length;
  const cancelledCount = queue.filter((q) => q.status === "cancelled").length;
  const highPriorityCount = queue.filter(
    (q) => q.urgency === "High" || q.urgency === "Critical"
  ).length;
  const criticalCount = queue.filter((q) => q.urgency === "Critical").length;
  const confirmedCount = queue.filter((q) => q.appointment_confirmed).length;
  const activeDoctors = doctors.filter((d) => d.is_available).length;

  const waitingItems = queue.filter((q) => q.status === "waiting");

  const avgWait = waitingItems
    .filter((q) => q.estimated_wait_minutes)
    .reduce((a, b, _, arr) => a + b.estimated_wait_minutes / arr.length, 0);

  const maxWait = Math.max(...queue.map((q) => Number(q.estimated_wait_minutes || 0)), 0);

  const donutData = [
    { label: "Waiting", value: waitingCount, color: "#2563eb" },
    { label: "In Consult", value: inConsultationCount, color: "#7c3aed" },
    { label: "Completed", value: completedCount, color: "#059669" },
    { label: "Cancelled", value: cancelledCount, color: "#94a3b8" },
  ];

  const urgencyData = [
    {
      label: "Critical",
      value: criticalCount,
      gradient: "from-red-500 to-rose-400",
    },
    {
      label: "High",
      value: queue.filter((q) => q.urgency === "High").length,
      gradient: "from-orange-500 to-amber-400",
    },
    {
      label: "Medium",
      value: queue.filter((q) => q.urgency === "Medium").length,
      gradient: "from-yellow-500 to-amber-300",
    },
    {
      label: "Low",
      value: queue.filter((q) => q.urgency === "Low").length,
      gradient: "from-emerald-500 to-teal-400",
    },
  ];

  const departmentLoad = departments
    .map((dept) => ({
      label: dept.name,
      value: queue.filter(
        (q) =>
          q.departments?.id === dept.id ||
          q.department_id === dept.id ||
          q.departments?.name === dept.name
      ).length,
      gradient: "from-indigo-500 to-blue-400",
    }))
    .filter((item) => item.value > 0)
    .slice(0, 6);

  const trendData = [
    { label: "9 AM", value: Math.max(1, Math.round(waitingCount * 0.45)) },
    { label: "11 AM", value: Math.max(1, Math.round(waitingCount * 0.75 + inConsultationCount)) },
    { label: "1 PM", value: Math.max(1, waitingCount + highPriorityCount) },
    { label: "3 PM", value: Math.max(1, Math.round(queue.length * 0.65)) },
    { label: "Now", value: Math.max(1, queue.length) },
  ];

  const filteredQueue =
    queueFilter === "all"
      ? queue
      : queue.filter((q) =>
          queueFilter === "high"
            ? q.urgency === "High" || q.urgency === "Critical"
            : q.status === queueFilter
        );

  const maxPatients = Math.max(
    ...doctors.map((d) => Number(patientCounts[d.id] ?? d.current_patient_count ?? 0)),
    1
  );

  const doctorLoadData = doctors.slice(0, 6).map((doc) => ({
    label: doc.full_name,
    value: Number(patientCounts[doc.id] ?? doc.current_patient_count ?? 0),
    gradient: "from-cyan-500 to-blue-500",
  }));

  const tabs = [
    { id: "queue", label: "Live Queue", count: queue.length, icon: Activity },
    { id: "doctors", label: "Doctors", count: doctors.length, icon: Stethoscope },
    { id: "add", label: "Add Doctor", count: null, icon: Plus },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[360px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 p-7 text-white sm:p-9 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <Activity size={15} />
                  Admin Control Center
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Live monitoring
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Smart Hospital Operations Dashboard
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Manage patient queues, doctor availability, appointment status and wait-time calculations from one modern command center.
              </p>

              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                <InsightCard
                  icon={Gauge}
                  title="Avg Wait"
                  value={`${Math.round(avgWait || 0)}m`}
                  desc="Current waiting estimate"
                  gradient="from-blue-600 to-cyan-500"
                />

                <InsightCard
                  icon={ShieldCheck}
                  title="Urgent"
                  value={highPriorityCount}
                  desc="High/Critical patients"
                  gradient="from-red-500 to-orange-400"
                />

                <InsightCard
                  icon={Users}
                  title="Doctors"
                  value={`${activeDoctors}/${doctors.length}`}
                  desc="Available today"
                  gradient="from-violet-600 to-indigo-500"
                />
              </div>
            </div>

            <div className="relative min-h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80"
                alt="Hospital operations dashboard"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/35 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-4 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Today Summary
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {queue.length} queue records • {confirmedCount} confirmed appointments
                    </p>
                  </div>

                  <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-lg transition hover:bg-blue-50 disabled:opacity-60"
                  >
                    <RefreshCcw size={15} className={isLoading ? "animate-spin" : ""} />
                    {isLoading ? "Refreshing" : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-lg shadow-red-50">
            <AlertTriangle size={18} className="shrink-0 text-red-600" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={Users}
            label="Waiting"
            value={waitingCount}
            sub="patients in queue"
            gradient="from-blue-600 to-cyan-400"
            glow="shadow-blue-100"
          />

          <StatCard
            icon={Stethoscope}
            label="In Consult"
            value={inConsultationCount}
            sub="active cases"
            gradient="from-violet-600 to-fuchsia-500"
            glow="shadow-violet-100"
          />

          <StatCard
            icon={Siren}
            label="High Priority"
            value={highPriorityCount}
            sub="urgent cases"
            gradient="from-red-500 to-orange-400"
            glow="shadow-red-100"
          />

          <StatCard
            icon={CalendarClock}
            label="Confirmed"
            value={confirmedCount}
            sub="appointments"
            gradient="from-emerald-500 to-teal-400"
            glow="shadow-emerald-100"
          />

          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={completedCount}
            sub="today"
            gradient="from-green-500 to-lime-400"
            glow="shadow-green-100"
          />

          <StatCard
            icon={CircleDot}
            label="Active Doctors"
            value={activeDoctors}
            sub={`of ${doctors.length} total`}
            gradient="from-indigo-600 to-blue-500"
            glow="shadow-indigo-100"
          />
        </div>

        <section className="mb-8">
          <SectionHeader
            title="Hospital Intelligence Features"
            desc="A more visual and informative section that explains what the admin dashboard controls."
            icon={Sparkles}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DASHBOARD_IMAGES.map((item) => (
  <div
    key={item.title}
    onClick={() => item.path && navigate(item.path)}
    className="cursor-pointer"
  >
    <FeatureImageCard item={item} />
  </div>
))}
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_1fr_1.05fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded-2xl bg-blue-50 p-2 text-blue-600">
                <BarChart3 size={18} />
              </span>

              <h3 className="text-base font-black text-slate-950">
                Queue Breakdown
              </h3>
            </div>

            <DonutChart data={donutData} />
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <HorizontalBarsChart
              title="Urgency Distribution"
              data={urgencyData}
              emptyText="No urgency data yet"
            />
          </div>

          <TrendChart data={trendData} />
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 lg:col-span-2">
            <SectionHeader
              title="Operational Load Overview"
              desc="Quickly compare department pressure and doctor load before adjusting queue status."
              icon={TrendingUp}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <HorizontalBarsChart
                title="Department Queue Load"
                data={departmentLoad}
                emptyText="No department queue load yet"
              />

              <HorizontalBarsChart
                title="Doctor Patient Load"
                data={doctorLoadData}
                emptyText="No doctors added yet"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-slate-200/70">
            <img
              src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=900&q=80"
              alt="Doctor reviewing hospital data"
              className="h-44 w-full object-cover"
            />

            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-500">
                Smart Insight
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950">
                Peak wait time is {maxWait}m
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Use the queue filter and doctor load chart together to identify high-pressure departments and move patients faster.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-0 overflow-hidden rounded-t-3xl border border-white/80 bg-white/80 px-4 pt-3 shadow-lg shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}

                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${
                        activeTab === tab.id
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-b-3xl rounded-tr-3xl border border-white/80 bg-white p-4 shadow-2xl shadow-slate-200/70 sm:p-6">
          {activeTab === "queue" && (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <SectionHeader
                  title="Live Queue & Wait-Time Calculation"
                  desc="Status updates recalculate wait times, urgency order and doctor load in real time."
                  icon={ClipboardCheck}
                />

                <div className="flex flex-wrap gap-2">
                  {["all", "waiting", "in_consultation", "high", "completed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setQueueFilter(f)}
                      className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                        queueFilter === f
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {f === "all"
                        ? "All"
                        : f === "high"
                        ? "🚨 High Priority"
                        : f.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-100">
                <table className="w-full min-w-[1120px] text-left text-[15px]">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Token",
                        "Patient",
                        "Department",
                        "Doctor",
                        "Urgency",
                        "Wait",
                        "Appt.",
                        "Status",
                        "Calc. Breakdown",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-4 text-[13px] font-black uppercase tracking-wider text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredQueue.map((item) => (
                      <tr
                        key={item.id}
                        className="group align-middle transition-colors hover:bg-blue-50/40"
                      >
                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex h-11 min-w-[58px] items-center justify-center rounded-2xl bg-blue-50 px-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                              Q-{item.queue_number}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <p className="font-black text-slate-950">
                            {item.app_users?.full_name}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Patient record
                          </p>
                        </td>

                        <td className="px-4 py-4 align-middle text-sm font-semibold text-slate-500">
                          {item.departments?.name}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <p className="text-sm font-bold text-slate-600">
                            {item.doctors?.full_name}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <UrgencyBadge urgency={item.urgency} />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <WaitTimeGauge minutes={item.estimated_wait_minutes || 0} />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                              item.appointment_confirmed
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.appointment_confirmed ? (
                              <CheckCircle2 size={11} />
                            ) : (
                              <XCircle size={11} />
                            )}

                            {item.appointment_confirmed ? "Confirmed" : "Pending"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="min-w-[235px] px-4 py-4 align-middle">
                          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-sm leading-7 text-slate-600">
                            <div className="flex justify-between">
                              <span className="font-bold">Base</span>
                              <span className="tabular-nums">
                                {item.base_wait_minutes || 0}m
                              </span>
                            </div>

                            <div className="flex justify-between text-emerald-700">
                              <span className="font-bold">Priority adj.</span>
                              <span className="tabular-nums">
                                −{item.priority_adjustment_minutes || 0}m
                              </span>
                            </div>

                            <div className="flex justify-between text-amber-700">
                              <span className="font-bold">Buffer</span>
                              <span className="tabular-nums">
                                +{item.buffer_minutes || 0}m
                              </span>
                            </div>

                            <div className="mt-2 flex justify-between border-t border-blue-100 pt-2 font-black text-slate-950">
                              <span>Final</span>
                              <span className="tabular-nums">
                                {item.estimated_wait_minutes || 0}m
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <select
                            className="input rounded-xl py-2 text-sm font-bold"
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                          >
                            <option value="waiting">Waiting</option>
                            <option value="in_consultation">In Consultation</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}

                    {filteredQueue.length === 0 && (
                      <tr>
                        <td colSpan="10" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Activity size={34} className="opacity-40" />

                            <p className="text-sm font-bold">
                              No queue entries matching this filter
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "doctors" && (
            <>
              <SectionHeader
                title="Doctor Availability & Patient Load"
                desc="Update walk-in counts to recalculate queue wait times and maintain accurate consultation flow."
                count={doctors.length}
                icon={Stethoscope}
              />

              <div className="overflow-x-auto rounded-3xl border border-slate-100">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Doctor",
                        "Department",
                        "Specialization",
                        "Consult Time",
                        "Live Patients",
                        "Base Wait",
                        "Load",
                        "Status",
                        "Toggle",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {doctors.map((doc) => {
                      const count = Number(
                        patientCounts[doc.id] ?? doc.current_patient_count ?? 0
                      );

                      const baseWait = count * Number(doc.consultation_minutes || 0);

                      const pct = maxPatients > 0 ? (count / maxPatients) * 100 : 0;

                      return (
                        <tr
                          key={doc.id}
                          className="group align-middle transition-colors hover:bg-blue-50/40"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-sm font-black text-white shadow-lg shadow-blue-100">
                                {doc.full_name?.charAt(0)}
                              </div>

                              <div>
                                <span className="font-black text-slate-950">
                                  {doc.full_name}
                                </span>

                                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                                  Medical staff
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                            {doc.departments?.name}
                          </td>

                          <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                            {doc.specialization || "—"}
                          </td>

                          <td className="px-4 py-4 text-xs font-black text-slate-700">
                            {doc.consultation_minutes}m
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                className="input w-20 rounded-xl py-2 text-xs font-bold"
                                value={
                                  patientCounts[doc.id] ??
                                  doc.current_patient_count ??
                                  0
                                }
                                onChange={(e) =>
                                  setPatientCounts({
                                    ...patientCounts,
                                    [doc.id]: e.target.value,
                                  })
                                }
                              />

                              <button
                                type="button"
                                onClick={() => updatePatientCount(doc.id)}
                                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                              >
                                Save
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <WaitTimeGauge minutes={baseWait} />
                          </td>

                          <td className="min-w-[130px] px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <MiniBar
                                  value={count}
                                  max={maxPatients}
                                  color={
                                    pct > 75
                                      ? "bg-red-500"
                                      : pct > 40
                                      ? "bg-amber-500"
                                      : "bg-blue-500"
                                  }
                                />
                              </div>

                              <span className="text-[10px] font-black text-slate-400 tabular-nums">
                                {Math.round(pct)}%
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                                doc.is_available
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  doc.is_available ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />

                              {doc.is_available ? "Available" : "Unavailable"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                toggleDoctorAvailability(doc.id, !doc.is_available)
                              }
                              className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                                doc.is_available
                                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {doc.is_available ? "Mark Off-Duty" : "Mark Available"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {doctors.length === 0 && (
                      <tr>
                        <td colSpan="9" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Stethoscope size={34} className="opacity-40" />

                            <p className="text-sm font-bold">
                              No doctors added yet
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "add" && (
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-blue-100">
                <img
                  src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=80"
                  alt="Add doctor"
                  className="h-64 w-full object-cover opacity-90"
                />

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
                    Doctor Setup
                  </p>

                  <h3 className="mt-2 text-3xl font-black">
                    Add staff and calculate live queue impact
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Consultation time and current patient count are used by the dashboard to estimate base wait time and balance hospital operations.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <p className="text-2xl font-black">{departments.length}</p>
                      <p className="text-xs font-bold text-slate-300">
                        Departments
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <p className="text-2xl font-black">{doctors.length}</p>
                      <p className="text-xs font-bold text-slate-300">
                        Doctors
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-100">
                <SectionHeader
                  title="Add Doctor Availability"
                  desc="Register a new doctor and set their initial patient load."
                  icon={Plus}
                />

                <form onSubmit={handleCreateDoctor} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-black text-slate-600">
                      Full Name *
                    </label>

                    <input
                      className="input rounded-2xl"
                      placeholder="Dr. Anika Sharma"
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-black text-slate-600">
                      Department *
                    </label>

                    <select
                      className="input rounded-2xl"
                      value={form.department_id}
                      onChange={(e) =>
                        setForm({ ...form, department_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Select a department</option>

                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-black text-slate-600">
                      Specialization
                    </label>

                    <input
                      className="input rounded-2xl"
                      placeholder="e.g. Cardiology, Pediatrics"
                      value={form.specialization}
                      onChange={(e) =>
                        setForm({ ...form, specialization: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-black text-slate-600">
                        Consultation Time (min)
                      </label>

                      <input
                        className="input rounded-2xl"
                        type="number"
                        min="1"
                        value={form.consultation_minutes}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            consultation_minutes: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-black text-slate-600">
                        Initial Patient Count
                      </label>

                      <input
                        className="input rounded-2xl"
                        type="number"
                        min="0"
                        value={form.current_patient_count}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            current_patient_count: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={form.is_available}
                      className="h-4 w-4 rounded accent-blue-600"
                      onChange={(e) =>
                        setForm({ ...form, is_available: e.target.checked })
                      }
                    />

                    <label
                      htmlFor="is_available"
                      className="cursor-pointer text-sm font-black text-slate-900"
                    >
                      Doctor is available now
                    </label>

                    <span
                      className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-black ${
                        form.is_available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {form.is_available ? "Active" : "Off-duty"}
                    </span>
                  </div>

                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl"
                    type="submit"
                  >
                    <Plus size={17} />
                    Add Doctor
                    <ArrowUpRight size={16} />
                  </button>

                  <p className="text-center text-xs leading-6 text-slate-400">
                    Current patient count represents live walk-in load and is used to calculate wait times.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}