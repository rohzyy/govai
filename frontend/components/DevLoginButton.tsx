'use client';

import { Button } from './ui/Button';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { ShieldCheck } from 'lucide-react';

export default function DevLoginButton() {
    const router = useRouter();
    const toast = useToast();

    const handleDevLogin = async () => {
        try {
            const res = await api.post('/auth/google', {
                token: "MOCK_GOOGLE_TOKEN", // Special token handled by backend
            });

            if (res.data?.token && res.data?.user) {
                await completeLogin(res.data);
            } else {
                if (res.data?.success) {
                    await completeLogin(res.data.data);
                } else {
                    console.warn("Dev login failed:", res.data);
                    toast.error(res.data?.safeMessage || "Dev login failed.");
                }
            }
        } catch (err: any) {
            console.error("Dev login failed", err);
            toast.error("Dev login failed. Is the backend running?");
        }
    };

    const completeLogin = async (data: any) => {
        if (!data || !data.user) {
            toast.error("Login failed: Invalid response.");
            return;
        }

        // Store user info
        if (data.token) {
            localStorage.setItem("access_token", data.token);
        }
        localStorage.setItem("user", JSON.stringify(data.user));

        // Update Global Auth State
        const { setAuth } = await import('@/lib/authState');
        setAuth({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role || 'USER'
        });

        toast.success(`Welcome back, ${data.user.name}`);

        // Redirect based on role
        // Redirect based on role (FORCE /dashboard for Dev Login)
        // if (data.user.role === "ADMIN") {
        //     router.push('/admin/dashboard');
        // } else {
            router.push('/dashboard');
        // }
    };

    return (
        <Button
            variant="secondary"
            className="w-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20"
            onClick={handleDevLogin}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
        >
            Dev Login (Test User)
        </Button>
    );
}
