import { useEffect, useState } from "react";
import { ClipboardPlus, RefreshCcw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminHealthHistory() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    total_records: 0,
    record_type_breakdown: {},
    department_breakdown: {},
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  async function loadAdminHealthData() {
    if (!token) {
      setMessage("Please login as admin first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const recordsResponse = await fetch(`${API_URL}/health-history/admin/records`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const recordsData = await recordsResponse.json();

      if (!recordsResponse.ok) {
        throw new Error(recordsData.detail || "Could not load health records");
      }

      const summaryResponse = await fetch(`${API_URL}/health-history/admin/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const summaryData = await summaryResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(summaryData.detail || "Could not load summary");
      }

      setRecords(recordsData);
      setSummary(summaryData);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminHealthData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-rose-500 p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <ClipboardPlus size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-100">
                Admin Panel
              </p>
              <h1 className="text-3xl font-bold">
                Health History Records
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-rose-50">
            View patient visits, prescriptions, allergies, reports and chronic condition records.
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
              Total Records
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900">
              {summary.total_records}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-500">
              Record Types
            </p>

            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.record_type_breakdown || {}).map(
                ([type, count]) => (
                  <span
                    key={type}
                    className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700"
                  >
                    {type}: {count}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-500">
              Departments
            </p>

            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.department_breakdown || {}).map(
                ([department, count]) => (
                  <span
                    key={department}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
                  >
                    {department}: {count}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              All Patient Health Records
            </h2>

            <button
              onClick={loadAdminHealthData}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">Loading records...</p>
          ) : records.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No health history records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-4 py-2">Patient</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Doctor</th>
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2">Visit Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="bg-slate-50 text-sm">
                      <td className="rounded-l-2xl px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {record.app_users?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.app_users?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-700">
                          {record.record_type}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {record.title}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {record.doctor_name || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {record.department || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {record.visit_date || "-"}
                      </td>

                      <td className="max-w-md px-4 py-4 text-slate-700">
                        {record.description}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4 text-slate-500">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleString()
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