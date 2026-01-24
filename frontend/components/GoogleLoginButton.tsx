"use client";
import { GoogleLogin } from '@react-oauth/google';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { useToast } from '@/context/ToastContext';

export default function GoogleLoginButton() {
    const router = useRouter();
    const toast = useToast();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const res = await api.post('/auth/google', {
                token: credentialResponse.credential,
            });

            // Parse Safe API Response (Direct match for backend now)
            if (res.data?.token && res.data?.user) {
                await completeLogin(res.data);
            } else {
                // Fallback for wrapped responses if they ever exist
                if (res.data?.success) {
                    await completeLogin(res.data.data);
                } else {
                    console.warn("Login API returned failure:", res.data);
                    toast.error(res.data?.safeMessage || "Login failed. Please try again.");
                }
            }
        } catch (err: any) {
            console.error("Login failed", err);

            if (err.response?.status === 401) {
                const detail = err.response?.data?.detail;
                toast.error(detail || "Invalid credentials. Please try again.");
            } else {
                toast.error("Login failed. Please try again.");
            }
        }
    };

    const completeLogin = async (data: any) => {
        if (!data || !data.user) {
            console.error("Invalid login data received", data);
            toast.error("Login failed: Invalid response.");
            return;
        }

        // Store user info (non-sensitive)
        if (data.token) {
            localStorage.setItem("access_token", data.token);
        }
        localStorage.setItem("user", JSON.stringify(data.user));

        // 🔒 UPDATE GLOBAL AUTH STATE
        const { setAuth } = await import('@/lib/authState');
        setAuth({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role || 'USER'
        });

        // Redirect based on role
        if (data.user.role === "ADMIN") {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }
    }

    const handleDevLogin = async () => {
        try {
            // Using generic safe fetch for login is slightly circular if it requires auth, 
            // but this is a public endpoint. We'll use api or internal safe fetch if we had a public variant.
            // Keeping api logic here but wrapped in try/catch as it already is.
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

            if (err.response?.status === 401) {
                const detail = err.response?.data?.detail;
                toast.error(detail || "Dev authentication failed.");
            } else {
                toast.error("Dev login failed. Please try again.");
            }
        }
    }

    return (
        <div className="flex flex-col gap-3 items-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    toast.error('Google Login connection failed');
                }}
                theme="filled_blue"
                size="large"
                shape="pill"
                text="continue_with"
            />

            {/* Dev Mode Validation Button */}
            <Button
                variant="ghost"
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors"
                onClick={handleDevLogin}
            >
                (DEV) CLICK TO LOGIN WITHOUT GOOGLE
            </Button>
        </div>
    );
}
