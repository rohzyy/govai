"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/ui/GlassCard';
import api from '@/lib/api';

export default function SignupPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setApiError("");
        try {
            await api.post('/auth/signup', {
                email: data.email,
                password: data.password,
                full_name: data.full_name,
                role: "citizen"
            });
            // Auto login after signup
            const loginRes = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            });
            localStorage.setItem('token', loginRes.data.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setApiError(err.response?.data?.detail || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
            <Navbar />

            <div className="w-full max-w-md">
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-gray-400">Join the civic revolution</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="Bruce Wayne"
                            {...register("full_name", { required: "Name is required" })}
                            error={errors.full_name?.message as string}
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="bruce@wayne.com"
                            {...register("email", { required: "Email is required" })}
                            error={errors.email?.message as string}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password", { required: "Password is required" })}
                            error={errors.password?.message as string}
                        />

                        {apiError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {apiError}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign Up
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Log in
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}
