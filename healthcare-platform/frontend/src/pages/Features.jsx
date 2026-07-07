import { Link } from "react-router-dom";
import { featureCards } from "../data/mock";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BedDouble,
  BrainCircuit,
  HeartPulse,      
  Hospital,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Camera,
} from "lucide-react";
import { getUser } from "../api/client";

const FEATURE_IMAGES = [
  {
    title: "Smart Queue Control",
    desc: "Predict wait time and manage patient movement using doctor load and urgency.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
    icon: BrainCircuit,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "Hospital Analytics",
    desc: "Track department workload, queue pressure, wait time and operational alerts.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    icon: BarChart3,
    gradient: "from-violet-600 to-indigo-500",
  },
  {
    title: "Emergency Flow",
    desc: "Prioritize urgent cases, ambulance tracking and critical hospital routing.",
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=900&q=80",
    icon: HeartPulse,
    gradient: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Operations",
    desc: "Manage doctor assignment, availability, live patient load and consultation flow.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Resource Management",
    desc: "Monitor beds, pharmacy, diagnostic imaging queue and hospital capacity.",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80",
    icon: BedDouble,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Digital Care Access",
    desc: "Patients and admins access the right modules through role-based dashboards.",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=80",
    icon: ShieldCheck,
    gradient: "from-rose-500 to-red-500",
  },
];

const FEATURE_GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-violet-600 to-indigo-500",
  "from-red-500 to-orange-400",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-red-500",
  "from-sky-500 to-blue-500",
  "from-purple-600 to-fuchsia-500",
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

function SectionHeader({ title, desc, badge }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-100">
          <Sparkles size={14} />
          {badge}
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

function ModuleCard({ feature, index, link }) {
  const Icon = feature.icon;
  const gradient = FEATURE_GRADIENTS[index % FEATURE_GRADIENTS.length];

  return (
    <Link
      to={link}
      className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition group-hover:opacity-25`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}
          >
            <Icon size={23} />
          </span>

          <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-500 transition group-hover:translate-x-1 group-hover:bg-blue-50 group-hover:text-blue-700">
            <ArrowRight size={18} />
          </span>
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-950">
          {feature.title}
        </h3>

        <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
          {feature.text}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
            {feature.metric}
          </p>

          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Open
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Features() {
  const user = getUser();
  const role = String(user?.role || "").toLowerCase();

  const adminAllowedFeatures = [
    "smart-queue-prediction",
    "patient-feedback",
    "voice-ai-assistant",
    "disease-risk-prediction",
    "health-history-dashboard",
    "analytics-dashboard",
    "bed-resource-management",
    "pharmacy-integration",
    "diagnostic-imaging-queue",
    "ambulance-tracking",
    "telemedicine",
    "digital-token-qr",
  ];

  const visibleFeatures =
    role === "admin"
      ? featureCards.filter((feature) =>
          adminAllowedFeatures.includes(feature.slug)
        )
      : featureCards;

  function getFeatureLink(slug) {
    if (slug === "smart-queue-prediction") {
      return role === "admin" ? "/admin" : "/smart-queue-prediction";
    }

    if (slug === "patient-feedback") {
      return role === "admin"
        ? "/admin/patient-feedback"
        : "/features/patient-feedback";
    }

    if (slug === "voice-ai-assistant") {
      return role === "admin"
        ? "/admin/voice-ai-assistant"
        : "/features/voice-ai-assistant";
    }

    if (slug === "disease-risk-prediction") {
      return role === "admin"
        ? "/admin/disease-risk-prediction"
        : "/features/disease-risk-prediction";
    }

    if (slug === "health-history-dashboard") {
      return role === "admin"
        ? "/admin/health-history-dashboard"
        : "/features/health-history-dashboard";
    }

    if (slug === "analytics-dashboard") {
      return "/analytics-dashboard";
    }

    if (slug === "telemedicine") {
  return role === "admin"
    ? "/admin/telemedicine"
    : "/features/telemedicine";
}

if (slug === "digital-token-qr") {
  return role === "admin"
    ? "/admin/digital-queue"
    : "/features/digital-token-qr";
}

if (slug === "pharmacy-integration") {
  return role === "admin"
    ? "/admin/pharmacy"
    : "/features/pharmacy";
}

    if (slug === "notifications") {
      return "/notifications-dashboard";
    }

    return `/features/${slug}`;
  }

  const isAdmin = role === "admin";

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[430px] lg:grid-cols-[1.12fr_0.88fr]">
            <div className="relative z-10 p-7 text-white sm:p-9 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <Sparkles size={15} />
                  {isAdmin ? "Admin Module Map" : "Complete Module Map"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  {isAdmin ? "Admin access" : "Patient + Admin modules"}
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {isAdmin
                  ? "Hospital Operations Control Center"
                  : "Smart Hospital Operations Platform"}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {isAdmin
                  ? "Access admin-supported modules such as smart queue control, analytics, disease risk monitoring, health history records, bed resources, pharmacy, imaging queue, ambulance tracking and telemedicine."
                  : "Access all major hospital modules from one place. Core modules are connected to the backend, while remaining modules are frontend-ready for teammate integration and documentation."}
              </p>

              <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                <StatCard
                  icon={Hospital}
                  label="Visible Modules"
                  value={visibleFeatures.length}
                  gradient="from-blue-600 to-cyan-500"
                />

                <StatCard
                  icon={ShieldCheck}
                  label="Role"
                  value={isAdmin ? "Admin" : "User"}
                  gradient="from-emerald-500 to-teal-500"
                />

                <StatCard
                  icon={Activity}
                  label="Platform"
                  value="Live"
                  gradient="from-violet-600 to-indigo-500"
                />
              </div>
            </div>

            <div className="relative min-h-[330px]">
              <img
                src={
                  isAdmin
                    ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                    : "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                }
                alt="Hospital modules"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/35 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Module Access
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {isAdmin
                        ? "Admin view filters only hospital operation modules."
                        : "User view shows the complete healthcare module set."}
                    </p>
                  </div>

                  <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950">
                    {visibleFeatures.length} modules
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeader
            title="Hospital module highlights"
            desc="A visual overview of the most important workflows available across the platform."
            badge="Feature Gallery"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_IMAGES.map((item) => (
              <FeatureImageCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <SectionHeader
            title={isAdmin ? "Admin-supported modules" : "All platform modules"}
            desc={
              isAdmin
                ? "These modules are available for admin users according to your role-based access rule."
                : "These modules are available for user access, including core working pages and frontend-ready feature previews."
            }
            badge={isAdmin ? "Admin Control" : "Complete Access"}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleFeatures.map((feature, index) => (
              <ModuleCard
                key={feature.title}
                feature={feature}
                index={index}
                link={getFeatureLink(feature.slug)}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <BrainCircuit className="text-blue-700" size={28} />

            <h3 className="mt-4 text-xl font-black text-slate-950">
              Smart Queue Intelligence
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Queue prediction, emergency prioritization and doctor assignment are
              designed to reduce hospital waiting time.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <Pill className="text-emerald-700" size={28} />

            <h3 className="mt-4 text-xl font-black text-slate-950">
              Resource Operations
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Beds, pharmacy, imaging queue and ambulance tracking help admins manage
              hospital resources better.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <Camera className="text-violet-700" size={28} />

            <h3 className="mt-4 text-xl font-black text-slate-950">
              Digital Care Modules
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Telemedicine, notifications, records, risk prediction and analytics make
              the platform useful for both patients and staff.
            </p>
          </div>
        </section>
        
      </div>
    </main>
  );
}