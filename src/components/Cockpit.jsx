import React from 'react';
import { Clock, PlayCircle } from 'lucide-react';

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
                                // ✅ Salle libre => ouvrir formulaire (même modal que bouton programmer)
                                onFreeRoomClick?.(room);
                            } else {
                                // ✅ Sinon => comportement actuel
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
    let statusColor = "bg-emerald-500";
    let statusText = "LIBRE";
    let statusBorder = "border-slate-200";

    if (room.status === 'EN COURS' || room.status === 'SUTURE / FERMETURE') {
        statusColor = "bg-blue-600";
        statusText = room.status;
        statusBorder = "border-blue-200 ring-4 ring-blue-50";
    } else if (room.status === 'NETTOYAGE') {
        statusColor = "bg-amber-500";
        statusText = "NETTOYAGE";
        statusBorder = "border-amber-200";
    } else if (room.status === 'PROGRAMMÉ' || room.status === 'PRÉPARATION') {
        statusColor = "bg-slate-500";
        statusText = room.status;
    } else if (room.status === 'EN RETARD') {
        statusColor = "bg-red-500";
        statusText = "RETARD";
        statusBorder = "border-red-200";
    } else {
        statusText = "LIBRE";
    }

    const timeLeft = room.endTime ? Math.max(0, Math.floor((new Date(room.endTime) - new Date()) / 60000)) : 0;

    return (
        <div
            onClick={onClick}
            className={`relative h-48 rounded-xl border ${statusBorder} bg-white shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group`}
        >
            <div className={`h-1.5 w-full ${statusColor}`} />

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg text-slate-800">{room.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${statusColor}`}>
                        {statusText}
                    </span>
                </div>

                {['EN COURS', 'SUTURE / FERMETURE', 'PROGRAMMÉ'].includes(room.status) ? (
                    <div className="mt-auto space-y-2">
                        <div>
                            <p className="text-xs font-bold text-slate-900 line-clamp-2">{room.currentProcedure}</p>
                            <p className="text-xs text-slate-500">{room.surgeon}</p>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-blue-700">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-bold font-mono">{timeLeft} min</span>
                        </div>
                    </div>
                ) : room.status === 'NETTOYAGE' ? (
                    <div className="mt-auto flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-700">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-bold">Fin : {timeLeft} min</span>
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
