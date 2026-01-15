import React from 'react';
import { EventType, INITIAL_SURGERIES } from '../data.js';
import { getMoroccoParts } from '../utils/time';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const SmartCalendar = ({ rooms, onSlotClick, onEventClick, viewDate = new Date(), onDateChange }) => {
    // Config: 8h to 20h
    const startHour = 8;
    const endHour = 20;
    const hours = Array.from({ length: 13 }, (_, i) => i + startHour);

    const handlePrevDay = () => {
        const prev = new Date(viewDate);
        prev.setDate(prev.getDate() - 1);
        onDateChange(prev);
    };

    const handleNextDay = () => {
        const next = new Date(viewDate);
        next.setDate(next.getDate() + 1);
        onDateChange(next);
    };

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Header Date Display
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = viewDate.toLocaleDateString('fr-FR', dateOptions);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Controls */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button onClick={handlePrevDay} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                        <button onClick={() => onDateChange(new Date())} className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-white rounded-md transition-all">Aujourd'hui</button>
                        <button onClick={handleNextDay} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        {dateStr}
                    </h2>
                </div>
            </div>

            {/* Header */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                <div className="w-32 p-3 font-semibold text-xs text-slate-500 uppercase tracking-wider border-r border-slate-200 flex items-center justify-center sticky left-0 z-10 bg-slate-50">
                    Salles
                </div>
                <div className="flex-1 flex" style={{ minWidth: '800px' }}>
                    {hours.map(h => (
                        <div key={h} className="flex-1 p-3 text-center border-r border-slate-100 last:border-0">
                            <span className="text-xs font-medium text-slate-400">{h}h00</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <div style={{ minWidth: '932px' }}> {/* 132 (header) + 800 (min content) */}
                    {rooms.map(room => (
                        <div key={room.id} className="flex border-b border-slate-100 h-20 group hover:bg-slate-50 relative">

                            {/* Room Name Column */}
                            <div className="w-32 p-4 flex items-center justify-center border-r border-slate-200 bg-white sticky left-0 z-10 group-hover:bg-slate-50 font-bold text-slate-700 text-sm">
                                {room.name}
                            </div>

                            {/* Grid & Events */}
                            <div className="flex-1 relative flex">
                                {/* Background Grid */}
                                {hours.map(h => (
                                    <div
                                        key={h}
                                        className="flex-1 border-r border-slate-100 h-full cursor-crosshair transition-colors hover:bg-blue-50/50"
                                        title={`Planifier ${room.name} à ${h}h00`}
                                        onClick={() => onSlotClick(room, h, viewDate)}
                                    />
                                ))}

                                {/* Events Overlay */}
                                {(() => {
                                    // Combine Current Active Op (if exists) + Schedule
                                    let displayEvents = [];

                                    // 1. Current Active Op (Only if viewDate is TODAY)
                                    // Note: If viewDate is today, we show real-time status.
                                    // If not today, we don't show real-time status (unless it spans days, but simplified here)
                                    const isViewToday = isSameDay(viewDate, new Date());

                                    if (isViewToday) {
                                        if (room.status === 'EN COURS' || room.status === 'SUTURE / FERMETURE' || room.status === 'DÉSINFECTION' || room.status === 'NETTOYAGE') {
                                            if (room.operationStartAt && room.operationEndAt) {
                                                displayEvents.push({
                                                    id: `active-${room.id}`,
                                                    procedureName: room.currentProcedure || room.name,
                                                    surgeon: { name: room.surgeon || '?' },
                                                    start: new Date(room.operationStartAt),
                                                    end: new Date(room.operationEndAt),
                                                    status: (room.status === 'DÉSINFECTION' || room.status === 'NETTOYAGE') ? 'cleaning' : 'active'
                                                });
                                            }
                                            if ((room.status === 'DÉSINFECTION' || room.status === 'NETTOYAGE') && room.disinfectionStartAt && room.disinfectionEndAt) {
                                                displayEvents.push({
                                                    id: `disin-${room.id}`,
                                                    procedureName: "Nettoyage",
                                                    surgeon: { name: "Staff" },
                                                    start: new Date(room.disinfectionStartAt),
                                                    end: new Date(room.disinfectionEndAt),
                                                    status: 'cleaning'
                                                });
                                            }
                                        }
                                    }

                                    // 2. Scheduled Ops (Filter by ViewDate)
                                    if (room.schedule && room.schedule.length > 0) {
                                        room.schedule.forEach(op => {
                                            const opStart = new Date(op.start);
                                            const opEnd = new Date(op.end);
                                            // Show if starts on this day
                                            if (isSameDay(opStart, viewDate)) {
                                                displayEvents.push({
                                                    id: op.id,
                                                    procedureName: op.procedure,
                                                    surgeon: { name: op.surgeon },
                                                    start: opStart,
                                                    end: opEnd,
                                                    status: 'scheduled'
                                                });
                                            }
                                        });
                                    }

                                    return displayEvents.map(op => {
                                        const startParts = getMoroccoParts(op.start);
                                        const endParts = getMoroccoParts(op.end);
                                        const opStart = startParts.hour + startParts.minute / 60;
                                        const opEnd = endParts.hour + endParts.minute / 60;

                                        if (opEnd <= startHour || opStart >= endHour) return null;

                                        const effectiveStart = Math.max(opStart, startHour);
                                        const effectiveEnd = Math.min(opEnd, (endHour + 1));
                                        const duration = effectiveEnd - effectiveStart;
                                        const totalHours = endHour - startHour + 1;

                                        const leftPerc = ((effectiveStart - startHour) / totalHours) * 100;
                                        const widthPerc = (duration / totalHours) * 100;

                                        let bgClass = "bg-blue-500 border-blue-600";
                                        if (op.status === 'cleaning') bgClass = "bg-slate-400 border-slate-500"; // Gray/Slate for Cleaning
                                        if (op.status === 'scheduled') bgClass = "bg-slate-300 border-slate-400 border-dashed text-slate-700"; // Gray dashed for future
                                        if (op.status === 'active') bgClass = "bg-blue-600 border-blue-700 shadow-md";

                                        return (
                                            <div
                                                key={op.id}
                                                className={`absolute top-2 bottom-2 rounded-md border text-xs leading-tight p-1 overflow-hidden shadow-sm hover:z-20 hover:shadow-lg transition-all cursor-pointer ${bgClass} ${op.status === 'scheduled' ? 'text-slate-700' : 'text-white'}`}
                                                style={{ left: `${leftPerc}%`, width: `${widthPerc}%` }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onEventClick) onEventClick(op, room);
                                                }}
                                                title={`${op.procedureName} (${op.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${op.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                                            >
                                                <span className="font-bold block truncate">{op.procedureName}</span>
                                                <span className="opacity-90 truncate">{op.surgeon.name}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SmartCalendar;
