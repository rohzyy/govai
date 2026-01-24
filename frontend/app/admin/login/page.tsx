"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import api from '@/lib/api';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const toast = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // NOTE: Using the secure admin endpoint
            const response = await api.post('/auth/admin/login', {
                username: email, // Reusing email field for username
                password: password
            });

            console.log("LOGIN RESPONSE OBJECT:", response);

            // Handle different possible response structures
            // Axios response.data is the body. The body has a .data field from the Next.js route wrapper.
            // So we need response.data.data.access_token
            let token = null;

            if (response.data && response.data.data && response.data.data.access_token) {
                token = response.data.data.access_token;
            } else if (response.data && response.data.access_token) {
                // Direct backend hit (fallback)
                token = response.data.access_token;
            }

            if (token) {
                console.log("✅ SAVING TOKEN:", token.substring(0, 10) + "...");
                localStorage.setItem("access_token", token);

                // Verify it was saved
                const saved = localStorage.getItem("access_token");
                if (saved !== token) {
                    console.error("❌ CRITICAL: LocalStorage failed to save token!");
                }
            } else {
                console.error("❌ NO ACCESS TOKEN FOUND IN RESPONSE. Keys:", Object.keys(response.data || {}), "Nested Keys:", response.data?.data ? Object.keys(response.data.data) : 'N/A');
            }

            localStorage.setItem("user", JSON.stringify({ role: "ADMIN" }));

            // Add small delay to ensure LS commits before redirect
            setTimeout(() => {
                window.location.href = "/admin/dashboard";
            }, 100);

        } catch (err: any) {
            toast.error("Unauthorized access. Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
            <div className="w-full max-w-md">
                <GlassCard className="p-8 border-red-500/20 bg-red-950/10">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
                        <p className="text-red-400/80 text-sm uppercase tracking-wider font-semibold">Government Officials Only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Username"
                            type="text"
                            placeholder="ADMIN"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-red-500/20 focus-visible:ring-red-500/50 block w-full px-3 py-2 bg-black/20"
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="•••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-red-500/20 focus-visible:ring-red-500/50 block w-full px-3 py-2 bg-black/20"
                        />


                        <Button type="submit" variant="danger" className="w-full" isLoading={isLoading}>
                            Authenticate
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
