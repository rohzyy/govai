import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';
import { useState } from 'react';

interface AIInsightPanelProps {
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

export const AIInsightPanel = ({ analysis, loading }: AIInsightPanelProps) => {
    const [expanded, setExpanded] = useState(false);

    if (!analysis && !loading) return null;

    const getConfidenceColor = (score: number) => {
        if (score >= 85) return "text-emerald-400";
        if (score >= 60) return "text-yellow-400";
        return "text-orange-400";
    };

    return (
        <AnimatePresence>
            {(loading || analysis) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 overflow-hidden"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Bot className={`h-5 w-5 ${loading ? 'text-blue-400 animate-pulse' : 'text-blue-400'}`} />
                        <h3 className="text-sm font-semibold text-blue-100">
                            {loading ? "AI is analyzing..." : "AI Analysis (Live)"}
                        </h3>
                        {analysis?.confidence && (
                            <div className="ml-auto flex items-center gap-1.5" title="Confidence is based on text clarity and historical patterns">
                                <span className={`text-xs font-bold ${getConfidenceColor(analysis.confidence)}`}>
                                    {analysis.confidence}% Confidence
                                </span>
                                <Info className="h-3 w-3 text-gray-500" />
                            </div>
                        )}
                    </div>

                    {!loading && analysis && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Detected Issue</p>
                                    <p className="text-gray-200 font-medium">{analysis.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Assigned Department</p>
                                    <p className="text-gray-200 font-medium">{analysis.department}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Priority Assessment</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${analysis.priority === 'Critical' ? 'bg-red-500' :
                                                analysis.priority === 'High' ? 'bg-orange-500' :
                                                    analysis.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`} />
                                        <span className="text-gray-200 font-medium">{analysis.priority}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Est. Resolution</p>
                                    <div className="flex items-center gap-1.5 text-gray-200 font-medium">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        {analysis.ert}
                                    </div>
                                </div>
                            </div>

                            {/* Reasoning Section - Expandable */}
                            {analysis.reasoning && analysis.reasoning.length > 0 && (
                                <div className="pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                        type="button"
                                    >
                                        {expanded ? "Hide Reasoning" : "Why AI chose this?"}
                                    </button>

                                    <AnimatePresence>
                                        {expanded && (
                                            <motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-2 space-y-1 pl-4 list-disc text-xs text-gray-400"
                                            >
                                                {analysis.reasoning.map((reason, i) => (
                                                    <li key={i}>{reason}</li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Low Confidence Warning */}
                            {(analysis.confidence || 0) < 60 && (
                                <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2 text-xs text-yellow-200">
                                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                    AI is unsure — manual review recommended
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
