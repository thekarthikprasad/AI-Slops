import { useState } from "react";
import { Header } from "../components/layout/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useExpenseStore, type Category } from "../store/useExpenseStore";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { cn } from "../lib/utils";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Investment', 'Misc'];

export default function Budget() {
    const { getBudgetProgress, budgets, createBudget, deleteBudget, getCurrencySymbol, monthlyBudget, expenses } = useExpenseStore();
    const currencySymbol = getCurrencySymbol();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [newBudgetCategory, setNewBudgetCategory] = useState<Category>('Food');
    const [newBudgetAmount, setNewBudgetAmount] = useState("");
    const [expandedBudget, setExpandedBudget] = useState<string | null>(null);

    const handleCreateBudget = () => {
        if (newBudgetName && newBudgetAmount) {
            const amount = parseFloat(newBudgetAmount);
            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }

            // Check if within monthly allocation limit
            const currentTotalAllocated = budgets.reduce((sum, b) => sum + b.amount, 0);
            if (currentTotalAllocated + amount > monthlyBudget) {
                alert(`Cannot create budget. You only have ${currencySymbol}${(monthlyBudget - currentTotalAllocated).toLocaleString()} remaining in your monthly allocation.`);
                return;
            }

            createBudget(newBudgetName, newBudgetCategory, amount);
            setNewBudgetName("");
            setNewBudgetAmount("");
            setShowCreateForm(false);
        } else {
            alert("Please fill in all fields");
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedBudget(expandedBudget === id ? null : id);
    };

    return (
        <div className="animate-fade-in pb-24">
            <Header title="Budget" large />
            <div className="p-4 space-y-6">
                {/* Create Budget Button */}
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="w-full bg-premium-gradient text-white py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform"
                >
                    <Plus size={20} />
                    Create New Budget
                </button>

                {/* Create Budget Form */}
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="card-gradient p-4 rounded-2xl shadow-ios space-y-4"
                    >
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateBudget();
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="Budget Name (e.g., Weekly Groceries)"
                                value={newBudgetName}
                                onChange={(e) => setNewBudgetName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700"
                            />

                            {/* Custom Category Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setNewBudgetCategory(cat)}
                                            className={cn(
                                                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                                                newBudgetCategory === cat
                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-gray-600"
                                            )}
                                        >
                                            <CategoryIcon category={cat} size="sm" />
                                            <span className={cn(
                                                "text-[10px] font-medium truncate w-full text-center",
                                                newBudgetCategory === cat
                                                    ? "text-purple-600 dark:text-purple-400"
                                                    : "text-gray-600 dark:text-gray-400"
                                            )}>{cat}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input
                                type="number"
                                placeholder={`Amount (Unallocated Limit: ${currencySymbol}${(monthlyBudget - budgets.reduce((sum, b) => sum + b.amount, 0)).toLocaleString()})`}
                                value={newBudgetAmount}
                                onChange={(e) => setNewBudgetAmount(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700"
                            />

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewBudgetName("");
                                        setNewBudgetAmount("");
                                    }}
                                    className="flex-1 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg"
                                >
                                    Add Budget
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Budget List */}
                {budgets.map((budget, index) => {
                    const { spent, limit, percentage } = getBudgetProgress(budget.category);
                    const isOverBudget = spent > limit;
                    const remaining = Math.max(0, limit - spent);
                    const remainingPercent = Math.max(0, 100 - percentage);
                    const isExpanded = expandedBudget === budget.id;

                    // Get transactions for this budget's category
                    const budgetExpenses = expenses ? expenses.filter(e => e.category === budget.category) : [];

                    return (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="card-gradient rounded-2xl shadow-ios overflow-hidden"
                        >
                            <div
                                onClick={() => toggleExpand(budget.id)}
                                className="p-4 cursor-pointer active:bg-gray-50 dark:active:bg-white/5 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <CategoryIcon category={budget.category} size="sm" />
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{budget.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{budget.category}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                            {remainingPercent.toFixed(0)}% Remaining
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {currencySymbol}{remaining.toLocaleString()} <span className="text-xs font-normal text-gray-400">left</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar with Gradient */}
                                <div className="h-4 bg-ios-gray6 dark:bg-ios-gray5 rounded-full overflow-hidden relative mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            isOverBudget
                                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                                : percentage >= 80
                                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                                    : "bg-gradient-to-r from-green-500 to-emerald-500"
                                        )}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white/90 drop-shadow-md">
                                        {spent.toLocaleString()} / {limit.toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                </div>
                            </div>

                            {/* Expanded Transactions View */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5"
                                    >
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                <span>Recent Transactions</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm("Delete this budget?")) deleteBudget(budget.id);
                                                    }}
                                                    className="text-red-500 flex items-center gap-1 hover:text-red-600"
                                                >
                                                    <Trash2 size={12} /> Delete Budget
                                                </button>
                                            </div>

                                            {budgetExpenses.length > 0 ? (
                                                <div className="space-y-2">
                                                    {budgetExpenses.slice(0, 5).map(expense => (
                                                        <div key={expense.id} className="flex justify-between items-center text-sm">
                                                            <div className="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
                                                                {expense.name || expense.category}
                                                            </div>
                                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                                {currencySymbol}{expense.amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {budgetExpenses.length > 5 && (
                                                        <div className="text-xs text-center text-gray-400 pt-1">
                                                            + {budgetExpenses.length - 5} more
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center text-sm text-gray-400 py-2">
                                                    No expenses in this category yet.
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
