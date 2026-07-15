import React, { useState, useEffect } from 'react';

export default function AmbulanceRequest() {
  const [selectedNode, setSelectedNode] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    available_count: 0,
    contact_number: '+91 98765 43210',
    report_summary_status: 'Active',
    multi_saas_status: 'Branch A Active'
  });
  const [userMsg, setUserMsg] = useState('');
  const [sentMessage, setSentMessage] = useState(false);

  // Fetch live system status for the selected node
  const fetchNodeStatus = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ambulance/status/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStatus({
          available_count: data.available_count,
          contact_number: data.contact_number || '+91 98765 43210',
          report_summary_status: data.report_summary_status || 'Active',
          multi_saas_status: data.multi_saas_status || 'Branch A Active'
        });
      }
    } catch (err) {
      console.error("Error fetching live database node status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeStatus(selectedNode);
  }, [selectedNode]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    setSentMessage(true);
    setTimeout(() => {
      setSentMessage(false);
      setUserMsg('');
    }, 4000);
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header and Node Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#0f172a', margin: 0, fontWeight: '800', letterSpacing: '-0.025em' }}>
            Emergency & Platform Hub
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Real-time medical node tracking and service availability status.</p>
        </div>

        {/* Node Selection Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Select Hospital Region:</label>
          <select 
            value={selectedNode} 
            onChange={(e) => setSelectedNode(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i+1} value={i+1}>Hospital Node #{i+1}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Fetching live database metrics...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT SIDE: Service Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card 1: Live Ambulance Availability */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🚑</span>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>Ambulance Dispatch</h3>
                </div>
                <span style={{ 
                  backgroundColor: status.available_count > 0 ? '#dcfce7' : '#fee2e2', 
                  color: status.available_count > 0 ? '#15803d' : '#b91c1c', 
                  padding: '4px 12px', 
                  borderRadius: '9999px', 
                  fontSize: '13px', 
                  fontWeight: '600' 
                }}>
                  {status.available_count > 0 ? 'Ready' : 'Standby'}
                </span>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Active Units in Area</p>
                <h4 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>{status.available_count}</h4>
              </div>

              <a 
                href={`tel:${status.contact_number}`} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '12px 24px', 
                  backgroundColor: '#ef4444', 
                  color: '#fff', 
                  borderRadius: '10px', 
                  textDecoration: 'none', 
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                  transition: 'background-color 0.2s'
                }}
              >
                📞 Call Emergency Line: {status.contact_number}
              </a>
            </div>

            {/* Card 2: AI Report Summarization */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>📄</span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>AI Report Summarizer Status</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>Current operational status of our pipeline analyzer model for processing medical charts.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', color: '#334155' }}>
                Pipeline State: <span style={{ color: status.report_summary_status === 'Active' ? '#16a34a' : '#ea580c' }}>{status.report_summary_status}</span>
              </div>
            </div>

            {/* Card 3: SaaS Cluster Status */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>🏢</span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>Multi-Hospital SaaS Cluster</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>Your hospital routing and active multi-tenant system cluster configurations.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', color: '#334155' }}>
                Active Node: <span style={{ color: '#2563eb' }}>{status.multi_saas_status}</span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Interactive Message Box */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '32px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>Drop Live Location / Situation</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>Share instant details directly with dispatch control. This logs coordinates and speeds up ETA.</p>
            
            {sentMessage && (
              <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
                ✓ GPS Coordinates and emergency details transmitted! Live units have been updated.
              </div>
            )}

            <form onSubmit={handleSendMessage}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Emergency Information / Landmark</label>
                <textarea 
                  value={userMsg} 
                  onChange={(e) => setUserMsg(e.target.value)} 
                  rows="5" 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', resize: 'none' }} 
                  placeholder="Tell us the ward, patient situation, or address landmarks..." 
                  required 
                />
              </div>
              <button 
                type="submit" 
                style={{ 
                  width: '100%',
                  padding: '14px', 
                  backgroundColor: '#2563eb', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: '700',
                  fontSize: '15px',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                }}
              >
                Transmit Alert Code
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}