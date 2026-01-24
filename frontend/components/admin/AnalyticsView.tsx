"use client";
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, FileText, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Interfaces matching backend responses
interface DashboardStats {
    total: number;
    total_processed: number;
    total_growth: number;
    pending: number;
    resolved: number;
    resolution_rate: number;
    avg_resolution_time: number;
    critical: number;
    sla_breached: number;
    unassigned: number;
    active_officers: number;
}

interface DepartmentStat {
    dept: string;
    total: number;
    pending: number;
    color: string;
}

interface MonthlyTrend {
    month: string;
    year: number;
    submitted: number;
    resolved: number;
}

interface OfficerPerformance {
    officer_id: number;
    officer_name: string;
    designation: string;
    assigned_count: number;
    resolved_count: number;
    avg_resolution_hours: number;
    sla_breach_count: number;
}

export default function AnalyticsView() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
    const [trends, setTrends] = useState<MonthlyTrend[]>([]);
    const [officerPerformance, setOfficerPerformance] = useState<OfficerPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadAnalytics = async () => {
            if (!mounted) return;
            // No setLoading(true) needed here as default state is loading=true
            await fetchAllAnalytics(mounted);
            if (mounted) setLoading(false);
        };

        loadAnalytics();

        return () => {
            mounted = false;
        };
    }, []);

    const fetchAllAnalytics = async (mounted: boolean = true) => {
        try {
            const { authSafeFetch } = await import('@/lib/authSafeFetch');

            const defaultStats: DashboardStats = {
                total: 0, total_processed: 0, total_growth: 0,
                pending: 0, resolved: 0, resolution_rate: 0,
                avg_resolution_time: 0, critical: 0, sla_breached: 0,
                unassigned: 0, active_officers: 0
            };

            // Parallel auth-safe fetches (Strict Mode Safe)
            const [statsRes, deptRes, trendsRes, officerRes] = await Promise.all([
                authSafeFetch<DashboardStats>('/api/admin/stats', {}, 'ADMIN'),
                authSafeFetch<DepartmentStat[]>('/api/admin/analytics/departments', {}, 'ADMIN'),
                authSafeFetch<MonthlyTrend[]>('/api/admin/analytics/trends', {}, 'ADMIN'),
                authSafeFetch<OfficerPerformance[]>('/api/admin/analytics/officer-performance', {}, 'ADMIN')
            ]);

            if (!mounted) return;

            if (!mounted) return;

            // Helper to unwrap "success: true, data: ..." pattern if present
            const unwrap = (res: any, defaultVal: any) => {
                if (!res.success) return defaultVal;
                // If the data property itself has a .data property (Double Wrap from Route Handler)
                if (res.data && res.data.data) return res.data.data;
                // If the data property is the object (Standard)
                return res.data || defaultVal;
            };

            setStats(unwrap(statsRes, defaultStats));
            setDeptStats(unwrap(deptRes, []));
            setTrends(unwrap(trendsRes, []));
            setOfficerPerformance(unwrap(officerRes, []));

        } catch (error) {
            console.error('Analytics crash avoided', error);
        }
    };

    const handleExportPDF = () => {
        alert('PDF export functionality will be implemented');
    };

    const handleExportExcel = () => {
        alert('Excel export functionality will be implemented');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-blue-400">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Analytics & Reports</h2>
                    <p className="text-gray-400">Department-wise pendency, trends, and officer performance</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        leftIcon={<Download className="h-4 w-4" />}
                        onClick={handleExportExcel}
                    >
                        Export Excel
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Download className="h-4 w-4" />}
                        onClick={handleExportPDF}
                    >
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600/20 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-sm text-gray-400">Total Processed</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{(stats?.total_processed ?? 0).toLocaleString()}</p>
                        <p className={`text-xs mt-1 ${(stats?.total_growth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(stats?.total_growth ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(stats?.total_growth ?? 0)}% from last month
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-600/20 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <span className="text-sm text-gray-400">Resolution Rate</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.resolution_rate ?? 0}%</p>
                        <p className="text-xs text-gray-500 mt-1">Target: &gt;90%</p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-600/20 rounded-lg">
                                <Calendar className="h-5 w-5 text-amber-400" />
                            </div>
                            <span className="text-sm text-gray-400">Avg Resolution Time</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.avg_resolution_time ?? 0}h</p>
                        <p className="text-xs text-green-400 mt-1">Based on closed cases</p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-600/20 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-purple-400" />
                            </div>
                            <span className="text-sm text-gray-400">Active Officers</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.active_officers ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Currently serving</p>
                    </div>
                </div>
            )}

            {/* Department-wise Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-6">Department-wise Pendency</h3>
                <div className="space-y-4">
                    {deptStats.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">No department data available</div>
                    ) : (
                        deptStats.map((item, idx) => {
                            const percentage = item.total > 0 ? (item.pending / item.total) * 100 : 0;
                            // Assign colors cyclically just for variety or based on percentage
                            const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                            const color = colors[idx % colors.length];

                            return (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-300">{item.dept}</span>
                                        <span className="text-sm text-gray-400">
                                            {item.pending} / {item.total} Pending ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3">
                                        <div
                                            className={`${color} h-3 rounded-full transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-6">Monthly Grievance Trends (Last 12 Months)</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {trends.map((item, idx) => {
                        // Determine scale based on max value in dataset to prevent overflow
                        const maxVal = Math.max(...trends.map(t => Math.max(t.submitted, t.resolved)), 10); // min 10
                        const submittedHeight = (item.submitted / maxVal) * 100;
                        const resolvedHeight = (item.resolved / maxVal) * 100;

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                <div className="flex gap-1 w-full h-full items-end justify-center">
                                    <div
                                        className="w-3 md:w-6 bg-blue-500/50 border-t-2 border-blue-400 rounded-t hover:bg-blue-500/80 transition-all cursor-pointer relative"
                                        style={{ height: `${submittedHeight}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            Sub: {item.submitted}
                                        </div>
                                    </div>
                                    <div
                                        className="w-3 md:w-6 bg-green-500/50 border-t-2 border-green-400 rounded-t hover:bg-green-500/80 transition-all cursor-pointer relative"
                                        style={{ height: `${resolvedHeight}%` }}
                                    >
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            Res: {item.resolved}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-500">{item.month}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500/50 border border-blue-400 rounded"></div>
                        <span className="text-sm text-gray-400">Submitted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500/50 border border-green-400 rounded"></div>
                        <span className="text-sm text-gray-400">Resolved</span>
                    </div>
                </div>
            </div>

            {/* Officer Performance Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Officer Performance Comparison</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Officer Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Designation</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Assigned</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Resolved</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Resolution Rate</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Avg Time (hrs)</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">SLA Breaches</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {officerPerformance.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        No officer performance data available
                                    </td>
                                </tr>
                            ) : (
                                officerPerformance.map((officer, idx) => {
                                    const resolutionRate = officer.assigned_count > 0
                                        ? ((officer.resolved_count / officer.assigned_count) * 100).toFixed(1)
                                        : "0.0";

                                    // Performance Logic
                                    let performance = 'Average';
                                    const rate = parseFloat(resolutionRate);
                                    if (rate >= 90 && officer.avg_resolution_hours < 48) performance = 'Excellent';
                                    else if (rate >= 75) performance = 'Good';
                                    else if (rate < 50) performance = 'Needs Improvement';

                                    const perfColor = performance === 'Excellent' ? 'text-green-400' :
                                        performance === 'Good' ? 'text-blue-400' :
                                            performance === 'Average' ? 'text-yellow-400' : 'text-red-400';

                                    return (
                                        <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3 px-4 text-sm text-white font-medium">{officer.officer_name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-400">{officer.designation}</td>
                                            <td className="py-3 px-4 text-sm text-center text-white">{officer.assigned_count}</td>
                                            <td className="py-3 px-4 text-sm text-center text-green-400">{officer.resolved_count}</td>
                                            <td className="py-3 px-4 text-sm text-center text-white">{resolutionRate}%</td>
                                            <td className="py-3 px-4 text-sm text-center text-white">{officer.avg_resolution_hours}</td>
                                            <td className="py-3 px-4 text-sm text-center">
                                                <span className={`px-2 py-1 rounded ${officer.sla_breach_count === 0 ? 'bg-green-900/30 text-green-400' : officer.sla_breach_count <= 2 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                                                    {officer.sla_breach_count}
                                                </span>
                                            </td>
                                            <td className={`py-3 px-4 text-sm text-center font-medium ${perfColor}`}>
                                                {performance}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


