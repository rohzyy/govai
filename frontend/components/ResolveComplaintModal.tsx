"use client";
import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { StarRating } from './ui/StarRating';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface ResolveComplaintModalProps {
    complaintId: number;
    complaintTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ResolveComplaintModal({
    complaintId,
    complaintTitle,
    isOpen,
    onClose,
    onSuccess
}: ResolveComplaintModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (rating === 0) {
            toast.warning("Please provide a rating");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/complaints/${complaintId}/resolve`, {
                feedback: {
                    rating,
                    comment: comment || null
                }
            });

            toast.success("Complaint resolved and archived successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to resolve complaint");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Confirm Resolution</h2>
                        <p className="text-sm text-gray-400">{complaintTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Warning Message */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                    <p className="text-yellow-200 text-sm">
                        Are you sure this public issue has been resolved?{' '}
                        <span className="font-semibold">This action cannot be undone.</span>
                    </p>
                </div>

                {/* Rating Section */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rate the resolution quality <span className="text-red-400">*</span>
                        </label>
                        <StarRating value={rating} onChange={setRating} />
                    </div>

                    {/* Optional Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Additional Comments (Optional)
                        </label>
                        <textarea
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all resize-none"
                            placeholder="Share your experience with the resolution..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                    </div>
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
                        variant="default"
                        onClick={handleConfirm}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        isLoading={loading}
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                    >
                        Yes, Issue Resolved
                    </Button>
                </div>
            </div>
        </div>
    );
}
