import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, PlusCircle, PieChart, Calendar } from "lucide-react";
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
        { name: "Add", icon: PlusCircle, path: "/add", special: true },
        { name: "Calendar", icon: Calendar, path: "/calendar" },
    ];

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden">
            {/* Global Mesh Gradient Background */}
            <div className="fixed inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none animate-mesh" />

            <main className="max-w-md mx-auto min-h-screen relative z-10">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 pb-safe pt-3 z-50 bg-white/80 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10">
                <div className="max-w-md mx-auto flex justify-around items-center px-2">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        const Icon = tab.icon;

                        if (tab.special) {
                            return (
                                <Link key={tab.name} to={tab.path}>
                                    <motion.div
                                        whileTap={{ scale: 0.85 }}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        className="bg-premium-gradient p-3.5 rounded-2xl shadow-lg"
                                    >
                                        <Icon size={26} className="text-white" />
                                    </motion.div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={tab.name}
                                to={tab.path}
                            >
                                <motion.div
                                    whileTap={{ scale: 0.85, y: -2 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-2 w-16 rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "text-purple-600 dark:text-violet-400 bg-purple-100/50 dark:bg-purple-900/20"
                                            : "text-gray-700 dark:text-ios-gray hover:bg-gray-200/60 dark:hover:bg-white/5"
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
