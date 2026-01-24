
"use client";
import { Navbar } from '@/components/Navbar';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { GrievanceTimeline } from '@/components/GrievanceTimeline';

export default function TrackStatusPage() {
    const [complaintId, setComplaintId] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        // ... (existing code, keeping it concise in replacement if allowed by tool, but need to be careful with replace_file_content context matching)
        // Actually, better to just fix the import at the top and the JSX at the bottom separately or in one go if I include enough context.
        // Let's do the import first.

        e.preventDefault();
        setLoading(true);
        setError('');
        setStatus(null);

        try {
            // Sanitize input: remove # and any non-numeric characters
            const cleanId = complaintId.replace(/\D/g, '');

            if (!cleanId) {
                setError('Please enter a valid numeric Complaint ID.');
                setLoading(false);
                return;
            }

            // Use existing public status endpoint
            const res = await api.get(`/complaints/${cleanId}/status`);
            setStatus(res.data);
        } catch (err: any) {
            setError(err.response?.data?.safeMessage || err.message || 'Complaint not found or access denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="pt-24 px-6 max-w-lg mx-auto text-white">
                <h1 className="text-3xl font-bold mb-6">Track Complaint Status</h1>

                <form onSubmit={handleTrack} className="glass-card p-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Complaint ID</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Enter Complaint ID (e.g. 1045)"
                            value={complaintId}
                            onChange={(e) => setComplaintId(e.target.value)}
                        />
                    </div>
                    <Button className="w-full" disabled={!complaintId || loading}>
                        {loading ? 'Tracking...' : 'Track Status'}
                    </Button>
                </form>

                {status && (
                    <>
                        <div className="mt-6 p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <h3 className="text-lg font-bold text-green-400">Status Found</h3>
                            <div className="mt-4 space-y-2">
                                <p className="text-gray-300">Complaint ID: <span className="text-white font-mono">{status.id || complaintId}</span></p>
                                <p className="text-gray-300">
                                    Current State:
                                    <span className={`ml-2 px-3 py-1 rounded text-sm font-bold ${status.status === 'Resolved' ? 'bg-green-500/20 text-green-300' :
                                        status.status === 'NEW' ? 'bg-blue-500/20 text-blue-300' :
                                            'bg-white/10 text-white'
                                        }`}>
                                        {status.status || 'Unknown Status'}
                                    </span>
                                </p>
                                {status.updated_at && (
                                    <p className="text-gray-400 text-sm">Last Updated: {new Date(status.updated_at).toLocaleString()}</p>
                                )}
                            </div>
                        </div>

                        <GrievanceTimeline complaintId={status.id} />
                    </>
                )}
                {error && (
                    <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
