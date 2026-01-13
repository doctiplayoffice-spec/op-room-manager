import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { geminiService } from '../services/gemini.js';

const StatsOverview = ({ rooms }) => {
    // Mock Calculations
    const activeRooms = rooms.filter(r => r.status === 'busy').length;
    const occupancyRate = Math.round((activeRooms / rooms.length) * 100);
    const totalProcedures = 18;

    // AI State
    const [analyzing, setAnalyzing] = useState(false);
    const [advice, setAdvice] = useState(null);

    // Data for Charts
    const chartData = rooms.slice(0, 10).map(r => ({
        name: r.name,
        heures: Math.floor(Math.random() * 8) + 2 // Simulated history
    }));

    const pieData = [
        { name: 'Chirurgie', value: 65, color: '#3b82f6' },
        { name: 'Nettoyage', value: 20, color: '#f59e0b' },
        { name: 'Attente', value: 15, color: '#e2e8f0' },
    ];

    const handleOptimization = async () => {
        setAnalyzing(true);
        setAdvice(null);
        try {
            const result = await geminiService.getOptimizationAdvice(rooms);
            setAdvice(result);
        } catch (e) {
            setAdvice({ analysis: "Erreur lors de l'analyse.", recommendations: [] });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Optimization Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        Optimisation Intelligente
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1 opacity-90">Analyse en temps réel des flux pour détecter les goulots d'étranglement.</p>
                </div>
                <button
                    onClick={handleOptimization}
                    disabled={analyzing}
                    className="px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {analyzing ? 'Analyse...' : 'Lancer l\'analyse IA'}
                </button>
            </div>

            {advice && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-500 bg-white border border-indigo-100 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-900 mb-2">Rapport de l'IA</h3>
                    <p className="text-slate-700 mb-4 text-sm leading-relaxed">{advice.analysis}</p>

                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-3">Recommandations</h4>
                    <ul className="space-y-2">
                        {advice.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-50">
                                <AlertTriangle className="w-4 h-4 text-indigo-500 mt-0.5" />
                                <span className="text-sm text-indigo-900 font-medium">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-4xl font-black text-emerald-500 mb-2">{occupancyRate}%</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Taux d'Occupation</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-4xl font-black text-blue-500 mb-2">{totalProcedures}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Procédures Aujourd'hui</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-4xl font-black text-purple-500 mb-2">22m</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Temps Moyen Nettoyage</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Utilisation par Salle (Heures)</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="heures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Répartition du Temps</h3>
                    <div className="flex-1 w-full min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-slate-800">100%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
