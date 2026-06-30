import { useEffect, useState } from "react";
import { telemedicineApi } from "../api/client";

export default function AdminTelemedicine() {
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
    const appointmentsData = await telemedicineApi.appointments();
const reportsData = await telemedicineApi.reports();
const prescriptionsData = await telemedicineApi.prescriptions();

      setAppointments(appointmentsData || []);
setReports(reportsData || []);
setPrescriptions(prescriptionsData || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteReport(reportId) {
  const confirmDelete = window.confirm(
    "Delete this report?"
  );

  if (!confirmDelete) return;

  await telemedicineApi.deleteReport(reportId);

  loadData();
}

async function handleDeletePrescription(id) {
  const confirmDelete = window.confirm(
    "Delete this prescription?"
  );

  if (!confirmDelete) return;

  await telemedicineApi.deletePrescription(id);

  loadData();
}

async function updateAppointmentStatus(id, status) {

    await telemedicineApi.updateAppointment(id, status);

    loadData();

}

  const pendingConsultations =
  appointments.filter(
    a => a.status?.toLowerCase() === "scheduled"
  ).length;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        Admin Telemedicine Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-xl shadow">
          <h3>Total Consultations</h3>
          <p className="text-3xl font-bold">
            {appointments.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3>Total Reports</h3>
          <p className="text-3xl font-bold">
            {reports.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3>Total Prescriptions</h3>
          <p className="text-3xl font-bold">
            {prescriptions.length}
          </p>
        </div>

      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Consultation Management
        </h2>

        <table className="w-full">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((item) => (
              <tr key={item.id}>
                <td>{item.patient_name}</td>
                <td>{item.doctor_name}</td>
                <td>{item.department}</td>
                <td>{item.appointment_date}</td>
                <td>
  <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">
    {item.status}
  </span>
</td>

<td className="space-x-2">

   <button
    onClick={() => {
        setSelectedAppointment(item);
        setShowModal(true);
    }}
    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
>
    View
</button>

    {item.status === "scheduled" && (
        <>
            <button
                onClick={() =>
                    updateAppointmentStatus(item.id, "completed")
                }
                className="bg-green-600 text-white px-3 py-1 rounded"
            >
                Complete
            </button>

            <button
                onClick={() =>
                    updateAppointmentStatus(item.id, "cancelled")
                }
                className="bg-red-600 text-white px-3 py-1 rounded"
            >
                Cancel
            </button>
        </>
    )}

</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Reports Management
        </h2>

        {reports.map((report) => (
          <div
            key={report.id}
            className="border p-3 rounded mb-2"
          >
            <div className="flex justify-between items-center">
  <span>{report.report_name}</span>

  <button
    className="bg-green-500 text-white px-3 py-1 rounded"
  >
    View
  </button>

<button
  onClick={() => handleDeleteReport(report.id)}
  className="bg-red-500 text-white px-3 py-1 rounded ml-2"
>
 Delete
</button>

</div>

          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Prescription Management
        </h2>

        {prescriptions.map((item) => (
          <div
            key={item.id}
            className="border p-3 rounded mb-2"
          >
            <p><strong>{item.medicine}</strong></p>
            <p>
  <strong>Dosage:</strong> {item.dosage}
</p>

<p>
  <strong>Duration:</strong> {item.duration}
</p>

<p>
  <strong>Instructions:</strong>{" "}
  {item.instructions}
</p>

<button
  onClick={() => handleDeletePrescription(item.id)}
  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
>
  Delete Prescription
</button>

          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
  <h3>Pending Consultations</h3>
  <p className="text-3xl font-bold">
    {pendingConsultations}
  </p>
</div>

{showModal && selectedAppointment && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

        <div className="bg-white rounded-xl shadow-xl p-6 w-[500px]">

            <h2 className="text-2xl font-bold mb-5">
                Consultation Details
            </h2>

            <div className="space-y-3">

                <p>
                    <strong>Patient:</strong> {selectedAppointment.patient_name}
                </p>

                <p>
                    <strong>Doctor:</strong> {selectedAppointment.doctor_name}
                </p>

                <p>
                    <strong>Department:</strong> {selectedAppointment.department}
                </p>

                <p>
                    <strong>Date:</strong> {selectedAppointment.appointment_date}
                </p>

                <p>
                    <strong>Status:</strong> {selectedAppointment.status}
                </p>

            </div>

            <div className="mt-6 flex justify-end">

                <button
                    onClick={() => setShowModal(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded"
                >
                    Close
                </button>

            </div>

        </div>

    </div>
)}

    </div>
  );
}