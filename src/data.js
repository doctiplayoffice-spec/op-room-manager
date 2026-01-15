import { SurgeryStatus, StaffRole, EventType, ChecklistPhases, RoomType } from './types.js';

export const STAFF = [
    { id: 's1', name: 'Dr. Hachem Sayegh', role: StaffRole.SURGEON, specialty: 'Orthopédie' },
    { id: 's2', name: 'Dr. Marie Curie', role: StaffRole.SURGEON, specialty: 'Neurochirurgie' },
    { id: 's3', name: 'Dr. Alain Prost', role: StaffRole.SURGEON, specialty: 'Cardiologie' },
    { id: 's4', name: 'Dr. Sarah Connor', role: StaffRole.SURGEON, specialty: 'Ophtalmologie' },
    { id: 's5', name: 'Dr. Gregory House', role: StaffRole.SURGEON, specialty: 'Diagnostic' },
    { id: 'a1', name: 'Dr. Luc Besson', role: StaffRole.ANESTHESIOLOGIST },
    { id: 'a2', name: 'Dr. Claire Redfield', role: StaffRole.ANESTHESIOLOGIST },
    { id: 'n1', name: 'Julie Martin', role: StaffRole.IBODE },
    { id: 'n2', name: 'Thomas Bernard', role: StaffRole.IADE },
    { id: 'n3', name: 'Lara Croft', role: StaffRole.IBODE },
    { id: 'n4', name: 'Leon Kennedy', role: StaffRole.IADE }
];

export const DEFAULT_CHECKLIST = [
    { id: 'c1', label: 'Identité patient vérifiée', checked: true, phase: 'BEFORE_INDUCTION' },
    { id: 'c2', label: 'Site opératoire marqué', checked: true, phase: 'BEFORE_INDUCTION' },
    { id: 'c3', label: 'Vérification matériel anesthésie', checked: true, phase: 'BEFORE_INDUCTION' },
    { id: 'c4', label: 'Confirmation identité et site par l\'équipe', checked: false, phase: 'BEFORE_INCISION' },
    { id: 'c5', label: 'Antibioprophylaxie faite <60min', checked: false, phase: 'BEFORE_INCISION' },
    { id: 'c6', label: 'Comptage final compresses/aiguilles', checked: false, phase: 'BEFORE_EXIT' },
    { id: 'c7', label: 'Étiquetage des échantillons', checked: false, phase: 'BEFORE_EXIT' },
];

// Re-export EventType for legacy consumers (if any) or consistency
export { EventType };

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

const createDate = (baseDate, hours, minutes = 0) => {
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
};

export const INITIAL_SURGERIES = [
    // --- AUJOURD'HUI ---
    {
        id: 'op-101',
        patientId: 'PT-8821',
        procedureName: 'Arthroplastie Totale de Hanche',
        roomNumber: 1,
        status: SurgeryStatus.IN_PROGRESS,
        start: createDate(today, 8, 30),
        end: createDate(today, 10, 30),
        surgeon: STAFF[0],
        anesthesiologist: STAFF[5],
        events: [
            { type: EventType.PATIENT_ENTRY, time: createDate(today, 8, 45), user: 'Julie Martin' },
            { type: EventType.ANESTHESIA_INDUCTION, time: createDate(today, 9, 0), user: 'Thomas Bernard' },
            { type: EventType.INCISION, time: createDate(today, 9, 20), user: 'Dr. Sayegh' }
        ],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-102',
        patientId: 'PT-4432',
        procedureName: 'Craniotomie',
        roomNumber: 2,
        status: SurgeryStatus.SCHEDULED,
        start: createDate(today, 13, 0),
        end: createDate(today, 17, 0),
        surgeon: STAFF[1],
        anesthesiologist: STAFF[5],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-103',
        patientId: 'PT-1234',
        procedureName: 'Pontage Coronarien',
        roomNumber: 3,
        status: SurgeryStatus.CLEANING,
        start: createDate(today, 9, 0),
        end: createDate(today, 14, 0),
        surgeon: STAFF[2],
        anesthesiologist: STAFF[6],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-104',
        patientId: 'PT-5678',
        procedureName: 'Cataracte Phaco',
        roomNumber: 4,
        status: SurgeryStatus.COMPLETED,
        start: createDate(today, 8, 0),
        end: createDate(today, 9, 0),
        surgeon: STAFF[3],
        anesthesiologist: STAFF[6],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-105',
        patientId: 'PT-5679',
        procedureName: 'Cataracte (2e œil)',
        roomNumber: 4,
        status: SurgeryStatus.IN_PROGRESS,
        start: createDate(today, 9, 30),
        end: createDate(today, 10, 30),
        surgeon: STAFF[3],
        anesthesiologist: STAFF[6],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-107',
        patientId: 'PT-0001',
        procedureName: 'Laminectomie',
        roomNumber: 6,
        status: SurgeryStatus.SCHEDULED,
        start: createDate(today, 11, 0),
        end: createDate(today, 13, 30),
        surgeon: STAFF[1],
        anesthesiologist: STAFF[5],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    }
];

export const INITIAL_ROOMS = Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    // Note: status is strictly matched to what's defined in INITIAL_SURGERIES or 'LIBRE' if not
    // Logic: busy -> IN_PROGRESS, Cleaning -> CLEANING, Scheduled -> (usually handled differently in cockpit, but here we can check)

    // We want the room to reflect the CURRENT status.
    const activeOp = INITIAL_SURGERIES.find(op =>
        op.roomNumber === id &&
        (op.status === SurgeryStatus.IN_PROGRESS || op.status === SurgeryStatus.CLEANING || op.status === SurgeryStatus.CLOSING)
    );

    const isHyperSeptic = id >= 17;
    const roomType = isHyperSeptic ? RoomType.HYPER_SEPTIC : RoomType.STANDARD;

    // Hyper-Septic Profile
    const asepsisProfile = isHyperSeptic ? {
        pressure_mode: 'POSITIVE',
        pressure_pa_target: 15,
        air_changes_per_hour: 30,
        hepa_filter: 'H14',
        airflow: 'Laminaire Vertical',
        air_velocity_mps: 0.30,
        temp_c_min: 18,
        temp_c_max: 20,
        humidity_pct_min: 40,
        humidity_pct_max: 60,
        turnover_cleaning_min: 20, // Reinforced default
        terminal_cleaning_min: 45,
        max_people_recommended: 4
    } : null;

    if (activeOp) {
        return {
            id: id,
            name: isHyperSeptic ? `Salle Hyper Septique ${id}` : `Salle ${id}`,
            type: roomType,
            asepsisProfile: asepsisProfile,
            status: activeOp.status,
            currentProcedure: activeOp.procedureName,
            surgeon: activeOp.surgeon.name,
            endTime: activeOp.end,
            events: activeOp.events,
            checklist: activeOp.checklist,
            currentSurgeryId: activeOp.id,
            schedule: []
        };
    } else {
        return {
            id: id,
            name: isHyperSeptic ? `Salle Hyper Septique ${id}` : `Salle ${id}`,
            type: roomType,
            asepsisProfile: asepsisProfile,
            status: 'LIBRE',
            currentProcedure: null,
            surgeon: null,
            endTime: null,
            events: [],
            checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)),
            currentSurgeryId: null,
            schedule: []
        };
    }
});
