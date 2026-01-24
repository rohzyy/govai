"use client";
import { useState, useEffect } from 'react';
import { X, Search, AlertCircle } from 'lucide-react';
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

interface AssignComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaintId: number;
    complaintTitle: string;
    onSuccess: () => void;
}

export default function AssignComplaintModal({
    isOpen,
    onClose,
    complaintId,
    complaintTitle,
    onSuccess
}: AssignComplaintModalProps) {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
    const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);
    const [priority, setPriority] = useState<string>('Medium');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOfficers();
        }
    }, [isOpen]);

    const fetchOfficers = async () => {
        try {
            const token = localStorage.getItem('access_token');

            // CRITICAL: Prevent unauthorized fetch attempt
            if (!token) {
                console.warn("fetchOfficers: No access_token found. Skipping fetch.");
                setOfficers([]);
                return;
            }

            const headers: HeadersInit = {};
            headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('http://localhost:8000/admin/officers?status=Active', {
                headers,
                credentials: 'include' // CRITICAL: Send HttpOnly Cookies
            });

            if (response.ok) {
                const data = await response.json();
                setOfficers(data || []); // Safety fallback
                setFilteredOfficers(data || []);
            } else {
                console.warn('Fetch officers status:', response.status);
                setOfficers([]);
            }
        } catch (error) {
            console.error('Failed to fetch officers (Network/CORS):', error);
            setOfficers([]); // Prevents UI crash
        }
    };

    const handleAssign = async () => {
        if (!selectedOfficer) {
            alert('Please select an officer');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:8000/admin/complaints/${complaintId}/assign`, {
                method: 'POST',
                headers,
                credentials: 'include', // CRITICAL: Send HttpOnly Cookies
                body: JSON.stringify({
                    officer_id: selectedOfficer,
                    priority: priority
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Grievance assigned successfully! SLA: ${data.sla_hours} hours`);
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to assign grievance');
            }
        } catch (error) {
            console.error('Assignment failed:', error);
            alert('Failed to assign grievance');
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
                        <h2 className="text-2xl font-bold text-white">Assign to Officer</h2>
                        <p className="text-sm text-gray-400 mt-1">Grievance #{complaintId}: {complaintTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Priority Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priority Level *
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                        <option value="Critical">Critical (24h SLA)</option>
                        <option value="High">High (48h SLA)</option>
                        <option value="Medium">Medium (5 days SLA)</option>
                        <option value="Low">Low (7 days SLA)</option>
                    </select>
                </div>

                {/* Officer Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Concerned Officer *
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredOfficers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                                <p>No active officers available</p>
                                <p className="text-sm text-gray-600 mt-1">Please create officers first</p>
                            </div>
                        ) : (
                            filteredOfficers.map(officer => (
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

                {/* Confirmation Warning */}
                <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-300 font-medium">
                                Are you sure you want to assign this grievance to the selected officer?
                            </p>
                            <p className="text-xs text-amber-400/80 mt-1">
                                This action will be recorded for administrative audit.
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
                        onClick={handleAssign}
                        disabled={!selectedOfficer || loading}
                        className="flex-1"
                    >
                        {loading ? 'Assigning...' : 'Assign to Officer'}
                    </Button>
                </div>

                {selectedOfficerData && (
                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <p className="text-xs text-blue-300">
                            ✓ Selected: {selectedOfficerData.name} ({selectedOfficerData.designation}) •
                            Ward {selectedOfficerData.ward} • SLA: {priority === 'Critical' ? '24h' : priority === 'High' ? '48h' : priority === 'Medium' ? '5 days' : '7 days'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
