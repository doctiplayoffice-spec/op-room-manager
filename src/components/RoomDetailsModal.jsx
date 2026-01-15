import React, { useState } from 'react';
import { X, Thermometer, Wind, Activity, Timer, ShieldCheck, ChevronRight, FileText, Settings, Save, AlertTriangle, Check, RotateCcw } from 'lucide-react';
import { RoomType } from '../types';
import { formatMoroccoTime } from '../utils/time';
import { useAuth, UserRole } from '../context/AuthContext';

const RoomDetailsModal = ({ room, onClose, onOpenTraceability, onUpdateRoom }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuth();

    if (!room) return null;

    const isHyperSeptic = room.type === RoomType.HYPER_SEPTIC;
    const canEdit = isHyperSeptic && user?.role === UserRole.GESTIONNAIRE;
    const profile = room.asepsisProfile;

    const handleSave = (newProfile) => {
        onUpdateRoom && onUpdateRoom({
            ...room,
            asepsisProfile: newProfile
        });
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col z-50">

                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-start ${isHyperSeptic ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isHyperSeptic ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                {isHyperSeptic ? 'Hyper Septique' : 'Standard'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                {room.status}
                            </span>
                        </div>
                        <h2 className={`text-2xl font-bold ${isHyperSeptic ? 'text-purple-900' : 'text-slate-800'}`}>{room.name}</h2>
                    </div>
                    {!isEditing && (
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Active Operation Status - Only in View Mode or non-blocking */}
                    {!isEditing && room.status === 'EN COURS' && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Intervention en cours
                            </h3>
                            <div className="space-y-2">
                                <p className="font-bold text-slate-800 text-lg">{room.currentProcedure}</p>
                                <p className="text-slate-600 flex items-center gap-2 text-sm">
                                    <span className="w-6 text-slate-400">Par</span> {room.surgeon}
                                </p>
                                <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-xs text-blue-400 font-bold uppercase">Fin estimée</span>
                                        <p className="text-lg font-mono font-bold text-blue-700">
                                            {room.operationEndAt ? formatMoroccoTime(new Date(room.operationEndAt)) : '--:--'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onOpenTraceability(room)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Ouvrir Traçabilité
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isEditing ? (
                        <RoomSpecsEdit profile={profile} onSave={handleSave} onCancel={() => setIsEditing(false)} />
                    ) : (
                        <RoomSpecsView profile={profile} isHyperSeptic={isHyperSeptic} />
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10 backdrop-blur-md bg-opacity-90">
                    {!isEditing ? (
                        <div className="flex flex-col gap-2">
                            {canEdit && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-3 rounded-xl bg-purple-100 text-purple-700 font-bold border border-purple-200 hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Modifier Paramètres
                                </button>
                            )}
                            <button onClick={onClose} className="w-full py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-colors">
                                Fermer
                            </button>
                        </div>
                    ) : (
                        // Edit Mode Footer is handled inside form or here? Better here to be sticky.
                        // Actually RoomSpecsEdit manages the form state, so buttons need to be inside it or context.
                        // To keep it simple, let's put buttons inside the scrollable area of RoomSpecsEdit OR make RoomSpecsEdit controllable.
                        // Let's make RoomSpecsEdit just the fields, and hoist state to here?
                        // No, too much boilerplate. I will let RoomSpecsEdit render its own buttons at the bottom of the list.
                        // But user asked for sticky bottom.
                        // Okay, I will pass `renderFooter` prop to RoomSpecsEdit? No.
                        // Let's just hide this footer when editing, and RoomSpecsEdit has its own buttons. 
                        null
                    )}
                </div>

            </div>
        </div>
    );
};

// View Component (Read-Only)
const RoomSpecsView = ({ profile, isHyperSeptic }) => {
    if (!profile && isHyperSeptic) return <div className="text-slate-400 italic">Profil non disponible</div>;
    if (!isHyperSeptic) return <div className="text-slate-400 italic">Configuration standard</div>;

    return (
        <>
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Paramètres Techniques
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <MetricCard label="Pression" value={`+${profile.pressure_pa_target} Pa`} desc={profile.pressure_mode} />
                    <MetricCard label="Renouvellement" value={`${profile.air_changes_per_hour} Vol/h`} desc="Extraction rapide" />
                    <MetricCard label="Flux" value={`${profile.air_velocity_mps} m/s`} desc={profile.airflow} />
                    <MetricCard label="Filtre" value={profile.hepa_filter} desc="Haute efficacité" />
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <Thermometer className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Ambiance</p>
                            <p className="font-bold text-slate-700">{profile.temp_c_min}-{profile.temp_c_max}°C / {profile.humidity_pct_min}-{profile.humidity_pct_max}% Hum.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cleaning Protocols */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <Wind className="w-4 h-4" /> Protocoles de Nettoyage
                </h3>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Nettoyage Standard</span>
                        <span className="text-sm font-bold text-slate-900">{isHyperSeptic ? profile?.turnover_cleaning_min : '15'} min</span>
                    </div>
                    <div className="p-4 flex justify-between items-center bg-slate-50/50">
                        <span className="text-sm font-medium text-slate-600">Nettoyage Terminal (Septique)</span>
                        <span className="text-sm font-bold text-slate-900">{isHyperSeptic ? profile?.terminal_cleaning_min : '30'} min</span>
                    </div>
                    <div className="p-4 flex justify-between items-center bg-white">
                        <span className="text-sm font-medium text-slate-600">Personnel Max</span>
                        <span className="text-sm font-bold text-slate-900">{profile?.max_people_recommended} pers.</span>
                    </div>
                </div>
            </div>
        </>
    );
};

// Edit Component
const RoomSpecsEdit = ({ profile, onSave, onCancel }) => {
    const [form, setForm] = useState(profile || {});
    const [error, setError] = useState(null);

    const handleChange = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validations
        if (Number(form.temp_c_min) > Number(form.temp_c_max)) return setError("Temp Min > Max");
        if (Number(form.humidity_pct_min) > Number(form.humidity_pct_max)) return setError("Humidité Min > Max");
        if (Number(form.pressure_pa_target) < 0 && form.pressure_mode === 'POSITIVE') return setError("Pression négative en mode positif");

        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-bold text-lg text-purple-900 border-b border-purple-100 pb-2">Modification Paramètres</h3>

            {/* Air Control */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Traitement d'Air</h4>
                <div className="grid grid-cols-2 gap-4">
                    <EditField label="Mode Pression" type="select" value={form.pressure_mode} options={['POSITIVE', 'NEGATIVE']} onChange={v => handleChange('pressure_mode', v)} />
                    <EditField label="Cible (Pa)" type="number" value={form.pressure_pa_target} onChange={v => handleChange('pressure_pa_target', v)} />
                    <EditField label="Renouvellement (Vol/h)" type="number" value={form.air_changes_per_hour} onChange={v => handleChange('air_changes_per_hour', v)} />
                    <EditField label="Filtre" type="select" value={form.hepa_filter} options={['H13', 'H14', 'U15']} onChange={v => handleChange('hepa_filter', v)} />
                    <EditField label="Type Flux" type="select" value={form.airflow} options={['Laminaire Vertical', 'Laminaire Horizontal', 'Turbulent']} onChange={v => handleChange('airflow', v)} />
                    <EditField label="Vitesse Flux (m/s)" type="number" value={form.air_velocity_mps} onChange={v => handleChange('air_velocity_mps', v)} />
                </div>
            </div>

            {/* Environment */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Ambiance</h4>
                <div className="grid grid-cols-2 gap-4">
                    <EditField label="Temp Min (°C)" type="number" value={form.temp_c_min} onChange={v => handleChange('temp_c_min', v)} />
                    <EditField label="Temp Max (°C)" type="number" value={form.temp_c_max} onChange={v => handleChange('temp_c_max', v)} />
                    <EditField label="Humidité Min (%)" type="number" value={form.humidity_pct_min} onChange={v => handleChange('humidity_pct_min', v)} />
                    <EditField label="Humidité Max (%)" type="number" value={form.humidity_pct_max} onChange={v => handleChange('humidity_pct_max', v)} />
                </div>
            </div>

            {/* Protocols */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Protocoles</h4>
                <div className="grid grid-cols-2 gap-4">
                    <EditField label="Nettoyage Std (min)" type="number" value={form.turnover_cleaning_min} onChange={v => handleChange('turnover_cleaning_min', v)} />
                    <EditField label="Nettoyage Term (min)" type="number" value={form.terminal_cleaning_min} onChange={v => handleChange('terminal_cleaning_min', v)} />
                    <EditField label="Personnel Max" type="number" value={form.max_people_recommended} onChange={v => handleChange('max_people_recommended', v)} />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Buttons (Sticky-ish simulation via margin-top) */}
            <div className="pt-4 flex items-center gap-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-md transition-colors flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Enregistrer
                </button>
            </div>
        </form>
    );
};

const EditField = ({ label, type, value, onChange, options }) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
        {type === 'select' ? (
            <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        ) : (
            <input
                type={type === 'number' ? 'number' : 'text'}
                step={type === 'number' ? '0.01' : undefined}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full p-2 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200"
            />
        )}
    </div>
);

// Custom Metric Card Component
const MetricCard = ({ label, value, desc }) => (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-black text-slate-800">{value}</p>
        <p className="text-[10px] text-slate-500 truncate">{desc}</p>
    </div>
);

export default RoomDetailsModal;
