"use client";
import { useState, useEffect } from 'react';
import { FileSearch, Calendar, User, Filter } from 'lucide-react';

interface AuditLog {
    id: number;
    timestamp: string;
    admin_id: string;
    action: string;
    target_resource: string;
}

export default function AuditLogsView() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filter, setFilter] = useState<'all' | 'assignment' | 'reassignment' | 'override'>('all');

    // Placeholder data - in production, fetch from /admin/audit-logs
    const placeholderLogs: AuditLog[] = [
        {
            id: 1,
            timestamp: new Date().toISOString(),
            admin_id: 'admin@municipal.gov.in',
            action: 'Assigned complaint #123 to officer PWD-JE-1042',
            target_resource: 'complaint:123'
        },
        {
            id: 2,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            admin_id: 'admin@municipal.gov.in',
            action: 'Created officer PWD-JE-1043 - Suresh Patel',
            target_resource: 'officer:PWD-JE-1043'
        },
        {
            id: 3,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            admin_id: 'admin@municipal.gov.in',
            action: 'Reassigned complaint #115 from PWD-JE-1040 to PWD-JE-1042',
            target_resource: 'complaint:115'
        }
    ];

    useEffect(() => {
        setLogs(placeholderLogs);
    }, [filter]);

    const getActionColor = (action: string) => {
        if (action.includes('Assigned')) return 'text-blue-400 bg-blue-900/20 border-blue-700';
        if (action.includes('Reassigned')) return 'text-orange-400 bg-orange-900/20 border-orange-700';
        if (action.includes('Created')) return 'text-green-400 bg-green-900/20 border-green-700';
        if (action.includes('Override')) return 'text-red-400 bg-red-900/20 border-red-700';
        return 'text-gray-400 bg-gray-900/20 border-gray-700';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Audit Logs</h2>
                    <p className="text-gray-400">Immutable administrative action trail - RTI compliant</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        All Actions
                    </button>
                    <button
                        onClick={() => setFilter('assignment')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'assignment'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        Assignments
                    </button>
                    <button
                        onClick={() => setFilter('reassignment')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'reassignment'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        Reassignments
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <FileSearch className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-300 font-medium">
                            RTI Compliance Notice
                        </p>
                        <p className="text-xs text-blue-400/80 mt-1">
                            All administrative actions are permanently logged for audit, Right to Information (RTI), and vigilance purposes.
                            These logs are immutable and cannot be edited or deleted.
                        </p>
                    </div>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Timestamp</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Admin User</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Action</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Target Resource</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-gray-500">
                                        <FileSearch className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                                        <p>No audit logs found</p>
                                        <p className="text-sm text-gray-600 mt-1">Actions will be logged as they occur</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                        <td className="py-4 px-6 text-sm text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                {new Date(log.timestamp).toLocaleString('en-IN', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                {log.admin_id}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-400 font-mono">
                                            {log.target_resource}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Count */}
            <div className="mt-4 text-sm text-gray-500 text-center">
                Displaying {logs.length} audit log entries • Immutable records • RTI compliant
            </div>
        </div>
    );
}
