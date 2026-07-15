import React, { useState, useEffect } from 'react';

export default function AdminAmbulance() {
  const [selectedRow, setSelectedRow] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // State for all 3 unified features
  const [formData, setFormData] = useState({
    available_count: 0,
    contact_number: '',
    report_summary_status: 'Active',
    multi_saas_status: 'Branch A Active'
  });
const [hospitals, setHospitals] = useState([]);
useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/ambulance/list');
        if (res.ok) {
          const data = await res.json();
          setHospitals(data);
        }
      } catch (err) {
        console.error("Error loading hospitals from DB:", err);
      }
    };
    fetchHospitals();
  }, []);
  // Fetch real-time row data from backend
  const fetchRowData = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ambulance/status/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          available_count: data.available_count,
          contact_number: data.contact_number || '',
          report_summary_status: data.report_summary_status || 'Active',
          multi_saas_status: data.multi_saas_status || 'Branch A Active'
        });
      }
    } catch (err) {
      console.error("Failed fetching live status", err);
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
    
    const url = `http://localhost:8000/api/ambulance/status/${selectedRow}?count=${formData.available_count}&report_status=${encodeURIComponent(formData.report_summary_status)}&saas_status=${encodeURIComponent(formData.multi_saas_status)}`;
    
    try {
      const response = await fetch(url, { method: 'PUT' });
      if (response.ok) {
        setMessage({ text: `⚡ Management Record #${selectedRow} updated live in Supabase!`, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: 'Error executing server updates.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Database synchronization failed.', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Upper Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#1e293b', margin: 0, fontWeight: '700' }}>Master Administration Console</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage cross-platform hospital SaaS deployments, AI pipelines, and emergency systems.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Active Core Node:</label>
          <select 
            value={selectedRow} 
            onChange={(e) => setSelectedRow(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
          >
            {hospitals.map((hosp) => (
              <option key={hosp.id} value={hosp.id}>
                {hosp.hospital_name || `Hospital Node #${hosp.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Messaging Toast */}
      {message.text && (
        <div style={{ 
          padding: '14px 20px', 
          borderRadius: '12px', 
          marginBottom: '24px', 
          fontWeight: '600',
          fontSize: '14px',
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', 
          color: message.type === 'success' ? '#059669' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '15px' }}>Syncing data grids with database cluster...</p>
      ) : (
        <form onSubmit={handleUpdateSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            
            {/* Card 1: Ambulance Systems */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>🚑</span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Emergency Fleet Manager</h3>
              </div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>Available Ambulances Count</label>
              <input 
                type="number" 
                value={formData.available_count} 
                onChange={(e) => setFormData({...formData, available_count: Number(e.target.value)})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '15px' }}
                min="0"
              />
            </div>

            {/* Card 2: AI Report Summarization */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>📄</span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>AI Report Summarizer</h3>
              </div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>Pipeline Operational State</label>
              <select
                value={formData.report_summary_status}
                onChange={(e) => setFormData({...formData, report_summary_status: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#fff' }}
              >
                <option value="Active">🟢 Active / Analyzing Notes</option>
                <option value="Offline">🔴 Pipeline Offline</option>
                <option value="Maintenance">🟡 Model Training Mode</option>
              </select>
            </div>

            {/* Card 3: Multi-Hospital SaaS Cluster */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>🏢</span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Multi-Hospital SaaS Instance</h3>
              </div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>Cluster Node Routing</label>
              <select
                value={formData.multi_saas_status}
                onChange={(e) => setFormData({...formData, multi_saas_status: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#fff' }}
              >
                <option value="Branch A Active">Branch A Operational Instance</option>
                <option value="Branch B Active">Branch B Operational Instance</option>
                <option value="Global Cross-Sync">Global Hybrid Sync Enabled</option>
              </select>
            </div>

          </div>

          <button 
            type="submit" 
            style={{ 
              padding: '14px 28px', 
              backgroundColor: '#2563eb', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
            }}
          >
            Publish Live Updates Across Clusters
          </button>
        </form>
      )}
    </div>
  );
}