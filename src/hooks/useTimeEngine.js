import { useState, useEffect, useRef } from 'react';
import { SurgeryStatus } from '../types';
import { INITIAL_ROOMS } from '../data';

/**
 * Custom hook to manage time-driven room states.
 * @returns {Object} { rooms, updateRoom, extendOperation }
 */
export const useTimeEngine = () => {
    // Initialize state from localStorage or default data
    const [rooms, setRooms] = useState(() => {
        let loadedRooms = INITIAL_ROOMS;
        const saved = localStorage.getItem('surgiTrack_rooms');
        if (saved) {
            try {
                loadedRooms = JSON.parse(saved, (key, value) => {
                    if (key.endsWith('At') || key === 'endTime' || key === 'time') {
                        return value ? new Date(value) : null;
                    }
                    return value;
                });
            } catch (e) {
                console.error("Failed to parse rooms from storage", e);
            }
        }

        // Data Migration / Normalization
        // Ensure operationEndAt exists if status is IN_PROGRESS (legacy data fix)
        return loadedRooms.map(room => {
            // Merge with static definition to update names/types if they changed in code
            const staticDef = INITIAL_ROOMS.find(r => r.id === room.id);

            let r = {
                ...room,
                // Force update name/type from static config
                name: staticDef?.name || room.name,
                type: staticDef?.type || room.type || 'standard',
                asepsisProfile: staticDef?.asepsisProfile || room.asepsisProfile || null
            };

            if (r.status === SurgeryStatus.IN_PROGRESS && !r.operationEndAt && r.endTime) {
                r.operationEndAt = r.endTime;
            }
            // Ensure schedule exists
            if (!r.schedule) r.schedule = [];
            return r;
        });
    });

    const roomsRef = useRef(rooms);

    // Keep ref in sync for interval callback
    useEffect(() => {
        roomsRef.current = rooms;
        localStorage.setItem('surgiTrack_rooms', JSON.stringify(rooms));
    }, [rooms]);

    // State Evaluator (Waterfall)
    const evaluateRoomState = (room, now) => {
        let modified = false;
        let newRoom = { ...room };

        // Loop until stable
        let stable = false;
        while (!stable) {
            stable = true;

            // 0. CHECK SCHEDULE FOR AUTO-START
            // Only if room is currently Free or Programmed (waiting)
            if (newRoom.status === 'LIBRE' || newRoom.status === SurgeryStatus.SCHEDULED) {
                if (newRoom.schedule && newRoom.schedule.length > 0) {
                    // Find if any operation should be active NOW
                    const activeOp = newRoom.schedule.find(op => {
                        const start = new Date(op.start);
                        const end = new Date(op.end);
                        return now >= start && now < end;
                    });

                    if (activeOp) {
                        // START OPERATION
                        newRoom.status = SurgeryStatus.IN_PROGRESS;
                        newRoom.currentProcedure = activeOp.procedure;
                        newRoom.surgeon = activeOp.surgeon;
                        newRoom.currentSurgeryId = activeOp.id;
                        newRoom.operationStartAt = new Date(activeOp.start);
                        newRoom.operationEndAt = new Date(activeOp.end);
                        newRoom.endTime = new Date(activeOp.end); // Legacy

                        // Remove from schedule? Or keep as history? 
                        // For now remove to avoid re-triggering, or filter by 'completed'
                        // Let's remove it from the pending schedule
                        newRoom.schedule = newRoom.schedule.filter(op => op.id !== activeOp.id);

                        modified = true;
                        stable = false; // Re-evaluate, though IN_PROGRESS is stable until end
                    }
                }
            }

            // 1. OPERATION_ENDED_ATTENTION -> DISINFECTION
            if (newRoom.status === SurgeryStatus.OPERATION_ENDED_ATTENTION) {
                const attEnd = newRoom.attentionEndAt ? new Date(newRoom.attentionEndAt) : null;
                // If past attention time
                if (attEnd && !isNaN(attEnd.getTime()) && now >= attEnd) {
                    newRoom.status = SurgeryStatus.DISINFECTION;
                    newRoom.operationEndAt = attEnd; // Sync
                    newRoom.disinfectionStartAt = attEnd;

                    const durationMin = newRoom.asepsisProfile?.turnover_cleaning_min || 20;
                    newRoom.disinfectionEndAt = new Date(attEnd.getTime() + durationMin * 60 * 1000);

                    newRoom.attentionStartAt = null;
                    newRoom.attentionEndAt = null;
                    modified = true;
                    stable = false;
                }
            }

            // 2. IN_PROGRESS -> DISINFECTION (Fallback if not going through attention)
            if (newRoom.status === SurgeryStatus.IN_PROGRESS) {
                const rawEnd = newRoom.operationEndAt || newRoom.endTime;
                const effectiveEnd = rawEnd ? new Date(rawEnd) : null;

                if (effectiveEnd && !isNaN(effectiveEnd.getTime()) && now >= effectiveEnd) {
                    newRoom.status = SurgeryStatus.DISINFECTION;
                    newRoom.operationEndAt = effectiveEnd;
                    newRoom.disinfectionStartAt = effectiveEnd;

                    const durationMin = newRoom.asepsisProfile?.turnover_cleaning_min || 20;
                    newRoom.disinfectionEndAt = new Date(effectiveEnd.getTime() + durationMin * 60 * 1000);

                    newRoom.attentionStartAt = null;
                    newRoom.attentionEndAt = null;
                    modified = true;
                    stable = false;
                }
            }
            // 2. DISINFECTION -> AVAILABLE
            else if (newRoom.status === SurgeryStatus.DISINFECTION || newRoom.status === SurgeryStatus.CLEANING) {
                if (newRoom.status === SurgeryStatus.CLEANING) {
                    newRoom.status = SurgeryStatus.DISINFECTION;
                    modified = true;
                }

                let disEnd = newRoom.disinfectionEndAt ? new Date(newRoom.disinfectionEndAt) : null;
                if (!disEnd && newRoom.disinfectionStartAt) {
                    const start = new Date(newRoom.disinfectionStartAt);
                    const durationMin = newRoom.asepsisProfile?.turnover_cleaning_min || 20;
                    disEnd = new Date(start.getTime() + durationMin * 60 * 1000);
                    newRoom.disinfectionEndAt = disEnd;
                }
                else if (!disEnd && !newRoom.disinfectionStartAt) {
                    const nowStart = new Date();
                    newRoom.disinfectionStartAt = nowStart; // Start NOW
                    const durationMin = newRoom.asepsisProfile?.turnover_cleaning_min || 20;
                    disEnd = new Date(nowStart.getTime() + durationMin * 60 * 1000);
                    newRoom.disinfectionEndAt = disEnd;
                    modified = true;
                    stable = false;
                }

                if (disEnd && !isNaN(disEnd.getTime()) && now >= disEnd) {
                    newRoom.status = 'LIBRE';
                    // Clear active data
                    newRoom.currentProcedure = null;
                    newRoom.surgeon = null;
                    newRoom.currentSurgeryId = null;
                    newRoom.operationStartAt = null;
                    newRoom.operationEndAt = null;
                    newRoom.disinfectionStartAt = null;
                    newRoom.disinfectionEndAt = null;
                    newRoom.checklist = room.checklist.map(c => ({ ...c, checked: false }));
                    newRoom.events = [];

                    modified = true;
                    stable = false; // Re-evaluate (check schedule immediately!)
                }
            }
        }

        return modified ? newRoom : null;
    };

    // Global Ticker
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            let hasChanges = false;

            const nextRooms = roomsRef.current.map(room => {
                const updatedRoom = evaluateRoomState(room, now);
                if (updatedRoom) {
                    hasChanges = true;
                    return updatedRoom;
                }
                return room;
            });

            if (hasChanges) {
                setRooms(nextRooms);
            }
        };

        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const updateRoom = (updatedRoom) => {
        setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    };

    const extendOperation = (roomId, minutes) => {
        setRooms(prev => prev.map(r => {
            if (r.id === roomId && r.status === SurgeryStatus.IN_PROGRESS && r.operationEndAt) {
                const newEnd = new Date(r.operationEndAt.getTime() + minutes * 60000);
                return { ...r, operationEndAt: newEnd, endTime: newEnd };
            }
            return r;
        }));
    };

    const scheduleOperation = (roomId, operationData) => {
        setRooms(prev => prev.map(r => {
            if (r.id === roomId) {
                const newSchedule = [...(r.schedule || []), operationData];
                // Sort by start time
                newSchedule.sort((a, b) => new Date(a.start) - new Date(b.start));

                // If room is Free, maybe update status to Scheduled visual?
                let newStatus = r.status;
                // Optional: if first in line and not started, show as PROGRAMMÉ

                return { ...r, schedule: newSchedule, status: newStatus };
            }
            return r;
        }));
    };

    const finishCleaning = (roomId) => {
        setRooms(prev => prev.map(r => {
            if (r.id === roomId && (r.status === SurgeryStatus.DISINFECTION || r.status === SurgeryStatus.CLEANING)) {
                return {
                    ...r,
                    status: 'LIBRE',
                    currentProcedure: null,
                    surgeon: null,
                    currentSurgeryId: null,
                    operationStartAt: null,
                    operationEndAt: null,
                    disinfectionStartAt: null,
                    disinfectionEndAt: null,
                    checklist: r.checklist.map(c => ({ ...c, checked: false })),
                    events: []
                };
            }
            return r;
        }));
    };

    return {
        rooms,
        updateRoom,
        extendOperation,
        scheduleOperation,
        finishCleaning
    };
};
