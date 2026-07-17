import React, { useState, useEffect } from 'react';
import { Users, Building2, Activity, Radio, ChevronRight } from 'lucide-react';

export default function UserSaaS() {
  const [selectedNode, setSelectedNode] = useState(1);
  const [status, setStatus] = useState('Synchronizing gateway...');

  const fetchStatus = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/saas/status/${selectedNode}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.branch_status);
      } else {
        setStatus('Offline Matrix');
      }
    } catch (err) {
      setStatus('Network Timeout');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [selectedNode]);

  // Color dynamic tag parser based on the environment state
  const getStatusStyle = (currentStatus) => {
    if (currentStatus.includes('Branch A')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (currentStatus.includes('Branch B')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (currentStatus.includes('Failover')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="p-6 sm:p-12 min-h-screen bg-[radial-gradient(circle_at_bottom_right,#e0f2fe_0,#f8fafc_35%,#f1f5f9_100%)] flex items-center justify-center font-sans">
      <div className="w-full max-w-xl bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/90 border border-slate-100">
        
        {/* Decorative Badge Icon Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-blue-50 to-cyan-50 text-blue-600 rounded-2xl shadow-inner border border-blue-100/30 text-2xl mb-4">
            <Users size={26} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Multi-Hospital SaaS Gateway</h2>
          <p className="text-sm font-medium text-slate-400 mt-1.5">Isolated architecture client allocation matrix routing matrix.</p>
        </div>

        {/* Input Interactive Panel */}
        <div className="mb-8 bg-slate-50/70 p-5 rounded-2.5xl border border-slate-100">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
            Select Active Region Node
          </label>
          <div className="grid gap-2">
            {[
              { id: 1, name: 'Apollo Hospital Environment', location: 'Primary Data Core' },
              { id: 2, name: 'Fortis Hospital Environment', location: 'Secondary Cluster' },
              { id: 3, name: 'Manipal Hospital Environment', location: 'Regional Cluster' }
            ].map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`w-full text-left p-4 rounded-xl font-bold flex items-center justify-between transition-all duration-200 border ${
                  selectedNode === node.id 
                    ? 'bg-white border-blue-500 shadow-md text-blue-700 translate-x-1' 
                    : 'bg-white/60 border-slate-200/60 text-slate-700 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={18} className={selectedNode === node.id ? 'text-blue-600' : 'text-slate-400'} />
                  <div>
                    <p className="text-sm">{node.name}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{node.location}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`opacity-60 ${selectedNode === node.id ? 'translate-x-0.5 text-blue-600' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display Neon Card Box */}
        <div className="p-6 rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden">
          <div className="absolute right-4 top-4 flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live</span>
          </div>

          <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Active Cluster Mapping Topology</p>
          
          <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none">
              {status}
            </h3>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide border ${getStatusStyle(status)}`}>
              Connected
            </span>
          </div>

          {/* Infrastructure status breakdown tracking indicator lines */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Status Code</span>
              <span className="text-xs font-bold text-white/80 mt-1 flex items-center gap-1">
                <Activity size={12} className="text-blue-400" /> Operational
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Isolation Layer</span>
              <span className="text-xs font-bold text-white/80 mt-1">Multi-Tenant v2</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}