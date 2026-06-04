import { useEffect, useState } from "react";
import { Activity, AlertTriangle, BrainCircuit, ClipboardList, Send } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function DiseaseRiskPrediction() {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState("male");
  const [notes, setNotes] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  async function loadSymptoms() {
    try {
      const response = await fetch(`${API_URL}/symptoms`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load symptoms");
      }

      setSymptoms(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadHistory() {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/disease-risk/my-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load risk history");
      }

      setHistory(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function toggleSymptom(symptomId) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  }

  async function predictRisk(event) {
    event.preventDefault();

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (selectedSymptoms.length === 0) {
      setMessage("Please select at least one symptom.");
      return;
    }

    setLoading(true);
    setMessage("");
    setPrediction(null);

    try {
      const response = await fetch(`${API_URL}/disease-risk/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptom_ids: selectedSymptoms,
          age: Number(age),
          gender,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Risk prediction failed");
      }

      setPrediction(data);
      setMessage("Disease risk prediction generated successfully.");
      setSelectedSymptoms([]);
      setNotes("");
      await loadHistory();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSymptoms();
    loadHistory();
  }, []);

  function riskStyle(level) {
    if (level === "Critical") return "bg-red-50 text-red-700 border-red-200";
    if (level === "High") return "bg-orange-50 text-orange-700 border-orange-200";
    if (level === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <BrainCircuit size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                Risk Indicator
              </p>
              <h1 className="text-3xl font-bold">Disease Risk Prediction</h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-blue-50">
            Get an early risk indication based on selected symptoms, age and notes.
            This is not a final diagnosis.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form
            onSubmit={predictRisk}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <Activity className="text-blue-600" size={22} />
              <h2 className="text-xl font-bold text-slate-900">
                Enter Patient Details
              </h2>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Gender
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Select Symptoms
            </label>

            <div className="mb-5 max-h-[280px] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {symptoms.length === 0 ? (
                <p className="text-sm text-slate-500">No symptoms found.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {symptoms.map((symptom) => (
                    <label
                      key={symptom.id}
                      className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm transition ${
                        selectedSymptoms.includes(symptom.id)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedSymptoms.includes(symptom.id)}
                        onChange={() => toggleSymptom(symptom.id)}
                      />
                      <span className="font-semibold">{symptom.name}</span>
                      <p className="ml-6 text-xs text-slate-400">
                        {symptom.department} • Severity {symptom.severity_weight}
                      </p>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Additional Notes
            </label>
            <textarea
              className="mb-5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              rows="3"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: fever, weakness, chest pain, breathing difficulty..."
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Send size={18} />
              {loading ? "Predicting..." : "Predict Risk"}
            </button>
          </form>

          <div className="space-y-6">
            {prediction && (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle className="text-orange-500" size={22} />
                  <h2 className="text-xl font-bold text-slate-900">
                    Prediction Result
                  </h2>
                </div>

                <div
                  className={`mb-4 rounded-2xl border p-5 ${riskStyle(
                    prediction.risk_level
                  )}`}
                >
                  <p className="text-sm font-semibold">Risk Level</p>
                  <h3 className="mt-1 text-3xl font-bold">
                    {prediction.risk_level}
                  </h3>
                  <p className="mt-2 text-sm">
                    Risk Score: {prediction.risk_score}
                  </p>
                  <p className="text-sm">
                    Suggested Department: {prediction.suggested_department}
                  </p>
                </div>

                <p className="mb-3 text-sm leading-7 text-slate-700">
                  {prediction.explanation}
                </p>

                <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  {prediction.recommendation}
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="text-blue-600" size={22} />
                  <h2 className="text-xl font-bold text-slate-900">
                    My Risk History
                  </h2>
                </div>

                <button
                  onClick={loadHistory}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>

              {history.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                  No risk predictions yet.
                </p>
              ) : (
                <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyle(
                            item.risk_level
                          )}`}
                        >
                          {item.risk_level}
                        </span>
                        <span className="text-xs text-slate-400">
                          Score: {item.risk_score}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        Department: {item.suggested_department}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.recommendation}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}