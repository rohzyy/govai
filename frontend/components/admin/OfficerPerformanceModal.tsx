"use client";
import { useState, useEffect } from 'react';
import { X, User, TrendingUp, Clock, AlertTriangle, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OfficerPerformance {
    officer_id: number;
    officer_name: string;
    designation: string;
    assigned_count: number;
    resolved_count: number;
    avg_resolution_hours: number;
    sla_breach_count: number;
}

interface OfficerPerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    officerId: number;
    officerName: string;
    designation: string;
}

export default function OfficerPerformanceModal({
    isOpen,
    onClose,
    officerId,
    officerName,
    designation
}: OfficerPerformanceModalProps) {
    const [performance, setPerformance] = useState<OfficerPerformance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && officerId) {
            fetchPerformance();
        }
    }, [isOpen, officerId]);

    const fetchPerformance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/admin/officers/${officerId}/performance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPerformance(data);
            }
        } catch (error) {
            console.error('Failed to fetch performance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const resolutionRate = performance
        ? ((performance.resolved_count / performance.assigned_count) * 100).toFixed(1)
        : '0';

    const performanceRating = parseFloat(resolutionRate) >= 90 ? 'Excellent' :
        parseFloat(resolutionRate) >= 80 ? 'Good' :
            parseFloat(resolutionRate) >= 70 ? 'Average' : 'Needs Improvement';

    const ratingColor = performanceRating === 'Excellent' ? 'text-green-400 bg-green-900/30 border-green-700' :
        performanceRating === 'Good' ? 'text-blue-400 bg-blue-900/30 border-blue-700' :
            performanceRating === 'Average' ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700' :
                'text-red-400 bg-red-900/30 border-red-700';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Officer Performance Summary</h2>
                        <p className="text-sm text-gray-400 mt-1">{officerName} - {designation}</p>
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
                        <div className="text-gray-400">Loading performance data...</div>
                    </div>
                ) : performance ? (
                    <>
                        {/* Performance Rating Banner */}
                        <div className={`rounded-xl p-6 mb-6 border ${ratingColor}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-lg">
                                        <Award className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">Overall Performance Rating</p>
                                        <p className="text-3xl font-bold mt-1">{performanceRating}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-300">Resolution Rate</p>
                                    <p className="text-3xl font-bold mt-1">{resolutionRate}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs text-gray-400">Assigned</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{performance.assigned_count}</p>
                                <p className="text-xs text-gray-500 mt-1">Total grievances</p>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                    <span className="text-xs text-gray-400">Resolved</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{performance.resolved_count}</p>
                                <p className="text-xs text-gray-500 mt-1">Successfully closed</p>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                    <span className="text-xs text-gray-400">Avg Time</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{performance.avg_resolution_hours.toFixed(1)}h</p>
                                <p className="text-xs text-gray-500 mt-1">Per grievance</p>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="text-xs text-gray-400">SLA Breach</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{performance.sla_breach_count}</p>
                                <p className="text-xs text-gray-500 mt-1">Deadline missed</p>
                            </div>
                        </div>

                        {/* Performance Breakdown */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Performance Breakdown</h3>
                            <div className="space-y-4">
                                {/* Resolution Rate Bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-300">Resolution Success Rate</span>
                                        <span className="text-sm font-medium text-white">{resolutionRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${parseFloat(resolutionRate) >= 90 ? 'bg-green-500' :
                                                parseFloat(resolutionRate) >= 80 ? 'bg-blue-500' :
                                                    parseFloat(resolutionRate) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${resolutionRate}%` }}
                                        />
                                    </div>
                                </div>

                                {/* SLA Compliance */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-300">SLA Compliance Rate</span>
                                        <span className="text-sm font-medium text-white">
                                            {((1 - (performance.sla_breach_count / performance.assigned_count)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3">
                                        <div
                                            className="bg-green-500 h-3 rounded-full"
                                            style={{ width: `${((1 - (performance.sla_breach_count / performance.assigned_count)) * 100).toFixed(1)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Average vs Target Time */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-300">Speed Efficiency (Target: 48h)</span>
                                        <span className="text-sm font-medium text-white">
                                            {performance.avg_resolution_hours < 48 ? 'Above Target' : 'Below Target'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${performance.avg_resolution_hours < 48 ? 'bg-green-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${Math.min((48 / performance.avg_resolution_hours) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Insights */}
                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                            <div className="flex gap-3">
                                <TrendingUp className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-blue-300 font-medium">
                                        Performance Insights
                                    </p>
                                    <ul className="text-xs text-blue-400/80 mt-2 space-y-1 list-disc list-inside">
                                        {parseFloat(resolutionRate) >= 90 && (
                                            <li>Excellent resolution rate - consistently meeting targets</li>
                                        )}
                                        {performance.sla_breach_count === 0 && (
                                            <li>Perfect SLA compliance - no deadline breaches</li>
                                        )}
                                        {performance.avg_resolution_hours < 48 && (
                                            <li>Fast resolution time - working efficiently</li>
                                        )}
                                        {performance.sla_breach_count > 5 && (
                                            <li>Multiple SLA breaches - may need additional support</li>
                                        )}
                                        {parseFloat(resolutionRate) < 70 && (
                                            <li>Resolution rate below target - training may be beneficial</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No performance data available</p>
                    </div>
                )}

                <div className="mt-6">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="w-full"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
