import { useEffect, useState } from "react";
import {
    getMedicines,
    getAlerts,
    getPrescriptions
} from "../api/client";

export default function PharmacyDashboard() {

    const [medicines, setMedicines] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [sent, setSent] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    

    useEffect(() => {
        fetchData();
    }, []);

    const latestPrescription =
    prescriptions.length > 0
        ? prescriptions[prescriptions.length - 1]
        : null;

    const currentStatus = latestPrescription?.status || "pending";

    const fetchData = async () => {
        try {

            const meds = await getMedicines();
            const alertData = await getAlerts();
            console.log(alertData);
            const prescriptionData = await getPrescriptions();

            setMedicines(meds);
            setAlerts(alertData);
            setPrescriptions(prescriptionData);

        } catch (err) {
    console.error("Dashboard Error:", err);
}
    };

    return (

        <div className="p-8">

            <h1 className="text-3xl font-bold mb-8">
                Pharmacy Dashboard
            </h1>
        
   
           <div className="bg-white rounded-xl shadow-md p-6 mb-6 border">

  <div className="flex justify-between items-center">

    <div>
      <h2 className="text-xl font-semibold">
        My Prescription
      </h2>

      <p className="text-gray-600 mt-2">
        <strong> Prescription ID:</strong> {latestPrescription ? `RX-${latestPrescription.id}` : "-"}
      </p>

      <p className="text-gray-600">
        <strong>Doctor:</strong> {latestPrescription
    ? `Doctor #${latestPrescription.doctor_id}`
    : "-"}
      </p>

      <p className="text-gray-600">
        <strong>Date:</strong> {latestPrescription
    ? latestPrescription.created_at.substring(0,10)
    : "-"}
      </p>

      <p className="text-gray-600">
        <strong>Patient:</strong> {latestPrescription
    ? latestPrescription.patient_name
    : "-"}
      </p>
    </div>

  {
latestPrescription?.status === "pending" ? (

<button className="bg-blue-600 text-white px-5 py-2 rounded">
    Send Prescription
</button>

) : (

<button className="bg-green-600 text-white px-5 py-2 rounded">
    {latestPrescription?.status}
</button>

)}

  </div>

  <div className="bg-white rounded-xl shadow p-6 mt-6">

    <h2 className="text-2xl font-bold mb-4">
        My Prescribed Medicines
    </h2>

    <table className="w-full border">

        <thead className="bg-gray-100">

            <tr>

                <th className="border px-4 py-2">
                    Medicine
                </th>

                <th className="border px-4 py-2">
                    Prescribed Quantity
                </th>

                <th className="border px-4 py-2">
                    Availability
                </th>

            </tr>

        </thead>

        <tbody>

        {medicines.map((medicine)=>(

            <tr key={medicine.id}>

                <td className="border px-4 py-2">
                    {medicine.medicine_name}
                </td>

                <td className="border px-4 py-2">
                    5
                </td>

                <td className="border px-4 py-2">

                    {medicine.stock_quantity>10 ? (

                        <span className="text-green-600 font-semibold">
                            Available
                        </span>

                    ) : (

                        <span className="text-red-600 font-semibold">
                            Low Stock
                        </span>

                    )}

                </td>

            </tr>

        ))}

        </tbody>

    </table>

</div>

</div>


<div className="bg-white rounded-xl shadow-md p-6 mt-6 border">

  <h2 className="text-xl font-semibold mb-5">
    Prescription Progress
  </h2>

  <div className="space-y-4">

   <div className="flex items-center justify-between mt-6">

  <div className="text-center">
    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto">
      ✓
    </div>
    <p className="mt-2 text-sm">Created</p>
  </div>

  <div className="flex-1 h-1 bg-green-500 mx-2"></div>

  <div className="text-center">
    <div
      className={`w-10 h-10 rounded-full text-white flex items-center justify-center mx-auto ${
        sent ? "bg-green-500" : "bg-gray-400"
      }`}
    >
      {sent ? "✓" : "2"}
    </div>
    <p className="mt-2 text-sm">
      {sent ? "Sent" : "Waiting"}
    </p>
  </div>

  <div className="flex-1 h-1 bg-gray-300 mx-2"></div>

  <div className="text-center">
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
      3
    </div>
    <p className="mt-2 text-sm">Processing</p>
  </div>

  <div className="flex-1 h-1 bg-gray-300 mx-2"></div>

  <div className="text-center">
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
      4
    </div>
    <p className="mt-2 text-sm">Ready</p>
  </div>

  <div className="flex-1 h-1 bg-gray-300 mx-2"></div>

  <div className="text-center">
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
      5
    </div>
    <p className="mt-2 text-sm">Dispensed</p>
  </div>

</div>

</div>

</div>

<div className="bg-white rounded-xl shadow p-6 mt-6">

    <h2 className="text-2xl font-bold mb-4">
        Prescription History
    </h2>

    <table className="w-full border">

        <thead className="bg-gray-100">

            <tr>

                <th className="border px-4 py-2">
                    Prescription ID
                </th>

                <th className="border px-4 py-2">
                    Date
                </th>

                <th className="border px-4 py-2">
                    Doctor
                </th>

                <th className="border px-4 py-2">
                    Status
                </th>

                <th className="border px-4 py-2">
                    View
                </th>

            </tr>

        </thead>

       <tbody>

{prescriptions.map((p)=>(

<tr key={p.id}>

<td className="border px-4 py-2">
    RX-{p.id}
</td>

<td className="border px-4 py-2">
    {p.created_at.substring(0,10)}
</td>

<td className="border px-4 py-2">
    Doctor #{p.doctor_id}
</td>

<td className="border px-4 py-2 capitalize">
    {p.status}
</td>

<td className="border px-4 py-2">

<button
    onClick={() => {

setSelectedPrescription(p);

setShowHistory(true);

}}
    className="bg-blue-600 text-white px-3 py-1 rounded"
>
    View
</button>

</td>

</tr>

))}

</tbody>

    </table>

</div>

<div className="bg-white rounded-xl shadow p-6 mt-6">

<h2 className="text-2xl font-bold mb-4">

Notifications

</h2>

{
currentStatus==="pending" && (

<div className="bg-blue-100 border-l-4 border-blue-600 p-4">

Prescription created successfully.

</div>

)
}

{
currentStatus==="processing" && (

<div className="bg-yellow-100 border-l-4 border-yellow-600 p-4">

Your medicines are being prepared.

</div>

)
}

{
currentStatus==="ready" && (

<div className="bg-green-100 border-l-4 border-green-600 p-4">

Medicines are ready for pickup.

</div>

)
}

{
currentStatus==="dispensed" && (

<div className="bg-green-100 border-l-4 border-green-600 p-4">

Medicines have been dispensed successfully.

</div>

)
}

</div>

{
showHistory && (

<div className="fixed inset-0 bg-black/40 flex justify-center items-center">

    <div className="bg-white rounded-xl p-6 w-[500px]">

        <h2 className="text-2xl font-bold mb-4">
            Prescription Details
        </h2>

        <p><b>Prescription ID:</b> RX-1001</p>
        <p><b>Doctor:</b> Dr. John</p>
        <p><b>Date:</b> 27-06-2026</p>

        <hr className="my-4"/>

        <ul className="list-disc ml-6">

            <li>Paracetamol × 5</li>
            <li>Crocin × 5</li>

        </ul>

        <button

            onClick={()=>setShowHistory(false)}

            className="mt-5 bg-blue-600 text-white px-5 py-2 rounded"

        >

            Close

        </button>

    </div>

</div>

)}

        </div>

    );
}