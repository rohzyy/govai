"use client";
import { useState, useEffect } from 'react';
import { X, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Officer {
    id: number;
    employee_id: string;
    name: string;
    designation: string;
    ward: string;
    zone?: string;
    department_id: number;
    status: string;
}

interface ReassignComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaintId: number;
    complaintTitle: string;
    currentOfficerName: string;
    onSuccess: () => void;
}

export default function ReassignComplaintModal({
    isOpen,
    onClose,
    complaintId,
    complaintTitle,
    currentOfficerName,
    onSuccess
}: ReassignComplaintModalProps) {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            fetchOfficers();
        }
    }, [isOpen]);

    const fetchOfficers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/admin/officers?status=Active', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOfficers(data);
            }
        } catch (error) {
            console.error('Failed to fetch officers:', error);
        }
    };

    const handleReassign = async () => {
        setError('');

        // Validation
        if (!selectedOfficer) {
            setError('Please select a new officer');
            return;
        }

        if (reason.trim().length < 10) {
            setError('Reassignment reason must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/admin/complaints/${complaintId}/reassign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_officer_id: selectedOfficer,
                    reason: reason.trim()
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Grievance reassigned successfully from ${data.from_officer} to ${data.to_officer}`);
                onSuccess();
                onClose();
                // Reset form
                setSelectedOfficer(null);
                setReason('');
                setError('');
            } else {
                const error = await response.json();
                setError(error.detail || 'Failed to reassign grievance');
            }
        } catch (error) {
            console.error('Reassignment failed:', error);
            setError('Failed to reassign grievance');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectedOfficerData = officers.find(o => o.id === selectedOfficer);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Reassign with Reason</h2>
                        <p className="text-sm text-gray-400 mt-1">Grievance #{complaintId}: {complaintTitle}</p>
                        <p className="text-xs text-gray-500 mt-1">Currently assigned to: {currentOfficerName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* India Govt Compliance Notice */}
                <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-300 font-medium">
                                Reassignment Requires Valid Justification
                            </p>
                            <p className="text-xs text-amber-400/80 mt-1">
                                As per India Government accountability rules, you must provide a detailed reason for reassignment.
                                This will be permanently logged for audit and vigilance purposes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reassignment Reason - MANDATORY */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Reassignment Reason * (Mandatory - Min 10 characters)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder="Example: Previous officer on medical leave. Workload distribution required. SLA breach risk..."
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${reason.length >= 10 ? 'text-green-400' : 'text-gray-500'}`}>
                            {reason.length} / 10 characters minimum
                        </span>
                        {reason.length > 0 && reason.length < 10 && (
                            <span className="text-xs text-red-400">
                                Please provide more detail
                            </span>
                        )}
                    </div>
                </div>

                {/* New Officer Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select New Officer *
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {officers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                                <p>No active officers available</p>
                            </div>
                        ) : (
                            officers.map(officer => (
                                <div
                                    key={officer.id}
                                    onClick={() => setSelectedOfficer(officer.id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${selectedOfficer === officer.id
                                        ? 'bg-blue-600/30 border-2 border-blue-500'
                                        : 'bg-slate-800/50 border border-slate-700 hover:border-blue-500/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-white">{officer.name}</h4>
                                            <p className="text-sm text-gray-400">
                                                {officer.designation} - {officer.employee_id}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Ward {officer.ward} {officer.zone ? `• Zone ${officer.zone}` : ''}
                                            </p>
                                        </div>
                                        {selectedOfficer === officer.id && (
                                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                <div className="h-3 w-3 rounded-full bg-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Final Confirmation */}
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <User className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-300 font-medium">
                                This action will be recorded for administrative audit
                            </p>
                            <p className="text-xs text-blue-400/80 mt-1">
                                The reassignment, including the reason provided, will be permanently logged and visible in audit trails.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel Action
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleReassign}
                        disabled={!selectedOfficer || reason.trim().length < 10 || loading}
                        className="flex-1"
                    >
                        {loading ? 'Reassigning...' : 'Confirm Reassignment'}
                    </Button>
                </div>

                {/* Selection Summary */}
                {selectedOfficerData && reason.length >= 10 && (
                    <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                        <p className="text-xs text-green-300">
                            ✓ Ready to reassign to: {selectedOfficerData.name} ({selectedOfficerData.designation}) •
                            Ward {selectedOfficerData.ward} • Reason provided ({reason.length} chars)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
