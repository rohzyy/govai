"use client";

import { useState, useCallback, useRef } from 'react';
import api from '@/lib/api';

interface UseVoiceInputResult {
    recording: boolean;
    transcribing: boolean;
    transcript: string;
    error: string | null;
    startRecording: () => void;
    stopRecording: (lang?: string) => void;
    resetTranscript: () => void;
}

/**
 * 🎙 useVoiceInput
 * 
 * Replaces the unreliable Web Speech API with MediaRecorder.
 * Audio is captured as a Blob and sent to the backend for high-quality transcription.
 */
export function useVoiceInput(): UseVoiceInputResult {
    const [recording, setRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            // Requesting fresh stream every time to trigger browser prompt if not permanently blocked
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            audioChunks.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.current.push(e.data);
            };

            recorder.onstart = () => {
                setRecording(true);
            };

            recorder.start();
            mediaRecorder.current = recorder;
            console.log("[Voice] Recording started");
        } catch (err: any) {
            console.error("[Voice] Mic Access Error:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Microphone access denied. Please click the 'Lock' icon in your browser address bar to 'Allow' the microphone and try again.");
            } else {
                setError("Error accessing microphone. Please ensure it is plugged in and not in use by another app.");
            }
            setRecording(false);
        }
    }, []);

    const stopRecording = useCallback(async (lang: string = 'en-IN') => {
        if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;

        return new Promise<void>((resolve) => {
            mediaRecorder.current!.onstop = async () => {
                setRecording(false);
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });

                // Cleanup tracks
                mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
                mediaRecorder.current = null;

                if (audioBlob.size < 1000) {
                    setError("Audio too short. Please try again.");
                    resolve();
                    return;
                }

                // Send to backend for transcription
                setTranscribing(true);
                try {
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'voice.webm');
                    formData.append('lang', lang);

                    const res = await api.post('/helper/transcribe', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        timeout: 120000 // 120 seconds for slow AI/upload
                    });

                    if (res.data.transcript) {
                        setTranscript(res.data.transcript);
                    }
                } catch (err: any) {
                    console.error("[Voice] Transcription Error:", err);
                    const serverError = err.response?.data?.details || err.response?.data?.safeMessage || err.message;
                    setError(`Transcription failed: ${serverError}`);
                } finally {
                    setTranscribing(false);
                    resolve();
                }
            };

            mediaRecorder.current!.stop();
            console.log("[Voice] Recording stopped, transcribing...");
        });
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        recording,
        transcribing,
        transcript,
        error,
        startRecording,
        stopRecording,
        resetTranscript
    };
}
