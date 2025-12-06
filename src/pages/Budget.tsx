import { useState } from "react";
import { Header } from "../components/layout/Header";
import { motion } from "framer-motion";
import { useExpenseStore, type Category } from "../store/useExpenseStore";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { cn } from "../lib/utils";
import { Trash2, Plus } from "lucide-react";

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Investment', 'Misc'];

export default function Budget() {
    const { getBudgetProgress, budgets, createBudget, updateBudget, deleteBudget } = useExpenseStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [newBudgetCategory, setNewBudgetCategory] = useState<Category>('Food');
    const [newBudgetAmount, setNewBudgetAmount] = useState("");

    const handleCreateBudget = () => {
        if (newBudgetName && newBudgetAmount) {
            createBudget(newBudgetName, newBudgetCategory, parseInt(newBudgetAmount));
            setNewBudgetName("");
            setNewBudgetAmount("");
            setShowCreateForm(false);
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
                        className="card-gradient p-4 rounded-2xl shadow-ios space-y-3"
                    >
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateBudget();
                            }}
                            className="space-y-3"
                        >
                            <input
                                type="text"
                                placeholder="Budget Name (e.g., Weekly Groceries)"
                                value={newBudgetName}
                                onChange={(e) => setNewBudgetName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-ios-gray6 dark:bg-ios-gray5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <select
                                value={newBudgetCategory}
                                onChange={(e) => setNewBudgetCategory(e.target.value as Category)}
                                className="w-full px-4 py-2 rounded-xl bg-ios-gray6 dark:bg-ios-gray5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newBudgetAmount}
                                onChange={(e) => setNewBudgetAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-ios-gray6 dark:bg-ios-gray5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button type="submit" className="w-full bg-gradient-primary text-white py-2 rounded-xl font-semibold">
                                Add Budget
                            </button>
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
                                        ₹{spent.toFixed(0)} / ₹{budget.amount}
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
