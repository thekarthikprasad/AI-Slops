import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Plus, PieChart, Calendar, Settings } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";

export function AppShell() {
    const location = useLocation();
    const { theme, setTheme } = useExpenseStore();

    useEffect(() => {
        setTheme(theme);
    }, []);

    const tabs = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/" },
        { name: "Budget", icon: PieChart, path: "/budget" },
        { name: "Add", icon: Plus, path: "/add", special: true },
        { name: "Calendar", icon: Calendar, path: "/calendar" },
        { name: "Settings", icon: Settings, path: "/settings" },
    ];

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden">
            {/* Global Mesh Gradient Background */}
            <div className="fixed inset-0 z-0 opacity-90 dark:opacity-70 pointer-events-none animate-mesh" />

            <main className="max-w-md mx-auto min-h-screen relative z-10">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 pb-safe pt-3 z-50 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10">
                <div className="max-w-md mx-auto grid grid-cols-5 items-center px-2 h-16 pb-2">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        const Icon = tab.icon;

                        if (tab.special) {
                            return (
                                <Link
                                    key={tab.name}
                                    to={tab.path}
                                    className="flex justify-center"
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        className="bg-blue-500/10 dark:bg-blue-500/20 p-2.5 rounded-xl text-blue-600 dark:text-blue-400"
                                    >
                                        <Icon size={24} strokeWidth={2.5} />
                                    </motion.div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={tab.name}
                                to={tab.path}
                                className="flex justify-center"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.85, y: -2 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-2 w-16 rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "text-purple-600 dark:text-violet-400"
                                            : "text-gray-400 dark:text-gray-500"
                                    )}
                                >
                                    <motion.div
                                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    </motion.div>
                                    <span className="text-[10px] font-medium">{tab.name}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
