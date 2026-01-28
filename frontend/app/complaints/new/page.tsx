"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import api from '@/lib/api';
import { Mic, MapPin, Send, MicOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce'; // Custom Hook
import { AIInsightPanel } from '@/components/ai/AIInsightPanel'; // New AI Component
import { useVoiceInput } from '@/hooks/useVoiceInput';

export default function NewComplaintPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [priority, setPriority] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // AI State
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const debouncedDescription = useDebounce(description, 800);

    const [selectedVoiceLang, setSelectedVoiceLang] = useState<any>('en-IN');
    const {
        recording: isListening,
        transcribing,
        transcript,
        resetTranscript,
        startRecording,
        stopRecording,
        error: voiceError
    } = useVoiceInput();
    const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');
    const browserSupportsSpeech = true; // MediaRecorder is widely supported
    const isMicrophoneAvailable = true;

    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        // FORCE AUTH CHECK (Improved)
        const token = localStorage.getItem('access_token');
        const cookieToken = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));

        if (!token && !cookieToken) {
            toast.warning("Please login to continue");
            router.push('/login');
        }
    }, [router, toast]);

    // AI Analysis Effect
    useEffect(() => {
        let isActive = true;

        const analyze = async () => {
            if (!debouncedDescription || debouncedDescription.length < 10) {
                if (isActive) setAiAnalysis(null);
                return;
            }

            if (isActive) setAnalyzing(true);
            try {
                // Non-blocking AI Call
                // Cancel if component unmounted or dependency changed
                if (!isActive) return;

                const res = await api.post('/helper/scan-text', { description: debouncedDescription });

                if (isActive) {
                    setAiAnalysis(res.data);
                    // Auto-suggest priority if user hasn't selected one
                    if (!priority && res.data.confidence > 60) {
                        setPriority(res.data.priority);
                    }
                }
            } catch (err) {
                console.error("AI Analysis failed silently:", err);
            } finally {
                if (isActive) setAnalyzing(false);
            }
        };

        analyze();

        return () => {
            isActive = false;
        };
    }, [debouncedDescription]);

    // Voice Input Logic (Improved with Hook)
    useEffect(() => {
        console.log("[Voice] Transcript Update:", transcript);
        if (transcript && transcript !== lastProcessedTranscript) {
            // Only append the new part of the transcript
            const newText = transcript.slice(lastProcessedTranscript.length);
            console.log("[Voice] New text found:", newText);
            if (newText) {
                setDescription(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + newText);
                setLastProcessedTranscript(transcript);
            }
        }
    }, [transcript, lastProcessedTranscript]);

    const lastErrorRef = useRef<string | null>(null);

    useEffect(() => {
        if (voiceError && voiceError !== lastErrorRef.current) {
            toast.error(voiceError);
            lastErrorRef.current = voiceError;
        } else if (!voiceError) {
            lastErrorRef.current = null;
        }
    }, [voiceError, toast]);

    const toggleVoiceInput = () => {
        if (isListening) {
            stopRecording(selectedVoiceLang);
            setLastProcessedTranscript('');
        } else {
            resetTranscript();
            setLastProcessedTranscript('');
            startRecording();
            toast.info("Recording... Speak now");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/api/complaints/', {
                title,
                description,
                location: location || "Unknown Location",
                priority: priority || undefined  // Send only if manually selected
            });
            // Success!
            toast.success("Complaint submitted successfully!");
            router.push('/dashboard'); // Redirect to dashboard
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to submit complaint");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 px-6">
            <Navbar />

            <div className="max-w-2xl mx-auto">
                <GlassCard className="p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">New Complaint</h1>
                        <p className="text-gray-400">Describe the issue and our AI will handle the rest</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300 ml-1">
                                Title
                            </label>
                            <Input
                                placeholder="e.g., Pothole on Main St"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300 ml-1">
                                Description
                            </label>
                            <div className="relative">
                                <textarea
                                    className="w-full h-32 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all text-white placeholder:text-gray-500 resize-none"
                                    placeholder="Describe the issue in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                                {isListening && (
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-blue-500/10 backdrop-blur-sm rounded-b-xl border-t border-white/5">
                                        {!isMicrophoneAvailable ? (
                                            <div className="text-xs text-red-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                ❌ Microphone not detected or access denied
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <div className="flex items-center gap-2 text-xs text-blue-300 animate-pulse">
                                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                                    <span className="font-medium">
                                                        {transcribing ? "🔄 Transcribing..." : "Voice Status: Recording..."}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 italic truncate">
                                                    {transcribing ? "Analyzing audio..." : (transcript || "Waiting for audio...")}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* AI INSIGHT PANEL */}
                            <AIInsightPanel analysis={aiAnalysis} loading={analyzing} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300 ml-1">
                                Location
                            </label>
                            <Input
                                placeholder="e.g., 123 Baker Street"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300 ml-1">
                                Priority (Optional)
                            </label>
                            <select
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all font-medium"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="" className="bg-gray-900">🤖 Auto-detect (AI will classify)</option>
                                <option value="Low" className="bg-gray-900">🟢 Low - Minor issues</option>
                                <option value="Medium" className="bg-gray-900">🟡 Medium - Standard complaints</option>
                                <option value="High" className="bg-gray-900">🟠 High - Urgent matters</option>
                                <option value="Critical" className="bg-gray-900">🔴 Critical - Emergency</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300 ml-1">
                                Voice Language
                            </label>
                            <select
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all font-medium"
                                value={selectedVoiceLang}
                                onChange={(e) => setSelectedVoiceLang(e.target.value)}
                                disabled={isListening}
                            >
                                <option value="en-IN" className="bg-gray-900">English (India)</option>
                                <option value="hi-IN" className="bg-gray-900">Hindi (हिंदी)</option>
                                <option value="te-IN" className="bg-gray-900">Telugu (తెలుగు)</option>
                                <option value="ta-IN" className="bg-gray-900">Tamil (தமிழ்)</option>
                            </select>
                            <p className="text-xs text-gray-500 ml-1">
                                Select your language before starting voice input
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant={isListening ? "danger" : "secondary"}
                                leftIcon={isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                onClick={toggleVoiceInput}
                            >
                                {isListening ? "Stop Recording" : "Voice Input"}
                            </Button>
                            <Button type="button" variant="secondary" leftIcon={<MapPin className="h-4 w-4" />}>
                                Get Location
                            </Button>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={loading} leftIcon={<Send className="h-4 w-4" />}>
                            Submit Complaint
                        </Button>
                    </form>
                </GlassCard>
            </div>
        </main>
    );
}
