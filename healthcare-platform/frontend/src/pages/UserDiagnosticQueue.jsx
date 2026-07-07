import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Clock, ShieldAlert } from 'lucide-react';

export default function UserDiagnosticQueue() {
    const [queue, setQueue] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchResult, setSearchResult] = useState(null);

    const fetchQueue = () => {
        fetch('http://localhost:8000/diagnostic/queue')
            .then(res => res.json())
            .then(data => setQueue(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error updating user list:", err));
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 3000); // Polling every 3 seconds for real-time sync
        return () => clearInterval(interval);
    }, []);

    // Case-insensitive helper to handle real-time counting accurately
    const countSection = (modality) => {
        return queue.filter(item => item.imaging_type?.toLowerCase().trim() === modality.toLowerCase().trim()).length;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchName.trim()) {
            setSearchResult(null);
            return;
        }

        const index = queue.findIndex(
            item => item.patient_name.toLowerCase().includes(searchName.toLowerCase().trim())
        );

        if (index !== -1) {
            setSearchResult({
                name: queue[index].patient_name,
                position: index + 1,
                modality: queue[index].imaging_type
            });
        } else {
            setSearchResult({ notFound: true, attemptedName: searchName });
        }
    };

    return (
        <div className="w-full bg-white p-2 rounded-2xl font-sans text-slate-900">
            
            {/* 4 REAL-TIME STATUS CARDS COMPONENT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {/* X-Ray */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase">X-Ray 📋</h4>
                    <span className="text-2xl font-black block text-slate-900 mt-1">{countSection('X-Ray')}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Patients waiting</p>
                </div>

                {/* CT Scan */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase">CT Scan 🧬</h4>
                    <span className="text-2xl font-black block text-slate-900 mt-1">{countSection('CT Scan')}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Patients waiting</p>
                </div>

                {/* MRI */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase">MRI 🧠</h4>
                    <span className="text-2xl font-black block text-slate-900 mt-1">{countSection('MRI')}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Patients waiting</p>
                </div>

                {/* Ultrasound */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase">Ultrasound 🌊</h4>
                    <span className="text-2xl font-black block text-slate-900 mt-1">{countSection('Ultrasound')}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Patients waiting</p>
                </div>
            </div>

            {/* DYNAMIC INFORMATION PANEL FLOW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* UP NEXT MONITOR */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 flex items-center gap-1">
                            <Clock size={12} /> Up Next For Scan
                        </p>
                        <h3 className="text-xl font-black mt-2 truncate">
                            {queue[0] ? queue[0].patient_name : "Queue Empty"}
                        </h3>
                    </div>
                    {queue[0] && (
                        <div className="mt-3">
                            <span className="inline-block bg-white/20 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase">
                                PROCEED TO: {queue[0].imaging_type} ROOM
                            </span>
                        </div>
                    )}
                </div>

                {/* PATIENT SEARCH FIELD */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        🔍 Find Your Current Place In Line
                    </h4>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Type your name..." 
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                if (!e.target.value) setSearchResult(null);
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
                        />
                        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition">
                            Check Turn
                        </button>
                    </form>

                    {searchResult && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                            {searchResult.notFound ? (
                                <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                                    <ShieldAlert size={12} /> Not found in current line.
                                </p>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex items-center justify-between">
                                    <div className="min-w-0">
                                        <h5 className="text-xs font-black text-slate-800 truncate">{searchResult.name}</h5>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{searchResult.modality}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Queue No.</span>
                                        <span className="text-base font-black text-emerald-600 font-mono">#{searchResult.position}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}