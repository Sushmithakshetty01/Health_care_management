import { useEffect, useState } from "react";
import { Activity, BarChart3, BrainCircuit, RefreshCcw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminDiseaseRisk() {
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState({
    total_predictions: 0,
    average_risk_score: 0,
    risk_level_breakdown: {},
    department_breakdown: {},
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  async function loadAdminRiskData() {
    if (!token) {
      setMessage("Please login as admin first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const predictionsResponse = await fetch(
        `${API_URL}/disease-risk/admin/predictions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const predictionsData = await predictionsResponse.json();

      if (!predictionsResponse.ok) {
        throw new Error(predictionsData.detail || "Could not load predictions");
      }

      const summaryResponse = await fetch(`${API_URL}/disease-risk/admin/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const summaryData = await summaryResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(summaryData.detail || "Could not load summary");
      }

      setPredictions(predictionsData);
      setSummary(summaryData);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminRiskData();
  }, []);

  function riskStyle(level) {
    if (level === "Critical") return "bg-red-100 text-red-700";
    if (level === "High") return "bg-orange-100 text-orange-700";
    if (level === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-700 p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <BrainCircuit size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                Admin Panel
              </p>
              <h1 className="text-3xl font-bold">
                Disease Risk Prediction Dashboard
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-blue-50">
            Monitor patient risk indications, suggested departments and risk levels.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {message}
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Predictions
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900">
              {summary.total_predictions}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Average Risk Score
            </p>
            <h2 className="mt-2 text-4xl font-bold text-blue-600">
              {summary.average_risk_score}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              <p className="text-sm font-semibold text-slate-500">
                Risk Breakdown
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.risk_level_breakdown || {}).map(
                ([level, count]) => (
                  <span
                    key={level}
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${riskStyle(
                      level
                    )}`}
                  >
                    {level}: {count}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-blue-600" size={22} />
              <h2 className="text-xl font-bold text-slate-900">
                All Disease Risk Predictions
              </h2>
            </div>

            <button
              onClick={loadAdminRiskData}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">Loading predictions...</p>
          ) : predictions.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No predictions found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-4 py-2">Patient</th>
                    <th className="px-4 py-2">Risk</th>
                    <th className="px-4 py-2">Score</th>
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2">Age</th>
                    <th className="px-4 py-2">Recommendation</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {predictions.map((item) => (
                    <tr key={item.id} className="bg-slate-50 text-sm">
                      <td className="rounded-l-2xl px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {item.app_users?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.app_users?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 font-semibold ${riskStyle(
                            item.risk_level
                          )}`}
                        >
                          {item.risk_level}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {item.risk_score}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {item.suggested_department}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {item.age}
                      </td>

                      <td className="max-w-md px-4 py-4 text-slate-700">
                        {item.recommendation}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4 text-slate-500">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}