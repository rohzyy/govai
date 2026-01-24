"use client";
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastMessage } from '@/context/ToastContext';

interface ToastProps extends ToastMessage {
    onClose: () => void;
}

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } },
};

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
};

const styles = {
    success: "bg-green-500/10 border-green-500/20 shadow-green-500/10",
    error: "bg-red-500/10 border-red-500/20 shadow-red-500/10",
    info: "bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
    warning: "bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/10",
};

export default function Toast({ message, type, onClose }: ToastProps) {
    return (
        <motion.div
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
                pointer-events-auto
                flex items-center gap-3 w-80 p-4 rounded-xl border backdrop-blur-md shadow-lg
                ${styles[type]}
            `}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>

            <p className="flex-1 text-sm font-medium text-white/90">
                {message}
            </p>

            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
