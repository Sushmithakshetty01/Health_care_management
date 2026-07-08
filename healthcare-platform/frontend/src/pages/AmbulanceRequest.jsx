import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

function AmbulanceRequest() {
  const [form, setForm] = useState({
    pickup_location: '',
    destination: '',
    emergency_type: 'Medical',
    patient_name: '',
    contact_number: '',
    notes: ''
  });

  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/ambulance/request`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(res.data);
      alert("Ambulance requested successfully!");
    } catch (err) {
      alert("Error requesting ambulance");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🚑 Request Ambulance</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Pickup Location" 
          value={form.pickup_location} 
          onChange={(e) => setForm({...form, pickup_location: e.target.value})}
          className="w-full p-3 border rounded" required />

        <input type="text" placeholder="Destination / Hospital" 
          value={form.destination} 
          onChange={(e) => setForm({...form, destination: e.target.value})}
          className="w-full p-3 border rounded" required />

        <select value={form.emergency_type} 
          onChange={(e) => setForm({...form, emergency_type: e.target.value})}
          className="w-full p-3 border rounded">
          <option>Medical</option>
          <option>Accident</option>
          <option>Cardiac</option>
          <option>Other</option>
        </select>

        <input type="text" placeholder="Patient Name" 
          value={form.patient_name} 
          onChange={(e) => setForm({...form, patient_name: e.target.value})}
          className="w-full p-3 border rounded" required />

        <input type="tel" placeholder="Contact Number" 
          value={form.contact_number} 
          onChange={(e) => setForm({...form, contact_number: e.target.value})}
          className="w-full p-3 border rounded" required />

        <textarea placeholder="Additional Notes" 
          value={form.notes} 
          onChange={(e) => setForm({...form, notes: e.target.value})}
          className="w-full p-3 border rounded" />

        <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-semibold">
          REQUEST AMBULANCE NOW
        </button>
      </form>

      {status && <div className="mt-6 p-4 bg-green-100 rounded">Request ID: {status.request?.id}</div>}
    </div>
  );
}

export default AmbulanceRequest;