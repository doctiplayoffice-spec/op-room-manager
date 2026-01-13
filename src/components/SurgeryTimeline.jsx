import React from 'react';
import { Clock, Play, CheckCircle, Activity, DoorOpen, Scissors, ListChecks } from 'lucide-react';
import { EventType } from '../data.js';
import { formatMoroccoTime } from '../utils/time';

const EVENT_ICONS = {
    [EventType.PATIENT_ENTRY]: <DoorOpen className="w-4 h-4" />,
    [EventType.ANESTHESIA_INDUCTION]: <Activity className="w-4 h-4" />,
    [EventType.INCISION]: <Scissors className="w-4 h-4" />,
    [EventType.CLOSURE]: <CheckCircle className="w-4 h-4" />,
    [EventType.PATIENT_EXIT]: <Play className="w-4 h-4" />
};

const SurgeryTimeline = ({ room, onAddEvent, onClose, onOpenChecklist }) => {
    if (!room) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Traçabilité Intervention
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">{room.name} — {room.currentProcedure}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    <div className="flex justify-end">
                        <button
                            onClick={onOpenChecklist}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-semibold text-sm"
                        >
                            <ListChecks className="w-4 h-4" /> Checklist Sécurité OMS
                        </button>
                    </div>

                    <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {room.events && room.events.length > 0 ? (
                            room.events.map((evt, idx) => (
                                <div key={idx} className="relative flex items-start gap-4 animate-in slide-in-from-left-2">
                                    <div className="absolute -left-[5px] top-0 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                                    <div className="flex-1 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-slate-800">{evt.type}</span>
                                            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                {formatMoroccoTime(evt.time)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">Enregistré par {evt.user}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 italic">Aucun événement pour le moment</div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.values(EventType).map(type => {
                        const isDone = room.events?.some(e => e.type === type);
                        return (
                            <button
                                key={type}
                                disabled={isDone}
                                onClick={() => onAddEvent(type)}
                                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${isDone
                                    ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600 shadow-sm'
                                    }`}
                            >
                                {isDone && <CheckCircle className="w-3 h-3" />}
                                {type}
                            </button>
                        )
                    })}
                </div>

            </div>
        </div>
    );
};

export default SurgeryTimeline;
