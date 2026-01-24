'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield, AlertTriangle, Mic, MicOff, X, Globe, Phone } from 'lucide-react';
import { useAuth } from '@/lib/authState';
import { authSafeFetch } from '@/lib/authSafeFetch';
import { useMultilingualSpeech } from '@/hooks/useMultilingualSpeech';
import { detectEmergency, detectLanguage, SUPPORTED_LANGUAGES } from '@/lib/languageUtils';
import clsx from 'clsx';

// Liquid Glass Animation Variants
const glassVariants = {
    idle: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
    focused: { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.2)" },
    listening: {
        scale: [1, 1.05, 1],
        borderColor: ["rgba(255,255,255,0.5)", "rgba(239,68,68,0.5)", "rgba(255,255,255,0.5)"],
        transition: { repeat: Infinity, duration: 1.5 }
    }
};

export default function WomenSafetyChatbot() {
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { authReady, user: currentUser } = useAuth();

    // Voice Hook
    const { isListening, transcript, startListening, stopListening, resetTranscript, error: micError } = useMultilingualSpeech();

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    // Sync input with voice transcript
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // Handle Send
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        resetTranscript();
        setIsThinking(true);

        // 🚨 1. EMERGENCY INTERCEPTOR (Client-Side)
        // Check keywords in ANY language before hitting AI
        if (detectEmergency(userMessage)) {
            setIsEmergency(true);
            setIsThinking(false);
            setMessages((prev) => [
                ...prev,
                { role: 'ai', text: "🚨 EMERGENCY DETECTED. Activate Panic Mode?" }
            ]);
            // Optional: Auto-trigger panic logic here if required strictness > 0
            return;
        }

        try {
            // 2. Send to AI API
            const response = await fetch('/api/women-safety/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
            } else {
                setMessages((prev) => [...prev, { role: 'ai', text: "I'm having trouble connecting. Please try again or call emergency." }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: 'ai', text: "Connection error. Please check your internet." }]);
        } finally {
            setIsThinking(false);
        }
    };

    // State for Panic Feedback
    const [panicStatus, setPanicStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handlePanic = async () => {
        setIsEmergency(true);
        setPanicStatus('sending');

        try {
            if (authReady) {
                await authSafeFetch('/api/women-safety/panic', {
                    method: 'POST',
                    body: JSON.stringify({ location: 'Unknown', type: 'Panic Button' })
                });
            }
            setPanicStatus('sent');
            // Reset after 3 seconds
            setTimeout(() => setPanicStatus('idle'), 3000);
        } catch (e) {
            setPanicStatus('idle');
        }
    };

    const detectedLangCode = detectLanguage(input);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* 🚨 PANIC BUTTON (Always Visible, independent of Chat) */}
            <div className="pointer-events-auto mb-4 flex items-center gap-2">
                {panicStatus === 'sent' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                        ALERT SENT!
                    </motion.div>
                )}
                <button
                    onClick={handlePanic}
                    className={clsx(
                        "group relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all active:scale-95",
                        panicStatus === 'sending' ? "bg-red-800" : "bg-red-600 hover:bg-red-700 animate-pulse-slow"
                    )}
                >
                    <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 group-hover:animate-ping"></span>
                    {panicStatus === 'sending' ? (
                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <AlertTriangle className="w-8 h-8 text-white relative z-10" />
                    )}
                </button>
            </div>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/50 w-80 sm:w-96 rounded-3xl shadow-2xl overflow-hidden mb-4 flex flex-col"
                        style={{ maxHeight: '600px', height: '80vh' }}
                    >
                        {/* HEADER */}
                        <div className={clsx(
                            "p-4 flex items-center justify-between text-white transition-colors duration-500",
                            isEmergency ? "bg-red-600" : "bg-gradient-to-r from-indigo-600 to-purple-600"
                        )}>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                <span className="font-semibold tracking-wide">
                                    {isEmergency ? "EMERGENCY MODE" : "Safety Assistant"}
                                </span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 mt-10 text-sm">
                                    <p>Safe. Secure. Private.</p>
                                    <p className="mt-2 text-xs">How can I help you today?</p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={clsx(
                                        "max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-indigo-600 text-white ml-auto rounded-br-none"
                                            : "bg-white text-gray-800 border border-gray-100 mr-auto rounded-bl-none"
                                    )}
                                >
                                    {msg.text}
                                </motion.div>
                            ))}

                            {isThinking && (
                                <div className="flex gap-1 ml-2">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                </div>
                            )}

                            {isEmergency && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="p-4 bg-red-50 border border-red-100 rounded-xl"
                                >
                                    <p className="text-red-700 font-bold mb-2">Need immediate help?</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-700">
                                            <Phone className="w-4 h-4" /> Call 100
                                        </button>
                                        <button className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-50" onClick={() => setIsEmergency(false)}>
                                            I'm Safe
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* 💧 LIQUID GLASS INPUT AREA */}
                        <div className="p-4 bg-white/60 border-t border-white/50 backdrop-blur-md">

                            {/* Auto Detected Language Badge */}
                            {input.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1 ml-2">
                                    <Globe className="w-3 h-3" />
                                    <span>Detected: {SUPPORTED_LANGUAGES[detectedLangCode]?.name}</span>
                                </div>
                            )}

                            <div className="relative flex items-center gap-2">
                                {/* Voice Button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={isListening ? stopListening : startListening}
                                    className={clsx(
                                        "p-3 rounded-full transition-all shadow-md backdrop-blur-md",
                                        isListening
                                            ? "bg-red-500 text-white animate-pulse shadow-red-500/50"
                                            : "bg-white/80 text-gray-600 hover:bg-indigo-50 border border-gray-200"
                                    )}
                                    title={micError || "Voice Input"}
                                >
                                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 opacity-60" />}
                                </motion.button>

                                {/* Glass Input */}
                                <motion.div
                                    variants={glassVariants}
                                    initial="idle"
                                    whileFocus="focused"
                                    animate={isListening ? "listening" : "idle"}
                                    className="flex-1 relative"
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => {
                                            if (isListening) stopListening(); // Stop voice on type
                                            setInput(e.target.value);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={isListening ? "Listening..." : "Type here..."}
                                        className="w-full pl-5 pr-10 py-3 rounded-full bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 text-gray-800 placeholder-gray-400 text-sm shadow-inner backdrop-blur-sm transition-all"
                                        style={{ fontFamily: '"Inter", sans-serif' }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!input.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-400 hover:scale-110 transition-transform shadow-lg"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            </div>

                            {/* Mic Error Feedback */}
                            {micError && (
                                <p className="text-[10px] text-red-500 mt-1 ml-12">{micError}. You can still type.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOGGLE BUTTON */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto w-14 h-14 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white ring-4 ring-indigo-50 ring-offset-2 hover:bg-indigo-700 transition-all"
                    style={{ backdropFilter: 'blur(10px)' }}
                >
                    <Shield className="w-7 h-7" />
                </motion.button>
            )}
        </div>
    );
}
