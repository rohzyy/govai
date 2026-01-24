"use client";
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ResolveComplaintModal } from '@/components/ResolveComplaintModal';
import { WithdrawComplaintModal } from '@/components/WithdrawComplaintModal';
import api from '@/lib/api';
import { Plus, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ViewMode = 'active' | 'archived';

export default function Dashboard() {
    const [activeComplaints, setActiveComplaints] = useState<any[]>([]);
    const [archivedComplaints, setArchivedComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('active');
    const router = useRouter();

    // Modal states
    const [resolveModal, setResolveModal] = useState<{ isOpen: boolean, id: number | null, title: string }>({
        isOpen: false,
        id: null,
        title: ''
    });
    const [withdrawModal, setWithdrawModal] = useState<{ isOpen: boolean, id: number | null, title: string }>({
        isOpen: false,
        id: null,
        title: ''
    });

    const fetchComplaints = async (mounted: boolean = true) => {
        if (mounted) setLoading(true);
        try {
            const { authSafeFetch } = await import('@/lib/authSafeFetch');

            // Parallel auth-safe fetches
            const [activeRes, archivedRes] = await Promise.all([
                authSafeFetch('/api/complaints/active', {}),
                authSafeFetch('/api/complaints/archived', {})
            ]);

            if (!mounted) return;

            // Handle Active
            if (activeRes.success && Array.isArray(activeRes.data)) {
                setActiveComplaints(activeRes.data);
            } else {
                console.warn("Active complaints load failed or invalid format:", activeRes);
                setActiveComplaints([]);
            }

            // Handle Archived
            if (archivedRes.success && Array.isArray(archivedRes.data)) {
                setArchivedComplaints(archivedRes.data);
            } else {
                console.warn("Archived complaints load failed or invalid format:", archivedRes);
                setArchivedComplaints([]);
            }

        } catch (err) {
            console.error('Dashboard fatal crash prevented', err);
        } finally {
            if (mounted) setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        fetchComplaints(mounted);
        return () => { mounted = false; };
    }, []);

    const handleResolve = (id: number, title: string) => {
        console.log("🟢 Dashboard: handleResolve called with id:", id, "title:", title);
        setResolveModal({ isOpen: true, id, title });
        console.log("🟢 Dashboard: resolveModal state set to:", { isOpen: true, id, title });
    };

    const handleWithdraw = (id: number, title: string) => {
        console.log("🔴 Dashboard: handleWithdraw called with id:", id, "title:", title);
        setWithdrawModal({ isOpen: true, id, title });
        console.log("🔴 Dashboard: withdrawModal state set to:", { isOpen: true, id, title });
    };

    const handleSuccess = () => {
        console.log("✅ Dashboard: handleSuccess called, refreshing complaints");
        fetchComplaints(); // Refresh both lists
    };

    const displayedComplaints = viewMode === 'active' ? activeComplaints : archivedComplaints;

    return (
        <main className="min-h-screen pt-24 pb-12 px-6">
            <Navbar showAuth={false} />

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Complaints</h1>
                        <p className="text-gray-400">Track and manage your reported issues</p>
                    </div>
                    <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push('/complaints/new')}>
                        New Complaint
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-white/10">
                    <button
                        className={`px-6 py-3 text-sm font-medium transition-all ${viewMode === 'active'
                            ? 'text-white border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-white'
                            }`}
                        onClick={() => setViewMode('active')}
                    >
                        Active Complaints ({activeComplaints.length})
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'archived'
                            ? 'text-white border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-white'
                            }`}
                        onClick={() => setViewMode('archived')}
                    >
                        <Archive className="h-4 w-4" />
                        Resolved / Archived ({archivedComplaints.length})
                    </button>
                </div>

                {loading ? (
                    <div className="text-white text-center py-12">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(displayedComplaints || []).map((c: any) => (
                            <ComplaintCard
                                key={c.id}
                                complaint={c}
                                onResolve={handleResolve}
                                onWithdraw={handleWithdraw}
                                isArchived={viewMode === 'archived'}
                            />
                        ))}

                        {(displayedComplaints || []).length === 0 && (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-500">
                                    {viewMode === 'active'
                                        ? 'No active complaints. Help your city by reporting an issue!'
                                        : 'No archived complaints yet.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {resolveModal.id && (
                <ResolveComplaintModal
                    complaintId={resolveModal.id}
                    complaintTitle={resolveModal.title}
                    isOpen={resolveModal.isOpen}
                    onClose={() => setResolveModal({ isOpen: false, id: null, title: '' })}
                    onSuccess={handleSuccess}
                />
            )}

            {withdrawModal.id && (
                <WithdrawComplaintModal
                    complaintId={withdrawModal.id}
                    complaintTitle={withdrawModal.title}
                    isOpen={withdrawModal.isOpen}
                    onClose={() => setWithdrawModal({ isOpen: false, id: null, title: '' })}
                    onSuccess={handleSuccess}
                />
            )}
        </main>
    );
}
