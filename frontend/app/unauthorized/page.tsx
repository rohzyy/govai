"use client";
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { ShieldBan } from 'lucide-react';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
            <div className="w-full max-w-md text-center">
                <GlassCard className="p-10 border-red-500/20 bg-red-950/10">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldBan className="h-8 w-8 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-8">
                        You do not have permission to access this page.
                        This area is restricted to authorized personnel or specific user roles.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button onClick={() => router.push('/')}>
                            Go to Homepage
                        </Button>
                        <Button variant="ghost" onClick={() => router.back()}>
                            Go Back
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}
