import { Link, useParams } from "react-router-dom";
import {
  Activity,
  Ambulance,
  BedDouble,
  Bell,
  Bot,
  CalendarClock,
  Camera,
  ClipboardPlus,
  FileText,
  HeartPulse,
  Hospital,
  Pill,
  QrCode,
  ScanLine,
  Stethoscope,
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Gauge,
  LineChart,
  ClipboardCheck,
} from "lucide-react";
import { imagingQueue, queueData } from "../data/mock";

const FEATURE_IMAGES = [
  {
    title: "Digital Hospital Flow",
    desc: "Connects patients, doctors and admins through a smarter workflow.",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
    icon: Hospital,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "Clinical Decision Support",
    desc: "Helps staff act faster using priority signals and queue intelligence.",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
    icon: BrainCircuit,
    gradient: "from-violet-600 to-fuchsia-500",
  },
  {
    title: "Emergency Ready System",
    desc: "Supports critical case routing, ambulance flow and urgent triage.",
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=900&q=80",
    icon: HeartPulse,
    gradient: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Operations",
    desc: "Improves coordination across departments, doctors and patient load.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Analytics & Insights",
    desc: "Turns hospital activity into clear dashboards and operational metrics.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    icon: BarChart3,
    gradient: "from-indigo-600 to-blue-500",
  },
  {
    title: "Connected Care",
    desc: "Supports prescriptions, reports, imaging, QR tokens and telemedicine.",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80",
    icon: ClipboardCheck,
    gradient: "from-rose-500 to-red-500",
  },
];

const featureDetails = {
  "smart-queue-prediction": {
    title: "Smart Queue Prediction",
    icon: Activity,
    tag: "AI Queue ETA",
    description:
      "Predicts patient waiting time using doctor availability, patient count, consultation duration and emergency load.",
    stats: [
      ["Current OPD Load", "38 patients"],
      ["Average Wait Time", "18 min"],
      ["Fastest Department", "Emergency"],
    ],
    workflow: [
      "Collect live patient count",
      "Check doctor availability",
      "Estimate consultation duration",
      "Show predicted waiting time",
    ],
  },
  "emergency-prioritization": {
    title: "AI Emergency Prioritization",
    icon: HeartPulse,
    tag: "Triage Intelligence",
    description:
      "Ranks patients based on symptom severity and moves emergency cases ahead in the queue.",
    stats: [
      ["Critical Cases", "4"],
      ["Medium Priority", "11"],
      ["Normal Queue", "27"],
    ],
    workflow: [
      "Patient submits symptoms",
      "AI assigns urgency score",
      "Critical cases are flagged",
      "Queue order is updated",
    ],
  },
  "appointment-scheduling": {
    title: "Smart Appointment Scheduling",
    icon: CalendarClock,
    tag: "Optimized Slots",
    description:
      "Suggests the least crowded doctor slot and helps patients book appointments at optimized timings.",
    stats: [
      ["Best Slot", "2:15 PM"],
      ["Doctor Load", "68%"],
      ["Saved Wait Time", "22 min"],
    ],
    workflow: [
      "Check doctor calendar",
      "Compare available slots",
      "Predict crowd level",
      "Recommend best appointment time",
    ],
  },
  "voice-ai-assistant": {
    title: "Voice-Based AI Assistant",
    icon: Bot,
    tag: "Patient Assistant",
    description:
      "Allows patients to ask about appointments, queue status, medicines and hospital services using voice commands.",
    stats: [
      ["Languages", "3+"],
      ["Common Queries", "Queue, OPD, Pharmacy"],
      ["Mode", "Voice + Text"],
    ],
    workflow: [
      "Patient asks a question",
      "Speech is converted to text",
      "AI identifies intent",
      "System gives relevant answer",
    ],
  },
  "health-history-dashboard": {
    title: "Patient Health History Dashboard",
    icon: ClipboardPlus,
    tag: "Unified Records",
    description:
      "Displays previous visits, prescriptions, allergies, reports, chronic conditions and medical notes.",
    stats: [
      ["Past Visits", "12"],
      ["Reports", "8"],
      ["Active Prescriptions", "3"],
    ],
    workflow: [
      "Fetch patient profile",
      "Show previous visits",
      "Display reports and prescriptions",
      "Help doctor review history faster",
    ],
  },
  "disease-risk-prediction": {
    title: "AI Disease Risk Prediction",
    icon: Stethoscope,
    tag: "Risk Indicator",
    description:
      "Provides early risk indication based on symptoms, age and health history. It is not a final diagnosis.",
    stats: [
      ["Risk Level", "Medium"],
      ["Suggested Dept", "General Medicine"],
      ["Confidence", "Mock 82%"],
    ],
    workflow: [
      "Analyze selected symptoms",
      "Compare risk patterns",
      "Generate possible risk indication",
      "Recommend department",
    ],
  },
  "bed-resource-management": {
    title: "Smart Bed & Resource Management",
    icon: BedDouble,
    tag: "Live Capacity",
    description:
      "Tracks ICU beds, oxygen availability, room occupancy and hospital equipment usage.",
    stats: [
      ["ICU Beds Free", "7"],
      ["Oxygen Units", "42"],
      ["Rooms Occupied", "76%"],
    ],
    workflow: [
      "Monitor bed availability",
      "Track oxygen and resources",
      "Map emergency requirement",
      "Assign nearest available resource",
    ],
  },
  "pharmacy-integration": {
    title: "Medicine & Pharmacy Integration",
    icon: Pill,
    tag: "Digital Prescription",
    description:
      "Checks medicine stock, sends prescriptions to pharmacy and alerts staff for low-stock medicines.",
    stats: [
      ["Available Medicines", "186"],
      ["Low Stock Alerts", "9"],
      ["Pending Prescriptions", "14"],
    ],
    workflow: [
      "Doctor creates prescription",
      "System checks pharmacy stock",
      "Prescription is sent digitally",
      "Low stock alerts are generated",
    ],
  },
  "analytics-dashboard": {
    title: "Real-Time Hospital Analytics Dashboard",
    icon: Hospital,
    tag: "Operational KPIs",
    description:
      "Visualizes patient inflow, average waiting time, emergency load, department workload and peak hours.",
    stats: [
      ["Today Patients", "248"],
      ["Emergency Cases", "18"],
      ["Peak Hour", "10 AM"],
    ],
    workflow: [
      "Collect hospital activity data",
      "Calculate KPIs",
      "Visualize trends",
      "Support admin decisions",
    ],
  },
  "digital-token-qr": {
    title: "TANMAY FEATURE DETAIL TEST",
    icon: QrCode,
    tag: "QR Check-in",
    description:
      "Generates QR tokens for digital check-in and live queue tracking without physical waiting lines.",
    stats: [
      ["Current Token", "A-104"],
      ["Checked In", "67"],
      ["Skipped Tokens", "5"],
    ],
    workflow: [
      "Generate digital token",
      "Patient scans QR",
      "Queue status updates",
      "Patient receives live tracking",
    ],
  },
  telemedicine: {
    title: "Telemedicine Integration",
    icon: Camera,
    tag: "Remote Care",
    description:
      "Allows online doctor consultation, report upload and digital prescription sharing.",
    stats: [
      ["Online Doctors", "6"],
      ["Video Consults", "21"],
      ["Reports Uploaded", "39"],
    ],
    workflow: [
      "Book online consultation",
      "Upload medical reports",
      "Join video call",
      "Receive e-prescription",
    ],
  },
  "multi-hospital-saas": {
    title: "Multi-Hospital Cloud SaaS Architecture",
    icon: Users,
    tag: "Cloud Platform",
    description:
      "Supports multiple hospitals with separate dashboards, secure data separation and scalable architecture.",
    stats: [
      ["Hospitals", "5"],
      ["Admin Roles", "3"],
      ["Cloud Ready", "Yes"],
    ],
    workflow: [
      "Create hospital workspace",
      "Assign admins and doctors",
      "Separate hospital data",
      "Scale using cloud backend",
    ],
  },
  "ambulance-tracking": {
    title: "Ambulance Tracking System",
    icon: Ambulance,
    tag: "Live ETA",
    description:
      "Tracks live ambulance location, estimated arrival time and hospital routing for emergency cases.",
    stats: [
      ["Active Ambulances", "4"],
      ["Nearest ETA", "6 min"],
      ["Emergency Routing", "Enabled"],
    ],
    workflow: [
      "Track ambulance GPS",
      "Calculate ETA",
      "Notify nearest hospital",
      "Prepare emergency team",
    ],
  },
  "report-summarization": {
    title: "Smart Report Summarization",
    icon: FileText,
    tag: "AI Summary",
    description:
      "Summarizes blood reports, discharge summaries and medical records in patient-friendly language.",
    stats: [
      ["Reports Today", "18"],
      ["Summary Time", "10 sec"],
      ["Patient Friendly", "Yes"],
    ],
    workflow: [
      "Upload medical report",
      "Extract important values",
      "Generate simple summary",
      "Highlight abnormal readings",
    ],
  },
  "diagnostic-imaging-queue": {
    title: "Diagnostic Imaging Queue Management",
    icon: ScanLine,
    tag: "X-ray / CT / MRI",
    description:
      "Manages imaging queues for X-ray, CT scan, MRI and ultrasound with emergency priority slots.",
    stats: [
      ["X-Ray Waiting", "12"],
      ["CT Scan Waiting", "8"],
      ["MRI Waiting", "6"],
    ],
    workflow: [
      "Select imaging test",
      "Assign queue token",
      "Prioritize emergency cases",
      "Notify patient when slot is ready",
    ],
  },
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

function StatCard({ label, value, icon: Icon, gradient = "from-blue-600 to-cyan-500" }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white p-5 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition group-hover:opacity-25`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
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

function WorkflowTimeline({ items }) {
  return (
    <div className="relative space-y-5">
      <div className="absolute left-[18px] top-4 h-[calc(100%-2rem)] w-px bg-blue-100" />

      {items.map((item, index) => (
        <div key={item} className="relative flex gap-4">
          <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white shadow-lg shadow-blue-100">
            {index + 1}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
            <p className="font-black text-slate-950">{item}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Presentation-ready mock flow that can later connect with live backend APIs.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, centerLabel = "Total" }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  if (!total) {
    return (
      <div className="rounded-3xl bg-slate-50 py-10 text-center text-sm font-semibold text-slate-400">
        No preview data available
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

function MiniTrendChart() {
  const data = [
    { label: "9 AM", value: 18 },
    { label: "11 AM", value: 34 },
    { label: "1 PM", value: 26 },
    { label: "3 PM", value: 42 },
    { label: "Now", value: 31 },
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
            Mock Trend
          </p>
          <h3 className="mt-1 text-2xl font-black">Hospital activity flow</h3>
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

export default function FeatureDetail() {
  const { slug } = useParams();
  const feature = featureDetails[slug];

  if (!feature) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/80 bg-white p-8 shadow-xl shadow-slate-200">
          <h1 className="text-3xl font-black text-slate-950">
            Feature not found
          </h1>

          <Link
            to="/features"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 ring-1 ring-blue-100"
          >
            <ArrowLeft size={16} />
            Back to Features
          </Link>
        </div>
      </main>
    );
  }

  const Icon = feature.icon;

  const statIcons = [Gauge, Clock, ShieldCheck];

  const previewDonutData = feature.stats.map(([label, value], index) => {
    const numeric = Number(String(value).match(/\d+/)?.[0] || 10 + index * 8);

    return {
      label,
      value: numeric,
      color: ["#2563eb", "#7c3aed", "#059669"][index] || "#0ea5e9",
    };
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/features"
          className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-black text-blue-700 shadow-lg shadow-slate-200/70 backdrop-blur transition hover:-translate-y-0.5 hover:bg-blue-50"
        >
          <ArrowLeft size={16} />
          Back to Features
        </Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[390px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 p-7 text-white sm:p-9 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <Sparkles size={15} />
                  {feature.tag}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Feature Preview
                </span>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-700 shadow-xl">
                  <Icon size={31} />
                </span>

                <div>
                  <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                    {feature.title}
                  </h1>

                  <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                {feature.stats.map(([label, value], index) => {
                  const StatIcon = statIcons[index] || Activity;

                  return (
                    <div
                      key={label}
                      className="rounded-3xl bg-white/10 p-5 text-white ring-1 ring-white/15 backdrop-blur-xl"
                    >
                      <StatIcon size={22} className="text-cyan-200" />
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-black">{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[330px]">
              <img
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80"
                alt={feature.title}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/35 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Module Status
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      Mock preview ready for presentation and backend integration.
                    </p>
                  </div>

                  <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeader
            title="Feature Capability Gallery"
            desc="Different hospital workflow visuals that explain how this feature fits into the overall platform."
            icon={Sparkles}
            badge="6 visual modules"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_IMAGES.map((item) => (
              <FeatureImageCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Mock Workflow"
              desc="This explains how the feature works from input to output."
              icon={CheckCircle2}
              badge={`${feature.workflow.length} steps`}
            />

            <WorkflowTimeline items={feature.workflow} />
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
              <SectionHeader
                title="Feature Metrics Preview"
                desc="A visual summary of the mock statistics for this module."
                icon={BarChart3}
              />

              <DonutChart data={previewDonutData} centerLabel="metrics" />
            </div>

            <MiniTrendChart />
          </div>
        </section>

        {slug === "diagnostic-imaging-queue" && (
          <section className="mt-8">
            <SectionHeader
              title="Diagnostic Imaging Queue"
              desc="Mock imaging queue for X-ray, CT, MRI and ultrasound priority management."
              icon={ScanLine}
              badge="Imaging Preview"
            />

            <div className="grid gap-5 md:grid-cols-4">
              {imagingQueue.map((item) => (
                <div
                  key={item.test}
                  className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-200 opacity-30 blur-2xl" />

                  <div className="relative flex items-center justify-between">
                    <h3 className="font-black text-slate-950">{item.test}</h3>
                    <span className="rounded-2xl bg-blue-50 p-3 text-blue-700 ring-1 ring-blue-100">
                      <ScanLine size={22} />
                    </span>
                  </div>

                  <p className="relative mt-4 text-4xl font-black text-slate-950">
                    {item.waiting}
                  </p>

                  <p className="relative text-sm font-semibold text-slate-500">
                    Patients waiting
                  </p>

                  <div className="relative mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-3 text-sm ring-1 ring-blue-100">
                      <span className="font-semibold text-slate-600">Priority</span>
                      <span className="font-black text-blue-700">{item.priority}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm ring-1 ring-slate-100">
                      <span className="font-semibold text-slate-600">Avg Time</span>
                      <span className="font-black text-slate-950">{item.avg}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {slug === "analytics-dashboard" && (
          <section className="mt-8 rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Department Load Preview"
              desc="Mock department-level patient load and average wait-time visualization."
              icon={BarChart3}
              badge="Analytics Mock"
            />

            <div className="space-y-5">
              {queueData.map((item) => {
                const width = Math.min(item.patients * 2, 100);

                return (
                  <div
                    key={item.name}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-black text-slate-950">{item.name}</span>
                      <span className="font-bold text-slate-500">
                        {item.patients} patients • {item.wait} min
                      </span>
                    </div>

                    <ProgressBar
                      value={width}
                      max={100}
                      gradient={
                        width >= 75
                          ? "from-red-500 to-orange-400"
                          : width >= 45
                          ? "from-amber-500 to-orange-400"
                          : "from-blue-600 to-cyan-400"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <StatCard
            icon={Clock}
            label="Real-time Status"
            value="API Ready"
            gradient="from-blue-600 to-cyan-500"
          />

          <StatCard
            icon={AlertTriangle}
            label="Priority Handling"
            value="Enabled"
            gradient="from-red-500 to-orange-400"
          />

          <StatCard
            icon={BarChart3}
            label="Admin Ready UI"
            value="Dashboard"
            gradient="from-violet-600 to-indigo-500"
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=900&q=80"
                alt="Hospital module"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20 backdrop-blur">
                  Future Integration
                </span>

                <h3 className="mt-3 text-2xl font-black">
                  Connect this module to live hospital APIs
                </h3>
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-8">
              <h2 className="text-3xl font-black text-slate-950">
                Ready for backend integration
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-500">
                This feature detail screen currently uses mock data for presentation.
                Later, your team can connect each card, chart and workflow step to real
                backend APIs for live hospital operations.
              </p>

              <Link
                to="/features"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                View All Features
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}