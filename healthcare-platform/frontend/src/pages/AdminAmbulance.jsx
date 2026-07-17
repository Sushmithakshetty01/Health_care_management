import React, { useState, useEffect } from 'react';

const FALLBACK_HOSPITALS = [
  { id: 1, hospital_name: "Apollo Hospital" },
  { id: 2, hospital_name: "Fortis Hospital" },
  { id: 3, hospital_name: "Manipal Hospital" },
  { id: 4, hospital_name: "Narayana Health" },
  { id: 5, hospital_name: "Columbia Asia Hospital" }
];

export default function AdminAmbulance() {
  const [selectedRow, setSelectedRow] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [alerts, setAlerts] = useState([]);
  const [hospitals, setHospitals] = useState(FALLBACK_HOSPITALS);
  
  const [formData, setFormData] = useState({ available_count: 0 });

  const fetchInitialData = async () => {
    try {
      const resHosp = await fetch('http://localhost:8000/api/ambulance/list');
      if (resHosp.ok) {
        const data = await resHosp.json();
        if (data && data.length > 0) setHospitals(data);
      }
    } catch (err) {
      console.error("Backend offline.");
    }

    try {
      const resAlerts = await fetch('http://localhost:8000/api/ambulance/requests');
      if (resAlerts.ok) {
        const data = await resAlerts.json();
        setAlerts(data || []);
      }
    } catch (err) {
      console.error("Could not sync live user alert logs:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRowData = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ambulance/status/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({ available_count: data.available_count });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRowData(selectedRow);
  }, [selectedRow]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    const url = `http://localhost:8000/api/ambulance/status/${selectedRow}?count=${formData.available_count}`;
    
    try {
      const response = await fetch(url, { method: 'PUT', headers: { 'Accept': 'application/json' } });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `⚡ Management Record #${selectedRow} updated live!`, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: `Backend Error: ${data.detail || 'Error executing updates.'}`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Database synchronization failed.', type: 'error' });
    }
  };

  // Maps the hospital name string using our local list state mapping array
  const getHospitalName = (id) => {
    const matched = hospitals.find(h => h.id === id);
    return matched ? matched.hospital_name : `Hospital Node #${id}`;
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#1e293b', margin: 0, fontWeight: '700' }}>Master Administration Console</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage hospital emergency fleets and live tracking systems.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Active Core Node:</label>
          <select value={selectedRow} onChange={(e) => setSelectedRow(Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', minWidth: '180px' }}>
            {hospitals.map((hosp) => (
              <option key={hosp.id} value={hosp.id}>{hosp.hospital_name || `Node #${hosp.id}`}</option>
            ))}
          </select>
        </div>
      </div>

      {message.text && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: '600', fontSize: '14px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#059669' : '#dc2626', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>{message.text}</div>
      )}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '15px' }}>Syncing data grids...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <form onSubmit={handleUpdateSubmit}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>🚑</span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Emergency Fleet Manager</h3>
              </div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>Available Ambulances Count</label>
              <input type="number" value={formData.available_count} onChange={(e) => setFormData({ available_count: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '15px' }} min="0" />
              <button type="submit" style={{ padding: '14px 28px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>
                Publish Live Updates Across Clusters
              </button>
            </div>
          </form>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>Live Incident & Situation Reports</h3>
            </div>

            {alerts.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No incoming emergency dispatches active right now.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map((item) => (
                  <div key={item.id} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: '#991b1b', fontSize: '14px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        📍 Target: {getHospitalName(item.hospital_id)}
                      </span>
                      <p style={{ margin: 0, color: '#374151', fontSize: '15px', fontWeight: '500' }}>"{item.message}"</p>
                    </div>
                    <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '750' }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}