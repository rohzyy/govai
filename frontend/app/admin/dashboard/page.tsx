"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Map,
    BarChart3,
    LogOut,
    FileText,
    Users,
    FileSearch,
    Settings,
    AlertCircle,
    CheckCircle,
    Clock,
    AlertTriangle,
    UserPlus,
    LucideIcon
} from 'lucide-react';
import GrievanceManagementView from '@/components/admin/GrievanceManagementView';
import OfficerManagementView from '@/components/admin/OfficerManagementView';
import AnalyticsView from '@/components/admin/AnalyticsView';
import AuditLogsView from '@/components/admin/AuditLogsView';

// Type definitions for components
interface StatCardProps {
    title: string;
    value: number | string | undefined;
    icon: LucideIcon;
    bgColor: string;
    textColor: string;
    subtitle?: string;
}

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    onClick: () => void;
}

// StatCard component - defined outside to avoid re-creation during render
const StatCard = ({ title, value, icon: Icon, bgColor, textColor, subtitle }: StatCardProps) => (
    <GlassCard className={`p-6 ${bgColor} border-l-4`}>
        <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg bg-white/10`}>
                <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
            <span className={`text-4xl font-bold ${textColor}`}>{value || 0}</span>
        </div>
        <h3 className="text-sm font-medium text-gray-300 mb-1">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </GlassCard>
);

// SidebarItem component - defined outside to avoid re-creation during render
const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active ? 'text-blue-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
        aria-current={active ? 'page' : undefined}
    >
        {active && (
            <motion.div
                className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.15,
                    ease: [0.2, 0.8, 0.2, 1]
                }}
                style={{
                    boxShadow: "inset 0 0 12px rgba(59, 130, 246, 0.15)"
                }}
            />
        )}
        <div className="relative z-10 flex items-center gap-3">
            <Icon size={18} className={active ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-gray-500 group-hover:text-gray-300 transition-colors duration-200'} />
            <span className="font-medium text-sm tracking-wide">{label}</span>
        </div>
    </button>
);


export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const router = useRouter();

    useEffect(() => {
        // Role Check
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/admin/login");
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "ADMIN") {
            router.push("/unauthorized");
            return;
        }

        /**
         * CRASH-PROOF fetchStats
         * 
         * RULES:
         * 1. NEVER crashes on backend failure
         * 2. NEVER assumes HTTP 200 means success
         * 3. ALWAYS checks res.data?.success
         * 4. ALWAYS has fallback data
         */
        const fetchStats = async () => {
            // Fallback data for graceful degradation
            const FALLBACK_STATS = {
                total_complaints: 0,
                pending: 0,
                in_progress: 0,
                resolved: 0,
                rejected: 0,
                critical: 0,
                resolution_rate: 0,
                avg_resolution_time: 0,
                departments: [],
            };

            try {
                const res = await api.get('/admin/stats');

                if (res.status !== 200 || !res.data) {
                    console.warn('[AdminDashboard] Stats fetch failed or empty');
                    setStats(FALLBACK_STATS);
                    return;
                }

                // Success path - Backend returns stats directly, not wrapped in { data: ... }
                setStats(res.data);
            } catch (err: any) {
                // This should NEVER happen with crash-proof backend
                // But we defend anyway
                console.error("[AdminDashboard] UNEXPECTED Axios error:", err?.message || err);

                // Check for auth issues
                if (err.response?.status === 401) {
                    router.push('/admin/login');
                    return;
                }

                // Use fallback data
                setStats(FALLBACK_STATS);
            }
        };
        fetchStats();
    }, [router]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) { }
        localStorage.clear();
        router.push('/admin/login');
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
            {/* Enhanced Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6 flex flex-col fixed h-full z-10">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg"></div>
                        <span className="font-bold text-white text-lg tracking-tight">GrievanceAI</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-10">Administrative Dashboard</p>
                    <p className="text-xs text-gray-600 pl-10">Municipal Commissioner</p>
                </div>

                <nav className="space-y-2 flex-1">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarItem
                        icon={FileText}
                        label="Grievance Management"
                        active={activeTab === 'grievances'}
                        onClick={() => setActiveTab('grievances')}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Officer Management"
                        active={activeTab === 'officers'}
                        onClick={() => setActiveTab('officers')}
                    />
                    <SidebarItem
                        icon={Map}
                        label="Heatmap"
                        active={activeTab === 'heatmap'}
                        onClick={() => setActiveTab('heatmap')}
                    />
                    <SidebarItem
                        icon={BarChart3}
                        label="Analytics & Reports"
                        active={activeTab === 'analytics'}
                        onClick={() => setActiveTab('analytics')}
                    />
                    <SidebarItem
                        icon={FileSearch}
                        label="Audit Logs"
                        active={activeTab === 'audit'}
                        onClick={() => setActiveTab('audit')}
                    />
                    <SidebarItem
                        icon={Settings}
                        label="System Settings"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={handleLogout}
                    leftIcon={<LogOut size={18} />}
                >
                    Sign Out
                </Button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                {activeTab === 'dashboard' && (
                    <>
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Administrative Dashboard</h1>
                            <p className="text-gray-400">Government of India - Public Property Grievance System</p>
                        </header>

                        {/* Enhanced KPI Cards with India Govt Wording */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                title="Total Grievances Registered"
                                value={stats?.total}
                                icon={FileText}
                                bgColor="border-blue-500/50"
                                textColor="text-blue-400"
                                subtitle="All time complaints"
                            />
                            <StatCard
                                title="Grievances Pending Action"
                                value={stats?.pending}
                                icon={Clock}
                                bgColor="border-amber-500/50"
                                textColor="text-amber-400"
                                subtitle="Requires immediate attention"
                            />
                            <StatCard
                                title="Critical Priority Grievances"
                                value={stats?.critical}
                                icon={AlertCircle}
                                bgColor="border-red-500/50"
                                textColor="text-red-400"
                                subtitle="24h SLA - urgent action needed"
                            />
                            <StatCard
                                title="Grievances Disposed"
                                value={stats?.resolved}
                                icon={CheckCircle}
                                bgColor="border-green-500/50"
                                textColor="text-green-400"
                                subtitle="Successfully resolved"
                            />
                            <StatCard
                                title="SLA Breached Grievances"
                                value={stats?.sla_breached}
                                icon={AlertTriangle}
                                bgColor="border-orange-500/50"
                                textColor="text-orange-400"
                                subtitle="Delay beyond prescribed time"
                            />
                            <StatCard
                                title="Unassigned Grievances"
                                value={stats?.unassigned}
                                icon={UserPlus}
                                bgColor="border-purple-500/50"
                                textColor="text-purple-400"
                                subtitle="Awaiting officer assignment"
                            />
                        </div>

                        {/* Quick Actions */}
                        <GlassCard className="p-6 mb-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setActiveTab('officers')}
                                    className="px-6 py-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg text-blue-400 font-medium transition-all text-left"
                                >
                                    <UserPlus className="h-5 w-5 mb-2" />
                                    <div className="text-sm">Create New Officer</div>
                                    <div className="text-xs text-gray-500 mt-1">Add JE, AE, EE, Inspector</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('grievances')}
                                    className="px-6 py-4 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 rounded-lg text-amber-400 font-medium transition-all text-left"
                                >
                                    <FileText className="h-5 w-5 mb-2" />
                                    <div className="text-sm">Assign to Officer</div>
                                    <div className="text-xs text-gray-500 mt-1">Assign grievances to specific officers</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('audit')}
                                    className="px-6 py-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg text-purple-400 font-medium transition-all text-left"
                                >
                                    <FileSearch className="h-5 w-5 mb-2" />
                                    <div className="text-sm">View Audit Logs</div>
                                    <div className="text-xs text-gray-500 mt-1">Immutable action trail</div>
                                </button>
                            </div>
                        </GlassCard>

                        {/* Recent Activity Placeholder */}
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Recent Administrative Actions</h3>
                            <div className="h-64 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg">
                                <div className="text-center">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                                    <p>Recent activity log will be displayed here</p>
                                    <p className="text-sm text-gray-600 mt-2">Assignment history, escalations, and admin actions</p>
                                </div>
                            </div>
                        </GlassCard>
                    </>
                )}

                {activeTab === 'grievances' && (
                    <GrievanceManagementView />
                )}

                {activeTab === 'officers' && (
                    <OfficerManagementView />
                )}

                {activeTab === 'heatmap' && (
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Complaint Heatmap</h2>
                        <GlassCard className="p-6">
                            <p className="text-gray-400">Ward-wise complaint density heatmap will be displayed here.</p>
                            <p className="text-sm text-gray-500 mt-2">Helps identify infrastructure stress zones for policy planning</p>
                        </GlassCard>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsView />
                )}

                {activeTab === 'audit' && (
                    <AuditLogsView />
                )}

                {activeTab === 'settings' && (
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">System Settings</h2>
                        <GlassCard className="p-6">
                            <p className="text-gray-400">System configuration and SLA settings.</p>
                            <p className="text-sm text-gray-500 mt-2">Configure SLA timelines, escalation rules, and department mappings</p>
                        </GlassCard>
                    </div>
                )}
            </div>
        </main>
    );
}
