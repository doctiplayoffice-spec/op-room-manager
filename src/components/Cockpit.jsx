import React, { useState, useEffect } from 'react';
import { Clock, PlayCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { SurgeryStatus } from '../types';

const Cockpit = ({ rooms, onRoomClick, onFreeRoomClick }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {rooms.map((room) => {
                const isFree = !room.status || room.status === 'LIBRE';

                return (
                    <RoomCard
                        key={room.id}
                        room={room}
                        onClick={() => {
                            if (isFree) {
                                onFreeRoomClick?.(room);
                            } else {
                                onRoomClick?.(room);
                            }
                        }}
                    />
                );
            })}
        </div>
    );
};

const RoomCard = ({ room, onClick }) => {
    // Force re-render periodically for countdowns? 
    // Actually the parent App re-renders every 1s due to useTimeEngine tick if something changes, 
    // but we might want smoother countdowns. For now relies on parent props.

    let statusColor = "bg-emerald-500";
    let statusText = "LIBRE";
    let statusBorder = "border-slate-200";
    let cardBg = "bg-white";
    let animate = "";

    const status = room.status;

    // Calculate time left for IN_PROGRESS to determine urgent border
    let timeLeftForOp = 0;
    if (status === SurgeryStatus.IN_PROGRESS && (room.operationEndAt || room.endTime)) {
        timeLeftForOp = Math.max(0, Math.ceil((new Date(room.operationEndAt || room.endTime) - new Date()) / 60000));
    }

    if (status === SurgeryStatus.IN_PROGRESS || status === SurgeryStatus.CLOSING) {
        statusColor = "bg-blue-600";
        statusText = status;
        // Default border
        statusBorder = "border-blue-200 ring-4 ring-blue-50";

        // NEW: Flash red if approaching end (e.g. < 5 mins)
        if (timeLeftForOp <= 5 && timeLeftForOp >= 0) {
            statusBorder = "border-red-400 ring-4 ring-red-100 animate-pulse";
        }
    } else if (status === SurgeryStatus.OPERATION_ENDED_ATTENTION) {
        statusColor = "bg-red-600";
        statusText = "ATTENTION (FIN)"; // Shortened for display
        statusBorder = "border-red-500 ring-4 ring-red-100";
        cardBg = "bg-red-50";
        animate = "animate-pulse"; // Blinking effect
    } else if (status === SurgeryStatus.DISINFECTION || status === SurgeryStatus.CLEANING) {
        statusColor = "bg-amber-500"; // Should distinguish Disinfection? Maybe Blue/Cyan?
        statusColor = 'bg-slate-100 text-slate-500'; // Grayed out
        statusText = 'NETTOYAGE';
        statusBorder = 'border-slate-300 border-dashed'; // Dashed to indicate maintenance/cleaning
    } else if (status === SurgeryStatus.PREPARING) {
        statusColor = "bg-slate-500";
        statusText = status;
    } else if (status === SurgeryStatus.DELAYED) {
        statusColor = "bg-red-500";
        statusText = "RETARD";
        statusBorder = "border-red-200";
    } else {
        statusText = "LIBRE";
    }

    // Timer Logic
    let timeLeftDisplay = null;
    let timerIcon = <Clock className="w-4 h-4" />;

    if (status === SurgeryStatus.IN_PROGRESS || status === SurgeryStatus.CLOSING) {
        // Count remaining time for operation
        const minutes = room.operationEndAt ? Math.ceil((new Date(room.operationEndAt) - new Date()) / 60000) : 0;
        timeLeftDisplay = `${minutes} min`;
    } else if (status === SurgeryStatus.DISINFECTION || status === SurgeryStatus.CLEANING) {
        // Disinfection Countdown
        const seconds = room.disinfectionEndAt ? Math.floor((new Date(room.disinfectionEndAt) - new Date()) / 1000) : 0;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        timeLeftDisplay = `${m}:${s < 10 ? '0' + s : s}`;
        timerIcon = <Sparkles className="w-4 h-4 animate-spin-slow" />;
    } else if (status === SurgeryStatus.OPERATION_ENDED_ATTENTION) {
        timerIcon = <AlertTriangle className="w-4 h-4" />;
        timeLeftDisplay = "FIN";
    }

    // Hyper Septic Styling
    const isHyperSeptic = room.type === 'HYPER_SEPTIC'; // Match enum string

    if (isHyperSeptic) {
        // Enforce solid mauve frame, no flashing
        statusBorder = "border-[3px] border-purple-600 shadow-md shadow-purple-100";
        if (animate.includes('pulse') || animate.includes('bounce')) {
            animate = ""; // Disable animations for hyper septic frame as requested "sans clignotement"
        }

        // If FREE, keep mauve theme
        if (statusText === 'LIBRE') {
            cardBg = "bg-purple-50";
        }
    }

    return (
        <div
            onClick={onClick}
            className={`relative h-48 rounded-xl border ${statusBorder} ${cardBg} shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group ${animate}`}
        >
            <div className={`h-1.5 w-full ${isHyperSeptic ? 'bg-purple-600' : statusColor}`} />

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold text-lg ${isHyperSeptic ? 'text-purple-900' : 'text-slate-800'}`}>{room.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${isHyperSeptic ? 'bg-purple-600' : statusColor}`}>
                        {statusText}
                    </span>
                </div>

                {[SurgeryStatus.IN_PROGRESS, SurgeryStatus.CLOSING].includes(status) ? (
                    <div className="mt-auto space-y-2">
                        <div>
                            <p className="text-xs font-bold text-slate-900 line-clamp-2">{room.currentProcedure}</p>
                            <p className="text-xs text-slate-500">{room.surgeon}</p>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-blue-50/80 rounded-lg text-blue-700 backdrop-blur-sm">
                            {timerIcon}
                            <span className="text-sm font-bold font-mono">{timeLeftDisplay}</span>
                        </div>
                    </div>
                ) : (status === SurgeryStatus.DISINFECTION || status === SurgeryStatus.CLEANING) ? (
                    <div className="mt-auto flex flex-col items-center justify-center py-6 animate-pulse">
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Nettoyage
                        </div>
                        <div className="text-4xl font-black text-slate-500 font-mono tracking-tighter">
                            {timeLeftDisplay}
                        </div>
                    </div>
                ) : status === SurgeryStatus.OPERATION_ENDED_ATTENTION ? (
                    <div className="mt-auto flex items-center justify-center p-2 bg-red-100/50 rounded-lg text-red-600 font-bold animate-bounce">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        TERMINÉ
                    </div>
                ) : (
                    <div className="mt-auto flex items-center justify-center p-4 text-emerald-600 opacity-50 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-8 h-8" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cockpit;

