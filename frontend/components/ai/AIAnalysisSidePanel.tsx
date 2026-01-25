'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertTriangle, Clock, Info, Sparkles, Building2, Zap, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface AIAnalysisSidePanelProps {
    analysis: {
        category?: string;
        department?: string;
        priority?: string;
        ert?: string;
        confidence?: number;
        reasoning?: string[];
    } | null;
    loading: boolean;
}

// Animated circular progress for confidence
const ConfidenceRing = ({ value }: { value: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    
    const getColor = (score: number) => {
        if (score >= 85) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
        if (score >= 60) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' };
        return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' };
    };
    
    const colors = getColor(value);
    
    return (
        <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Glow effect */}
            <div 
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ backgroundColor: colors.glow }}
            />
            
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                >
                    {value}%
                </motion.span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Confidence</span>
            </div>
        </div>
    );
};

// Shimmer loading skeleton
const ShimmerSkeleton = ({ className }: { className?: string }) => (
    <div className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
);

// Priority badge with glow
const PriorityBadge = ({ priority }: { priority: string }) => {
    const config: Record<string, { bg: string; text: string; glow: string; dot: string }> = {
        Critical: { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/30', dot: 'bg-red-500' },
        High: { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: 'shadow-orange-500/30', dot: 'bg-orange-500' },
        Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'shadow-yellow-500/30', dot: 'bg-yellow-500' },
        Low: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/30', dot: 'bg-green-500' },
    };
    
    const style = config[priority] || config.Medium;
    
    return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bg} shadow-lg ${style.glow}`}
        >
            <span className={`h-2 w-2 rounded-full ${style.dot} animate-pulse`} />
            <span className={`text-sm font-semibold ${style.text}`}>{priority}</span>
        </motion.div>
    );
};

export const AIAnalysisSidePanel = ({ analysis, loading }: AIAnalysisSidePanelProps) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="relative h-full">
            {/* Animated gradient border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 blur-sm animate-[gradient_3s_ease_infinite]" 
                style={{ backgroundSize: '200% 200%' }} 
            />
            
            <div className="relative h-full rounded-2xl bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`p-2 rounded-xl bg-blue-500/20 ${loading ? 'animate-pulse' : ''}`}>
                                <Bot className="h-5 w-5 text-blue-400" />
                            </div>
                            {loading && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                AI Analysis
                                {!loading && analysis && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                                        Live
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-400">
                                {loading ? 'Processing your complaint...' : 'Real-time classification'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex justify-center py-4">
                                    <div className="relative w-28 h-28">
                                        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                                    </div>
                                </div>
                                <ShimmerSkeleton className="h-4 w-3/4 mx-auto" />
                                <ShimmerSkeleton className="h-4 w-1/2 mx-auto" />
                                <div className="space-y-3 pt-4">
                                    <ShimmerSkeleton className="h-16 w-full" />
                                    <ShimmerSkeleton className="h-16 w-full" />
                                </div>
                            </motion.div>
                        ) : analysis ? (
                            <motion.div
                                key="analysis"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* Confidence Ring */}
                                <div className="flex justify-center">
                                    <ConfidenceRing value={analysis.confidence || 0} />
                                </div>

                                {/* Priority */}
                                <div className="flex justify-center">
                                    <PriorityBadge priority={analysis.priority || 'Medium'} />
                                </div>

                                {/* Info Cards */}
                                <div className="space-y-3">
                                    {/* Category Card */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/20">
                                                <Sparkles className="h-4 w-4 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Detected Issue</p>
                                                <p className="text-sm font-medium text-white">{analysis.category}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Department Card */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/20">
                                                <Building2 className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Assigned Department</p>
                                                <p className="text-sm font-medium text-white">{analysis.department}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* ERT Card */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                                <Clock className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Est. Resolution Time</p>
                                                <p className="text-sm font-medium text-white">{analysis.ert}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Reasoning Section */}
                                {analysis.reasoning && analysis.reasoning.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="pt-2"
                                    >
                                        <button
                                            onClick={() => setExpanded(!expanded)}
                                            className="w-full group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 hover:border-white/20 transition-all"
                                            type="button"
                                        >
                                            <span className="text-sm text-blue-400 font-medium flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                {expanded ? 'Hide AI Reasoning' : 'Why AI chose this?'}
                                            </span>
                                            <motion.span 
                                                animate={{ rotate: expanded ? 180 : 0 }}
                                                className="text-gray-400"
                                            >
                                                ↓
                                            </motion.span>
                                        </button>

                                        <AnimatePresence>
                                            {expanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <ul className="mt-3 space-y-2 pl-4">
                                                        {analysis.reasoning.map((reason, i) => (
                                                            <motion.li 
                                                                key={i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                className="text-xs text-gray-400 flex items-start gap-2"
                                                            >
                                                                <span className="mt-1.5 h-1 w-1 rounded-full bg-blue-400 flex-shrink-0" />
                                                                {reason}
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* Low Confidence Warning */}
                                {(analysis.confidence || 0) < 60 && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3"
                                    >
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                        <p className="text-xs text-yellow-200">
                                            AI confidence is low — manual review recommended
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="p-4 rounded-2xl bg-white/5 mb-4">
                                    <Zap className="h-8 w-8 text-gray-600" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Awaiting Input</h4>
                                <p className="text-xs text-gray-600 max-w-[200px]">
                                    Start typing your complaint description and AI will analyze it in real-time
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
