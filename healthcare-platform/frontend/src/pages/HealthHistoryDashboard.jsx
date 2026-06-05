import { useEffect, useState } from "react";
import {
  ClipboardPlus,
  FileText,
  HeartPulse,
  Pill,
  Trash2,
  RefreshCcw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function HealthHistoryDashboard() {
  const [recordType, setRecordType] = useState("visit");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [department, setDepartment] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [prescription, setPrescription] = useState("");
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  async function loadRecords() {
    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/health-history/my-records`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load health records");
      }

      setRecords(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createRecord(event) {
    event.preventDefault();

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setMessage("Title and description are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/health-history/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          record_type: recordType,
          title,
          description,
          doctor_name: doctorName || null,
          department: department || null,
          visit_date: visitDate || null,
          prescription: prescription || null,
          allergies: allergies || null,
          chronic_conditions: chronicConditions || null,
          report_notes: reportNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not create health record");
      }

      setMessage("Health history record added successfully.");
      setTitle("");
      setDescription("");
      setDoctorName("");
      setDepartment("");
      setVisitDate("");
      setPrescription("");
      setAllergies("");
      setChronicConditions("");
      setReportNotes("");

      await loadRecords();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(recordId) {
    try {
      const response = await fetch(`${API_URL}/health-history/records/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not delete record");
      }

      setMessage("Health record deleted successfully.");
      await loadRecords();
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function recordBadge(type) {
    if (type === "visit") return "bg-blue-100 text-blue-700";
    if (type === "prescription") return "bg-emerald-100 text-emerald-700";
    if (type === "allergy") return "bg-red-100 text-red-700";
    if (type === "report") return "bg-violet-100 text-violet-700";
    if (type === "chronic_condition") return "bg-orange-100 text-orange-700";
    return "bg-slate-100 text-slate-700";
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-rose-500 to-red-400 p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <ClipboardPlus size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-100">
                Unified Record
              </p>
              <h1 className="text-3xl font-bold">Health History Dashboard</h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-rose-50">
            Store previous visits, prescriptions, allergies, reports and chronic condition notes.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={createRecord}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <FileText className="text-rose-500" size={22} />
              <h2 className="text-xl font-bold text-slate-900">
                Add Health Record
              </h2>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Record Type
            </label>
            <select
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              value={recordType}
              onChange={(event) => setRecordType(event.target.value)}
            >
              <option value="visit">Visit</option>
              <option value="prescription">Prescription</option>
              <option value="allergy">Allergy</option>
              <option value="report">Report</option>
              <option value="chronic_condition">Chronic Condition</option>
              <option value="general">General</option>
            </select>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Fever consultation"
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              rows="3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the visit, report, allergy or condition..."
            />

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Doctor Name
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
                  value={doctorName}
                  onChange={(event) => setDoctorName(event.target.value)}
                  placeholder="Dr. Rao"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="General Medicine"
                />
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Visit Date
            </label>
            <input
              type="date"
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Prescription
            </label>
            <textarea
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              rows="2"
              value={prescription}
              onChange={(event) => setPrescription(event.target.value)}
              placeholder="Medicine details..."
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Allergies
            </label>
            <textarea
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              rows="2"
              value={allergies}
              onChange={(event) => setAllergies(event.target.value)}
              placeholder="Example: Penicillin allergy"
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Chronic Conditions
            </label>
            <textarea
              className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              rows="2"
              value={chronicConditions}
              onChange={(event) => setChronicConditions(event.target.value)}
              placeholder="Example: Diabetes, asthma..."
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Report Notes
            </label>
            <textarea
              className="mb-5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-500"
              rows="2"
              value={reportNotes}
              onChange={(event) => setReportNotes(event.target.value)}
              placeholder="Lab/report notes..."
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white hover:bg-rose-600 disabled:bg-rose-300"
            >
              <Pill size={18} />
              {loading ? "Saving..." : "Save Health Record"}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartPulse className="text-rose-500" size={22} />
                <h2 className="text-xl font-bold text-slate-900">
                  My Health History
                </h2>
              </div>

              <button
                onClick={loadRecords}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>

            {records.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                No health history records yet.
              </p>
            ) : (
              <div className="max-h-[900px] space-y-4 overflow-y-auto pr-2">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${recordBadge(
                            record.record_type
                          )}`}
                        >
                          {record.record_type}
                        </span>

                        <h3 className="mt-3 text-lg font-bold text-slate-900">
                          {record.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="rounded-xl bg-white p-2 text-red-500 shadow-sm hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <p className="text-sm leading-6 text-slate-700">
                      {record.description}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      {record.doctor_name && <p>Doctor: {record.doctor_name}</p>}
                      {record.department && <p>Department: {record.department}</p>}
                      {record.visit_date && <p>Visit Date: {record.visit_date}</p>}
                      {record.prescription && <p>Prescription: {record.prescription}</p>}
                      {record.allergies && <p>Allergies: {record.allergies}</p>}
                      {record.chronic_conditions && (
                        <p>Chronic: {record.chronic_conditions}</p>
                      )}
                    </div>

                    {record.report_notes && (
                      <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-600">
                        Report Notes: {record.report_notes}
                      </p>
                    )}

                    <p className="mt-4 text-xs text-slate-400">
                      Added on{" "}
                      {record.created_at
                        ? new Date(record.created_at).toLocaleString()
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
  );
}