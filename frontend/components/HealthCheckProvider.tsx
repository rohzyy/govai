"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

interface HealthContextType {
    isHealthy: boolean;
    error: string | null;
}

const HealthContext = createContext<HealthContextType>({ isHealthy: true, error: null });

export const HealthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isHealthy, setIsHealthy] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkHealth = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

            console.log(`[SAFETY] Checking backend health at ${apiUrl}...`);

            try {
                // 1. Connectivity & CORS Assertion
                // We use a shorter timeout for the initial check to keep it "Fail-Fast"
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 3000);

                const res = await fetch(`${apiUrl}/health`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });

                clearTimeout(id);

                if (!res.ok) {
                    throw new Error(`Technical Failure: Backend returned ${res.status}`);
                }

                const data = await res.json();
                if (data.status === 'healthy') {
                    console.log(`[SAFETY] Backend is healthy (v${data.version})`);
                    setIsHealthy(true);
                    setError(null);
                } else {
                    throw new Error("Backend degraded: Health check failed.");
                }
            } catch (err: any) {
                // 2. Fail-Fast
                setIsHealthy(false);
                const msg = err.name === 'AbortError'
                    ? `Backend Timeout: Check if service at ${apiUrl} is alive.`
                    : `Backend Unreachable at ${apiUrl}. Verify your server is running and CORS is configured.`;

                setError(msg);
                console.error("FAIL-FAST SAFETY TRIGGERED:", msg);
            } finally {
                setIsLoading(false);
            }
        };

        checkHealth();
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col items-center justify-center z-[9999]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-mono text-sm">Verifying System Integrity...</p>
            </div>
        );
    }

    if (!isHealthy) {
        return (
            <div className="fixed inset-0 bg-red-950/20 backdrop-blur-xl flex items-center justify-center z-[9999] p-6">
                <div className="bg-black/80 p-8 rounded-2xl border border-red-500/30 max-w-lg w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">System Connectivity Failure</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed font-mono text-sm whitespace-pre-wrap">{error}</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-600/20"
                        >
                            Retry Connection
                        </button>
                        <button
                            onClick={() => window.open('https://github.com/rohzyy/govai', '_blank')}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-all text-sm"
                        >
                            Documentation & Support
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <HealthContext.Provider value={{ isHealthy, error }}>
            {children}
        </HealthContext.Provider>
    );
};

export const useHealth = () => useContext(HealthContext);
