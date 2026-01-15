export const SurgeryStatus = {
    SCHEDULED: 'PROGRAMMÉ',
    PREPARING: 'PRÉPARATION',
    IN_PROGRESS: 'EN COURS',
    CLOSING: 'SUTURE / FERMETURE',
    OPERATION_ENDED_ATTENTION: 'ATTENTION (FIN OPÉRATION)',
    DISINFECTION: 'DÉSINFECTION',
    CLEANING: 'NETTOYAGE', // Deprecated but kept for compatibility if needed
    COMPLETED: 'TERMINÉ',
    DELAYED: 'EN RETARD'
};

export const StaffRole = {
    SURGEON: 'Chirurgien',
    ANESTHESIOLOGIST: 'Anesthésiste',
    IBODE: 'IBODE',
    IADE: 'IADE'
};

export const EventType = {
    PATIENT_ENTRY: 'Entrée Patient',
    ANESTHESIA_INDUCTION: 'Induction Anesthésique',
    INCISION: 'Incision',
    KEY_GESTURE: 'Geste Opératoire Clé',
    CLOSURE: 'Fermeture',
    PATIENT_EXIT: 'Sortie de Salle'
};

export const ChecklistPhases = {
    BEFORE_INDUCTION: 'Avant Induction',
    BEFORE_INCISION: 'Time-Out (Avant Incision)',
    BEFORE_EXIT: 'Avant Sortie de Salle'
};

export const RoomType = {
    STANDARD: 'STANDARD',
    SEPTIC: 'SEPTIC',
    HYPER_SEPTIC: 'HYPER_SEPTIC'
};
