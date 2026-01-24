import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AITrustBadgeProps {
    score: number;
    flags: string | null;
}

export const AITrustBadge = ({ score, flags }: AITrustBadgeProps) => {
    // 1. Perfect Trust (Score 1.0) - Hidden by default to reduce noise
    if (score >= 0.95 && !flags) return null;

    // 2. Parse Flags
    let flagList: string[] = [];
    try {
        if (flags) flagList = JSON.parse(flags);
    } catch (e) {
        flagList = ["Unknown Anomaly"];
    }

    // 3. Render Warning Badge
    return (
        <div className="group relative flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full w-fit cursor-help">
            <AlertTriangle className="h-3 w-3 text-orange-400" />
            <span className="text-xs font-semibold text-orange-300">
                AI Notice
            </span>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold text-white">Trust Analysis: {Math.round(score * 100)}%</span>
                </div>
                <div className="space-y-1">
                    {flagList.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                            <span className="mt-1 h-1 w-1 bg-orange-500 rounded-full" />
                            {flag}
                        </div>
                    ))}
                    <p className="mt-2 text-[10px] text-gray-500 italic">
                        Advisory only. Does not affect workflow.
                    </p>
                </div>
            </div>
        </div>
    );
};
