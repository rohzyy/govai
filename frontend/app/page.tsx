"use client";
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ShieldCheck, MessageSquare, BarChart3, ChevronRight, Lock, UserCheck } from 'lucide-react';
import { HomeAnalytics } from '@/components/HomeAnalytics';
import { FeatureCard } from '@/components/FeatureCard';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen overflow-hidden bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-300">Live Municipal AI System</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                            Voice Your Grievances <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                AI Will Handle The Rest
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
                            A next-generation civic platform connecting citizens with government.
                            Report issues instantly, track resolution in real-time, and let AI streamline the process.
                        </p>


                        <div className="flex flex-col items-center justify-center gap-8">
                            <Link href="/login" className="group relative">
                                {/* Refined Glow Container */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:opacity-60 group-hover:blur-md"></div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    whileHover={{}}
                                    whileTap={{}}
                                    className="
                                        relative w-64 h-14 text-lg font-semibold border-none
                                        bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-[length:200%_auto] bg-left
                                        shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_12px_rgba(0,0,0,0.3)]
                                        transform scale-100 translate-y-0
                                        transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform
                                        hover:bg-right hover:-translate-y-0.5 hover:scale-[1.015] 
                                        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_32px_rgba(0,0,0,0.4)]
                                        active:scale-[0.98] active:translate-y-0 active:duration-100
                                    "
                                    leftIcon={<MessageSquare className="h-5 w-5 opacity-90 transition-opacity duration-300" />}
                                >
                                    Raise a Complaint
                                </Button>
                            </Link>

                            <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                                <Link href="/admin/login" className="flex items-center gap-2 hover:text-white transition-colors duration-200 group p-2 rounded-lg hover:bg-white/5">
                                    <Lock className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                                    <span>Government Portal</span>
                                </Link>
                                <div className="h-4 w-px bg-white/10"></div>
                                <Link href="/officer/login" className="flex items-center gap-2 hover:text-white transition-colors duration-200 group p-2 rounded-lg hover:bg-white/5">
                                    <UserCheck className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    <span>Officer Portal</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Analytics Shortcuts */}
            <HomeAnalytics />

            {/* Features Grid */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        index={0}
                        icon={MessageSquare}
                        title="Instant Reporting"
                        description="Submit complaints in seconds. Our AI automatically categorizes and prioritizes your issue."
                        color="blue"
                    />

                    <FeatureCard
                        index={1}
                        icon={BarChart3}
                        title="Live Tracking"
                        description="Monitor status updates in real-time. Get notified immediately when your problem is resolved."
                        color="purple"
                    />

                    <FeatureCard
                        index={2}
                        icon={ShieldCheck}
                        title="Secure & Private"
                        description="Your data is encrypted. Strict role-based access ensures only authorized officials see details."
                        color="green"
                    />
                </div>
            </section>
        </main>
    );
}
