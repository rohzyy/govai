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
import { useDebounce } from '@/hooks/useDebounce';
import { AIAnalysisSidePanel } from '@/components/ai/AIAnalysisSidePanel';
import { ImageUploadArea } from '@/components/ImageUploadArea';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export default function NewComplaintPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [priority, setPriority] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // AI State
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const debouncedDescription = useDebounce(description, 800);

    const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>('en-IN');
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

    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        // FORCE AUTH CHECK
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
    }, [debouncedDescription, priority]);

    // Voice Input Logic
    useEffect(() => {
        if (transcript && transcript !== lastProcessedTranscript) {
            const newText = transcript.slice(lastProcessedTranscript.length);
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
                priority: priority || undefined
            });
            toast.success("Complaint submitted successfully!");
            router.push('/dashboard');
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

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column - Complaint Form */}
                    <div className="lg:col-span-3">
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
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-sm font-medium text-gray-300 ml-1">
                                            Description
                                        </label>
                                        <select
                                            className="bg-transparent text-xs text-gray-400 border-none focus:ring-0 cursor-pointer"
                                            value={selectedVoiceLang}
                                            onChange={(e) => setSelectedVoiceLang(e.target.value)}
                                            disabled={isListening}
                                        >
                                            <option value="en-IN">English (India)</option>
                                            <option value="hi-IN">Hindi (हिंदी)</option>
                                            <option value="te-IN">Telugu (తెలుగు)</option>
                                            <option value="ta-IN">Tamil (தமிழ்)</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <div className="relative flex-1">
                                            <textarea
                                                className="w-full h-32 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all text-white placeholder:text-gray-500 resize-none"
                                                placeholder="Describe the issue in detail..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                required
                                            />
                                            {isListening && (
                                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                                    <div className="h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
                                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">REC</span>
                                                </div>
                                            )}
                                            {transcribing && (
                                                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-blue-400">
                                                    <div className="h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Processing...</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant={isListening ? "danger" : "secondary"}
                                            className="h-12 w-12 flex items-center justify-center p-0 flex-shrink-0"
                                            title="Voice Input"
                                            onClick={toggleVoiceInput}
                                        >
                                            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-300 ml-1">
                                        Location
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="e.g., 123 Baker Street"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="h-10 w-12 flex items-center justify-center p-0 flex-shrink-0"
                                            title="Get Current Location"
                                        >
                                            <MapPin className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <ImageUploadArea
                                    images={images}
                                    setImages={setImages}
                                />

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-300 ml-1">
                                        Priority (Optional)
                                    </label>
                                    <select
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="" className="bg-gray-900">🤖 Auto-detect (AI will classify)</option>
                                        <option value="Low" className="bg-gray-900">🟢 Low - Minor issues</option>
                                        <option value="Medium" className="bg-gray-900">🟡 Medium - Standard complaints</option>
                                        <option value="High" className="bg-gray-900">🟠 High - Urgent matters</option>
                                        <option value="Critical" className="bg-gray-900">🔴 Critical - Emergency</option>
                                    </select>
                                    <p className="text-xs text-gray-500 ml-1">
                                        Leave as auto-detect for AI to analyze urgency from your description
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" size="lg" isLoading={loading} leftIcon={<Send className="h-4 w-4" />}>
                                    Submit Complaint
                                </Button>
                            </form>
                        </GlassCard>
                    </div>

                    {/* Right Column - AI Analysis Panel */}
                    <div className="lg:col-span-2">
                        <div className="lg:sticky lg:top-28">
                            <AIAnalysisSidePanel
                                analysis={aiAnalysis}
                                loading={analyzing}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
