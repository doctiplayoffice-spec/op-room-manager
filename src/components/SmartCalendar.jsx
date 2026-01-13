import React from 'react';
import { EventType, INITIAL_SURGERIES } from '../data.js';
import { getMoroccoParts } from '../utils/time';

const SmartCalendar = ({ rooms, onSlotClick }) => {
    // Config: 8h to 20h
    const startHour = 8;
    const endHour = 20;
    const hours = Array.from({ length: 13 }, (_, i) => i + startHour);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
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
                                        onClick={() => onSlotClick(room, h)}
                                    />
                                ))}

                                {/* Events Overlay */}
                                {INITIAL_SURGERIES.filter(op => op.roomNumber === room.id).map(op => {
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
                                    if (op.status === 'cleaning') bgClass = "bg-amber-500 border-amber-600";
                                    if (op.status === 'scheduled') bgClass = "bg-slate-400 border-slate-500 opacity-80";
                                    if (op.status === 'free') bgClass = "bg-emerald-500";

                                    return (
                                        <div
                                            key={op.id}
                                            className={`absolute top-2 bottom-2 rounded-md border text-white text-[10px] leading-tight p-1 overflow-hidden shadow-sm hover:z-20 hover:shadow-lg transition-all cursor-pointer ${bgClass}`}
                                            style={{ left: `${leftPerc}%`, width: `${widthPerc}%` }}
                                            onClick={(e) => { e.stopPropagation(); alert(`Intervention: ${op.procedureName}\nChirurgien: ${op.surgeon.name}`); }}
                                        >
                                            <span className="font-bold block truncate">{op.procedureName}</span>
                                            <span className="opacity-90 truncate">{op.surgeon.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SmartCalendar;
