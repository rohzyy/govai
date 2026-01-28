"use client";
import { useState, useEffect } from 'react';
import { X, MapPin, Clock, User, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ComplaintDetail {
    id: number;
    title: string;
    description: string;
    location: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    sla_hours?: number;
    sla_deadline?: string;
    sla_breached?: boolean;
    urgency_level?: string;
    sentiment_score?: number;
    user_id: number;
    assigned_officer_id?: number;
}

interface ComplaintDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaintId: number;
}

export default function ComplaintDetailModal({
    isOpen,
    onClose,
    complaintId
}: ComplaintDetailModalProps) {
    const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && complaintId) {
            fetchComplaintDetails();
        }
    }, [isOpen, complaintId]);

    const fetchComplaintDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/complaints/${complaintId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setComplaint(data);
            }
        } catch (error) {
            console.error('Failed to fetch complaint details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Grievance Details</h2>
                        <p className="text-gray-400 text-sm">Case #{complaintId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-blue-400">Loading details...</div>
                    </div>
                ) : complaint ? (
                    <div className="space-y-6">
                        {/* Status Badge & Priority */}
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${complaint.priority === 'Critical' ? 'bg-red-900/30 text-red-400 border-red-700' :
                                complaint.priority === 'High' ? 'bg-orange-900/30 text-orange-400 border-orange-700' :
                                    'bg-green-900/30 text-green-400 border-green-700'
                                }`}>
                                {complaint.priority} Priority
                            </span>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-gray-300 border border-slate-700">
                                {complaint.status}
                            </span>
                            {complaint.category && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-400 border border-blue-700">
                                    {complaint.category}
                                </span>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">{complaint.title}</h3>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {complaint.description}
                                </p>
                            </div>
                        </div>

                        {/* Meta Data Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs uppercase tracking-wider">Location</span>
                                </div>
                                <p className="text-white font-medium">{complaint.location}</p>
                            </div>

                            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <Calendar className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs uppercase tracking-wider">Reported On</span>
                                </div>
                                <p className="text-white font-medium">
                                    {new Date(complaint.created_at).toLocaleDateString()} at {new Date(complaint.created_at).toLocaleTimeString()}
                                </p>
                            </div>

                            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <AlertCircle className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs uppercase tracking-wider">Urgency (AI)</span>
                                </div>
                                <p className="text-white font-medium">{complaint.urgency_level || "N/A"}</p>
                            </div>

                            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs uppercase tracking-wider">SLA status</span>
                                </div>
                                {complaint.sla_deadline ? (
                                    <p className={`font-medium ${complaint.sla_breached ? 'text-red-400' : 'text-green-400'}`}>
                                        {complaint.sla_breached ? 'Breached' : `${complaint.sla_hours}h Target`}
                                    </p>
                                ) : (
                                    <p className="text-gray-500">Not Assigned</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-4 border-t border-slate-800">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Failed to load details
                    </div>
                )}
            </div>
        </div>
    );
}
