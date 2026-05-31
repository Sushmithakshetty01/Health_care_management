import { Link } from "react-router-dom";
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
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Bell,
} from "lucide-react";
import { featureCards } from "../data/mock";

const HOME_IMAGES = [
  {
    title: "Smart Queue Prediction",
    desc: "Predict patient waiting time using doctor load, emergency level and consultation time.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
    icon: BrainCircuit,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "Emergency Triage",
    desc: "Prioritize serious symptoms and move urgent patients ahead in the workflow.",
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=900&q=80",
    icon: HeartPulse,
    gradient: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Operations",
    desc: "Admins can manage doctor availability, patient count and live workload.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Appointment Flow",
    desc: "Track patient appointment confirmation and queue status from one screen.",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=80",
    icon: CalendarClock,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Hospital Analytics",
    desc: "Visualize department pressure, wait-time trends and operational alerts.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    icon: BarChart3,
    gradient: "from-violet-600 to-indigo-500",
  },
  {
    title: "Patient Notifications",
    desc: "Notify patients when their turn is close and reduce crowded waiting areas.",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80",
    icon: Bell,
    gradient: "from-rose-500 to-red-500",
  },
];

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

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/10 p-5 text-white ring-1 ring-white/15 backdrop-blur-xl">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/15 blur-xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-black">{value}</h3>
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

function MiniMetric({ icon: Icon, title, value, desc, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition group-hover:opacity-25`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-black text-slate-950">{value}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
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

function SectionHeader({ title, desc }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-100">
          <Sparkles size={14} />
          Platform Modules
        </span>

        <h2 className="mt-4 text-3xl font-black text-slate-950 md:text-4xl">
          {title}
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[620px] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10 flex flex-col justify-center p-7 text-white sm:p-10 lg:p-12">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <Sparkles size={15} />
                  AI powered hospital workflow
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Live hospital-ready UI
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Smart healthcare queue and hospital operations platform.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                A modern hospital web app with real authentication, dynamic symptom
                triage, separate admin/user dashboards, queue prediction, patient
                notifications and analytics-ready hospital modules.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Start now
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/features"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
                >
                  View features
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <StatCard
                  icon={Users}
                  label="OPD Load"
                  value="284"
                  gradient="from-blue-600 to-cyan-500"
                />

                <StatCard
                  icon={Clock}
                  label="Avg Wait"
                  value="18m"
                  gradient="from-amber-500 to-orange-400"
                />

                <StatCard
                  icon={ShieldCheck}
                  label="Priority"
                  value="AI"
                  gradient="from-emerald-500 to-teal-500"
                />
              </div>
            </div>

            <div className="relative min-h-[430px]">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80"
                alt="Smart hospital platform"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/30 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Live OPD Queue
                    </p>

                    <h3 className="mt-1 text-3xl font-black">284 patients</h3>
                  </div>

                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-lg">
                    <ShieldCheck size={30} />
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    "Emergency priority detected",
                    "X-Ray queue slot optimized",
                    "Cardiology wait reduced by 12 min",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold ring-1 ring-white/10"
                    >
                      <CheckCircle2 size={17} className="text-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MiniMetric
            icon={Activity}
            title="Smart Queue"
            value="ETA"
            desc="Predicts patient waiting time using current hospital load."
            gradient="from-blue-600 to-cyan-500"
          />

          <MiniMetric
            icon={HeartPulse}
            title="Emergency"
            value="Triage"
            desc="Flags high-risk symptoms and urgent patient cases."
            gradient="from-red-500 to-orange-400"
          />

          <MiniMetric
            icon={Hospital}
            title="Admin"
            value="Ops"
            desc="Manage doctors, departments, queue and resources."
            gradient="from-violet-600 to-indigo-500"
          />

          <MiniMetric
            icon={BarChart3}
            title="Analytics"
            value="Live"
            desc="View workload, pressure, wait time and alerts."
            gradient="from-emerald-500 to-teal-500"
          />
        </section>

        <section className="mt-10">
          <SectionHeader
            title="Built for complete hospital operations"
            desc="These visual modules explain how the platform improves patient flow, admin decisions, emergency handling and hospital analytics."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {HOME_IMAGES.map((item) => (
              <FeatureImageCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <SectionHeader
            title="Core feature preview"
            desc="Quick access to the main modules available in your healthcare platform."
          />

          <div className="grid gap-5 md:grid-cols-4">
            {featureCards.slice(0, 4).map(({ title, icon: Icon, text }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl transition group-hover:bg-cyan-200/50" />

                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <Icon size={22} />
                  </span>

                  <h3 className="mt-4 font-black text-slate-950">{title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>

                  <Link
                    to="/features"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-black text-blue-700"
                  >
                    Explore
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}