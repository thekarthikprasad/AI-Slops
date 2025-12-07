import { motion } from "framer-motion";
import icon from "../assets/xpense-icon.png";

export function LaunchScreen() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 animate-mesh opacity-100" />

            {/* Optional Overlay to ensure contrast if needed */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[2px]" />

            {/* Icon Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut"
                }}
                className="relative z-10 w-32 h-32 rounded-[28px] overflow-hidden shadow-2xl border border-white/10"
            >
                <img
                    src={icon}
                    alt="Xpense"
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </motion.div>
    );
}
