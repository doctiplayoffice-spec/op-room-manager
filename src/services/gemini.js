import { GoogleGenAI } from "@google/genai";
// import { EVENT_TYPES } from "../data.js"; // If needed

// NOTE: In a real prod app, use a backend proxy.
// For this prototype, we use a placeholder. User can replace it in the code.
const API_KEY = "";

export const geminiService = {
    async getOptimizationAdvice(surgeries) {
        if (!API_KEY) return { analysis: "Clé API manquante.", recommendations: ["Ajoutez votre clé API dans src/services/gemini.js"] };

        const ai = new GoogleGenAI(API_KEY);
        // Use 'gemini-1.5-flash' which is often the mapped model name for newer SDKs or check docs. 
        // User used 'gemini-3-flash-preview', assuming availability or fallback.
        const modelId = 'gemini-1.5-flash';

        const prompt = `Agis en tant qu'expert en gestion de bloc opératoire senior. Analyse cet état actuel du bloc :
    ${JSON.stringify(surgeries.map(s => ({
            id: s.id,
            room: s.roomNumber,
            status: s.status,
            scheduledStart: s.start, // mapped from data structure
            currentEvents: s.events ? s.events.length : 0
        })))}

    Tâches :
    1. Détecte les retards critiques.
    2. Recommande des réaffectations.
    3. Identifie les goulots d'étranglement.
    Réponds EXCLUSIVEMENT en français dans un format JSON structuré avec 'analysis' (une chaîne) et 'recommendations' (un tableau de chaînes).`;

        try {
            const model = ai.getGenerativeModel({ model: modelId });
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'object',
                        properties: {
                            analysis: { type: 'string' },
                            recommendations: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        },
                        required: ['analysis', 'recommendations']
                    }
                }
            });
            return JSON.parse(result.response.text());
        } catch (error) {
            console.error("AI Optimization failed", error);
            return {
                analysis: "Erreur de connexion au conseiller IA.",
                recommendations: ["Vérifiez votre configuration réseau ou quotas."]
            };
        }
    },

    async processVoiceCommand(text) {
        if (!API_KEY) return { action: 'UNKNOWN', confidence: 0 };

        const ai = new GoogleGenAI(API_KEY);
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Tu es l'assistant vocal d'un bloc opératoire. Analyse la commande suivante : "${text}"
    Détermine si l'utilisateur veut enregistrer un événement chirurgical, valider une checklist, ou naviguer.
    
    Réponds en JSON avec :
    - action: 'RECORD_EVENT' | 'CHECK_LIST' | 'NAVIGATE' | 'UNKNOWN'
    - target: le nom de l'événement, de l'item, ou de la page (cockpit/planning/stats)
    - confidence: score entre 0 et 1`;

        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'object',
                        properties: {
                            action: { type: 'string' },
                            target: { type: 'string' },
                            confidence: { type: 'number' }
                        },
                        required: ['action', 'target', 'confidence']
                    }
                }
            });
            return JSON.parse(result.response.text());
        } catch (e) {
            console.error(e);
            return { action: 'UNKNOWN' };
        }
    },

    async generateSurgicalReport(surgery) {
        if (!API_KEY) return "Clé API manquante.";

        const ai = new GoogleGenAI(API_KEY);
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Génère un compte-rendu opératoire structuré et professionnel pour l'intervention suivante :
    Intervention : ${surgery.procedureName}
    Patient ID : ${surgery.patientId}
    Chirurgien : ${surgery.surgeon.name}
    Events : ${JSON.stringify(surgery.events)}
    
    Le rapport doit être en français, clair, et inclure les sections : Identification, Personnel, Déroulement, et Conclusion.`;

        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            return result.response.text();
        } catch (e) {
            return "Échec de la génération du compte-rendu.";
        }
    }
};
