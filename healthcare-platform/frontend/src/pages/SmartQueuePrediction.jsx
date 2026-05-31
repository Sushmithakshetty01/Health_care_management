import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock,
  HeartPulse,
  Hospital,
  LineChart,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TimerReset,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { getUser } from "../api/client";

const QUEUE_IMAGES = [
  {
    title: "Symptom-Based Queue Entry",
    desc: "Patients start by submitting symptoms and basic health details.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    icon: UserCheck,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "AI Priority Detection",
    desc: "The system identifies emergency, high, medium and low priority cases.",
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=900&q=80",
    icon: HeartPulse,
    gradient: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Load Matching",
    desc: "Patients are assigned to the least loaded available doctor.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Dynamic Wait-Time ETA",
    desc: "Waiting time changes based on patient count and consultation duration.",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
    icon: Clock,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Digital Queue Token",
    desc: "A queue token is generated so patients can track their progress.",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=80",
    icon: CalendarClock,
    gradient: "from-indigo-600 to-blue-500",
  },
  {
    title: "Queue Analytics",
    desc: "Admins can monitor workload, pressure and waiting-time trends.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    icon: BarChart3,
    gradient: "from-violet-600 to-fuchsia-500",
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

          <h2 className="mt-3 text-3xl font-black text-slate-950 tabular-nums">
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

function FeatureImageCard({ item }) {
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

function WorkflowTimeline() {
  const steps = [
    {
      title: "Symptom Selection",
      desc: "Patient selects symptoms and enters basic details like age, gender and notes.",
      icon: UserCheck,
    },
    {
      title: "Department & Doctor Assignment",
      desc: "Backend checks symptom severity, recommends a department and assigns the least loaded available doctor.",
      icon: Stethoscope,
    },
    {
      title: "Wait-Time Prediction",
      desc: "The system uses doctor load, consultation duration, urgency priority and buffer time to generate an ETA.",
      icon: TimerReset,
    },
    {
      title: "Queue Token Generation",
      desc: "Patient receives a queue token and can confirm the appointment from the dashboard.",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="relative space-y-5">
      <div className="absolute left-[18px] top-4 h-[calc(100%-2rem)] w-px bg-blue-100" />

      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <div key={step.title} className="relative flex gap-4">
            <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white shadow-lg shadow-blue-100">
              {index + 1}
            </div>

            <div className="flex-1 rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm ring-1 ring-slate-100">
                  <Icon size={20} />
                </span>

                <div>
                  <p className="font-black text-slate-950">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ value, max = 100, gradient = "from-blue-600 to-cyan-400" }) {
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

function MiniTrendChart() {
  const data = [
    { label: "9 AM", value: 16 },
    { label: "11 AM", value: 32 },
    { label: "1 PM", value: 24 },
    { label: "3 PM", value: 38 },
    { label: "Now", value: 28 },
  ];

  const max = Math.max(...data.map((item) => item.value), 1);

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
            Queue Trend
          </p>
          <h3 className="mt-1 text-2xl font-black">Live patient flow</h3>
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

function FactorCard({ icon: Icon, title, value, desc, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition group-hover:opacity-25`}
      />

      <div className="relative">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <Icon size={22} />
        </span>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          {title}
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-950">{value}</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default function SmartQueuePrediction() {
  const navigate = useNavigate();
  const user = getUser();
  const role = String(user?.role || "").toLowerCase();

  useEffect(() => {
    if (role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [role, navigate]);

  if (role === "admin") {
    return null;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[430px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 p-7 text-white sm:p-9 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <BrainCircuit size={15} />
                  Core Working Feature
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Patient Flow Enabled
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Smart Queue Prediction
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Automatically estimates patient waiting time based on selected symptoms,
                doctor availability, current patient load, consultation duration and
                emergency priority level.
              </p>

              <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                <InsightCard
                  icon={Clock}
                  title="Predicted Wait"
                  value="Dynamic"
                  desc="Live queue ETA"
                  gradient="from-blue-600 to-cyan-500"
                />

                <InsightCard
                  icon={HeartPulse}
                  title="Priority"
                  value="Triage"
                  desc="Emergency aware"
                  gradient="from-red-500 to-orange-400"
                />

                <InsightCard
                  icon={Stethoscope}
                  title="Doctor"
                  value="Auto"
                  desc="Least-load assign"
                  gradient="from-emerald-500 to-teal-500"
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/symptoms"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Start Symptom Check
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3.5 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
                >
                  View My Queue
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[340px]">
              <img
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80"
                alt="Smart Queue Prediction"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/35 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Prediction Preview
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      Uses symptoms, urgency, doctor load and consultation duration.
                    </p>
                  </div>

                  <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950">
                    ETA Ready
                  </span>
                </div>

                <div className="mt-4">
                  <ProgressBar value={72} max={100} gradient="from-cyan-300 to-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard
            icon={UserCheck}
            label="Patient Side"
            value="Enabled"
            sub="Submit symptoms and view live queue"
            gradient="from-blue-600 to-cyan-500"
            glow="shadow-blue-100"
          />

          <MetricCard
            icon={Stethoscope}
            label="Doctor Load"
            value="Aware"
            sub="Uses availability and current patient count"
            gradient="from-emerald-500 to-teal-500"
            glow="shadow-emerald-100"
          />

          <MetricCard
            icon={HeartPulse}
            label="Emergency Priority"
            value="Auto"
            sub="Urgent symptoms receive queue adjustment"
            gradient="from-red-500 to-orange-400"
            glow="shadow-red-100"
          />

          <MetricCard
            icon={CalendarClock}
            label="Queue Token"
            value="Digital"
            sub="Token generated after prediction"
            gradient="from-violet-600 to-indigo-500"
            glow="shadow-violet-100"
          />
        </section>

        <section className="mt-8">
          <SectionHeader
            title="Smart Queue Capability Gallery"
            desc="A visual overview of how the queue prediction feature works from symptom submission to doctor assignment."
            icon={Sparkles}
            badge="6 queue modules"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {QUEUE_IMAGES.map((item) => (
              <FeatureImageCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="How the Prediction Works"
              desc="The patient journey is converted into a queue token with a realistic waiting-time estimate."
              icon={ShieldAlert}
              badge="4 steps"
            />

            <WorkflowTimeline />
          </div>

          <div className="grid gap-6">
            <MiniTrendChart />

            <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
              <SectionHeader
                title="Prediction Factors"
                desc="These values influence the final wait-time estimate without showing a raw formula to the user."
                icon={Zap}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FactorCard
                  icon={Users}
                  title="Patient Load"
                  value="Live"
                  desc="Current doctor patient count affects base waiting time."
                  gradient="from-blue-600 to-cyan-500"
                />

                <FactorCard
                  icon={Clock}
                  title="Consultation Time"
                  value="Dynamic"
                  desc="Each doctor's average consultation duration is considered."
                  gradient="from-amber-500 to-orange-400"
                />

                <FactorCard
                  icon={HeartPulse}
                  title="Urgency"
                  value="Priority"
                  desc="Emergency and high-priority cases move faster in queue."
                  gradient="from-red-500 to-rose-500"
                />

                <FactorCard
                  icon={Hospital}
                  title="Department"
                  value="Matched"
                  desc="The system maps symptoms to the suitable department."
                  gradient="from-violet-600 to-indigo-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <UserCheck className="text-blue-700" size={28} />

            <h3 className="mt-4 text-xl font-black text-slate-950">
              Patient Side
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Patients can submit symptoms, view assigned doctor, see predicted
              wait time and confirm their appointment.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <Stethoscope className="text-emerald-700" size={28} />

            <h3 className="mt-4 text-xl font-black text-slate-950">
              Doctor Load Aware
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              The system uses doctor availability and current patient count so the
              patient gets a realistic estimated wait time.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <HeartPulse className="text-red-700" size={28} />

            <h3 className="mt-4 text-xl font-black text-slate-950">
              Emergency Priority
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Higher severity symptoms receive priority adjustment so critical
              patients can move faster in the queue.
            </p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80"
                alt="Queue platform"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20 backdrop-blur">
                  Working Feature
                </span>

                <h3 className="mt-3 text-2xl font-black">
                  Start from symptoms and continue to your queue dashboard
                </h3>
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-8">
              <h2 className="text-3xl font-black text-slate-950">
                Ready for patient use
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-500">
                This feature connects the patient symptom flow to doctor assignment,
                queue token generation and the user dashboard. It is the core working
                part of your hospital operations platform.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/symptoms"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Start Symptom Check
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                >
                  View My Queue
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}