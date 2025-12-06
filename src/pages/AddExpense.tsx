import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { useExpenseStore } from "../store/useExpenseStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Check, Delete, ChevronDown } from "lucide-react";
import { cn, normalizeText } from "../lib/utils";
import type { Category } from "../store/useExpenseStore";
import { CategoryIcon } from "../components/ui/CategoryIcon";

export default function AddExpense() {
    const navigate = useNavigate();
    const { addExpense, categories, expenses, getCurrencySymbol } = useExpenseStore();
    const currencySymbol = getCurrencySymbol();

    // State
    const [amount, setAmount] = useState("");
    const [name, setName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category>("Food");
    // New Type State: 'expense' | 'savings' | 'investment'
    const [type, setType] = useState<'expense' | 'savings' | 'investment'>('expense');

    // Suggestions logic
    const [showSuggestions, setShowSuggestions] = useState(false);
    const existingNames = Array.from(new Set(expenses.map(e => e.name).filter(Boolean)));
    const suggestions = name ? existingNames.filter(n => n.toLowerCase().includes(name.toLowerCase())).slice(0, 3) : [];

    // Numpad logic
    const handleNumPress = (num: string) => {
        if (amount.includes('.') && num === '.') return;
        if (amount.length > 8) return;
        setAmount(prev => prev + num);
    };

    const handleDelete = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleSave = () => {
        if (!amount) return;

        let finalName = normalizeText(name);
        let finalCategory = selectedCategory;

        // Default naming if empty
        if (!finalName) {
            if (type === 'investment') finalName = "Investment";
            else if (type === 'savings') finalName = "Savings Deposit";
            else finalName = selectedCategory;
        }

        // Auto-categorize Investment
        if (type === 'investment') {
            finalCategory = 'Investment';
        }

        addExpense({
            name: finalName,
            amount: parseFloat(amount),
            category: finalCategory,
            date: new Date().toISOString(),
            type: type // Pass the type
        });

        navigate("/");
    };

    // Quick Selectors for Type
    const types = [
        { id: 'expense', label: 'Expense', color: 'bg-blue-500' },
        { id: 'investment', label: 'Investment', color: 'bg-purple-500' },
        { id: 'savings', label: 'Savings', color: 'bg-emerald-500' },
    ] as const;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <Header title="Add Transaction" showBack />

            <div className="px-6 pt-6">
                {/* Type Selector (New) */}
                <div className="flex bg-gray-200 dark:bg-white/10 p-1 rounded-2xl mb-6">
                    {types.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id)}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-sm font-semibold transition-all",
                                type === t.id
                                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>


                {/* Amount Display */}
                <div className="text-center mb-8">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2 uppercase tracking-wider">
                        Amount ({type})
                    </div>
                    <div className="text-5xl font-bold text-gray-900 dark:text-white flex justify-center items-baseline gap-1">
                        <span className="text-3xl text-gray-400">{currencySymbol}</span>
                        {amount || "0"}
                    </div>
                </div>

                {/* Name Input with Autocomplete */}
                <div className="mb-6 relative">
                    <label className="text-xs font-semibold text-gray-500 ml-4 mb-1 block uppercase">Name / Note</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }}
                        placeholder={type === 'expense' ? "What is this for?" : "Description..."}
                        className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl text-lg font-medium shadow-sm border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-xl z-20 border border-gray-100 dark:border-white/5 overflow-hidden"
                            >
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setName(suggestion);
                                            setShowSuggestions(false);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 border-b last:border-0 border-gray-100 dark:border-white/5"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Category Grid (Only for Expense type) */}
                {type === 'expense' && (
                    <div className="mb-8">
                        <label className="text-xs font-semibold text-gray-500 ml-4 mb-2 block uppercase">Category</label>
                        <div className="grid grid-cols-4 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all border-2",
                                        selectedCategory === cat
                                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                                            : "bg-white dark:bg-[#1C1C1E] border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <div className="text-2xl">
                                        <CategoryIcon category={cat} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-medium truncate w-full text-center",
                                        selectedCategory === cat ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
                                    )}>
                                        {cat}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
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
                        <Delete size={20} />
                    </motion.button>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 pb-8">
                    <button
                        onClick={handleSave}
                        className="w-full bg-premium-gradient text-white py-3.5 rounded-2xl shadow-lg shadow-purple-500/20 font-semibold text-base active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Check size={18} />
                        Save {type === 'expense' ? 'Expense' : type === 'investment' ? 'Investment' : 'Savings'}
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