import React, { useState, useEffect } from 'react';
import { Camera, Check, RefreshCw, CheckCircle2, History } from 'lucide-react';

export default function AdminDiagnosticQueue() {
    const [queue, setQueue] = useState([]);
    const [completedList, setCompletedList] = useState([]); // Tracks doctors completed log session

    const fetchQueue = () => {
        fetch('http://localhost:8000/diagnostic/queue')
            .then(res => res.json())
            .then(data => setQueue(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleStatusChange = (id, newType) => {
        fetch('http://localhost:8000/diagnostic/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, imaging_type: newType })
        })
        .then(res => res.json())
        .then(() => fetchQueue());
    };

    // LIVE ACTION: Clears from main waiting line and archives into Doctor's completed board log
    const handleComplete = (item) => {
        fetch(`http://localhost:8000/diagnostic/complete/${item.id}`, {
            method: 'DELETE'
        })
        .then(() => {
            // Store locally in session state history log instantly
            setCompletedList(prev => [
                { ...item, completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                ...prev
            ]);
            fetchQueue(); // Sync live table pipeline
        });
    };

    return (
        <div className="w-full bg-slate-900 text-slate-100 font-sans p-2 space-y-8">
            
            {/* ACTIVE WORKSTATION MATRIX */}
            <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Camera size={16} className="text-blue-500" /> Radiology Workstation Matrix
                    </h2>
                    <button onClick={fetchQueue} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition">
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-300">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                                <th className="py-3">Position</th>
                                <th className="py-3">Patient</th>
                                <th className="py-3">Modality</th>
                                <th className="py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {queue.map((item, idx) => (
                                <tr key={item.id || idx}>
                                    <td className="py-3 font-mono text-blue-400">Slot #{idx + 1}</td>
                                    <td className="py-3 font-bold text-white">{item.patient_name}</td>
                                    <td className="py-3">
                                        <select 
                                            className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-bold cursor-pointer focus:outline-none"
                                            value={item.imaging_type} 
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                        >
                                            <option value="X-Ray">X-Ray</option>
                                            <option value="CT Scan">CT Scan</option>
                                            <option value="MRI">MRI</option>
                                            <option value="Ultrasound">Ultrasound</option>
                                        </select>
                                    </td>
                                    <td className="py-3 text-right">
                                        <button 
                                            onClick={() => handleComplete(item)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition shadow-md"
                                        >
                                            <Check size={12} /> Clear Scan Complete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DOCTOR'S ARCHIVED COMPLETED LOG (BLUE PANEL EXCLUSIVE EXTENSION) */}
            <div className="border-t border-slate-800/80 pt-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-4">
                    <History size={14} className="text-emerald-500" /> Completed Procedures Log (Today)
                </h3>
                
                {completedList.length === 0 ? (
                    <p className="text-[11px] text-slate-500 font-medium italic pl-1">No scan procedures completed yet during this session.</p>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {completedList.map((patient, index) => (
                            <div key={index} className="bg-slate-950 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="font-bold text-white">{patient.patient_name}</p>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{patient.imaging_type} Scan</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="bg-emerald-950/80 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-900/50">
                                        Done
                                    </span>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{patient.completedAt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}