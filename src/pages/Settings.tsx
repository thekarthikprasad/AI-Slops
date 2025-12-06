import { Header } from "../components/layout/Header";
import { useExpenseStore } from "../store/useExpenseStore";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "../lib/utils";

export default function Settings() {
    const { theme, setTheme } = useExpenseStore();

    const themes = [
        { id: 'light', name: 'Light', icon: Sun },
        { id: 'dark', name: 'Dark', icon: Moon },
        { id: 'system', name: 'System', icon: Monitor },
    ] as const;

    return (
        <div className="animate-fade-in pb-24">
            <Header title="Settings" large />
            <div className="p-4 space-y-6">
                <div className="card-gradient rounded-2xl p-6 shadow-ios">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Appearance</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {themes.map((t) => {
                            const Icon = t.icon;
                            const isActive = theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all border-2",
                                        isActive
                                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                            : "border-transparent bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
                                    )}
                                >
                                    <Icon
                                        size={24}
                                        className={isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}
                                    />
                                    <span className={cn(
                                        "text-xs font-medium",
                                        isActive ? "text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-400"
                                    )}>
                                        {t.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
