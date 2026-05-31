import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { hospitalApi } from "../api/client";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  HeartPulse,
  Hospital,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerReset,
  UserRound,
  Users,
  AlertTriangle,
  ClipboardCheck,
  BrainCircuit,
  MapPin,
} from "lucide-react";

const FEATURE_IMAGES = [
  {
    title: "Queue Status Tracking",
    desc: "View your live queue token, remaining time and consultation status.",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
    icon: Activity,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "Smart Wait Prediction",
    desc: "Estimated wait time is calculated using doctor load and urgency level.",
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=900&q=80",
    icon: BrainCircuit,
    gradient: "from-violet-600 to-fuchsia-500",
  },
  {
    title: "Doctor Assignment",
    desc: "Get automatically assigned to the right department and doctor.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Queue Alerts",
    desc: "Enable beep and browser notifications when your turn is nearby.",
    image:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=900&q=80",
    icon: Bell,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Appointment Confirmation",
    desc: "Confirm your appointment so the hospital team knows you are attending.",
    image:
      "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=900&q=80",
    icon: CalendarClock,
    gradient: "from-indigo-600 to-blue-500",
  },
  {
    title: "Patient Care Flow",
    desc: "Track every queue record and care step in your dashboard history.",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80",
    icon: HeartPulse,
    gradient: "from-rose-500 to-red-500",
  },
];

const URGENCY_STYLES = {
  Critical: "bg-red-50 text-red-700 ring-red-100",
  High: "bg-orange-50 text-orange-700 ring-orange-100",
  Medium: "bg-amber-50 text-amber-700 ring-amber-100",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const STATUS_STYLES = {
  waiting: "bg-blue-50 text-blue-700 ring-blue-100",
  in_consultation: "bg-violet-50 text-violet-700 ring-violet-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-slate-100 text-slate-500 ring-slate-200",
};

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
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
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
    <div className="group relative min-h-[235px] overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
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

function StatusBadge({ status }) {
  const label =
    status === "in_consultation"
      ? "In Consultation"
      : status
      ? status.replace(/^\w/, (c) => c.toUpperCase())
      : "-";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-500 ring-slate-200"
      }`}
    >
      {label}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${
        URGENCY_STYLES[urgency] || "bg-slate-100 text-slate-500 ring-slate-200"
      }`}
    >
      {urgency || "-"}
    </span>
  );
}

function ProgressBar({ value, max, gradient = "from-blue-600 to-cyan-400" }) {
  const width =
    max > 0 ? Math.min(100, Math.max(0, (Number(value || 0) / max) * 100)) : 0;

  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function DetailCard({ icon: Icon, label, value, gradient = "from-blue-600 to-cyan-500" }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-black text-slate-950">{value}</h3>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [error, setError] = useState("");
  const alreadyAlertedRef = useRef(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const queueData = await hospitalApi.myQueue();
      setQueue(Array.isArray(queueData) ? queueData : []);
    } catch (err) {
      setError(err.message || "Unable to load queue details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const latestQueue = queue[0];

  const activeQueue = useMemo(() => {
    if (!latestQueue) return null;

    const createdAt = new Date(latestQueue.created_at).getTime();
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - createdAt) / 60000);
    const estimated = Number(latestQueue.estimated_wait_minutes || 0);
    const remaining = Math.max(estimated - elapsedMinutes, 0);

    return {
      ...latestQueue,
      remaining_minutes: remaining,
    };
  }, [latestQueue]);

  function playBeep() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      alert("Your browser does not support beep audio.");
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
      0.00001,
      audioContext.currentTime + 0.8
    );

    oscillator.stop(audioContext.currentTime + 0.8);
  }

  async function enableAlerts() {
    setAlertEnabled(true);

    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    playBeep();
  }

  async function confirmAppointment() {
    if (!activeQueue) return;

    try {
      setError("");
      await hospitalApi.confirmQueueAppointment(activeQueue.id);
      await loadData();
    } catch (err) {
      setError(err.message || "Could not confirm appointment");
    }
  }

  useEffect(() => {
    if (!alertEnabled || !activeQueue || alreadyAlertedRef.current) return;

    if (
      activeQueue.status === "waiting" &&
      activeQueue.remaining_minutes <= 30
    ) {
      alreadyAlertedRef.current = true;
      playBeep();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("MediFlow AI Queue Alert", {
          body: `Your turn is getting close. Remaining time: ${activeQueue.remaining_minutes} minutes.`,
        });
      } else {
        alert(
          `Your turn is getting close. Remaining time: ${activeQueue.remaining_minutes} minutes.`
        );
      }
    }
  }, [activeQueue, alertEnabled]);

  const waitProgress = activeQueue
    ? Math.max(
        0,
        Math.min(
          100,
          100 -
            (Number(activeQueue.remaining_minutes || 0) /
              Math.max(Number(activeQueue.estimated_wait_minutes || 1), 1)) *
              100
        )
      )
    : 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[380px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 p-7 text-white sm:p-9 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <HeartPulse size={15} />
                  Patient Dashboard
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ${
                    alertEnabled
                      ? "bg-emerald-400/15 text-emerald-100 ring-emerald-300/20"
                      : "bg-white/10 text-white/80 ring-white/15"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      alertEnabled ? "bg-emerald-300" : "bg-slate-300"
                    }`}
                  />
                  {alertEnabled ? "Queue alert enabled" : "Queue alert disabled"}
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Your Smart Queue Status
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Track your queue token, doctor assignment, predicted waiting time
                and appointment confirmation in one modern patient dashboard.
              </p>

              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                <InsightCard
                  icon={Activity}
                  title="Token"
                  value={activeQueue ? `Q-${activeQueue.queue_number}` : "-"}
                  desc="Current queue number"
                  gradient="from-blue-600 to-cyan-500"
                />

                <InsightCard
                  icon={Clock}
                  title="Remaining"
                  value={activeQueue ? `${activeQueue.remaining_minutes}m` : "-"}
                  desc="Live countdown estimate"
                  gradient="from-amber-500 to-orange-400"
                />

                <InsightCard
                  icon={ShieldCheck}
                  title="Priority"
                  value={activeQueue?.urgency || "-"}
                  desc="Emergency urgency level"
                  gradient="from-red-500 to-rose-500"
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={enableAlerts}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:bg-blue-50"
                >
                  <Bell size={17} />
                  Enable Queue Alert
                </button>

                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
                >
                  <RefreshCcw size={17} className={loading ? "animate-spin" : ""} />
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <div className="relative min-h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
                alt="Patient dashboard"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Live Queue Progress
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {activeQueue
                        ? `${Math.round(waitProgress)}% of estimated waiting time completed`
                        : "Submit symptoms to generate your first queue token"}
                    </p>
                  </div>

                  <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950">
                    {activeQueue ? `${activeQueue.remaining_minutes}m left` : "No queue"}
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 transition-all"
                    style={{ width: `${waitProgress}%` }}
                  />
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

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Activity}
            label="Queue Token"
            value={activeQueue ? `Q-${activeQueue.queue_number}` : "-"}
            sub="Your current token"
            gradient="from-blue-600 to-cyan-400"
            glow="shadow-blue-100"
          />

          <MetricCard
            icon={HeartPulse}
            label="Emergency Priority"
            value={activeQueue?.urgency || "-"}
            sub="Based on symptoms"
            gradient="from-red-500 to-rose-500"
            glow="shadow-red-100"
          />

          <MetricCard
            icon={Clock}
            label="Predicted Wait"
            value={activeQueue ? `${activeQueue.estimated_wait_minutes}m` : "-"}
            sub="Estimated wait time"
            gradient="from-amber-500 to-orange-400"
            glow="shadow-amber-100"
          />

          <MetricCard
            icon={Bell}
            label="Remaining Time"
            value={activeQueue ? `${activeQueue.remaining_minutes}m` : "-"}
            sub={alertEnabled ? "Alert is enabled" : "Enable alert"}
            gradient="from-emerald-500 to-teal-400"
            glow="shadow-emerald-100"
          />
        </section>

        <section className="mt-8">
          <SectionHeader
            title="Patient Care Features"
            desc="A visual overview of what your patient dashboard tracks after symptom submission."
            icon={Sparkles}
            badge="6 care modules"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_IMAGES.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        {!activeQueue && (
          <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-slate-200/70">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative min-h-[300px]">
                <img
                  src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80"
                  alt="Submit symptoms"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20 backdrop-blur">
                    First Step
                  </span>
                  <h3 className="mt-3 text-2xl font-black">
                    Submit symptoms to join the queue
                  </h3>
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-8">
                <h2 className="text-3xl font-black text-slate-950">
                  No queue record yet
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Submit your symptoms first. The system will automatically assign
                  a doctor, select the department and calculate your waiting time.
                </p>

                <Link
                  to="/symptoms"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Submit Symptoms
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {activeQueue && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
              <SectionHeader
                title="Assigned Doctor & Department"
                desc="Your doctor and department are assigned automatically from your submitted symptoms."
                icon={Stethoscope}
                badge={activeQueue.appointment_confirmed ? "Confirmed" : "Pending"}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <DetailCard
                  icon={Stethoscope}
                  label="Doctor"
                  value={activeQueue.doctors?.full_name || "Not assigned"}
                  gradient="from-blue-600 to-cyan-500"
                />

                <DetailCard
                  icon={Hospital}
                  label="Department"
                  value={activeQueue.departments?.name || "Not assigned"}
                  gradient="from-violet-600 to-indigo-500"
                />

                <DetailCard
                  icon={ClipboardCheck}
                  label="Status"
                  value={<StatusBadge status={activeQueue.status} />}
                  gradient="from-emerald-500 to-teal-500"
                />

                <DetailCard
                  icon={CalendarClock}
                  label="Appointment"
                  value={
                    activeQueue.appointment_confirmed ? "Confirmed" : "Pending"
                  }
                  gradient="from-amber-500 to-orange-400"
                />
              </div>

              <div className="mt-6 rounded-3xl border border-slate-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">
                      Wait Time Breakdown
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      A simple view of your base wait, priority adjustment, buffer
                      and final predicted wait.
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                    Final: {activeQueue.estimated_wait_minutes || 0}m
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Base Wait
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {activeQueue.base_wait_minutes || 0}m
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Priority Adj.
                    </p>
                    <p className="mt-2 text-2xl font-black text-emerald-700">
                      -{activeQueue.priority_adjustment_minutes || 0}m
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Buffer
                    </p>
                    <p className="mt-2 text-2xl font-black text-amber-700">
                      +{activeQueue.buffer_minutes || 0}m
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-lg">
                    <p className="text-xs font-black uppercase tracking-wide text-white/60">
                      Final Wait
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {activeQueue.estimated_wait_minutes || 0}m
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-400">
                    <span>Waiting progress</span>
                    <span>{Math.round(waitProgress)}%</span>
                  </div>
                  <ProgressBar value={waitProgress} max={100} />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-slate-200/70">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80"
                alt="Appointment confirmation"
                className="h-52 w-full object-cover"
              />

              <div className="p-6">
                <SectionHeader
                  title="Appointment Confirmation"
                  desc="Confirm this appointment so the admin can see that you are attending."
                  icon={CheckCircle2}
                />

                {activeQueue.appointment_confirmed ? (
                  <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                    Appointment Confirmed
                  </div>
                ) : (
                  <button
                    onClick={confirmAppointment}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl"
                  >
                    Confirm Appointment
                    <ArrowRight size={18} />
                  </button>
                )}

                <button
                  onClick={enableAlerts}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3.5 text-sm font-black text-blue-700 transition hover:bg-blue-100"
                >
                  <Bell size={18} />
                  Enable Beep Notification
                </button>

                <div className="mt-5 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                  <div className="flex items-start gap-3">
                    <span className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                      <TimerReset size={20} />
                    </span>
                    <div>
                      <h3 className="font-black text-slate-950">Alert timing</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Alert triggers when remaining time is 30 minutes or less.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
          <SectionHeader
            title="My Queue History"
            desc="All your previous and current queue records appear here."
            icon={Users}
            badge={`${queue.length} records`}
          />

          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 min-w-[64px] items-center justify-center rounded-2xl bg-blue-50 px-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                      Q-{item.queue_number}
                    </span>

                    <div>
                      <h3 className="text-xl font-black text-slate-950">
                        {item.departments?.name || "Department not assigned"}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {item.doctors?.full_name || "Doctor not assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <UrgencyBadge urgency={item.urgency} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Wait
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950">
                      {item.estimated_wait_minutes} min
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-950">
                      {item.departments?.name || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Doctor
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-950">
                      {item.doctors?.full_name || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Confirmed
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-950">
                      {item.appointment_confirmed ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-black text-slate-950">
                      <MapPin size={14} className="text-blue-600" />
                      Hospital
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {queue.length === 0 && (
              <div className="rounded-3xl bg-slate-50 py-12 text-center ring-1 ring-slate-100">
                <UserRound size={34} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">
                  No queue record yet. Submit symptoms first.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}