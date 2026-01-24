"use client";
import { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, UserPlus, User, FileText } from 'lucide-react';
import AssignComplaintModal from './AssignComplaintModal';
import ComplaintDetailModal from './ComplaintDetailModal';
import { AITrustBadge } from './AITrustBadge';
import { AIRiskAdvisory } from './AIRiskAdvisory';

interface Complaint {
    id: number;
    title: string;
    description: string;
    location: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    assigned_officer_id?: number;
    sla_hours?: number;
    sla_deadline?: string;
    sla_breached?: boolean;
    ai_trust_score?: number;
    ai_trust_flags?: string;
}

export default function GrievanceManagementView() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filter, setFilter] = useState<'all' | 'unassigned' | 'sla_breached'>('all');
    const [loading, setLoading] = useState(true);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDetailComplaintId, setSelectedDetailComplaintId] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadComplaints = async () => {
            if (!mounted) return;
            setLoading(true);
            await fetchComplaints(mounted);
            if (mounted) setLoading(false);
        };

        loadComplaints();

        return () => {
            mounted = false;
        };
    }, [filter]);

    const fetchComplaints = async (mounted: boolean = true) => {
        try {
            const { authSafeFetch } = await import('@/lib/authSafeFetch');

            let apiPath = '/api/admin/complaints';
            if (filter === 'unassigned') {
                apiPath = '/api/admin/complaints?filter=unassigned';
            } else if (filter === 'sla_breached') {
                apiPath = '/api/admin/complaints?filter=sla_breached';
            }

            // 🔒 Enforce ADMIN role
            const response = await authSafeFetch<Complaint[]>(apiPath, { cache: 'no-store' }, 'ADMIN');

            if (mounted) {
                if (response.success && response.data) {
                    const rawData = response.data as any;

                    if (Array.isArray(rawData)) {
                        setComplaints(rawData);
                    } else if (rawData.data && Array.isArray(rawData.data)) {
                        setComplaints(rawData.data);
                    } else {
                        setComplaints([]);
                    }
                } else {
                    console.warn('Admin complaints fetch failed:', response.reason);
                    // Temporarily show error in the list for debugging
                    setComplaints([{ id: 0, title: `ERROR: ${response.reason}`, status: 'Error', priority: 'High', description: 'Fetch Failed', location: 'Debug', created_at: new Date().toISOString(), category: 'System' } as any]);
                }
            }
        } catch (error) {
            console.error('CRITICAL: Admin fetch crash avoided', error);
            if (mounted) setComplaints([]);
        }
    };

    const handleAssignClick = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setAssignModalOpen(true);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'text-red-400 bg-red-900/30 border-red-700';
            case 'High': return 'text-orange-400 bg-orange-900/30 border-orange-700';
            case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
            case 'Low': return 'text-green-400 bg-green-900/30 border-green-700';
            default: return 'text-gray-400 bg-gray-900/30 border-gray-700';
        }
    };

    const getSLAColor = (sla_breached?: boolean) => {
        return sla_breached ? 'text-red-400' : 'text-green-400';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Grievance Management</h2>
                    <p className="text-gray-400">Assign grievances to concerned officers</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        All Grievances
                    </button>
                    <button
                        onClick={() => setFilter('unassigned')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'unassigned'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        Unassigned Only
                    </button>
                    <button
                        onClick={() => setFilter('sla_breached')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'sla_breached'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        SLA Breached
                    </button>
                </div>
            </div>

            {/* AI Risk Advisory Header */}
            <AIRiskAdvisory />

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-400">Loading grievances...</div>
                </div>
            ) : complaints.length === 0 ? (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg">No grievances found</p>
                    <p className="text-gray-500 text-sm mt-2">
                        {filter === 'unassigned' && 'All grievances have been assigned'}
                        {filter === 'sla_breached' && 'No SLA breaches detected'}
                        {filter === 'all' && 'No grievances are currently registered'}
                    </p>
                </div>
            ) : complaints.length > 0 && complaints[0] && (complaints[0] as any).title && (complaints[0] as any).title.startsWith('ERROR:') ? (
                <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/50 rounded-xl p-12 text-center overflow-hidden break-words">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold text-white mb-2">
                        {(complaints[0] as any).title.includes('500') ? 'Server Error (500)' : 'Access Denied (Forbidden)'}
                    </h3>
                    <p className="text-red-200 mb-6">
                        {(complaints[0] as any).title}
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {(Array.isArray(complaints) ? complaints : []).map((complaint) => {
                        if (!complaint) return null;

                        let dateDisplay = 'N/A';
                        try {
                            if (complaint.created_at) {
                                dateDisplay = new Date(complaint.created_at).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                });
                            }
                        } catch (e) {
                            console.error('Date parse error:', e);
                        }

                        return (
                            <div
                                key={complaint.id || Math.random()}
                                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm font-mono text-gray-500">
                                                #{complaint.id}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                                                {complaint.priority || 'Medium'}
                                            </span>
                                            {complaint.category && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-700">
                                                    {complaint.category}
                                                </span>
                                            )}
                                            {complaint.sla_breached && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-700 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    SLA Breached
                                                </span>
                                            )}

                                            {/* AI Trust Badge Integration */}
                                            <AITrustBadge
                                                score={complaint.ai_trust_score !== undefined ? complaint.ai_trust_score : 1.0}
                                                flags={complaint.ai_trust_flags || null}
                                            />
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            {complaint.title || 'Untitled'}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {complaint.description || 'No description provided.'}
                                        </p>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <MapPin className="h-4 w-4" />
                                                <span>{complaint.location || 'Unknown Location'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock className="h-4 w-4" />
                                                <span>{dateDisplay}</span>
                                            </div>
                                            {complaint.assigned_officer_id ? (
                                                <div className="flex items-center gap-2 text-green-400">
                                                    <User className="h-4 w-4" />
                                                    <span>Assigned to Officer</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-400">
                                                    <UserPlus className="h-4 w-4" />
                                                    <span>Awaiting Assignment</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-6">
                                        {!complaint.assigned_officer_id ? (
                                            <button
                                                onClick={() => handleAssignClick(complaint)}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                Assign to Officer
                                            </button>
                                        ) : (
                                            <div className="px-6 py-3 bg-green-900/30 text-green-400 rounded-lg font-medium border border-green-700/50 text-center">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span className="text-sm">Assigned</span>
                                                </div>
                                                {complaint.sla_hours && (
                                                    <div className={`text-xs mt-1 ${getSLAColor(complaint.sla_breached)}`}>
                                                        SLA: {complaint.sla_hours}h
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedDetailComplaintId(complaint.id);
                                                setDetailModalOpen(true);
                                            }}
                                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedComplaint && (
                <AssignComplaintModal
                    isOpen={assignModalOpen}
                    onClose={() => {
                        setAssignModalOpen(false);
                        setSelectedComplaint(null);
                    }}
                    complaintId={selectedComplaint.id}
                    complaintTitle={selectedComplaint.title}
                    onSuccess={() => {
                        fetchComplaints();
                    }}
                />
            )}

            {selectedDetailComplaintId && (
                <ComplaintDetailModal
                    isOpen={detailModalOpen}
                    onClose={() => {
                        setDetailModalOpen(false);
                        setSelectedDetailComplaintId(null);
                    }}
                    complaintId={selectedDetailComplaintId}
                />
            )}
        </div>
    );
}
