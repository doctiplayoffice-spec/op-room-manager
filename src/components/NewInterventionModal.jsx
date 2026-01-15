import { useMemo, useState, useEffect } from "react";
import { Wind, Thermometer, ShieldCheck, Info } from "lucide-react";

const NewInterventionModal = ({ open, onClose, onSchedule, defaultSalle, defaultDate, defaultTime, rooms }) => {
    const [form, setForm] = useState({
        patientId: "",
        salle: "",
        intervention: "",
        chirurgien: "",
        dureeMinutes: "",
        heureDebut: "", // "HH:MM"
        date: new Date().toISOString().split('T')[0], // Default to Today "YYYY-MM-DD"
    });

    useEffect(() => {
        if (open) {
            setForm(prev => ({
                patientId: "",
                salle: defaultSalle ? String(defaultSalle) : "",
                intervention: "",
                chirurgien: "",
                dureeMinutes: "",
                heureDebut: defaultTime || "",
                date: defaultDate || new Date().toISOString().split('T')[0],
            }));
        }
    }, [open, defaultSalle, defaultDate, defaultTime]);

    const errors = useMemo(() => {
        const e = {};
        if (!form.patientId.trim()) e.patientId = "Patient ID requis";
        if (!form.salle.trim()) e.salle = "N° Salle requis";
        if (!form.intervention.trim()) e.intervention = "Intervention requise";
        if (!form.chirurgien.trim()) e.chirurgien = "Chirurgien requis";
        if (!form.dureeMinutes.trim()) e.dureeMinutes = "Durée requise";
        if (form.dureeMinutes && Number(form.dureeMinutes) <= 0) e.dureeMinutes = "Durée invalide";
        if (!form.heureDebut.trim()) e.heureDebut = "Heure de début requise";
        if (!form.date) e.date = "Date requise";
        return e;
    }, [form]);

    const isValid = Object.keys(errors).length === 0;

    function update(key, value) {
        setForm((p) => ({ ...p, [key]: value }));
    }

    function handleCancel() {
        onClose?.();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!isValid) return;

        // Validation: Check if room is occupied
        // Note: 'rooms' prop must be passed from parent
        const selectedRoomId = Number(form.salle);
        const targetRoom = rooms?.find(r => r.id === selectedRoomId);

        if (targetRoom) {
            // New request times
            const [h, m] = form.heureDebut.split(':').map(Number);

            // Construct precise start time
            // Careful with timezones. form.date is YYYY-MM-DD.
            const [yy, mm, dd] = form.date.split('-').map(Number);
            const start = new Date(yy, mm - 1, dd, h, m, 0);
            const end = new Date(start.getTime() + Number(form.dureeMinutes) * 60000);

            // Check vs Active Operation (if IN_PROGRESS or DISINFECTION)
            // ONLY if today
            const now = new Date();
            const isToday = start.getDate() === now.getDate() && start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();

            // Check if status implies the room is blocked NOW
            // Ideally we should check if the *scheduled time* overlaps with the *current blocking*
            // But for simplicity, if scheduling for TODAY and room is busy NOW, we block.
            if (isToday && targetRoom.status !== 'LIBRE' && targetRoom.status !== 'PROGRAMMÉ') {
                // If status is IN_PROGRESS, CLOSING, DISINFECTION, we have busy times
                alert(`Impossible de programmer: La salle ${selectedRoomId} est actuellement ${targetRoom.status}. Attendez qu'elle soit LIBRE.`);
                return;
            }
        }

        const payload = {
            id: crypto?.randomUUID?.() ?? String(Date.now()),
            patientId: form.patientId.trim(),
            salle: Number(form.salle),
            intervention: form.intervention.trim(),
            chirurgien: form.chirurgien.trim(),
            dureeMinutes: Number(form.dureeMinutes),
            heureDebut: form.heureDebut,
            date: form.date, // Pass date string "YYYY-MM-DD"
            status: "PROGRAMMÉ", // Match the French status used in the app
            createdAt: new Date().toISOString(),
        };

        onSchedule?.(payload);
        onClose?.();
    }

    if (!open) return null;

    const selectedRoomId = Number(form.salle);
    const selectedRoom = rooms?.find(r => r.id === selectedRoomId);
    const isHyperSeptic = selectedRoom?.type === 'HYPER_SEPTIC';

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* fond */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCancel} />

            {/* panneau */}
            <div className={`relative w-full rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 transition-all ${isHyperSeptic ? 'max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden' : 'max-w-lg p-6'}`}>

                {/* Right Panel (Hyper Septic) - On Desktop: Order 2, On Mobile: Order 2 (Below) */}
                {/* Wait, design request: Left=Form, Right=Panel. */}
                {/* If isHyperSeptic is FALSE, we just render form content directly in the container (preserving old layout exactly if needed, or wrapping) 
                    To preserve "EXACTEMENT le modal actuel", I should handle the wrapping carefully.
                */}

                {/* Form Section */}
                <div className={`flex flex-col h-full ${isHyperSeptic ? 'p-6 lg:p-8 order-1' : ''}`}>
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">Nouvelle intervention</h2>
                            <p className="mt-1 text-sm text-slate-500 font-medium">Renseigne les infos puis clique sur Programmer.</p>
                        </div>

                        {!isHyperSeptic && (
                            <button
                                onClick={handleCancel}
                                className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                            >
                                <span className="text-xl leading-none">✕</span>
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <Field label="Patient ID" value={form.patientId} onChange={(v) => update("patientId", v)} error={errors.patientId} placeholder="Ex: P-001245" />

                        {/* Room Select Logic */}
                        {/* We use a simple select or existing field. Previous code used a type="number" input for room. 
                            If we want a dropdown to easily select rooms (and trigger hyper septic mode), we can keep the input or upgrade.
                            The user said "Ne pas modifier le formulaire". So I keep Field type="number".
                        */}
                        <Field label="N° Salle" type="number" value={form.salle} onChange={(v) => update("salle", v)} error={errors.salle} placeholder="Ex: 17 for Hyper Septic" />

                        <Field label="Intervention" value={form.intervention} onChange={(v) => update("intervention", v)} error={errors.intervention} placeholder="Ex: Cataracte" />
                        <Field label="Chirurgien" value={form.chirurgien} onChange={(v) => update("chirurgien", v)} error={errors.chirurgien} placeholder="Ex: Dr. Sarah Connor" />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field label="Date" type="date" value={form.date} onChange={(v) => update("date", v)} error={errors.date} />
                            <Field label="Heure de début" type="time" value={form.heureDebut} onChange={(v) => update("heureDebut", v)} error={errors.heureDebut} />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <Field label="Durée (minutes)" type="number" value={form.dureeMinutes} onChange={(v) => update("dureeMinutes", v)} error={errors.dureeMinutes} placeholder="Ex: 90" />
                        </div>

                        <div className="mt-4 flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>

                            <button
                                type="submit"
                                disabled={!isValid}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-blue-200 transition-all"
                            >
                                Programmer
                            </button>
                        </div>
                    </form>
                </div>

                {/* Hyper Septic Panel */}
                {isHyperSeptic && (
                    <RoomSpecsPanel room={selectedRoom} onClose={handleCancel} />
                )}

            </div>
        </div>
    );
}

const RoomSpecsPanel = ({ room, onClose }) => {
    const profile = room?.asepsisProfile;

    return (
        <div className="bg-purple-50 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-purple-100 flex flex-col h-full order-2">
            {/* Header with Close for Desktop */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-white bg-purple-600 px-2 py-0.5 rounded-full">
                            Hyper-Septique
                        </span>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                            {room.status}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-purple-900">{room.name}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 -mr-2 -mt-2 rounded-full text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors"
                >
                    <span className="text-xl leading-none">✕</span>
                </button>
            </div>

            {/* Profile Data */}
            {profile ? (
                <div className="space-y-6 flex-1 overflow-auto">

                    {/* Air Control */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest flex items-center gap-2">
                            <Wind className="w-4 h-4" /> Traitement d'Air
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <SpecCard label="Pression" value={`+${profile.pressure_pa_target} Pa`} sub={profile.pressure_mode} />
                            <SpecCard label="Renouvellement" value={`${profile.air_changes_per_hour} Vol/h`} sub="Extraction rapide" />
                            <SpecCard label="Filtration" value={profile.hepa_filter} sub="HEPA" />
                            <SpecCard label="Flux" value={profile.airflow} sub={`${profile.air_velocity_mps} m/s`} />
                        </div>
                    </div>

                    {/* Environment */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest flex items-center gap-2">
                            <Thermometer className="w-4 h-4" /> Ambiance
                        </h4>
                        <div className="bg-white rounded-xl border border-purple-100 p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-500 font-medium">Température</span>
                                <span className="text-sm font-bold text-slate-900">{profile.temp_c_min}°C - {profile.temp_c_max}°C</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">Humidité</span>
                                <span className="text-sm font-bold text-slate-900">{profile.humidity_pct_min}% - {profile.humidity_pct_max}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Protocols */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Protocoles
                        </h4>
                        <ul className="space-y-2">
                            <li className="flex items-center justify-between text-sm bg-purple-100/50 px-3 py-2 rounded-lg text-purple-900 font-medium">
                                <span>Nettoyage Standard</span>
                                <span className="font-bold">{profile.turnover_cleaning_min} min</span>
                            </li>
                            <li className="flex items-center justify-between text-sm bg-purple-100/50 px-3 py-2 rounded-lg text-purple-900 font-medium">
                                <span>Nettoyage Terminal</span>
                                <span className="font-bold">{profile.terminal_cleaning_min} min</span>
                            </li>
                            <li className="flex items-center justify-between text-sm bg-purple-100/50 px-3 py-2 rounded-lg text-purple-900 font-medium">
                                <span>Max. Personnel</span>
                                <span className="font-bold">{profile.max_people_recommended} pers.</span>
                            </li>
                        </ul>
                    </div>

                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Info className="w-12 h-12 text-purple-200 mb-2" />
                    <p className="text-purple-900 font-bold">Infos hyper-septiques indisponibles</p>
                    <p className="text-sm text-purple-600 mt-1">Les données de profil n'ont pas pu être chargées.</p>
                </div>
            )}
        </div>
    );
};

const SpecCard = ({ label, value, sub }) => (
    <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-800 leading-tight">{value}</p>
        <p className="text-[10px] text-slate-400 mt-1 truncate">{sub}</p>
    </div>
);

function Field({ label, value, onChange, error, placeholder, type = "text" }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2 text-sm outline-none transition-all duration-200 ${error ? "border-red-400 bg-red-50/50 focus:ring-4 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
            />
            {error ? <div className="text-[10px] font-bold text-red-500 uppercase tracking-tighter ml-1">{error}</div> : null}
        </div>
    );
}

export default NewInterventionModal;
