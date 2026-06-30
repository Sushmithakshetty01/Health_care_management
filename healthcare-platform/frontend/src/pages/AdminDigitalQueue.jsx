import { useEffect, useState } from "react";
import { digitalTokenApi } from "../api/client";

export default function AdminDigitalQueue() {
  const [tokens, setTokens] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const tokenData = await digitalTokenApi.listTokens();
      const analyticsData = await digitalTokenApi.analytics();

      setTokens(tokenData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to load admin queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (tokenId, status) => {
  try {
    await digitalTokenApi.updateTokenStatus(tokenId, status);

    await loadDashboard();

  } catch (err) {
    console.error(err);
  }
};

const callNext = async (departmentId) => {
  try {
    await digitalTokenApi.callNext(departmentId);

    await loadDashboard();

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Digital Queue Management
        </h1>

        <p className="text-gray-600 mt-2">
          Manage hospital queue, call patients and monitor live status.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center">
          Loading Queue...
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-gray-500">Waiting</p>

              <h2 className="text-3xl font-bold text-blue-600">
                {analytics?.active_totals?.waiting || 0}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-gray-500">Checked In</p>

              <h2 className="text-3xl font-bold text-green-600">
                {analytics?.active_totals?.checked_in || 0}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-gray-500">Called</p>

              <h2 className="text-3xl font-bold text-yellow-600">
                {analytics?.active_totals?.called || 0}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-gray-500">Completed</p>

              <h2 className="text-3xl font-bold text-purple-600">
                {analytics?.active_totals?.completed || 0}
              </h2>
            </div>

          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              Live Queue
            </h2>

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">
                    Token
                  </th>

                  <th className="text-left">
                    Patient
                  </th>

                  <th className="text-left">
                    Department
                  </th>

                  <th className="text-left">
                    Status
                  </th>

                  <th className="text-left">
                    Position
                  </th>

                <th className="text-left">
Actions
</th>

                </tr>

              </thead>

              <tbody>

                {tokens.map((token) => (

                  <tr
                    key={token.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="py-4 font-bold">
                      {token.token_number}
                    </td>

                    <td>
                      {token.patient_name}
                    </td>

                    <td>
                      {token.department?.name}
                    </td>

                    <td>
                      {token.status}
                    </td>

                    <td>
                      {token.position}
                    </td>

                    <td>

<div className="flex gap-2">

{token.status === "waiting" && (

<>
<button
className="bg-green-600 text-white px-3 py-1 rounded"
onClick={() =>
updateStatus(token.id, "checked_in")
}
>
Check In
</button>

<button
className="bg-blue-600 text-white px-3 py-1 rounded"
onClick={() =>
callNext(token.department_id)
}
>
Call
</button>
</>

)}

{token.status === "checked_in" && (

<>
<button
className="bg-blue-600 text-white px-3 py-1 rounded"
onClick={() =>
callNext(token.department_id)
}
>
Call
</button>

<button
className="bg-purple-600 text-white px-3 py-1 rounded"
onClick={() =>
updateStatus(token.id, "completed")
}
>
Complete
</button>
</>

)}

{token.status === "called" && (

<button
className="bg-purple-600 text-white px-3 py-1 rounded"
onClick={() =>
updateStatus(token.id, "completed")
}
>
Complete
</button>

)}

</div>

</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </>
      )}

    </div>
  );
}