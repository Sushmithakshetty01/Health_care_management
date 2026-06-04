import { useEffect, useState } from "react";
import { Bot, BarChart3, RefreshCcw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminVoiceAssistant() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    total_queries: 0,
    intent_breakdown: {},
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  async function loadVoiceAdminData() {
    if (!token) {
      setMessage("Please login as admin first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const logsResponse = await fetch(`${API_URL}/voice-assistant/admin/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const logsData = await logsResponse.json();

      if (!logsResponse.ok) {
        throw new Error(logsData.detail || "Could not load voice logs");
      }

      const summaryResponse = await fetch(`${API_URL}/voice-assistant/admin/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const summaryData = await summaryResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(summaryData.detail || "Could not load voice summary");
      }

      setLogs(logsData);
      setSummary(summaryData);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVoiceAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-orange-500 p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <Bot size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-100">
                Admin Panel
              </p>
              <h1 className="text-3xl font-bold">
                Voice Assistant Logs
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-orange-50">
            Monitor patient voice/text queries, detected intents and generated responses.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {message}
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total Queries</p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900">
              {summary.total_queries}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={20} className="text-orange-500" />
              <p className="text-sm font-semibold text-slate-500">
                Intent Breakdown
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(summary.intent_breakdown || {}).length === 0 ? (
                <p className="text-slate-500">No intent data yet.</p>
              ) : (
                Object.entries(summary.intent_breakdown).map(([intent, count]) => (
                  <span
                    key={intent}
                    className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700"
                  >
                    {intent}: {count}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              All Voice Assistant Logs
            </h2>

            <button
              onClick={loadVoiceAdminData}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No voice assistant logs found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-4 py-2">Patient</th>
                    <th className="px-4 py-2">Intent</th>
                    <th className="px-4 py-2">Query</th>
                    <th className="px-4 py-2">Response</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((item) => (
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
                        <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                          {item.intent}
                        </span>
                      </td>

                      <td className="max-w-xs px-4 py-4 text-slate-700">
                        {item.query_text}
                      </td>

                      <td className="max-w-md px-4 py-4 text-slate-700">
                        {item.response_text}
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