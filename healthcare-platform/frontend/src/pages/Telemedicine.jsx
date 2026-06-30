import { useEffect, useState } from "react";
import { telemedicineApi } from "../api/client";
import {
  Calendar,
  FileText,
  Stethoscope,
  ClipboardList,
} from "lucide-react";


export default function Telemedicine() {
  const [selectedFile, setSelectedFile] = useState(null);

  
const [consultations, setConsultations] = useState([]);
const [prescriptions, setPrescriptions] = useState([]);
const [reports, setReports] = useState([]);

const [analytics, setAnalytics] = useState({
  consultations: 0,
  reports: 0,
  prescriptions: 0,
});

const [formData, setFormData] = useState({
  patient_name: "",
  department: "",
  doctor_name: "",
  appointment_date: "",
  appointment_time: "",
  reason: "",
});



const activities = [
  "Consultation Created",
  "Medical Report Uploaded",
  "Doctor Reviewed Report",
  "Prescription Generated",
];

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const appointments =
      await telemedicineApi.appointments();

    const analyticsData =
      await telemedicineApi.analytics();

    const prescriptionsData =
      await telemedicineApi.prescriptions();

    const reportsData =
  await telemedicineApi.reports();
  setReports(reportsData);

    setConsultations(appointments);
    setAnalytics(analyticsData);
    setPrescriptions(prescriptionsData);
  } catch (error) {
    console.error(error);
  }
};

const handleBookAppointment = async () => {
  try {
    await telemedicineApi.createAppointment(
      formData
    );

    alert("Consultation booked successfully");

    loadData();

    setFormData({
      patient_name: "",
      department: "",
      doctor_name: "",
      appointment_date: "",
      appointment_time: "",
      reason: "",
    });
  } catch (error) {
    console.error(error);
    alert("Failed to create appointment");
  }
};

const handleUploadReport = async () => {
  if (!selectedFile) {
    alert("Please select a file");
    return;
  }

  try {
    await telemedicineApi.createReport({
      appointment_id:
        consultations[0]?.id || null,
      report_name: selectedFile.name,
      report_url: selectedFile.name,
    });

    alert("Report uploaded");

    loadData();
  } catch (error) {
    console.error(error);
    alert("Upload failed");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-8 mb-6">
        <h1 className="text-4xl font-bold">
          Telemedicine & Remote Care
        </h1>

        <p className="mt-3 text-lg opacity-90">
          Book consultations, upload reports and receive
          digital prescriptions.
        </p>
      </section>

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-gray-500">Consultations</p>
          <h2 className="text-3xl font-bold">{analytics.consultations}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-gray-500">Reports Uploaded</p>
          <h2 className="text-3xl font-bold">{analytics.reports}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-gray-500">Prescriptions</p>
          <h2 className="text-3xl font-bold">{analytics.prescriptions}</h2>
        </div>

      </div>

      {/* Workflow */}
      <section className="bg-white rounded-2xl p-6 shadow mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Consultation Workflow
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <div className="p-4 rounded-xl bg-slate-100">
            1. Book Consultation
          </div>

          <div className="p-4 rounded-xl bg-slate-100">
            2. Upload Reports
          </div>

          <div className="p-4 rounded-xl bg-slate-100">
            3. Doctor Consultation
          </div>

          <div className="p-4 rounded-xl bg-slate-100">
            4. Receive Prescription
          </div>

        </div>
      </section>

      {/* Booking Form */}
      <section className="bg-white rounded-2xl p-6 shadow mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Book Consultation
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

         <input
  className="border rounded-lg p-3"
  placeholder="Patient Name"
  value={formData.patient_name}
  onChange={(e) =>
    setFormData({
      ...formData,
      patient_name: e.target.value,
    })
  }
/>

          <input
            className="border rounded-lg p-3"
            placeholder="Department"
            value={formData.department}
            onChange={(e) =>
              setFormData({
                ...formData,
                department: e.target.value,
              })
            }
          />

            <input
  className="border rounded-lg p-3"
  placeholder="Doctor Name"
  value={formData.doctor_name}
  onChange={(e) =>
    setFormData({
      ...formData,
      doctor_name: e.target.value,
    })
  }
/>

          <input
            type="date"
            className="border rounded-lg p-3"
            value={formData.appointment_date}
            onChange={(e) =>
              setFormData({
                ...formData,
                appointment_date: e.target.value,
              })
            }
          />

          <input
  type="time"
  className="border rounded-lg p-3"
  value={formData.appointment_time}
  onChange={(e) =>
    setFormData({
      ...formData,
      appointment_time: e.target.value,
    })
  }
/>

        </div>

        <textarea
          className="border rounded-lg p-3 w-full mt-4"
          rows={4}
          placeholder="Reason for consultation"
          value={formData.reason}
          onChange={(e) =>
            setFormData({
              ...formData,
              reason: e.target.value,
            })
          }
        />

        <button
  onClick={handleBookAppointment}
  className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl"
>
  Book Consultation
</button>

      </section>

      <section className="rounded-2xl border bg-white p-6">
  <h2 className="text-2xl font-semibold mb-6">
    Consultation History
  </h2>

  <div className="space-y-4">
    {consultations.map((item) => (
      <div
        key={item.id}
        className="rounded-xl border p-4"
      >
        <div className="flex justify-between">
          <h3 className="font-semibold">
            {item.id}
          </h3>

          <span className="text-blue-600">
            {item.status}
          </span>
        </div>

       <p>{item.doctor_name}</p>

        <p>{item.department}</p>

        <p>
          {item.appointment_date} • {item.appointment_time}
        </p>
      </div>
    ))}
  </div>
</section>

<section className="rounded-2xl border bg-white p-6">
  <h2 className="text-2xl font-semibold mb-6">
    Activity Timeline
  </h2>

  <div className="space-y-4">
    {activities.map((activity, index) => (
      <div
        key={index}
        className="flex items-center gap-4"
      >
        <div className="w-3 h-3 rounded-full bg-blue-500" />

        <p>{activity}</p>
      </div>
    ))}
  </div>
</section>


      {/* Upload Reports */}
      <section className="bg-white rounded-2xl p-6 shadow mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Medical Reports
        </h2>

       <div className="rounded-xl border-2 border-dashed p-8 text-center">
  <p className="mb-4">
    Upload PDF, JPG or PNG Reports
  </p>

  <input
    type="file"
    onChange={(e) =>
      setSelectedFile(e.target.files[0])
    }
  />

  <button
  onClick={handleUploadReport}
  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
>
  Upload Report
</button>

  {selectedFile && (
    <div className="mt-4 text-green-600">
      {selectedFile.name}
    </div>
  )}
</div>

        {selectedFile && (
          <p className="mt-3 text-green-600">
            {selectedFile.name}
          </p>
        )}

      </section>

<section className="rounded-2xl border bg-white p-6">
  <h2 className="text-2xl font-semibold mb-6">
    Uploaded Reports
  </h2>

  <div className="space-y-3">
    {reports.map((report) => (
      <div
        key={report.id}
        className="border rounded-lg p-3"
      >
        <p>{report.report_name}</p>
      </div>
    ))}
  </div>
</section>

      {/* Prescription */}
      <section className="rounded-2xl border bg-white p-6">
  <h2 className="text-2xl font-semibold mb-6">
    Digital Prescriptions
  </h2>

    <p>Prescription Count: {prescriptions.length}</p>

  <div className="grid md:grid-cols-2 gap-4">
   {prescriptions.length > 0 ? (
  prescriptions.map((item) => (
    <div
      key={item.id}
      className="rounded-xl border p-4"
    >
      <h3 className="font-semibold text-lg">
        {item.medicine}
      </h3>

      <p>Dosage: {item.dosage}</p>

      <p>Duration: {item.duration}</p>

<p className="text-gray-500 mt-2">
  {item.instructions}
</p>

    </div>
  ))
) : (
  <p>No prescriptions available</p>
)}
  </div>
</section>

    </div>
  );
}