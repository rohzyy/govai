"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { FileText, AlertCircle, CheckCircle2, Clock, LogOut, ChevronDown, ChevronUp, MapPin, Wrench } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { GrievanceTimeline } from '@/components/GrievanceTimeline';

export default function OfficerDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        fetchDashboardData();
    }, [filter]);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await api.get('/officer/dashboard/stats');
            setStats(statsRes.data.data || statsRes.data);

            const complaintsRes = await api.get(`/officer/complaints${filter !== 'all' ? `?status=${filter}` : ''}`);
            setComplaints(complaintsRes.data.data || complaintsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/officer/login');
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Officer Dashboard</h1>
                        <p className="text-gray-400 mt-1">Manage your assigned grievances</p>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-5 gap-4 mb-8">
                        <GlassCard className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Total Assigned</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stats.total_assigned}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-500" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Resolved</p>
                                    <p className="text-2xl font-bold text-green-500 mt-1">{stats.resolved}</p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">SLA Breached</p>
                                    <p className="text-2xl font-bold text-red-500 mt-1">{stats.sla_breached}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Critical</p>
                                    <p className="text-2xl font-bold text-red-500 mt-1">{stats.critical_priority}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    <Button onClick={() => setFilter("all")} variant={filter === "all" ? "primary" : "outline"}>All</Button>
                    <Button onClick={() => setFilter("pending")} variant={filter === "pending" ? "primary" : "outline"}>Pending</Button>
                    <Button onClick={() => setFilter("sla_breached")} variant={filter === "sla_breached" ? "primary" : "outline"}>SLA Breached</Button>
                    <Button onClick={() => setFilter("RESOLVED")} variant={filter === "RESOLVED" ? "primary" : "outline"}>Resolved</Button>
                </div>

                {/* Complaints List */}
                <div className="space-y-4">
                    {complaints.map((complaint) => (
                        <GlassCard key={complaint.id} className="p-6 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-white">{complaint.title}</h3>
                                        <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs font-mono border border-white/10">
                                            #{complaint.id}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(complaint.priority)}`}>
                                            {complaint.priority}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${complaint.status === 'RESOLVED' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                                            complaint.status === 'IN_PROGRESS' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                                                'text-gray-400 bg-gray-500/10 border-gray-500/20'
                                            }`}>
                                            {complaint.status}
                                        </span>
                                        {complaint.sla_breached && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-500">
                                                SLA BREACHED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">{complaint.description}</p>
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <span>📍 {complaint.location}</span>
                                        <span>🏷️ {complaint.category}</span>
                                        <span>📅 {new Date(complaint.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="ml-4">
                                    <Button
                                        onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                                        variant="outline"
                                        className="border-white/10 text-white hover:bg-white/5"
                                    >
                                        {expandedId === complaint.id ? (
                                            <>Hide Details <ChevronUp className="w-4 h-4 ml-2" /></>
                                        ) : (
                                            <>View & Manage <ChevronDown className="w-4 h-4 ml-2" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Expanded Section with Timeline & Actions */}
                            {expandedId === complaint.id && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <AISummarySection complaintId={complaint.id} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <GrievanceTimeline complaintId={complaint.id} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                                            <OfficerActionsPanel
                                                complaintId={complaint.id}
                                                onActionComplete={() => {
                                                    fetchDashboardData();
                                                    // Force timeline refresh? 
                                                    // Timeline component polls, but we might want faster feedback.
                                                    // For now, allow polling or strict data update.
                                                    // Actually, we should probably signal Timeline to update or just let it poll.
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    ))}

                    {complaints.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No complaints assigned yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component for strict action logic
function OfficerActionsPanel({ complaintId, onActionComplete }: { complaintId: number, onActionComplete: () => void }) {
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const toast = useToast();

    const fetchTimeline = async () => {
        try {
            const res = await api.get(`/api/complaints/${complaintId}/timeline`);
            setTimeline(res.data);
        } catch (error) {
            console.error("Failed to fetch timeline for actions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, [complaintId]);

    const handleAction = async (event: string, remarks: string = "") => {
        setProcessing(true);
        try {
            await api.post(`/officer/complaints/${complaintId}/timeline-event`, {
                event: event,
                remarks: remarks
            });
            toast.success(`Action ${event} recorded successfully`);
            await fetchTimeline(); // Refresh local timeline state to update buttons
            onActionComplete(); // Refresh parent dashboard stats
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Action failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading actions...</div>;

    // Derived State Machine
    const hasVisited = timeline.some(e => e.status === 'VISITED' || e.status === 'Officer Visited Location'); // Handle label fallback if API returns labels (it shouldn't, returns string)
    // Actually API stores Enum strings now "VISITED".
    // But check older data if any? No, new table.
    const hasStarted = timeline.some(e => e.status === 'IN_PROGRESS' || e.status === 'Work in Progress');
    const isResolved = timeline.some(e => e.status === 'RESOLVED' || e.status === 'Resolved');

    if (isResolved) {
        return (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span>Complaint Resolved</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!hasVisited && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-gray-400 text-sm mb-3">Step 1: Visit the location to assess the grievance.</p>
                    <Button
                        onClick={() => handleAction('VISITED', 'Officer visited site')}
                        disabled={processing}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        Mark as Visited
                    </Button>
                </div>
            )}

            {hasVisited && !hasStarted && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-gray-400 text-sm mb-3">Step 2: Start working on the resolution.</p>
                    <Button
                        onClick={() => handleAction('IN_PROGRESS', 'Work started')}
                        disabled={processing}
                        className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                        <Wrench className="w-4 h-4 mr-2" />
                        Start Work
                    </Button>
                </div>
            )}

            {hasStarted && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-gray-400 text-sm mb-3">Step 3: Resolve the grievance once work is done.</p>
                    <Button
                        onClick={() => handleAction('RESOLVED', 'Issue resolved by officer')}
                        disabled={processing}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Resolved
                    </Button>
                </div>
            )}
        </div>
    );
}


function AISummarySection({ complaintId }: { complaintId: number }) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.post(`/officer/complaints/${complaintId}/ai-summary`);
            if (res.data?.summary) {
                setSummary(res.data.summary);
            }
        } catch (err) {
            console.error("AI Summary failed", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            {!summary && !loading && !error && (
                <Button
                    onClick={handleGenerate}
                    variant="ghost"
                    className="w-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                >
                    ✨ Generate AI Summary
                </Button>
            )}

            {loading && (
                <div className="p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-lg flex items-center justify-center gap-3 text-indigo-300 animate-pulse">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Generating insight...
                </div>
            )}

            {summary && (
                <div className="p-4 bg-gradient-to-r from-indigo-950/50 to-blue-950/30 border border-indigo-500/30 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            ✨ AI Insight
                        </h4>
                        <span className="text-[10px] text-indigo-400/50">Private Officer View</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">
                        {summary}
                    </p>
                </div>
            )}

            {error && (
                <div className="text-center">
                    <p className="text-xs text-indigo-400/60 mb-2">AI Summary temporarily unavailable</p>
                    <Button
                        onClick={handleGenerate}
                        size="sm"
                        variant="ghost"
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
}
