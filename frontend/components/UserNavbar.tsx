"use client";
import Link from 'next/link';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export function UserNavbar() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.clear();
        router.push('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
                    <Link href="/dashboard" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        GrievanceAI
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                        <Link href="/complaints/new" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">New Complaint</Link>
                        <Link href="/complaints/track" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Track Status</Link>
                        <Link href="/chatbot" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Chatbot</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
