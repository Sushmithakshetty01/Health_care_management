import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [summary, setSummary] = useState({
    total_feedback: 0,
    average_rating: 0,
    average_satisfaction_score: 0,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  async function loadAdminFeedback() {
    if (!token) {
      setMessage("Please login as admin first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const feedbackResponse = await fetch(`${API_URL}/feedback/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const feedbackData = await feedbackResponse.json();

      if (!feedbackResponse.ok) {
        throw new Error(feedbackData.detail || "Could not load feedback");
      }

      const summaryResponse = await fetch(`${API_URL}/feedback/admin/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const summaryData = await summaryResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(summaryData.detail || "Could not load feedback summary");
      }

      setFeedbackList(feedbackData);
      setSummary(summaryData);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-700 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold">Patient Feedback Dashboard</h1>
          <p className="mt-3 max-w-2xl text-blue-50">
            View patient feedback, satisfaction scores and service quality insights.
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
              Total Feedback
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900">
              {summary.total_feedback}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Average Rating
            </p>
            <h2 className="mt-2 text-4xl font-bold text-blue-600">
              {summary.average_rating}/5
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Average Satisfaction
            </p>
            <h2 className="mt-2 text-4xl font-bold text-cyan-600">
              {summary.average_satisfaction_score}/10
            </h2>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              All Patient Feedback
            </h2>

            <button
              onClick={loadAdminFeedback}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">Loading feedback...</p>
          ) : feedbackList.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No feedback found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-4 py-2">Patient</th>
                    <th className="px-4 py-2">Rating</th>
                    <th className="px-4 py-2">Satisfaction</th>
                    <th className="px-4 py-2">Waiting Experience</th>
                    <th className="px-4 py-2">Doctor Feedback</th>
                    <th className="px-4 py-2">Comments</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {feedbackList.map((item) => (
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
                        <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                          {item.rating}/5
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {item.satisfaction_score || "-"} / 10
                      </td>

                      <td className="max-w-xs px-4 py-4 text-slate-700">
                        {item.waiting_experience}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-slate-700">
                        {item.doctor_feedback || "-"}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-slate-700">
                        {item.comments || "-"}
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