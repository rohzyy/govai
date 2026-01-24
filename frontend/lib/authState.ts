export type AuthUser = {
    id: string
    email: string
    role: 'ADMIN' | 'OFFICER' | 'USER'
}

let authReady = false
let currentUser: AuthUser | null = null


// Basic event emitter for state updates
const listeners = new Set<(state: { authReady: boolean, user: AuthUser | null }) => void>();

function notify() {
    const state = { authReady, user: currentUser };
    listeners.forEach(l => l(state));
}

export function setAuth(user: AuthUser | null) {
    currentUser = user
    authReady = true
    notify();
}

/**
 * React Hook for Auth State
 * Usage: const { user, authReady } = useAuth();
 */
import { useState, useEffect } from 'react';

export function useAuth() {
    const [state, setState] = useState({ authReady: false, user: currentUser });

    useEffect(() => {
        // Initial hydration
        const current = getAuth();
        setState(current);

        // Subscription
        const handler = (newState: { authReady: boolean, user: AuthUser | null }) => {
            setState(newState);
        };
        listeners.add(handler);

        return () => {
            listeners.delete(handler);
        };
    }, []);

    return state;
}

export function getAuth() {
    // Try to hydrate if not ready (Zero-Crash resilience)
    if (!authReady && typeof window !== 'undefined') {
        const res = hydrateAuth();
        if (res.user !== currentUser) {
            currentUser = res.user;
            // Don't notify here to avoid loops during render, just return
        }
    }
    return { authReady, user: currentUser }
}

function hydrateAuth() {
    try {
        const stored = localStorage.getItem('user');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
        // Token check
        if (!localStorage.getItem('access_token')) {
            currentUser = null;
        }
    } catch (e) {
        currentUser = null;
    }
    authReady = true;
    return { authReady, user: currentUser };
}

