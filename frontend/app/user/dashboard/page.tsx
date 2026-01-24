"use client";
import { useEffect, useState } from 'react';
import { UserNavbar } from '@/components/UserNavbar';
import { Button } from '@/components/ui/Button';
import { ComplaintCard } from '@/components/ComplaintCard';
import { GlassCard } from '@/components/ui/GlassCard';
import api from '@/lib/api';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            const { authSafeFetch } = await import('@/lib/authSafeFetch');
            const { getAuth } = await import('@/lib/authState');

            // Force hydration/check
            const auth = getAuth();
            if (!auth.user && mounted) {
                // Double check localStorage manually if authState isn't ready
                // (Handled by hydration in getAuth, but being extra safe)
                const stored = localStorage.getItem('user');
                if (!stored) {
                    router.push('/login');
                    return;
                }
            }

            if (mounted && auth.user) {
                setUser(auth.user);
            }

            // Safe Auth Fetch
            const response = await authSafeFetch('/api/complaints', {});

            if (!mounted) return;

            if (response.success && response.data) {
                setComplaints(response.data);
            } else {
                console.warn("Fetch failed:", response.reason);
                // Graceful degradation handled by empty complaints state
            }
            setLoading(false);
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [router]);

    if (!user) return null; // Prevent flash

    return (
        <main className="min-h-screen pt-24 pb-12 px-6">
            <UserNavbar />

            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name} 👋</h1>
                        <p className="text-gray-400">Here's an overview of your reported issues</p>
                    </div>
                    <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push('/complaints/new')}>
                        New Complaint
                    </Button>
                </div>

                {/* KPI Cards (Optional for User, but good for UX) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <GlassCard className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xl">{complaints.length}</div>
                        <div><p className="text-sm text-gray-400">Total Submitted</p></div>
                    </GlassCard>
                    {/* Add more like Pending/Resolved count if backend supported stats API for user */}
                </div>

                {loading ? (
                    <div className="text-white">Loading complaints...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {complaints.map((c: any) => (
                            <ComplaintCard key={c.id} complaint={c} />
                        ))}

                        {complaints.length === 0 && (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-500">No complaints found. Start by adding one!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
