import { useState } from "react";
import { Header } from "../components/layout/Header";
import { motion } from "framer-motion";
import { useExpenseStore, type Category } from "../store/useExpenseStore";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { cn } from "../lib/utils";
import { Trash2, Plus } from "lucide-react";

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Investment', 'Misc'];

export default function Budget() {
    const { getBudgetProgress, budgets, createBudget, updateBudget, deleteBudget, getCurrencySymbol, monthlyBudget } = useExpenseStore();
    const currencySymbol = getCurrencySymbol();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [newBudgetCategory, setNewBudgetCategory] = useState<Category>('Food');
    const [newBudgetAmount, setNewBudgetAmount] = useState("");

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
                                placeholder={`Amount (Available: ${currencySymbol}${(monthlyBudget - budgets.reduce((sum, b) => sum + b.amount, 0)).toLocaleString()})`}
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
                    return (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="card-gradient p-4 rounded-2xl shadow-ios"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <CategoryIcon category={budget.category} size="sm" />
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{budget.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{budget.category}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {currencySymbol}{spent.toFixed(0)} / {currencySymbol}{budget.amount}
                                    </div>
                                    <button
                                        onClick={() => deleteBudget(budget.id)}
                                        className="text-ios-red p-1.5 hover:bg-ios-red/10 rounded-full transition-colors"
                                        title="Delete Budget"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar with Gradient */}
                            <div className="h-3 bg-ios-gray6 dark:bg-ios-gray5 rounded-full overflow-hidden relative">
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
                            </div>

                            {/* Edit Amount */}
                            <div className="mt-3 flex justify-end">
                                <input
                                    type="number"
                                    value={budget.amount}
                                    onChange={(e) => updateBudget(budget.id, parseInt(e.target.value) || 0)}
                                    className="text-right text-xs font-medium text-purple-600 dark:text-violet-400"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
