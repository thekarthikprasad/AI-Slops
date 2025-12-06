import { Header } from "../components/layout/Header";
import { motion } from "framer-motion";
import { useExpenseStore } from "../store/useExpenseStore";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { generateCommentary } from "../lib/aiLogic";
import { Sparkles, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";

export default function Dashboard() {
    const { expenses, getTotalBudget, getOverallBudgetStatus, deleteExpense } = useExpenseStore();

    // Calculate total spent and balance reactively
    const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalBudget = getTotalBudget();
    const balance = totalBudget - totalSpent; // Balance is remaining budget

    const budgetStatus = getOverallBudgetStatus();
    const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const commentary = generateCommentary(expenses, balance);

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
                {/* Balance Card with Color Coding */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "rounded-3xl p-6 shadow-2xl text-gray-900",
                        getBalanceGradient()
                    )}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-gray-900/80 ">Remaining Budget</span>
                            <div className="text-4xl font-bold mt-1 tracking-tight text-gray-900 dark:text-gray-900 ">
                                ₹{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

                {/* Spending Visualization - Simple Bars */}
                {topCategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-gradient rounded-2xl p-6 shadow-ios"
                    >
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-900 ">Top Spending Categories</h3>
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
                        <span className="font-semibold text-purple-600 dark:text-violet-400 ">AI Insight</span>
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
                                    <div className="font-medium text-gray-900 dark:text-white ">{expense.category}</div>
                                    {expense.note && (
                                        <div className="text-xs text-gray-500 dark:text-ios-subtext">{expense.note}</div>
                                    )}
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






