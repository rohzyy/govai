"use client";
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Wrench, FileText, UserCheck } from 'lucide-react';

interface TimelineEvent {
    id: number;
    status: string;
    timestamp: string;
    updated_by: string;
    remarks?: string;
}

const ICONS: Record<string, any> = {
    'SUBMITTED': FileText,
    'ASSIGNED': UserCheck,
    'VISITED': MapPin,
    'IN_PROGRESS': Wrench,
    'RESOLVED': CheckCircle2,
    'VERIFIED': CheckCircle2,
    // Legacy support (fallback)
    'Complaint Submitted': FileText,
    'Assigned to Officer': UserCheck,
    'Officer Visited Location': MapPin,
    'Work in Progress': Wrench,
    'Resolved': CheckCircle2,
    'Verified by Citizen': CheckCircle2
};

const STATUS_LABELS: Record<string, string> = {
    'SUBMITTED': 'Complaint Submitted',
    'ASSIGNED': 'Assigned to Officer',
    'VISITED': 'Officer Visited Location',
    'IN_PROGRESS': 'Work in Progress',
    'RESOLVED': 'Resolved',
    'VERIFIED': 'Verified by Citizen'
};

export function GrievanceTimeline({ complaintId }: { complaintId: number }) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const fetchTimeline = async () => {
        if (document.hidden) return; // Don't poll if tab is hidden

        try {
            const res = await api.get(`/api/complaints/${complaintId}/timeline`);
            setEvents(res.data);
            setError(false);

            // Stop polling if verified
            const isVerified = res.data.some((e: TimelineEvent) => e.status === 'VERIFIED' || e.status === 'Verified by Citizen');
            if (isVerified && pollInterval.current) {
                clearInterval(pollInterval.current);
                pollInterval.current = null;
            }
        } catch (err) {
            console.error("Timeline fetch error:", err);
            // Don't show error UI if just polling fails, only if initial load fails
            if (loading) setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();

        // Polling: 30 seconds (Optimized)
        pollInterval.current = setInterval(fetchTimeline, 30000);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchTimeline(); // Immediate fetch on resume
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [complaintId]);

    if (loading) return <div className="animate-pulse h-20 bg-white/5 rounded-lg"></div>;
    if (error) return <div className="text-sm text-gray-400 italic">Timeline will update once available</div>;
    if (events.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Live Status Timeline
            </h3>

            <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pl-8 py-2">
                {events.map((event, index) => {
                    const statusKey = event.status;
                    const Icon = ICONS[statusKey] || FileText;
                    const label = STATUS_LABELS[statusKey] || statusKey;
                    const isLatest = index === events.length - 1;

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Dot/Icon on Line */}
                            <div className={`absolute -left-[41px] top-0 p-1.5 rounded-full border-2 ${isLatest ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-900 border-gray-600'
                                }`}>
                                <Icon className={`w-4 h-4 ${isLatest ? 'text-white' : 'text-gray-400'}`} />
                            </div>

                            {/* Content Card */}
                            <div className={`p-4 rounded-lg border ${isLatest ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'
                                }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-semibold ${isLatest ? 'text-blue-200' : 'text-gray-300'}`}>
                                        {label}
                                    </h4>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {new Date(event.timestamp).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {event.remarks && (
                                    <p className="text-sm text-gray-400 mt-1">{event.remarks}</p>
                                )}
                                <p className="text-xs text-gray-600 mt-2 uppercased tracking-wider">
                                    Updated by: {event.updated_by}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
