"use client";
import Link from 'next/link';
import { Button } from './ui/Button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    showAuth?: boolean; // If false, show logout instead of login/getstarted
}

export function Navbar({ showAuth = true }: NavbarProps) {
    const router = useRouter();

    const handleLogout = () => {
        // Clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Redirect to home
        router.push('/');
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        GrievanceAI
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                        <Link href="/complaints/track" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Track Status</Link>
                        <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {showAuth ? (
                            <>
                                <Link href="/login">
                                    <Button variant="secondary" size="sm">Log In</Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="primary" size="sm">Get Started</Button>
                                </Link>
                            </>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleLogout}
                                leftIcon={<LogOut className="h-4 w-4" />}
                            >
                                Log Out
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
