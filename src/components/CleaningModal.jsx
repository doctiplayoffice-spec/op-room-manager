import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, Clock } from 'lucide-react';

const CleaningModal = ({ room, onClose, onFinish }) => {
    const [timeLeft, setTimeLeft] = useState("00:00");

    useEffect(() => {
        if (!room || !room.disinfectionEndAt) return;

        const updateTimer = () => {
            const end = new Date(room.disinfectionEndAt);
            const now = new Date();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("00:00");
                // Optionally auto-close or enable finish? 
                // The global ticker usually handles the state transition to FREE automatically.
                // But if the modal is open, we might want to just show 00:00.
            } else {
                const m = Math.floor(diff / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [room]);

    if (!room) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                    ✕
                </button>

                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-12 h-12 text-slate-500" />
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Nettoyage / Désinfection</h2>
                        <p className="text-slate-500 mt-1">Salle : {room.name}</p>
                    </div>

                    {/* Timer */}
                    <div className="bg-slate-50 rounded-xl p-4 w-full border border-slate-100">
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">
                            <Clock className="w-4 h-4" /> Temps Restant
                        </div>
                        <div className="text-5xl font-mono font-black text-slate-700 tracking-tighter">
                            {timeLeft}
                        </div>
                    </div>

                    {/* Warning Text */}
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                        La salle est indisponible durant cette phase.
                    </p>

                    {/* Action */}
                    <button
                        onClick={() => {
                            if (window.confirm("Confirmer la fin anticipée du nettoyage ?")) {
                                onFinish(room.id);
                                onClose();
                            }
                        }}
                        className="w-full py-4 bg-emerald-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-6 h-6" />
                        Désinfection Terminée
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CleaningModal;
