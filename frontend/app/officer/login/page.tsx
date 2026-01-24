"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import api from '@/lib/api';
import { UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function OfficerLoginPage() {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const toast = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/officer/login', {
                username: employeeId,
                password: password
            });

            // Store access token and officer info
            if (response.data.access_token) {
                localStorage.setItem("access_token", response.data.access_token);
            }
            localStorage.setItem("user", JSON.stringify({
                role: "OFFICER",
                officer: response.data.officer
            }));

            router.push("/officer/dashboard");

        } catch (err: any) {
            console.error("Login error:", err);
            if (err.response) {
                // Server responded with error
                toast.error(err.response.data?.detail || "Invalid credentials");
            } else if (err.request) {
                // Request made but no response (Network Error / CORS)
                toast.error("Network Error: Could not reach server. Check console.");
            } else {
                // Something else
                toast.error(err.message || "An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
            <div className="w-full max-w-md">
                <GlassCard className="p-8 border-blue-500/20 bg-blue-950/10">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                            <UserCheck className="h-6 w-6 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Officer Portal</h1>
                        <p className="text-blue-400/80 text-sm uppercase tracking-wider font-semibold">Government Officials Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Officer ID"
                            type="text"
                            placeholder="Officer ID"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="border-blue-500/20 focus-visible:ring-blue-500/50 block w-full px-3 py-2 bg-black/20"
                            required
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="•••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-blue-500/20 focus-visible:ring-blue-500/50 block w-full px-3 py-2 bg-black/20"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">Default password: Your Employee ID</p>
                        </div>


                        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                            Login as Officer
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
                            ← Return to Citizen Portal
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}
