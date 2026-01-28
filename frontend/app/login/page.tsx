"use client";
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';
import { motion } from 'framer-motion';

import DevLoginButton from '@/components/DevLoginButton';

export default function LoginPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
            <Navbar />

            <div className="w-full max-w-md">
                <GlassCard className="p-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-400 mb-8">Sign in to access your citizen dashboard</p>

                        <div className="space-y-4 mb-6">
                            <GoogleLoginButton />
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#0a0a1a] px-2 text-gray-500">Or for development</span>
                                </div>
                            </div>

                            <DevLoginButton />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400 space-y-2">
                            <div>
                                Government Official?{' '}
                                <Link href="/admin/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                    Admin Login
                                </Link>
                            </div>
                            <div>
                                Field Officer?{' '}
                                <Link href="/officer/login" className="text-green-400 hover:text-green-300 transition-colors font-medium">
                                    Officer Login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </GlassCard>
            </div>
        </main>
    );
}
