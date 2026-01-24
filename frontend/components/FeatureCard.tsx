"use client";
import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    color: "blue" | "purple" | "green";
    index: number;
}

export function FeatureCard({ icon: Icon, title, description, color, index }: FeatureCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [6, -6]);
    const rotateY = useTransform(x, [-100, 100], [-6, 6]);

    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const rotateXSpring = useSpring(rotateX, springConfig);
    const rotateYSpring = useSpring(rotateY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Style Maps
    const iconColors = {
        blue: "bg-blue-500/10 text-blue-400",
        purple: "bg-purple-500/10 text-purple-400",
        green: "bg-green-500/10 text-green-400"
    };

    const glowColors = {
        blue: "from-blue-500/30",
        purple: "from-purple-500/30",
        green: "from-green-500/30"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            style={{
                perspective: 1000,
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-auto min-h-[220px]"
        >
            <div className={`
                relative h-full w-full rounded-2xl border border-white/10
                bg-gradient-to-br from-white/[0.08] to-white/[0.02] 
                backdrop-blur-xl shadow-xl overflow-hidden
                p-8 flex flex-col group
                transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
            `}>
                {/* Glow Effect */}
                <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-gradient-to-r ${glowColors[color]} to-transparent blur-2xl`}
                    style={{ transform: 'translateZ(-1px)' }}
                />

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${iconColors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="mt-auto">
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-white/50 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
