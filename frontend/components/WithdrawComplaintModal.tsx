"use client";
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface WithdrawComplaintModalProps {
    complaintId: number;
    complaintTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function WithdrawComplaintModal({
    complaintId,
    complaintTitle,
    isOpen,
    onClose,
    onSuccess
}: WithdrawComplaintModalProps) {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await api.post(`/complaints/${complaintId}/withdraw`);

            toast.success("Complaint withdrawn successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to withdraw complaint");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Withdraw Complaint</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6 space-y-4">
                    <p className="text-sm text-gray-400">
                        <span className="font-semibold text-white">{complaintTitle}</span>
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-red-200 text-sm">
                            Are you sure you want to withdraw this complaint?{' '}
                            <span className="font-semibold">This action cannot be undone.</span>
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">
                        The complaint will be archived and removed from your active complaints list.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirm}
                        className="flex-1"
                        isLoading={loading}
                    >
                        Withdraw Complaint
                    </Button>
                </div>
            </div>
        </div>
    );
}
