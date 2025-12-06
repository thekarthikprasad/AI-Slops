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
            amount: parseFloat(amount),
            category,
            date: new Date(date).toISOString(),
        });
        navigate("/");
    };

    return (
        <div className="h-screen flex flex-col animate-fade-in pb-24">
            <Header
                title="Add Expense"
                rightAction={
                    <button onClick={() => navigate("/")} className="text-ios-blue ">Cancel</button>
                }
            />

            <div className="flex-1 flex flex-col p-4 gap-6">
                {/* Amount Display */}
                <div className="flex flex-col items-center justify-center py-8">
                    <span className="text-gray-500 dark:text-ios-subtext ">Amount</span>
                    <div className="text-5xl font-bold flex items-center text-gray-400 dark:text-ios-gray3">
                        <span className="mr-1">₹</span>
                        {amount}
                    </div>
                </div>

                {/* Category Selector */}
                <div className="space-y-2">
                    <span className="text-sm text-gray-500 dark:text-ios-subtext ">Category</span>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {sortedCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "flex flex-col items-center gap-2 min-w-[80px] max-w-[90px] h-auto px-2 py-3 rounded-xl transition-all",
                                    category === cat
                                        ? "card-gradient shadow-ios scale-105"
                                        : "bg-gray-100 dark:bg-ios-gray6 border border-gray-200 dark:border-ios-gray5"
                                )}
                            >
                                <CategoryIcon category={cat} />
                                <span className="text-[10px] font-medium text-black dark:text-white text-center leading-tight">{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Picker */}
                <div className="card-gradient rounded-xl p-3 flex items-center justify-between shadow-ios">
                    <div className="flex items-center gap-3">
                        <div className="bg-ios-blue/10 p-2 rounded-lg text-ios-blue">
                            <Calendar size={20} />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white ">Date</span>
                    </div>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-right font-medium text-ios-blue "
                    />
                </div>

                {/* Keypad */}
                <div className="mt-auto grid grid-cols-3 gap-4 pb-safe">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
                        <motion.button
                            key={num}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleNumPress(num.toString())}
                            className="h-16 text-2xl font-medium rounded-full card-gradient shadow-sm flex items-center justify-center text-gray-900 dark:text-white "
                        >
                            {num}
                        </motion.button>
                    ))}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDelete}
                        className="h-16 flex items-center justify-center rounded-full bg-red-500 dark:bg-red-600 text-white text-xl shadow-sm"
                    >
                        ⌫
                    </motion.button>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-premium-gradient text-white py-4 rounded-2xl shadow-lg font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    Save Expense
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl shadow-lg font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}



