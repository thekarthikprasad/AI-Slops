import { Header } from "../components/layout/Header";
import { useNotifications } from "../hooks/useNotifications";
import { useExpenseStore, type Currency } from "../store/useExpenseStore";
import { Moon, Sun, Monitor, DollarSign, Euro, PoundSterling, JapaneseYen, IndianRupee, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";

export default function Settings() {
    const {
        theme,
        setTheme,
        notifications,
        toggleNotifications,
        currency,
        setCurrency,
        income,
        setIncome,
        savingsGoal,
        setSavingsGoal,
        totalSavings,
        investmentGoal,
        setInvestmentGoal,
        monthlyBudget,
        setMonthlyBudget,
    } = useExpenseStore();

    const { scheduleDailyReminder, cancelReminders } = useNotifications();


    const handleToggleNotifications = async () => {
        if (!notifications) {
            // Turning ON
            const success = await scheduleDailyReminder();
            if (success) {
                toggleNotifications();
            }
        } else {
            // Turning OFF
            await cancelReminders();
            toggleNotifications();
        }
    };

    const currencies = [
        { id: 'INR', symbol: '₹', icon: IndianRupee },
        { id: 'USD', symbol: '$', icon: DollarSign },
        { id: 'EUR', symbol: '€', icon: Euro },
        { id: 'GBP', symbol: '£', icon: PoundSterling },
        { id: 'JPY', symbol: '¥', icon: JapaneseYen },
    ] as const;

    const themes = [
        { id: 'light', name: 'Light', icon: Sun },
        { id: 'dark', name: 'Dark', icon: Moon },
        { id: 'system', name: 'System', icon: Monitor },
    ] as const;

    return (
        <div className="animate-fade-in pb-24">
            <Header title="Settings" large />
            <div className="p-4 space-y-8">
                {/* Savings & Income Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" />
                        Financial Goals
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Monthly Income (Total Inflow)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥'}
                                </span>
                                <input
                                    type="number"
                                    value={income || ''}
                                    onChange={(e) => setIncome(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Allocations */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Monthly Budget (Needs)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥'}
                                </span>
                                <input
                                    type="number"
                                    value={monthlyBudget || ''}
                                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Investment Allocation
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥'}
                                </span>
                                <input
                                    type="number"
                                    value={investmentGoal || ''}
                                    onChange={(e) => setInvestmentGoal(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Savings Goal (Resulting Target)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥'}
                                </span>
                                <input
                                    type="number"
                                    value={savingsGoal || ''}
                                    onChange={(e) => setSavingsGoal(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Calculated or Manual Goal"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Suggested: {currency === 'INR' ? '₹' : '$'}{Math.max(0, (income || 0) - (monthlyBudget || 0) - (investmentGoal || 0)).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex justify-between items-center">
                        <div>
                            <span className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">Current Total Savings</span>
                            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">
                                {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥'}
                                {totalSavings.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

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

                <div className="card-gradient rounded-2xl p-6 shadow-ios">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Currency</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {currencies.map((c) => {
                            const Icon = c.icon;
                            const isActive = currency === c.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setCurrency(c.id as Currency)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2",
                                        isActive
                                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                            : "border-transparent bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
                                    )}
                                >
                                    <Icon
                                        size={20}
                                        className={isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}
                                    />
                                    <span className={cn(
                                        "text-[10px] font-medium",
                                        isActive ? "text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-400"
                                    )}>
                                        {c.id}
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
                            onClick={handleToggleNotifications}
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
