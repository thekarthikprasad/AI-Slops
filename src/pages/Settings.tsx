import { Header } from "../components/layout/Header";
import { useExpenseStore } from "../store/useExpenseStore";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "../lib/utils";

export default function Settings() {
    const { theme, setTheme, notifications, toggleNotifications } = useExpenseStore();

    const themes = [
        { id: 'light', name: 'Light', icon: Sun },
        { id: 'dark', name: 'Dark', icon: Moon },
        { id: 'system', name: 'System', icon: Monitor },
    ] as const;

    return (
        <div className="animate-fade-in pb-24">
            <Header title="Settings" large />
            <div className="p-4 space-y-8">
                {/* Appearance */}
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

                {/* Data Management */}
                <div className="card-gradient rounded-2xl p-6 shadow-ios">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Data Management</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(useExpenseStore.getState().expenses));
                                const downloadAnchorNode = document.createElement('a');
                                downloadAnchorNode.setAttribute("href", dataStr);
                                downloadAnchorNode.setAttribute("download", "xpense_data.json");
                                document.body.appendChild(downloadAnchorNode);
                                downloadAnchorNode.click();
                                downloadAnchorNode.remove();
                            }}
                            className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="text-gray-900 dark:text-white font-medium">Export Data</span>
                            <span className="text-xs text-gray-500">JSON</span>
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        try {
                                            const json = JSON.parse(event.target?.result as string);
                                            if (Array.isArray(json)) {
                                                useExpenseStore.getState().setExpenses(json);
                                                alert('Data imported successfully!');
                                            } else {
                                                alert('Invalid data format');
                                            }
                                        } catch (err) {
                                            alert('Error parsing file');
                                        }
                                    };
                                    reader.readAsText(file);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors pointer-events-none">
                                <span className="text-gray-900 dark:text-white font-medium">Import Data</span>
                                <span className="text-xs text-gray-500">JSON</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
                                    useExpenseStore.getState().clearExpenses();
                                }
                            }}
                            className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <span className="text-red-600 dark:text-red-400 font-medium">Clear All Data</span>
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="card-gradient rounded-2xl p-6 shadow-ios">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Notifications</h3>
                    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-xl">
                        <span className="text-gray-900 dark:text-white font-medium">Daily Reminders</span>
                        <div
                            onClick={toggleNotifications}
                            className={cn(
                                "w-11 h-6 rounded-full relative cursor-pointer transition-colors",
                                notifications ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                                notifications ? "right-1" : "left-1"
                            )} />
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="card-gradient rounded-2xl p-6 shadow-ios">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">About</h3>
                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between items-center">
                            <span>Version</span>
                            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
                        </div>
                        <button className="w-full py-2 text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                            Check for Updates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
