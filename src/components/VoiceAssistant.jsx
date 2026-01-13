import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');

    // Simulate speech recognition
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'fr-FR';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setResponse("J'écoute...");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                processCommand(text);
            };
        } else {
            console.warn("Speech Recognition API not supported");
        }
    }, []);

    const processCommand = (text) => {
        const lower = text.toLowerCase();

        // Simulation of simple commands
        setTimeout(() => {
            if (lower.includes('salle 1') || lower.includes('salles une')) {
                setResponse("J'ouvre la traçabilité de la Salle 1.");
                // Note: Real action would require a callback passed from App.js
            } else if (lower.includes('planning') || lower.includes('agenda')) {
                setResponse("Affichage du planning des interventions.");
            } else if (lower.includes('stat') || lower.includes('analyse')) {
                setResponse("Voici le tableau de bord.");
            } else {
                setResponse("Commande non reconnue, mais notée.");
            }
        }, 800);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Votre navigateur ne supporte pas la commande vocale.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            setResponse('');
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            {/* Transcript Bubble */}
            {(transcript || response) && (
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4 max-w-xs mb-2 transition-all animate-in slide-in-from-bottom-5 pointer-events-auto">
                    {transcript && <p className="text-slate-500 text-sm mb-2 italic">"{transcript}"</p>}
                    {response && (
                        <div className="flex items-start gap-2 text-indigo-700 font-medium">
                            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="text-sm">{response}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Mic Button */}
            <button
                onClick={toggleListening}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all pointer-events-auto ${isListening
                        ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                        : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-700'
                    }`}
            >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default VoiceAssistant;
