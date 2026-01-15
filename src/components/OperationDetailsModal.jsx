import React from 'react';
import { Calendar, Clock, User, FileText, X, AlertCircle } from 'lucide-react';
import { formatMoroccoTime } from '../utils/time';

const OperationDetailsModal = ({ operation, onClose, roomName }) => {
    if (!operation) return null;

    const start = new Date(operation.start);
    const end = new Date(operation.end);

    // Calculate duration in minutes
    const durationMinutes = Math.round((end - start) / 60000);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Détails Intervention
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">{roomName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Time Slot */}
                    <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm text-blue-800 font-bold uppercase tracking-wide">Horaire</div>
                            <div className="text-lg font-mono font-bold text-slate-800">
                                {formatMoroccoTime(start)} - {formatMoroccoTime(end)}
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-0.5">
                                Durée : {durationMinutes} min
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase">Intervention</label>
                                <p className="font-medium text-slate-800">{operation.procedure}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <User className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase">Chirurgien</label>
                                <p className="font-medium text-slate-800">{operation.surgeon}</p>
                            </div>
                        </div>

                        {operation.patientId && (
                            <div className="flex gap-3 items-start">
                                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase">Patient ID</label>
                                    <p className="font-medium text-slate-800">{operation.patientId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>Créé le {new Date(operation.created).toLocaleString('fr-FR')}</span>
                    </div>

                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Fermer
                    </button>
                    {/* Future: Edit Button */}
                </div>
            </div>
        </div>
    );
};

export default OperationDetailsModal;
