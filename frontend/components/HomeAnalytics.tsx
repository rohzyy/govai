"use client";
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import api from '@/lib/api';
import { CheckCircle2, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface AnalyticsData {
    total_resolved: number;
    resolution_improvement_percent: number;
    complaint_reduction_percent: number;
    avg_resolution_time_days: number;
}

export function HomeAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/public/analytics/overview');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch public analytics", error);
                // Fail gracefully
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Defaults if data missing or loading
    const stats = {
        total_resolved: data?.total_resolved || 0,
        resolution_improvement_percent: data?.resolution_improvement_percent || 0,
        complaint_reduction_percent: data?.complaint_reduction_percent || 0,
        avg_resolution_time_days: data?.avg_resolution_time_days || 0
    };

    const cards = [
        {
            label: "Complaints Resolved",
            value: stats.total_resolved.toLocaleString() + "+",
            desc: "Successfully addressed by government",
            icon: CheckCircle2,
            trend: null,
            color: "emerald" // Green
        },
        {
            label: "Resolution Efficiency",
            value: `▲ ${stats.resolution_improvement_percent}%`,
            desc: "Improvement vs previous period",
            icon: TrendingUp,
            trend: "positive",
            color: "blue"
        },
        {
            label: "Complaint Reduction",
            value: `▼ ${stats.complaint_reduction_percent}%`,
            desc: "Fewer complaints vs last quarter",
            icon: TrendingDown,
            trend: "positive", // Reduction is good in this context
            color: "purple"
        },
        {
            label: "Avg. Resolution Time",
            value: `${stats.avg_resolution_time_days} days`,
            desc: "Faster grievance resolution",
            icon: Clock,
            trend: null,
            color: "amber"
        }
    ];

    if (loading) return null; // Or skeleton, but user said "Fast" and "No clutter"

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-16">
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-white/90">Government Impact Overview</h2>
                <p className="text-sm text-white/50">Real-time insights on grievance resolution</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <AnalyticsCard key={index} card={card} index={index} />
                ))}
            </div>
        </section>
    );
}

function AnalyticsCard({ card, index }: { card: any, index: number }) {
    // Parallax & Glow Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [6, -6]); // Reverse for natural tilt
    const rotateY = useTransform(x, [-100, 100], [-6, 6]);

    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const rotateXSpring = useSpring(rotateX, springConfig);
    const rotateYSpring = useSpring(rotateY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Color Maps
    const bgColors: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    };

    const iconColors: Record<string, string> = {
        emerald: "bg-emerald-500/20 text-emerald-500",
        blue: "bg-blue-500/20 text-blue-500",
        purple: "bg-purple-500/20 text-purple-500",
        amber: "bg-amber-500/20 text-amber-500"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            style={{
                perspective: 1000,
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-auto min-h-[150px]"
        >
            <div className={`
                relative h-full w-full rounded-2xl border border-white/10
                bg-gradient-to-br from-white/[0.08] to-white/[0.02] 
                backdrop-blur-xl shadow-xl overflow-hidden
                p-5 flex flex-col justify-between group
                transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
            `}>
                {/* Glow Effect */}
                <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-${card.color}-500/30 to-transparent blur-2xl`}
                    style={{ transform: 'translateZ(-1px)' }}
                />

                <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[card.color]}`}>
                        <card.icon className="w-5 h-5" />
                    </div>
                </div>

                <div className="mt-auto">
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                        {card.value}
                    </h3>
                    <p className="text-sm font-medium text-white/60 mb-1">{card.label}</p>
                    <p className="text-xs text-white/40 break-words leading-relaxed max-w-[240px]">{card.desc}</p>
                </div>
            </div>
        </motion.div>
    );
}
