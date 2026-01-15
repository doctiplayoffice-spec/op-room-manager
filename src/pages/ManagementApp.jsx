import React, { useState, useEffect } from 'react';
import { Layout, Activity, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import Cockpit from '../components/Cockpit';
import SurgeryTimeline from '../components/SurgeryTimeline';
import WhoChecklist from '../components/WhoChecklist';
import SmartCalendar from '../components/SmartCalendar';
import StatsOverview from '../components/StatsOverview';
import NewInterventionModal from '../components/NewInterventionModal';
import CleaningModal from '../components/CleaningModal';
import OperationDetailsModal from '../components/OperationDetailsModal';
import RoomDetailsModal from '../components/RoomDetailsModal';
import { formatMoroccoDateTime } from '../utils/time';

// import { INITIAL_ROOMS } from '../data.js'; // REMOVE: Managed by hook
import { useTimeEngine } from '../hooks/useTimeEngine';
import { SurgeryStatus, EventType } from '../types';


const ManagementApp = () => {
    const [activeTab, setActiveTab] = useState('cockpit');
    // const [rooms, setRooms] = useState(INITIAL_ROOMS); // REMOVE: Managed by hook
    const { rooms, updateRoom: setSingleRoom, extendOperation, scheduleOperation, finishCleaning } = useTimeEngine(); // Use hook
    const [currentTime, setCurrentTime] = useState(formatMoroccoDateTime());
    const [viewDate, setViewDate] = useState(new Date()); // For Calendar navigation

    // Allow setRooms to work for compatibility if possible, or refactor usage.
    // The hook exposes `updateRoom` for single updates.
    // Ideally we refactor `setRooms` calls to use `updateRoom` or a batch update if needed.
    // For now, I'll create a compatibility wrapper locally if needed, but better to refactor handlers.

    // NOTE: The previous code passed `setRooms` essentially doing functional updates.
    // I need to adapt the handlers below to work with the hook's `updateRoom` or `rooms` state.
    // However, the hook is the source of truth.
    // Let's modify the handlers to use `setSingleRoom` or similar.

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(formatMoroccoDateTime(now));
            // Cleaning logic moved to useTimeEngine
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    // Modal State
    const [showTimeline, setShowTimeline] = useState(false);
    const [showCleaning, setShowCleaning] = useState(false);
    const [showDetails, setShowDetails] = useState(false); // New state for details
    const [selectedOperation, setSelectedOperation] = useState(null); // Data for details
    const [showChecklist, setShowChecklist] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showRoomDetails, setShowRoomDetails] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    // Prefill states
    const [prefillRoom, setPrefillRoom] = useState(null);
    const [prefillDate, setPrefillDate] = useState(null);
    const [prefillTime, setPrefillTime] = useState(null);

    // Derived State
    const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;

    // Helpers
    const extractRoomNumber = (room) => {
        const m = String(room?.name ?? "").match(/\d+/);
        return m ? Number(m[0]) : null;
    };

    const openNewIntervention = (roomNumber = null, date = null, time = null) => {
        setPrefillRoom(roomNumber);
        setPrefillDate(date ? date.toISOString().split('T')[0] : null);
        setPrefillTime(time || null);
        setShowNewModal(true);
    };

    // Handlers
    // Handlers
    // Handlers
    const handleRoomClick = (room) => {
        setSelectedRoomId(room.id);

        if (room.status === SurgeryStatus.DISINFECTION || room.status === SurgeryStatus.CLEANING) {
            // Cleaning -> Cleaning Modal
            setShowCleaning(true);
        } else {
            // All other states (Free, Scheduled, Active) -> Room Details / Fiche Salle
            setShowRoomDetails(true);
        }
    };

    const handleAddEvent = (type) => {
        if (!selectedRoom) return;

        // Determine new status based on event type
        let newStatus = selectedRoom.status;
        let newEndTime = selectedRoom.endTime;

        if (type === EventType.CLOSURE) {
            newStatus = SurgeryStatus.CLOSING; // "SUTURE / FERMETURE"
        } else if (type === EventType.PATIENT_EXIT) {
            // Trigger Disinfection directly (User Request: Skip Attention)
            newStatus = SurgeryStatus.DISINFECTION;
            const now = new Date();

            // Start 20min cleanup immediately
            const cleanupDuration = 20 * 60 * 1000;

            const updatedRoom = {
                ...selectedRoom,
                status: SurgeryStatus.DISINFECTION,
                operationEndAt: now, // Op ends now
                disinfectionStartAt: now, // Cleaning starts now
                disinfectionEndAt: new Date(now.getTime() + cleanupDuration),

                attentionStartAt: null,
                attentionEndAt: null,

                endTime: now, // For legacy display
                events: [...(selectedRoom.events || []), { type, time: now, user: 'Dr. Admin' }]
            };
            setSingleRoom(updatedRoom);
            return;
        } else if ([EventType.PATIENT_ENTRY, EventType.ANESTHESIA_INDUCTION, EventType.INCISION].includes(type)) {
            newStatus = SurgeryStatus.IN_PROGRESS;
        }

        // Default update for other events
        const newEvent = { type, time: new Date(), user: 'Dr. Admin' };

        // Ensure we don't duplicate events if user double clicks fast (though UI disables button)

        const updatedRoom = {
            ...selectedRoom,
            status: newStatus,
            endTime: newEndTime,
            events: [...(selectedRoom.events || []), newEvent]
        };

        setSingleRoom(updatedRoom);
        // No need to setSelectedRoom, it's derived
    };

    const handleToggleChecklist = (roomId, itemId) => {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            const updatedChecklist = room.checklist.map(i =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
            );
            const updatedRoom = { ...room, checklist: updatedChecklist };
            setSingleRoom(updatedRoom);
        }
    };

    const handleSchedule = (payload) => {
        const [h, m] = payload.heureDebut.split(':').map(Number);
        const [yy, mm, dd] = payload.date.split('-').map(Number);

        // Create start date based on Payload Date
        const start = new Date(yy, mm - 1, dd, h, m, 0);

        const durationMs = (payload.dureeMinutes || 60) * 60 * 1000;
        const end = new Date(start.getTime() + durationMs);

        const operationData = {
            id: payload.id,
            procedure: payload.intervention,
            surgeon: payload.chirurgien,
            start: start.toISOString(),
            end: end.toISOString(),
            created: new Date().toISOString()
        };

        scheduleOperation(payload.salle, operationData);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'cockpit':
                return (
                    <Cockpit
                        rooms={rooms}
                        onRoomClick={handleRoomClick}
                        onFreeRoomClick={(room) => openNewIntervention(extractRoomNumber(room))}
                    />
                );
            case 'planning':
                return (
                    <SmartCalendar
                        rooms={rooms}
                        onSlotClick={(room, hour, date) => {
                            const timeStr = `${String(hour).padStart(2, '0')}:00`;
                            openNewIntervention(extractRoomNumber(room), date, timeStr);
                        }}
                        onEventClick={(opData, room) => {
                            if (opData.status === 'active' || opData.status === 'cleaning') {
                                // Jump to cockpit for active stuff
                                handleRoomClick(room);
                                setActiveTab('cockpit');
                            } else {
                                // Show details for scheduled
                                setSelectedOperation(opData);
                                setSelectedRoomId(room.id);
                                setShowDetails(true);
                            }
                        }}
                        viewDate={viewDate}
                        onDateChange={setViewDate}
                    />
                );
            case 'stats':
                return <StatsOverview rooms={rooms} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 animate-in fade-in duration-500">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
                <div className="p-6 flex flex-col gap-4 border-b border-slate-800">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-medium group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Retour au site</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">SurgiTrack</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    <NavItem
                        id="cockpit"
                        label="Cockpit Live"
                        icon={<Layout className="w-5 h-5" />}
                        active={activeTab === 'cockpit'}
                        onClick={() => setActiveTab('cockpit')}
                    />
                    <NavItem
                        id="planning"
                        label="Planning"
                        icon={<Calendar className="w-5 h-5" />}
                        active={activeTab === 'planning'}
                        onClick={() => setActiveTab('planning')}
                    />
                    <NavItem
                        id="stats"
                        label="Statistiques"
                        icon={<BarChart3 className="w-5 h-5" />}
                        active={activeTab === 'stats'}
                        onClick={() => setActiveTab('stats')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">DA</div>
                        <div>
                            <p className="text-sm font-medium">Dr. Admin</p>
                            <p className="text-xs text-slate-400">Chef de Bloc</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <h1 className="text-xl font-bold text-slate-800">
                        {activeTab === 'cockpit' && 'Cockpit Temps Réel'}
                        {activeTab === 'planning' && 'Planning des Interventions'}
                        {activeTab === 'stats' && 'Tableau de Bord Statistiques'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                            {currentTime}
                        </span>
                        <button
                            onClick={() => openNewIntervention(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-sm"
                        >
                            <Calendar className="w-4 h-4" /> Programmer
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 relative">
                    {renderContent()}
                </div>
            </main>

            {/* Modals */}
            {showTimeline && selectedRoom && (
                <SurgeryTimeline
                    room={selectedRoom}
                    onClose={() => setShowTimeline(false)}
                    onAddEvent={handleAddEvent}
                    onOpenChecklist={() => setShowChecklist(true)}
                    onExtendOperation={extendOperation}
                />
            )}

            {showCleaning && selectedRoom && (
                <CleaningModal
                    room={selectedRoom}
                    onClose={() => setShowCleaning(false)}
                    onFinish={finishCleaning}
                />
            )}

            {showRoomDetails && selectedRoom && (
                <RoomDetailsModal
                    room={selectedRoom}
                    onClose={() => setShowRoomDetails(false)}
                    onOpenTraceability={() => {
                        setShowRoomDetails(false);
                        setShowTimeline(true);
                    }}
                    onUpdateRoom={setSingleRoom}
                />
            )}

            {showDetails && selectedOperation && (
                <OperationDetailsModal
                    operation={selectedOperation}
                    roomName={selectedRoom ? selectedRoom.name : 'Salle Inconnue'}
                    onClose={() => setShowDetails(false)}
                />
            )}

            {showChecklist && selectedRoom && (
                <WhoChecklist
                    room={selectedRoom}
                    onClose={() => setShowChecklist(false)}
                    onToggle={handleToggleChecklist}
                />
            )}

            <NewInterventionModal
                open={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSchedule={handleSchedule}
                defaultSalle={prefillRoom}
                defaultDate={prefillDate}
                defaultTime={prefillTime}
                rooms={rooms}
            />
        </div>
    );
};

const NavItem = ({ id, label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

export default ManagementApp;

