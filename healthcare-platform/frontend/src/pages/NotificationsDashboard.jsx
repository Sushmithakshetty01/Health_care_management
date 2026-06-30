import { useEffect, useState } from "react";
import { hospitalApi, getUser } from "../api/client";
import {
  Bell,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Clock,
  Send,
  UserRound,
  Stethoscope,
  AlertTriangle,
  Info,
  RefreshCcw,
  Sparkles,
  Activity,
  Hospital,
  CalendarClock,
  ArrowRight,
  MessageCircle,
  Radio,
  Inbox,
  HeartPulse,
  Zap,
} from "lucide-react";

const NOTIFICATION_IMAGES = [
  {
    title: "Email Confirmation",
    desc: "Sends appointment confirmation details to the patient after confirmation.",
    image:
      "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&w=900&q=80",
    icon: Mail,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "Browser Alerts",
    desc: "Enables browser notification and beep alerts for queue updates.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    icon: Bell,
    gradient: "from-violet-600 to-fuchsia-500",
  },
  {
    title: "Patient Updates",
    desc: "Patients can track queue token, doctor, department and wait time.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
    icon: UserRound,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Doctor Assignment",
    desc: "Notifications include assigned doctor and department information.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-indigo-600 to-blue-500",
  },
  {
    title: "Admin Visibility",
    desc: "Admins can view confirmed records and email-triggered appointments.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    icon: Hospital,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Queue Reminder Flow",
    desc: "Queue reminders can be used when consultation time is near.",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80",
    icon: Clock,
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

function WorkflowStep({ index, text }) {
  return (
    <div className="relative flex gap-4 rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-xl">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-sm font-black text-blue-700">
        {index + 1}
      </div>

      <p className="text-sm leading-6 text-white/85">{text}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc, gradient = "from-blue-600 to-cyan-500" }) {
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

        <h3 className="mt-4 font-black text-slate-950">{title}</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function QueueStatusCard({ item, admin = false }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 min-w-[66px] items-center justify-center rounded-2xl bg-blue-50 px-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">
              Q-{item.queue_number}
            </span>

            <div>
              <h3 className="text-lg font-black text-slate-950">
                {admin ? "Confirmed Appointment" : "Latest Queue Record"}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {item.departments?.name || "Department"} •{" "}
                {item.doctors?.full_name || "Doctor"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {admin && (
              <>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Patient
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {item.app_users?.full_name || "Patient"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm font-black text-slate-950">
                    {item.app_users?.email || "Not available"}
                  </p>
                </div>
              </>
            )}

            {!admin && (
              <>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Wait Time
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {item.estimated_wait_minutes} min
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Confirmation
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {item.appointment_confirmed ? "Confirmed" : "Not Confirmed"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
            item.appointment_confirmed
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
              : "bg-amber-50 text-amber-700 ring-amber-100"
          }`}
        >
          {item.appointment_confirmed ? "Email Triggered" : "Pending"}
        </span>
      </div>
    </div>
  );
}

export default function NotificationsDashboard() {
  const user = getUser();
  const role = String(user?.role || "").toLowerCase();

  const [queue, setQueue] = useState([]);
  const [adminQueue, setAdminQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [beepEnabled, setBeepEnabled] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      if (role === "admin") {
        const data = await hospitalApi.adminQueue();
        setAdminQueue(data || []);
      } else {
        const data = await hospitalApi.myQueue();
        setQueue(data || []);
      }
    } catch (err) {
      setMessage(err.message || "Unable to load notification data");
    } finally {
      setLoading(false);
    }
  }

  async function enableBrowserAlert() {
    try {
      if (!("Notification" in window)) {
        setMessage("Browser notifications are not supported.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setBeepEnabled(true);

        new Notification("MediFlow AI Notifications Enabled", {
          body: "You will receive queue and appointment alerts in the browser.",
        });

        const audio = new Audio(
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
        );
        audio.play().catch(() => {});
      } else {
        setMessage("Notification permission was not granted.");
      }
    } catch {
      setMessage("Unable to enable browser notification.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const latestQueue = queue?.[0] || null;

  const confirmedAdminItems = adminQueue.filter(
    (item) => item.appointment_confirmed === true
  );

  const totalRecords = role === "admin" ? adminQueue.length : queue.length;
  const confirmedCount =
    role === "admin"
      ? confirmedAdminItems.length
      : queue.filter((item) => item.appointment_confirmed === true).length;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#f1f5f9_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-64 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-100">
          <div className="grid min-h-[390px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 p-7 text-white sm:p-9 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
                  <Bell size={15} />
                  Notification Center
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ${
                    beepEnabled
                      ? "bg-emerald-400/15 text-emerald-100 ring-emerald-300/20"
                      : "bg-white/10 text-white/80 ring-white/15"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      beepEnabled ? "bg-emerald-300" : "bg-slate-300"
                    }`}
                  />
                  {beepEnabled ? "Browser alerts enabled" : "Browser alerts optional"}
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Appointment Email & Queue Alerts
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                This module connects appointment confirmation, email status and browser
                notifications into one clean dashboard for patients and admins.
              </p>

              <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/10 p-5 text-white ring-1 ring-white/15 backdrop-blur-xl">
                  <Mail size={22} className="text-cyan-200" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                    Email
                  </p>
                  <p className="mt-2 text-2xl font-black">Enabled</p>
                </div>

                <div className="rounded-3xl bg-white/10 p-5 text-white ring-1 ring-white/15 backdrop-blur-xl">
                  <Bell size={22} className="text-cyan-200" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                    Browser Alert
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {beepEnabled ? "Enabled" : "Optional"}
                  </p>
                </div>

                <div className="rounded-3xl bg-white/10 p-5 text-white ring-1 ring-white/15 backdrop-blur-xl">
                  <ShieldCheck size={22} className="text-cyan-200" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                    Role Access
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {role === "admin" ? "Admin" : "Patient"}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[330px]">
              <img
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80"
                alt="Notification dashboard"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/35 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Notification Summary
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {confirmedCount} confirmed appointments • {totalRecords} queue records
                    </p>
                  </div>

                  <button
                    onClick={loadData}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-lg transition hover:bg-blue-50"
                  >
                    <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
                    {loading ? "Loading" : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard
            icon={Mail}
            label="Email Confirmation"
            value="Enabled"
            sub="Triggered after appointment confirmation"
            gradient="from-blue-600 to-cyan-500"
            glow="shadow-blue-100"
          />

          <MetricCard
            icon={Bell}
            label="Browser Alert"
            value={beepEnabled ? "Enabled" : "Optional"}
            sub="Permission-based browser notification"
            gradient="from-violet-600 to-fuchsia-500"
            glow="shadow-violet-100"
          />

          <MetricCard
            icon={ShieldCheck}
            label="Role Access"
            value={role === "admin" ? "Admin" : "Patient"}
            sub="Role-based notification visibility"
            gradient="from-emerald-500 to-teal-500"
            glow="shadow-emerald-100"
          />

          <MetricCard
            icon={CheckCircle2}
            label="Confirmed"
            value={confirmedCount}
            sub={`${totalRecords} total queue records`}
            gradient="from-amber-500 to-orange-400"
            glow="shadow-amber-100"
          />
        </section>

        {message && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 shadow-lg shadow-blue-50">
            <Info size={18} className="shrink-0 text-blue-600" />
            <p className="text-sm font-bold text-blue-700">{message}</p>
          </div>
        )}

        <section className="mt-8">
          <SectionHeader
            title="Notification Workflow Features"
            desc="A visual overview of how appointment email, browser alerts and role-based notification status work."
            icon={Sparkles}
            badge="6 notification modules"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {NOTIFICATION_IMAGES.map((item) => (
              <FeatureImageCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-blue-100">
            <div className="relative h-56">
              <img
                src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=80"
                alt="Email workflow"
                className="absolute inset-0 h-full w-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20 backdrop-blur">
                  <Send size={14} />
                  Email Flow
                </span>
                <h2 className="mt-3 text-2xl font-black">How Email Works</h2>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {[
                "Patient submits symptoms and gets a queue token.",
                "Patient opens dashboard and clicks Confirm Appointment.",
                "FastAPI reads the patient email from app_users table.",
                "SMTP sends appointment details to the patient email.",
                "Admin can see the appointment confirmation in queue records.",
              ].map((item, index) => (
                <WorkflowStep key={item} index={index} text={item} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Email Confirmation Status"
              desc="This section shows how confirmation email status is linked to appointment confirmation."
              icon={Mail}
              badge={role === "admin" ? "Admin View" : "Patient View"}
            />

            <div className="mb-5 flex justify-end">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {role === "admin" ? (
              <div className="space-y-4">
                {confirmedAdminItems.length > 0 ? (
                  confirmedAdminItems.slice(0, 5).map((item) => (
                    <QueueStatusCard key={item.id} item={item} admin />
                  ))
                ) : (
                  <div className="rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-100">
                    <Inbox size={34} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-500">
                      No confirmed appointments found yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {latestQueue ? (
                  <>
                    <QueueStatusCard item={latestQueue} />

                    <div className="mt-5 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5 text-sm leading-7 text-slate-600 ring-1 ring-blue-100">
                      {latestQueue.appointment_confirmed ? (
                        <>
                          <b>Email confirmation status:</b> Your appointment was
                          confirmed. The backend email function is triggered when
                          confirmation happens.
                        </>
                      ) : (
                        <>
                          <b>Email confirmation status:</b> Confirm your appointment
                          from the User Dashboard to trigger the email confirmation.
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-100">
                    <UserRound size={34} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-500">
                      No queue record found yet. Once you confirm an appointment,
                      email status will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Browser Beep Notification"
              desc="Useful for demo. It asks permission and shows browser notification when enabled."
              icon={Bell}
            />

            <button
              onClick={enableBrowserAlert}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Enable Browser Notification
              <ArrowRight size={18} />
            </button>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                  <Radio size={20} />
                </span>

                <div>
                  <h3 className="font-black text-slate-950">
                    Notification permission
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    The browser asks permission before showing alerts. Once enabled,
                    a test notification and beep are triggered.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
            <SectionHeader
              title="Notification Logic"
              desc="Clear explanation cards for your demo and project presentation."
              icon={Zap}
              badge="Demo Ready"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                icon={CheckCircle2}
                title="Email Trigger Point"
                desc="Email is triggered only when appointment confirmation happens, not while submitting symptoms."
                gradient="from-emerald-500 to-teal-500"
              />

              <InfoCard
                icon={Clock}
                title="Queue Alert Logic"
                desc="Browser alerts can be used when remaining wait time becomes close to consultation time."
                gradient="from-amber-500 to-orange-400"
              />

              <InfoCard
                icon={Info}
                title="Demo Friendly"
                desc="Even if SMTP is not configured, the UI explains the complete email notification flow clearly."
                gradient="from-blue-600 to-cyan-500"
              />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <InfoCard
            icon={UserRound}
            title="Patient Notification"
            desc="Patient receives appointment token, doctor name, department, urgency and estimated wait time through email."
            gradient="from-blue-600 to-cyan-500"
          />

          <InfoCard
            icon={Stethoscope}
            title="Doctor Assignment Alert"
            desc="The notification module uses assigned doctor and department details from the queue entry."
            gradient="from-violet-600 to-indigo-500"
          />

          <InfoCard
            icon={AlertTriangle}
            title="Admin Visibility"
            desc="Admin can verify confirmed appointment records and patient email details from the queue data."
            gradient="from-red-500 to-orange-400"
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[270px]">
              <img
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=900&q=80"
                alt="Notification system"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20 backdrop-blur">
                  Future Integration
                </span>

                <h3 className="mt-3 text-2xl font-black">
                  Ready for SMS, WhatsApp and push notifications
                </h3>
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-8">
              <h2 className="text-3xl font-black text-slate-950">
                Extend this into a complete hospital notification engine
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-500">
                This page already explains email confirmation and browser alerts.
                Later, you can add SMS, WhatsApp, push notifications, admin broadcast
                messages and emergency queue reminders using the same dashboard structure.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100">
                  <MessageCircle className="text-blue-700" />
                  <p className="mt-3 font-black text-slate-950">SMS</p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                  <Bell className="text-emerald-700" />
                  <p className="mt-3 font-black text-slate-950">Push Alerts</p>
                </div>

                <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
                  <HeartPulse className="text-violet-700" />
                  <p className="mt-3 font-black text-slate-950">Emergency</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}