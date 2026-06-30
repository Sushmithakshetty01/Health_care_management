import {
    getMedicines,
    getAlerts,
    getPrescriptions,
    addMedicine,
    updateMedicine,
    deleteMedicine, updatePrescriptionStatus

} from "../api/client";

import React, { useState, useEffect } from "react";



export default function AdminPharmacyDashboard() {

const [medicines, setMedicines] = useState([]);
const [alerts, setAlerts] = useState([]);
const [prescriptions, setPrescriptions] = useState([]);
const [selectedPrescription, setSelectedPrescription] = useState(null);
const [showDetails, setShowDetails] = useState(false);

const pendingCount = prescriptions.filter(
    p => p.status === "pending"
).length;

const processingCount = prescriptions.filter(
    p => p.status === "processing"
).length;

const readyCount = prescriptions.filter(
    p => p.status === "ready"
).length;

const lowStockCount = alerts.length;

    useEffect(() => {

    const fetchData = async () => {

        try {

            const medicineData = await getMedicines();
            const alertData = await getAlerts();
            const prescriptionData = await getPrescriptions();

            console.log("Medicines:", medicineData);
            console.log("Alerts:", alertData);
            console.log("Prescriptions:", prescriptionData);

            setMedicines(medicineData);
            setAlerts(alertData);
            setPrescriptions(prescriptionData);

        } catch (err) {
            console.error(err);
        }

    };

    fetchData();

}, []);


const changeStatus = async (prescription, newStatus) => {
    try {

        await updatePrescriptionStatus(
            prescription.id,
            newStatus
        );

        const updated = await getPrescriptions();

        setPrescriptions(updated);

       const latest = updated.find(
    item => item.id === prescription.id
);

setSelectedPrescription(latest);

    } catch (err) {
        console.error(err);
    }

};

    return (
        <div className="p-8">

            <h1 className="text-4xl font-bold mb-8">
                Pharmacy Administration
            </h1>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

    <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-gray-500 font-medium">
            Pending Orders
        </h2>

        <p className="text-4xl font-bold mt-3 text-orange-500">
            {pendingCount}
        </p>
    </div>

    <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-gray-500 font-medium">
            Processing
        </h2>

        <p className="text-4xl font-bold mt-3 text-blue-500">
            {processingCount}
        </p>
    </div>

    <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-gray-500 font-medium">
            Ready for Pickup
        </h2>

        <p className="text-4xl font-bold mt-3 text-green-500">
            {readyCount}
        </p>
    </div>

    <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-gray-500 font-medium">
            Low Stock Alerts
        </h2>

        <p className="text-4xl font-bold mt-3 text-red-500">
            {lowStockCount}
        </p>
    </div>

</div>

        

            {/* Incoming Prescriptions */}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-2xl font-bold mb-6">
                    Incoming Prescriptions
                </h2>

                <div className="overflow-x-auto">
<table className="min-w-full border">

    <thead className="bg-gray-100">

        <tr>
            <th className="border px-4 py-2">Prescription</th>
            <th className="border px-4 py-2">Patient</th>
            <th className="border px-4 py-2">Doctor</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Action</th>
        </tr>

    </thead>

    <tbody>

        {prescriptions.length === 0 ? (

            <tr>
                <td
                    colSpan="5"
                    className="text-center py-6"
                >
                    No Incoming Prescriptions
                </td>
            </tr>

        ) : (

           prescriptions
    .filter(p => p.status !== "dispensed")
    .map((p) => (

                <tr key={p.id}>

                    <td className="border px-4 py-2">
                        RX-{p.id}
                    </td>

                    <td className="border px-4 py-2">
                        Patient {p.patient_id}
                    </td>

                    <td className="border px-4 py-2">
                        Doctor {p.doctor_id}
                    </td>

                    <td className="border px-4 py-2 capitalize">
                        {p.status}
                    </td>

                    <td className="border px-4 py-2">
    <button
       onClick={() => {
    setSelectedPrescription(p);
    setShowDetails(true);
}}
        className="bg-blue-500 text-white px-3 py-1 rounded text-xs mr-2"
    >
        View
    </button>

    {p.status === "pending" && (
        <button
            onClick={() => changeStatus(p, "processing")}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
        >
            Start
        </button>
    )}

    {p.status === "processing" && (
        <button
            onClick={() => changeStatus(p, "ready")}
            className="bg-green-500 text-white px-3 py-1 rounded text-xs"
        >
            Ready
        </button>
    )}

    {p.status === "ready" && (
        <button
            onClick={() => changeStatus(p, "dispensed")}
            className="bg-gray-700 text-white px-3 py-1 rounded text-xs"
        >
            Dispense
        </button>
    )}
</td>

                </tr>

            ))

        )}

    </tbody>

</table>
</div>
                

            </div>

           

{selectedPrescription && (

<div className="bg-white rounded-xl shadow p-6 mt-6">

<h2 className="text-2xl font-bold mb-4">
Prescription Details
</h2>

<div className="grid grid-cols-2 gap-4">

<p>
<strong>Prescription:</strong> RX-{selectedPrescription.id}
</p>

<p>
<strong>Patient:</strong> Patient {selectedPrescription.patient_id}
</p>

<p>
<strong>Doctor:</strong> Doctor {selectedPrescription.doctor_id}
</p>

<p>
<strong>Status:</strong>
<span className="capitalize ml-2">
{selectedPrescription.status}
</span>
</p>

</div>

</div>

)}

        </div>
    );
}