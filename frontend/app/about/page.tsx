"use client";

import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/GlassCard';
import {
    BrainCircuit,
    Mic,
    MapPin,
    ShieldCheck,
    Users,
    LayoutDashboard,
    Gavel,
    FileText,
    Lock,
    Zap,
    MessageSquare
} from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="pt-24 pb-12 px-6">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* HERO SECTION */}
                    <div className="text-center space-y-4 mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 pb-2">
                            Reshaping Governance with AI
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            GrievanceAI is an intelligent platform bridging the gap between citizens and authorities.
                            We automate the chaotic process of complaint filing, categorization, and assignment using state-of-the-art Artificial Intelligence.
                        </p>
                    </div>

                    {/* CORE PILLARS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassCard className="p-8 space-y-4 border-blue-500/20 bg-blue-500/5">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <BrainCircuit className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">AI-Powered Intelligence</h3>
                            <p className="text-gray-400">
                                Every complaint is analyzed by Gemini AI to automatically detect the <strong>category</strong>, estimate <strong>priority</strong>, and extract key details. No more manual sorting.
                            </p>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-4 border-purple-500/20 bg-purple-500/5">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Automated Assignment</h3>
                            <p className="text-gray-400">
                                Complaints don't sit in a pile. Based on the category (e.g., "Roads", "Water"), the system instantly routes the issue to the specific departmental officer responsible.
                            </p>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-4 border-emerald-500/20 bg-emerald-500/5">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">24/7 AI Chatbot</h3>
                            <p className="text-gray-400">
                                An always-active intelligent assistant available to everyone. It answers queries, guides you through the grievance process, and provides instant support for any issue.
                            </p>
                        </GlassCard>
                    </div>

                    {/* DETAILED FEATURES */}
                    <div className="pt-12">
                        <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-indigo-500 pl-4">
                            Platform Features
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* CITIZEN FEATURES */}
                            <GlassCard className="p-0 overflow-hidden">
                                <div className="p-6 bg-white/5 border-b border-white/10">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Users className="h-5 w-5 text-indigo-400" />
                                        For Citizens
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <Mic className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h4 className="text-white font-medium">Voice Reporting</h4>
                                            <p className="text-sm text-gray-400">Speak your complaint. Our speech-to-text engine transcribes it instantly, making checking in easier for everyone.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h4 className="text-white font-medium">Smart Location</h4>
                                            <p className="text-sm text-gray-400">Auto-tagging of complaint locations to ensure field officers know exactly where to go.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Lock className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h4 className="text-white font-medium">Secure & Anonymous</h4>
                                            <p className="text-sm text-gray-400">Enterprise-grade security implies your data is safe. Anonymity options available for sensitive reports.</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* OFFICIALS FEATURES */}
                            <GlassCard className="p-0 overflow-hidden">
                                <div className="p-6 bg-white/5 border-b border-white/10">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Gavel className="h-5 w-5 text-indigo-400" />
                                        For Officials
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <LayoutDashboard className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h4 className="text-white font-medium">Officer Portal</h4>
                                            <p className="text-sm text-gray-400">Field officers receive assigned tasks directly with priority levels (Low to Critical) pre-calculated.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <FileText className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h4 className="text-white font-medium">Admin Analytics</h4>
                                            <p className="text-sm text-gray-400">Administrators get a bird's-eye view of city health, grievance trends, and department performance.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <BrainCircuit className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h4 className="text-white font-medium">AI Triage</h4>
                                            <p className="text-sm text-gray-400">The system automatically filters spam and duplicates, letting officials focus only on real issues.</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>



                </div>
            </main>
        </div>
    );
}
