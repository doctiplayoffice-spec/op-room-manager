import { useMemo, useState, useEffect } from "react";

export default function NewInterventionModal({ open, onClose, onSchedule, defaultSalle }) {
    const [form, setForm] = useState({
        patientId: "",
        salle: "",
        intervention: "",
        chirurgien: "",
        dureeMinutes: "",
        heureDebut: "", // "HH:MM"
    });

    useEffect(() => {
        if (open) {
            if (defaultSalle) {
                setForm((prev) => ({ ...prev, salle: String(defaultSalle) }));
            } else {
                // Reset form when opening via button
                setForm({
                    patientId: "",
                    salle: "",
                    intervention: "",
                    chirurgien: "",
                    dureeMinutes: "",
                    heureDebut: "",
                });
            }
        }
    }, [open, defaultSalle]);

    const errors = useMemo(() => {
        const e = {};
        if (!form.patientId.trim()) e.patientId = "Patient ID requis";
        if (!form.salle.trim()) e.salle = "N° Salle requis";
        if (!form.intervention.trim()) e.intervention = "Intervention requise";
        if (!form.chirurgien.trim()) e.chirurgien = "Chirurgien requis";
        if (!form.dureeMinutes.trim()) e.dureeMinutes = "Durée requise";
        if (form.dureeMinutes && Number(form.dureeMinutes) <= 0) e.dureeMinutes = "Durée invalide";
        if (!form.heureDebut.trim()) e.heureDebut = "Heure de début requise";
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

        const payload = {
            id: crypto?.randomUUID?.() ?? String(Date.now()),
            patientId: form.patientId.trim(),
            salle: Number(form.salle),
            intervention: form.intervention.trim(),
            chirurgien: form.chirurgien.trim(),
            dureeMinutes: Number(form.dureeMinutes),
            heureDebut: form.heureDebut,
            status: "PROGRAMMÉ", // Match the French status used in the app
            createdAt: new Date().toISOString(),
        };

        onSchedule?.(payload);
        onClose?.();
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* fond */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCancel} />

            {/* panneau */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Nouvelle intervention</h2>
                        <p className="mt-1 text-sm text-slate-500 font-medium">Renseigne les infos puis clique sur Programmer.</p>
                    </div>

                    <button
                        onClick={handleCancel}
                        className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                    >
                        <span className="text-xl leading-none">✕</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                    <Field label="Patient ID" value={form.patientId} onChange={(v) => update("patientId", v)} error={errors.patientId} placeholder="Ex: P-001245" />
                    <Field label="N° Salle" type="number" value={form.salle} onChange={(v) => update("salle", v)} error={errors.salle} placeholder="Ex: 3" />
                    <Field label="Intervention" value={form.intervention} onChange={(v) => update("intervention", v)} error={errors.intervention} placeholder="Ex: Cataracte (2e oeil)" />
                    <Field label="Chirurgien" value={form.chirurgien} onChange={(v) => update("chirurgien", v)} error={errors.chirurgien} placeholder="Ex: Dr. Sarah Connor" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Durée (minutes)" type="number" value={form.dureeMinutes} onChange={(v) => update("dureeMinutes", v)} error={errors.dureeMinutes} placeholder="Ex: 90" />
                        <Field label="Heure de début" type="time" value={form.heureDebut} onChange={(v) => update("heureDebut", v)} error={errors.heureDebut} />
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
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
        </div>
    );
}

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
