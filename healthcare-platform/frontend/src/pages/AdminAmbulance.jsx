import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

function AdminAmbulance() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/ambulance/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const assignAmbulance = async (requestId) => {
    const ambulanceId = prompt("Enter Ambulance ID:");
    const driverName = prompt("Enter Driver Name:");

    if (!ambulanceId || !driverName) return;

    try {
      await axios.patch(`${API_BASE}/ambulance/${requestId}/assign`, {
        ambulance_id: ambulanceId,
        driver_name: driverName
      });
      alert("Ambulance Assigned!");
      fetchRequests();
    } catch (err) {
      alert("Failed to assign");
    }
  };

  const updateStatus = async (requestId, status) => {
    try {
      await axios.patch(`${API_BASE}/ambulance/${requestId}/status`, { status });
      alert(`Status updated to ${status}`);
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🚑 Ambulance Management</h1>

      <div className="grid gap-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-xl shadow border">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{req.patient_name}</h3>
                <p className="text-sm text-gray-600">{req.emergency_type}</p>
                <p>From: {req.pickup_location}</p>
                <p>To: {req.destination}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${req.status === 'requested' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {req.status}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {req.status === 'requested' && (
                <button onClick={() => assignAmbulance(req.id)} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Assign Ambulance
                </button>
              )}
              <button onClick={() => updateStatus(req.id, 'on_the_way')} className="bg-orange-500 text-white px-4 py-2 rounded">
                On The Way
              </button>
              <button onClick={() => updateStatus(req.id, 'arrived')} className="bg-green-600 text-white px-4 py-2 rounded">
                Arrived
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAmbulance;