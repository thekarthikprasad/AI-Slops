import { useState } from "react";
import { Header } from "../components/layout/Header";
import { useExpenseStore } from "../store/useExpenseStore";
import { motion } from "framer-motion";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { Search } from "lucide-react";


export default function History() {
    const { expenses, getCurrencySymbol } = useExpenseStore();
    const currencySymbol = getCurrencySymbol();
    const [searchTerm, setSearchTerm] = useState("");

    // Sort transactions by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter based on search
    const filteredExpenses = sortedExpenses.filter(e =>
    (e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Group by Date
    const groupedExpenses: Record<string, typeof expenses> = {};
    filteredExpenses.forEach(expense => {
        const dateKey = new Date(expense.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!groupedExpenses[dateKey]) {
            groupedExpenses[dateKey] = [];
        }
        groupedExpenses[dateKey].push(expense);
    });

    return (
        <div className="animate-fade-in pb-24">
            <Header title="History" large />

            {/* Search Bar */}
            <div className="px-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="px-4 space-y-6">
                {Object.keys(groupedExpenses).length > 0 ? (
                    Object.entries(groupedExpenses).map(([date, items], groupIndex) => (
                        <motion.div
                            key={date}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: groupIndex * 0.05 }}
                        >
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                {date}
                            </h3>
                            <div className="space-y-3">
                                {items.map((expense) => (
                                    <div key={expense.id} className="card-gradient p-3.5 rounded-2xl shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3.5">
                                            <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                                                <CategoryIcon category={expense.category} size="sm" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {expense.name || expense.category}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {expense.category}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                                            - {currencySymbol}{expense.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        No transactions found.
                    </div>
                )}
            </div>
        </div>
    );
}
