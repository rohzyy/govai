"use client";
import { GlassCard } from "./ui/GlassCard";
import { MapPin, MoreVertical, CheckCircle, XCircle, Archive as ArchiveIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface ComplaintProps {
    complaint: any;
    onResolve?: (id: number, title: string) => void;
    onWithdraw?: (id: number, title: string) => void;
    isArchived?: boolean;
}

export function ComplaintCard({ complaint, onResolve, onWithdraw, isArchived = false }: ComplaintProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const statusColors: any = {
        "NEW": "text-blue-400 bg-blue-400/10 border-blue-400/20",
        "Pending": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        "In Progress": "text-blue-400 bg-blue-400/10 border-blue-400/20",
        "Work Completed": "text-green-400 bg-green-400/10 border-green-400/20",
        "Resolved": "text-green-400 bg-green-400/10 border-green-400/20",
        "RESOLVED": "text-green-400 bg-green-400/10 border-green-400/20",
        "Closed by Citizen": "text-gray-400 bg-gray-400/10 border-gray-400/20",
        "Withdrawn by Citizen": "text-red-400 bg-red-400/10 border-red-400/20",
        "Rejected": "text-red-400 bg-red-400/10 border-red-400/20",
    };

    const priorityColors: any = {
        "Low": "text-green-400",
        "Medium": "text-yellow-400",
        "High": "text-orange-400",
        "Critical": "text-red-500 font-bold",
    };

    const handleResolveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        console.log("Resolve clicked for complaint:", complaint.id);
        onResolve?.(complaint.id, complaint.title);
    };

    const handleWithdrawClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        console.log("Withdraw clicked for complaint:", complaint.id);
        onWithdraw?.(complaint.id, complaint.title);
    };

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    return (
        <GlassCard className={cn(
            "p-5 flex flex-col gap-4 relative",
            isArchived && "opacity-60"
        )}>
            {/* Three-dot menu */}
            {!isArchived && (
                <div className="absolute top-4 right-4" ref={menuRef}>
                    <button
                        onClick={handleMenuToggle}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                            <button
                                onClick={handleResolveClick}
                                className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Mark as Resolved
                            </button>
                            <div className="h-px bg-white/10" />
                            <button
                                onClick={handleWithdrawClick}
                                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                                <XCircle className="h-4 w-4" />
                                Withdraw Complaint
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Archived badge */}
            {isArchived && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400">
                    <ArchiveIcon className="h-3 w-3" />
                    Archived
                </div>
            )}

            <div className="flex justify-between items-start pr-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={cn("text-xs px-2 py-1 rounded-full border inline-block", statusColors[complaint.status] || statusColors["NEW"])}>
                            {complaint.status}
                        </span>
                        <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                            ID: #{complaint.id}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{complaint.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{complaint.description}</p>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", priorityColors[complaint.priority])}>
                    {complaint.priority} Priority
                </span>
                <span className="text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {complaint.location}
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    {complaint.category}
                </div>
            </div>
        </GlassCard>
    );
}
