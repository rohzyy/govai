import { cn } from "@/lib/utils"
import { HTMLMotionProps, motion } from "framer-motion"

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    className?: string
    hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" } : {}}
            className={cn(
                "backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6 transition-all duration-300",
                "dark:bg-black/20 dark:border-white/10",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    )
}
