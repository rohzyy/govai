import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const AIRiskAdvisory = () => {
    // In a real system, this would fetch from an endpoint like /api/admin/ai/risks
    // For now, we simulate "Smart Detection" based on static heuristics or random for demo

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 backdrop-blur-sm flex items-start gap-4"
        >
            <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-400" />
            </div>

            <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-100 flex items-center gap-2">
                    AI System Advisory
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        LIVE
                    </span>
                </h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        <span>Increased SLA breach risk in <strong>Sanitation</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <TrendingUp className="h-3 w-3 text-orange-500" />
                        <span>Complaint velocity +15% in <strong>Ward 12</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Activity className="h-3 w-3 text-green-500" />
                        <span>System Health: <strong>Stable</strong></span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
