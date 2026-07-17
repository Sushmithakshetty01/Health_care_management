import React, { useState, useEffect } from 'react';
import { Layers, Globe, CheckCircle2, AlertCircle, RefreshCw, Server, ShieldCheck } from 'lucide-react';

export default function AdminSaaS() {
  const [selectedNode, setSelectedNode] = useState(1);
  const [currentStatus, setCurrentStatus] = useState('Branch A Active');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchSaaSStatus = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/saas/status/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentStatus(data.branch_status);
      }
    } catch (err) {
      console.error("Error fetching SaaS status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaaSStatus(selectedNode);
  }, [selectedNode]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`http://localhost:8000/api/saas/status/${selectedNode}?saas_status=${encodeURIComponent(currentStatus)}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setMsg({ text: 'SaaS deployment routing map successfully propagated live!', type: 'success' });
        setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      } else {
        setMsg({ text: 'Failed to update configuration on backend.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Database synchronization conflict detected.', type: 'error' });
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_30%,#f1f5f9_100%)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium background ambient blur blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute right-[-5%] top-[20%] h-[450px] w-[450px] rounded-full bg-cyan-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[2.5rem] border border-white bg-white/80 p-8 sm:p-10 shadow-2xl shadow-blue-100/60 backdrop-blur-xl">
          
          {/* Header layout */}
          <div className="flex items-start gap-4 border-b border-slate-100 pb-6 mb-8">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-200">
              <Layers size={24} />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700 ring-1 ring-blue-100">
                <ShieldCheck size={12} /> Root Controller
              </span>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-2">
                Multi-Hospital SaaS Cluster Core
              </h2>
              <p className="mt-1 text-sm leading-6 font-medium text-slate-500">
                Dynamically adjust infrastructure partitions and active multi-tenant environments.
              </p>
            </div>
          </div>

          {/* Alert Status Banners */}
          {msg.text && (
            <div className={`mb-6 flex items-start gap-3 p-4 rounded-2xl text-sm font-bold border transition-all duration-300 transform scale-100 ${
              msg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-100/80 shadow-sm shadow-emerald-100' 
                : 'bg-rose-50 text-rose-800 border-rose-100/80'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Controls Workspace */}
          <div className="space-y-6">
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100/80">
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                Hospital Target Node
              </label>
              <div className="relative">
                <select 
                  value={selectedNode} 
                  onChange={(e) => setSelectedNode(Number(e.target.value))} 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer transition-all"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                >
                  <option value={1}>Apollo Hospital Cluster</option>
                  <option value={2}>Fortis Hospital Cluster</option>
                  <option value={3}>Manipal Hospital Cluster</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 gap-3 text-slate-400 font-bold text-sm">
                <RefreshCw size={18} className="animate-spin text-blue-600" />
                <span>Pulling latest infrastructure records...</span>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100/80">
                  <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                    Cluster Environment Target Mapping
                  </label>
                  <select 
                    value={currentStatus} 
                    onChange={(e) => setCurrentStatus(e.target.value)} 
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer transition-all"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                  >
                    <option value="Branch A Active">Branch A Active</option>
                    <option value="Branch B Active">Branch B Active</option>
                    <option value="Global Failover Model">Global Failover Model</option>
                    <option value="Standby Clusters">Standby Clusters</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4.5 px-6 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-300"
                >
                  <Globe size={16} className="transition-transform group-hover:rotate-45 duration-500" />
                  <span>Deploy Allocation Strategy</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}