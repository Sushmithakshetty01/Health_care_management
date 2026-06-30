import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { symptomsApi } from "../api/client";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock,
  HeartPulse,
  Hospital,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  ClipboardCheck,
  FileText,
  Gauge,
} from "lucide-react";

const SYMPTOM_IMAGES = [
  {
    title: "Symptom Check-In",
    desc: "Patients submit symptoms and basic details to begin the smart queue flow.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    icon: ClipboardCheck,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    title: "AI Triage Priority",
    desc: "Symptoms are analyzed to identify urgency level and emergency priority.",
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=900&q=80",
    icon: HeartPulse,
    gradient: "from-red-500 to-orange-400",
  },
  {
    title: "Doctor Matching",
    desc: "The system recommends a department and assigns an available doctor.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Queue ETA",
    desc: "Waiting time is predicted using patient load and consultation duration.",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=80",
    icon: Clock,
    gradient: "from-amber-500 to-orange-400",
  },
  {
    title: "Digital Token",
    desc: "A queue token is generated after triage and doctor assignment.",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80",
    icon: CalendarClock,
    gradient: "from-violet-600 to-indigo-500",
  },
  {
    title: "Patient Dashboard",
    desc: "Patients can track queue status and confirm their appointment.",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
    icon: Gauge,
    gradient: "from-rose-500 to-red-500",
  },
];

const URGENCY_STYLES = {
  Critical: "bg-red-50 text-red-700 ring-red-100",
  High: "bg-orange-50 text-orange-700 ring-orange-100",
  Medium: "bg-amber-50 text-amber-700 ring-amber-100",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-100",
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

function InputShell({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
      <Icon size={18} className="shrink-0 text-slate-400" />
      {children}
    </div>
  );
}

function ResultCard({ icon: Icon, label, value, gradient = "from-blue-600 to-cyan-500" }) {
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
          {label}
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-950">{value}</h3>
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

export default function Symptoms() {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadSymptoms(searchText = "") {
    try {
      setLoadingSymptoms(true);
      setError("");

      const data = await symptomsApi.getSymptoms(searchText);
      setSymptoms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load symptoms");
      setSymptoms([]);
    } finally {
      setLoadingSymptoms(false);
    }
  }

  useEffect(() => {
    loadSymptoms();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSymptoms(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  function toggleSymptom(symptomId) {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptomId)) {
        return prev.filter((id) => id !== symptomId);
      }

      return [...prev, symptomId];
    });
  }

  const selectedSymptomDetails = useMemo(() => {
    return symptoms.filter((symptom) => selectedSymptoms.includes(symptom.id));
  }, [symptoms, selectedSymptoms]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const response = await symptomsApi.submitSymptoms({
        symptom_ids: selectedSymptoms,
        age: age ? Number(age) : null,
        gender,
        notes,
      });

      setResult(response);
    } catch (err) {
      setError(err.message || "Could not submit symptoms");
    } finally {
      setSubmitting(false);
    }
  }

  const triage = result?.triage || result;

  const severityTotal = selectedSymptomDetails.reduce(
    (sum, symptom) => sum + Number(symptom.severity_weight || 0),
    0
  );

  const severityProgress = Math.min(100, severityTotal * 10);

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
                  Dynamic symptom triage
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Supabase + FastAPI
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Tell us your symptoms and get smart queue guidance
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Select symptoms from the live database. The system automatically
                assigns a doctor, calculates urgency, predicts queue time and
                generates your queue token.
              </p>

              <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                <InsightCard
                  icon={HeartPulse}
                  title="Emergency"
                  value="Triage"
                  desc="Priority detection"
                  gradient="from-red-500 to-orange-400"
                />

                <InsightCard
                  icon={Clock}
                  title="Queue"
                  value="ETA"
                  desc="Live wait prediction"
                  gradient="from-blue-600 to-cyan-500"
                />

                <InsightCard
                  icon={Stethoscope}
                  title="Doctor"
                  value="Match"
                  desc="Auto assignment"
                  gradient="from-emerald-500 to-teal-500"
                />
              </div>
            </div>

            <div className="relative min-h-[330px]">
              <img
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80"
                alt="Symptom triage"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/35 to-transparent lg:bg-gradient-to-l" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/15 p-5 text-white backdrop-blur-xl ring-1 ring-white/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                      Selected Symptoms
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {selectedSymptoms.length} selected • Severity score {severityTotal || 0}
                    </p>
                  </div>

                  <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950">
                    {selectedSymptoms.length || 0}
                  </span>
                </div>

                <div className="mt-4">
                  <ProgressBar
                    value={severityProgress}
                    max={100}
                    gradient="from-cyan-300 to-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard
            icon={HeartPulse}
            label="Emergency Priority"
            value="Auto Triage"
            sub="Urgency calculated from symptoms"
            gradient="from-red-500 to-orange-400"
            glow="shadow-red-100"
          />

          <MetricCard
            icon={Clock}
            label="Queue Prediction"
            value="Live ETA"
            sub="Estimated waiting time generated"
            gradient="from-blue-600 to-cyan-500"
            glow="shadow-blue-100"
          />

          <MetricCard
            icon={Stethoscope}
            label="Doctor Match"
            value="Auto Assign"
            sub="Doctor selected from available load"
            gradient="from-emerald-500 to-teal-500"
            glow="shadow-emerald-100"
          />

          <MetricCard
            icon={CalendarClock}
            label="Queue Token"
            value="Digital"
            sub="Token created after submission"
            gradient="from-violet-600 to-indigo-500"
            glow="shadow-violet-100"
          />
        </section>

        <section className="mt-8">
          <SectionHeader
            title="Symptom Triage Capability Gallery"
            desc="A visual overview of how the symptom module connects patient input to queue prediction and doctor assignment."
            icon={Sparkles}
            badge="6 triage modules"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SYMPTOM_IMAGES.map((item) => (
              <FeatureImageCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
            <SectionHeader
              title="Patient Details"
              desc="Basic information helps the system understand the queue request clearly."
              icon={UserRound}
            />

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                <AlertTriangle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-900">
                    Age
                  </label>

                  <InputShell icon={UserRound}>
                    <input
                      type="number"
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                      placeholder="Example: 22"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="1"
                      max="120"
                    />
                  </InputShell>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-900">
                    Gender
                  </label>

                  <InputShell icon={ShieldCheck}>
                    <select
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </InputShell>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-black text-slate-900">
                  Additional notes
                </label>

                <textarea
                  className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="Example: Fever and headache since morning..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {selectedSymptomDetails.length > 0 && (
                <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-950">
                      Selected symptoms
                    </p>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                      {selectedSymptomDetails.length} selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedSymptomDetails.map((symptom) => (
                      <span
                        key={symptom.id}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100"
                      >
                        <CheckCircle2 size={13} />
                        {symptom.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <HeartPulse size={18} />
                    Submit Symptoms
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
            <SectionHeader
              title="Search & Select Symptoms"
              desc="Search symptoms from your live Supabase database and select one or more."
              icon={Search}
              badge={`${selectedSymptoms.length} selected`}
            />

            <div>
              <label className="mb-2 block text-sm font-black text-slate-900">
                Search symptoms
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="Search fever, cough, chest pain..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 max-h-[520px] overflow-y-auto rounded-3xl border border-slate-100 bg-slate-50 p-3">
              {loadingSymptoms ? (
                <div className="flex items-center justify-center gap-2 py-14 text-sm font-black text-blue-700">
                  <Loader2 className="animate-spin" size={18} />
                  Loading symptoms...
                </div>
              ) : symptoms.length === 0 ? (
                <div className="py-14 text-center text-sm font-semibold text-slate-500">
                  No symptoms found.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {symptoms.map((symptom) => {
                    const active = selectedSymptoms.includes(symptom.id);

                    return (
                      <button
                        type="button"
                        key={symptom.id}
                        onClick={() => toggleSymptom(symptom.id)}
                        className={`rounded-3xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                          active
                            ? "border-blue-300 bg-white shadow-lg ring-4 ring-blue-100"
                            : "border-slate-100 bg-white/80 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-950">
                              {symptom.name}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {symptom.department}
                            </p>
                          </div>

                          {active ? (
                            <CheckCircle2
                              className="shrink-0 text-blue-700"
                              size={20}
                            />
                          ) : (
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-slate-300 bg-white" />
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                            Severity: {symptom.severity_weight}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
                              Number(symptom.severity_weight || 0) >= 7
                                ? "bg-red-50 text-red-700 ring-red-100"
                                : Number(symptom.severity_weight || 0) >= 4
                                ? "bg-amber-50 text-amber-700 ring-amber-100"
                                : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            }`}
                          >
                            {Number(symptom.severity_weight || 0) >= 7
                              ? "High"
                              : Number(symptom.severity_weight || 0) >= 4
                              ? "Medium"
                              : "Low"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {triage && (
          <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-slate-200/70">
            <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
              <div className="relative min-h-[320px]">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"
                  alt="Smart queue result"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${
                      URGENCY_STYLES[triage.urgency] ||
                      "bg-white/15 text-white ring-white/20"
                    }`}
                  >
                    {triage.urgency || "Smart Queue Result"}
                  </span>

                  <h2 className="mt-4 text-3xl font-black">
                    Your queue details are ready
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Doctor is assigned automatically based on symptoms, availability
                    and current patient count.
                  </p>
                </div>
              </div>

              <div className="p-7 sm:p-8">
                <SectionHeader
                  title="Smart Queue Result"
                  desc="Your triage result, doctor assignment and queue token are generated from the submitted symptoms."
                  icon={AlertTriangle}
                  badge="Result Ready"
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <ResultCard
                    icon={HeartPulse}
                    label="Urgency"
                    value={triage.urgency}
                    gradient={
                      triage.urgency === "Critical" || triage.urgency === "High"
                        ? "from-red-500 to-orange-400"
                        : triage.urgency === "Medium"
                        ? "from-amber-500 to-orange-400"
                        : "from-emerald-500 to-teal-500"
                    }
                  />

                  <ResultCard
                    icon={Hospital}
                    label="Department"
                    value={triage.recommended_department}
                    gradient="from-violet-600 to-indigo-500"
                  />

                  <ResultCard
                    icon={Stethoscope}
                    label="Assigned Doctor"
                    value={triage.assigned_doctor || "Not assigned"}
                    gradient="from-emerald-500 to-teal-500"
                  />

                  <ResultCard
                    icon={Clock}
                    label="Wait Time"
                    value={`${triage.estimated_wait_minutes}m`}
                    gradient="from-amber-500 to-orange-400"
                  />

                  <ResultCard
                    icon={CalendarClock}
                    label="Queue Token"
                    value={triage.queue_token || `Q-${triage.queue_number || "-"}`}
                    gradient="from-blue-600 to-cyan-500"
                  />

                  <ResultCard
                    icon={BrainCircuit}
                    label="Prediction"
                    value="Completed"
                    gradient="from-rose-500 to-red-500"
                  />
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-2xl"
                  >
                    View Dashboard & Confirm
                    <ArrowRight size={18} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSymptoms([]);
                      setAge("");
                      setGender("Male");
                      setNotes("");
                      setResult(null);
                      setError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=80"
                alt="Backend connected symptom flow"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20 backdrop-blur">
                  Live Integration
                </span>

                <h3 className="mt-3 text-2xl font-black">
                  FastAPI + Supabase powered triage
                </h3>
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-8">
              <h2 className="text-3xl font-black text-slate-950">
                Complete symptom-to-queue flow
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-500">
                This page connects symptom selection to doctor assignment, urgency
                detection, predicted waiting time and digital queue token generation.
                It is one of the core working patient flows in your hospital platform.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100">
                  <FileText className="text-blue-700" />
                  <p className="mt-3 font-black text-slate-950">Symptoms</p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                  <Stethoscope className="text-emerald-700" />
                  <p className="mt-3 font-black text-slate-950">Doctor</p>
                </div>

                <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
                  <CalendarClock className="text-violet-700" />
                  <p className="mt-3 font-black text-slate-950">Queue Token</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}