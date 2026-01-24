import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    leftIcon?: React.ReactNode
}

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    ...props
}: ButtonProps) {

    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30",
        secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10",
        outline: "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
        ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30"
    }

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    }

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            className={cn(
                "relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
        </motion.button>
    )
}
