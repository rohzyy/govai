
import { Navbar } from '@/components/Navbar';

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="pt-24 px-6 max-w-4xl mx-auto text-white">
                <h1 className="text-4xl font-bold mb-6">About Grievance AI</h1>
                <p className="text-lg text-gray-300 mb-4">
                    Grievance AI is a next-generation platform designed to bridge the gap between citizens and government authorities.
                </p>
                <div className="glass-card p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                    <p className="text-gray-400">
                        To empower every citizen with a voice that is heard, ensuring rapid resolution of complaints through AI-driven categorization and automated workflows.
                    </p>
                </div>
            </div>
        </div>
    );
}
