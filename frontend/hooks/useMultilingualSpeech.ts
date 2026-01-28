"use client";

import { useState, useCallback, useRef } from 'react';

// Define supported language types
export type SpeechLanguage = 'en-IN' | 'hi-IN' | 'te-IN' | 'ta-IN';

interface UseSpeechResult {
    listening: boolean;
    transcript: string;
    error: string | null;
    isSupported: boolean;
    startListening: (lang?: SpeechLanguage) => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

/**
 * 🎤 FINAL ROBUST SPEECH HOOK
 * Ensures stability in Next.js + Chrome by using fresh instances and delayed start.
 */
export function useMultilingualSpeech(): UseSpeechResult {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Reference to the active recognition instance for cleanup
    const recognitionRef = useRef<any>(null);

    const isSupported = typeof window !== 'undefined' &&
        (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

    /**
     * 🧹 Mandatory Cleanup
     */
    const cleanup = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onstart = null;
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            try { recognitionRef.current.abort(); } catch (e) { }
            recognitionRef.current = null;
        }
    }, []);

    /**
     * 🚀 Start Recording
     * Re-initializes a fresh instance on every call.
     */
    const startListening = useCallback((lang: SpeechLanguage = 'en-IN') => {
        if (!isSupported) return;

        // Ensure page is visible to avoid network drops
        if (document.visibilityState !== 'visible') return;

        // Reset previous state
        cleanup();
        setError(null);

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognition();

        // Requirements: No continuous, no interim (maximum stability)
        rec.continuous = false;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.lang = lang;

        rec.onstart = () => {
            setListening(true);
            console.log("[Speech] Active");
        };

        rec.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            console.log("[Speech] Result:", text);
            setTranscript(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text);
        };

        rec.onerror = (event: any) => {
            console.error("[Speech] Error:", event.error);
            // Handle "network" or "fatal" states by resetting
            if (event.error === 'network') {
                setError("Network error. Please try again in 1 second.");
            } else {
                setError(`Voice error: ${event.error}`);
            }
            setListening(false);
            cleanup();
        };

        rec.onend = () => {
            setListening(false);
            cleanup();
        };

        recognitionRef.current = rec;

        // ⏱ 500ms delay to avoid Chrome network service race conditions
        setTimeout(() => {
            if (recognitionRef.current === rec) {
                try { rec.start(); } catch (e) {
                    setError("Failed to start speech engine.");
                    cleanup();
                }
            }
        }, 500);

    }, [isSupported, cleanup]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        listening,
        transcript,
        error,
        isSupported,
        startListening,
        stopListening,
        resetTranscript
    };
}

/**
 * 📝 MINIMAL USAGE EXAMPLE:
 * 
 * function MyComponent() {
 *   const { listening, transcript, startListening, stopListening, isSupported } = useMultilingualSpeech();
 *   
 *   if (!isSupported) return <span>Voice not supported</span>;
 *
 *   return (
 *     <div>
 *       <button onClick={() => listening ? stopListening() : startListening('hi-IN')}>
 *         {listening ? "Stop" : "Speak Hindi"}
 *       </button>
 *       <p>{transcript}</p>
 *     </div>
 *   );
 * }
 */
