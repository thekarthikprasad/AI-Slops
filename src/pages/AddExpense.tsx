import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Header } from "../components/layout/Header";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { useExpenseStore, type Category } from "../store/useExpenseStore";
import { cn } from "../lib/utils";

export function AddExpense() {
    const navigate = useNavigate();
    const addExpense = useExpenseStore((state) => state.addExpense);
    const expenses = useExpenseStore((state) => state.expenses);

    const [amount, setAmount] = useState("0");
    const [name, setName] = useState("");
    const [category, setCategory] = useState<Category>('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Sort categories by usage frequency
    const allCategories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Investment', 'Misc'];
    const categoryCounts = allCategories.map(cat => ({
        category: cat,
        count: expenses.filter(e => e.category === cat).length
    }));
    const sortedCategories = categoryCounts
        .sort((a, b) => b.count - a.count)
        .map(item => item.category);

    const handleNumPress = (num: string) => {
        if (amount === "0" && num !== ".") {
            setAmount(num);
        } else {
            if (num === "." && amount.includes(".")) return;
            setAmount(amount + num);
        }
    };

    const handleDelete = () => {
        if (amount.length === 1) {
            setAmount("0");
        } else {
            setAmount(amount.slice(0, -1));
        }
    };

    const handleSave = () => {
        addExpense({
            name: name || category, // Default to category if name is empty
            amount: parseFloat(amount),
            category,
            date: new Date(date).toISOString(),
        });
        navigate("/");
    };

    return (
        <div className="h-[100dvh] flex flex-col animate-fade-in">
            <Header
                title="Add Expense"
            />

            <div className="flex-1 overflow-y-auto p-4 pb-safe space-y-4 no-scrollbar">
                {/* Amount Display */}
                <div className="flex flex-col items-center justify-center py-4">
                    <span className="text-sm text-gray-500 dark:text-ios-subtext font-medium">Amount</span>
                    <div className="text-5xl font-bold flex items-center text-gray-800 dark:text-white mt-1">
                        <span className="mr-1 text-3xl text-gray-400">₹</span>
                        {amount}
                    </div>
                </div>

                {/* Name Input */}
                <div className="glass rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200 min-w-[40px]">Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="What is this for?"
                        className="bg-transparent w-full font-medium text-gray-800 dark:text-white text-sm focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                </div>

                {/* Category Selector */}
                <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-ios-subtext ml-1">Category</span>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {sortedCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "flex flex-col items-center gap-2 min-w-[72px] p-2 rounded-2xl transition-all",
                                    category === cat
                                        ? "bg-white dark:bg-white/10 shadow-ios scale-105 border border-purple-100 dark:border-white/10"
                                        : "bg-white/50 dark:bg-black/20 border border-transparent hover:bg-white/80 dark:hover:bg-white/5"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-full",
                                    category === cat ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                )}>
                                    <CategoryIcon category={cat} className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium leading-tight",
                                    category === cat ? "text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-400"
                                )}>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Picker */}
                <div className="glass rounded-2xl p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                            <Calendar size={18} />
                        </div>
                        <span className="font-medium text-sm text-gray-700 dark:text-gray-200">Date</span>
                    </div>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-right font-medium text-purple-600 dark:text-purple-400 text-sm focus:outline-none"
                    />
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
                        <motion.button
                            key={num}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleNumPress(num.toString())}
                            className="h-14 text-xl font-medium rounded-2xl glass shadow-sm flex items-center justify-center text-gray-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                        >
                            {num}
                        </motion.button>
                    ))}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDelete}
                        className="h-14 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xl shadow-sm border border-red-100 dark:border-red-500/30"
                    >
                        ⌫
                    </motion.button>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 pb-8">
                    <button
                        onClick={handleSave}
                        className="w-full bg-premium-gradient text-white py-3.5 rounded-2xl shadow-lg shadow-purple-500/20 font-semibold text-base active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        Save Expense
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 py-3.5 rounded-2xl font-semibold text-base active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}



