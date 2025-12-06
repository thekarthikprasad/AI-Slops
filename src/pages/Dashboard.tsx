import { Header } from "../components/layout/Header";
import { motion } from "framer-motion";
import { useExpenseStore } from "../store/useExpenseStore";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { generateCommentary } from "../lib/aiLogic";
import { Sparkles, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";

export default function Dashboard() {
    const { expenses, getTotalBudget, getOverallBudgetStatus, deleteExpense } = useExpenseStore();

    // Calculate total spent and balance reactively
    const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalBudget = getTotalBudget();
    const balance = totalBudget - totalSpent; // Balance is remaining budget

    const budgetStatus = getOverallBudgetStatus();
    const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const commentary = generateCommentary(expenses, balance);

    // Comparison State
    const [comparisonPeriod, setComparisonPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    // Comparison Logic
    const getComparisonData = () => {
        const now = new Date();
        const data: { label: string; amount: number }[] = [];

        if (comparisonPeriod === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayAmount = expenses
                    .filter(e => e.date.startsWith(dateStr))
                    .reduce((acc, e) => acc + e.amount, 0);
                data.push({
                    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    amount: dayAmount
                });
            }
        } else if (comparisonPeriod === 'weekly') {
            for (let i = 3; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - (i * 7));
                // Approximate week start
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay()); // Sunday
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                const weekAmount = expenses.filter(e => {
                    const eDate = new Date(e.date);
                    return eDate >= weekStart && eDate <= weekEnd;
                }).reduce((acc, e) => acc + e.amount, 0);

                data.push({
                    label: `W${4 - i}`,
                    amount: weekAmount
                });
            }
        } else if (comparisonPeriod === 'monthly') {
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
                const monthAmount = expenses
                    .filter(e => e.date.startsWith(monthStr))
                    .reduce((acc, e) => acc + e.amount, 0);
                data.push({
                    label: d.toLocaleDateString('en-US', { month: 'short' }),
                    amount: monthAmount
                });
            }
        }
        return data;
    };

    const comparisonData = getComparisonData();
    const maxComparisonAmount = Math.max(...comparisonData.map(d => d.amount), 1);

    // Calculate spending by category for visualization
    const categorySpending = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categorySpending)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    // Determine balance color based on budget status
    const getBalanceGradient = () => {
        switch (budgetStatus) {
            case 'over':
                return 'bg-gradient-to-r from-red-500 to-red-600';
            case 'near':
                return 'bg-gradient-to-r from-yellow-500 to-orange-500';
            default:
                return 'bg-gradient-to-r from-green-500 to-emerald-600';
        }
    };

    const getBalanceIcon = () => {
        return budgetStatus === 'over' || budgetStatus === 'near'
            ? <TrendingDown className="text-gray-900" size={24} />
            : <TrendingUp className="text-gray-900" size={24} />;
    };

    return (
        <div className="animate-fade-in pb-24">
            <Header
                title="Summary"
                large
            />
            <div className="p-4 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Remaining Budget Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "rounded-3xl p-6 shadow-2xl text-gray-900",
                            getBalanceGradient()
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-gray-900/80 font-medium">Remaining Budget</span>
                                <div className="text-4xl font-bold mt-1 tracking-tight text-gray-900 dark:text-gray-900 ">
                                    ₹{balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            {getBalanceIcon()}
                        </div>

                        {/* Budget Status Indicator */}
                        {totalBudget > 0 && (
                            <div className="mt-4 bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Budget Status</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-900 ">{budgetPercentage.toFixed(0)}% used</span>
                                </div>
                                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                        className="h-full bg-white rounded-full"
                                    />
                                </div>
                                <div className="text-xs mt-2 text-gray-900/80">
                                    ₹{totalSpent.toFixed(0)} of ₹{totalBudget} total budget
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Total Expenses & Total Budget Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card-gradient p-5 rounded-3xl shadow-ios"
                        >
                            <div className="flex flex-col">
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Spent</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ₹{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="card-gradient p-5 rounded-3xl shadow-ios"
                        >
                            <div className="flex flex-col">
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Budget</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ₹{totalBudget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Comparison Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card-gradient p-6 rounded-3xl shadow-ios"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Spending Trend</h3>
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setComparisonPeriod(period)}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                                        comparisonPeriod === period
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    )}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-40 flex items-end justify-between gap-2">
                        {comparisonData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 flex-1">
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg relative group h-32 flex items-end overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(item.amount / maxComparisonAmount) * 100}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="w-full bg-purple-500 dark:bg-purple-600 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    {item.amount > 0 && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ₹{item.amount}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Spending Visualization - Simple Bars */}
                {topCategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-gradient rounded-2xl p-6 shadow-ios"
                    >
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Top Spending Categories</h3>
                        <div className="space-y-3">
                            {topCategories.map((item, index) => {
                                const maxAmount = topCategories[0].amount;
                                const percentage = (item.amount / maxAmount) * 100;
                                return (
                                    <div key={item.category}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium dark:text-gray-900">{item.category}</span><span className="text-ios-subtext">₹{item.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 bg-ios-gray6 dark:bg-ios-gray5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* AI Commentary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-2xl p-5 border border-purple-500/20"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-purple-600 dark:text-violet-400" size={20} />
                        <span className="font-semibold text-gray-900 dark:text-white">Insight</span>
                    </div>
                    <p className="text-sm leading-relaxed">{commentary}</p>
                </motion.div>

                {/* Recent Expenses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <h3 className="font-bold text-lg px-2 text-gray-900 dark:text-white ">Recent Expenses</h3>
                    {expenses.slice(0, 5).map((expense, i) => (
                        <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="card-gradient p-4 rounded-xl shadow-sm flex justify-between items-center"
                        >
                            <div className="flex gap-3 items-center">
                                <CategoryIcon category={expense.category} size="sm" />
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white ">{expense.name || expense.category}</div>
                                    <div className="text-xs text-gray-500 dark:text-ios-subtext">{expense.category}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="font-semibold text-gray-900 dark:text-white ">
                                    -₹{expense.amount.toFixed(2)}
                                </div>
                                <button
                                    onClick={() => deleteExpense(expense.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}






