import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert, KeyRound, AlertCircle, ArrowRight, Activity, Loader2 } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';

const AuthPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState(UserRole.INTERVENANT);
    const [pin, setPin] = useState('');
    const [secondary, setSecondary] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(role, pin, secondary);
            navigate('/app');
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            // Shake effect or focus reset could be added here
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
            background: `
                linear-gradient(rgba(7,26,43,.8), rgba(7,26,43,.6)),
                url("https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=2200&q=60")
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat'
        }}>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <Activity className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Authentification</h1>
                    <p className="text-slate-500 text-sm font-medium">Accompagnement Bloc Opératoire</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${role === UserRole.INTERVENANT ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
                        onClick={() => { setRole(UserRole.INTERVENANT); setError(null); }}
                    >
                        <User className="w-4 h-4" /> Intervenant
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${role === UserRole.GESTIONNAIRE ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
                        onClick={() => { setRole(UserRole.GESTIONNAIRE); setError(null); }}
                    >
                        <ShieldAlert className="w-4 h-4" /> Gestionnaire
                    </button>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Code PIN
                            </label>
                            <input
                                type="password" // or text with restricted inputType if numeric keypad needed
                                inputMode="numeric"
                                pattern="\d*"
                                autoFocus
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="----"
                                className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-slate-200"
                            />
                        </div>

                        {role === UserRole.GESTIONNAIRE && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <KeyRound className="w-3 h-3" /> Code Secondaire
                                </label>
                                <input
                                    type="password"
                                    value={secondary}
                                    onChange={(e) => setSecondary(e.target.value)}
                                    placeholder="Code Admin"
                                    className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-3 animate-pulse">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !pin}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${role === UserRole.INTERVENANT ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Se connecter <ArrowRight className="w-5 h-5" /></>}
                        </button>

                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            {role === UserRole.INTERVENANT ? 'Accès standard pour visualisation et saisie.' : 'Accès réservé pour configuration avancée.'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;
