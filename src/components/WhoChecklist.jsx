import React from 'react';
import { ShieldCheck, CheckSquare, Square } from 'lucide-react';

const WhoChecklist = ({ room, onToggle, onClose }) => {
    if (!room) return null;

    const phases = {
        BEFORE_INDUCTION: "Avant Induction",
        BEFORE_INCISION: "Time-Out (Avant Incision)",
        BEFORE_EXIT: "Avant Sortie de Salle"
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        Checklist Sécurité OMS
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-500">✕</button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8">
                    {Object.keys(phases).map(phaseKey => (
                        <div key={phaseKey}>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">
                                {phases[phaseKey]}
                            </h4>
                            <div className="space-y-3">
                                {room.checklist.filter(i => i.phase === phaseKey).map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => onToggle(room.id, item.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${item.checked
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:shadow-md'
                                            }`}
                                    >
                                        {item.checked
                                            ? <div className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center"><CheckSquare className="w-3.5 h-3.5" /></div>
                                            : <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-emerald-400" />
                                        }
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WhoChecklist;
