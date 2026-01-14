import React, { useState, useEffect } from 'react';
import { Layout, Activity, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import Cockpit from '../components/Cockpit';
import SurgeryTimeline from '../components/SurgeryTimeline';
import WhoChecklist from '../components/WhoChecklist';
import SmartCalendar from '../components/SmartCalendar';
import StatsOverview from '../components/StatsOverview';
import NewInterventionModal from '../components/NewInterventionModal';
import VoiceAssistant from '../components/VoiceAssistant';
import { formatMoroccoDateTime } from '../utils/time';
import { INITIAL_ROOMS } from '../data.js';
import { SurgeryStatus, EventType } from '../types';


const ManagementApp = () => {
    const [activeTab, setActiveTab] = useState('cockpit');
    const [rooms, setRooms] = useState(INITIAL_ROOMS);
    const [currentTime, setCurrentTime] = useState(formatMoroccoDateTime());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(formatMoroccoDateTime(now));

            // Check for rooms that finished cleaning
            setRooms(prevRooms => prevRooms.map(room => {
                if (room.status === SurgeryStatus.CLEANING && room.endTime && new Date(room.endTime) <= now) {
                    return {
                        ...room,
                        status: 'LIBRE',
                        currentProcedure: null,
                        surgeon: null,
                        currentSurgeryId: null,
                        endTime: null,
                        checklist: room.checklist.map(c => ({ ...c, checked: false })), // Reset checklist
                        events: [] // Clear events
                    };
                }
                return room;
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    // Modal State
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [prefillRoom, setPrefillRoom] = useState(null);

    // Helpers
    const extractRoomNumber = (room) => {
        const m = String(room?.name ?? "").match(/\d+/);
        return m ? Number(m[0]) : null;
    };

    const openNewIntervention = (roomNumber = null) => {
        setPrefillRoom(roomNumber);
        setShowNewModal(true);
    };

    // Handlers
    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        // Check new French statuses
        const activeStatuses = ['EN COURS', 'SUTURE / FERMETURE', 'NETTOYAGE', 'PRÉPARATION'];
        if (activeStatuses.includes(room.status)) {
            setShowTimeline(true);
        } else {
            // Todo: Open simple form for 'free' rooms (omitted for brevity in this step)
            // We can just switch to planning tab as a mock action
            setActiveTab('planning');
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
            newStatus = SurgeryStatus.CLEANING; // "NETTOYAGE"
            // Set timer for 20 minutes from now
            newEndTime = new Date(Date.now() + 20 * 60 * 1000);
        } else if ([EventType.PATIENT_ENTRY, EventType.ANESTHESIA_INDUCTION, EventType.INCISION].includes(type)) {
            newStatus = SurgeryStatus.IN_PROGRESS;
        }

        // Update local state (optimistic UI)
        const updatedRooms = rooms.map(r => {
            if (r.id === selectedRoom.id) {
                const newEvent = { type, time: new Date(), user: 'Dr. Admin' };
                const updatedRoom = {
                    ...r,
                    status: newStatus,
                    endTime: newEndTime,
                    events: [...(r.events || []), newEvent]
                };
                setSelectedRoom(updatedRoom); // Keep modal in sync
                return updatedRoom;
            }
            return r;
        });
        setRooms(updatedRooms);
    };

    const handleToggleChecklist = (roomId, itemId) => {
        const updatedRooms = rooms.map(r => {
            if (r.id === roomId) {
                const updatedChecklist = r.checklist.map(i =>
                    i.id === itemId ? { ...i, checked: !i.checked } : i
                );
                const updatedRoom = { ...r, checklist: updatedChecklist };
                if (selectedRoom?.id === roomId) setSelectedRoom(updatedRoom);
                return updatedRoom;
            }
            return r;
        });
        setRooms(updatedRooms);
    };

    const handleSchedule = (payload) => {
        const updatedRooms = rooms.map(r => {
            if (r.id === payload.salle) {
                return {
                    ...r,
                    status: SurgeryStatus.IN_PROGRESS, // Directly to "EN COURS" as requested
                    currentProcedure: payload.intervention,
                    surgeon: payload.chirurgien,
                    currentSurgeryId: payload.id,
                    // Note: We could also update endTime based on dureeMinutes if needed
                };
            }
            return r;
        });
        setRooms(updatedRooms);
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
                return <SmartCalendar rooms={rooms} onSlotClick={() => { }} />;
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
            />

            {/* Voice Assistant */}
            <VoiceAssistant />
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

