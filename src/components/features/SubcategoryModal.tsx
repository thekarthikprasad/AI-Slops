import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { normalizeText } from "../../lib/utils";

interface SubcategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string;
    expenses: Array<{
        id: string;
        name: string;
        amount: number;
        category: string;
        date: string;
    }>;
    categoryTotal: number;
}

export function SubcategoryModal({ isOpen, onClose, category, expenses, categoryTotal }: SubcategoryModalProps) {
    const { getCurrencySymbol } = useExpenseStore();
    const currencySymbol = getCurrencySymbol();

    // Group expenses by normalized name
    const nameGroups: Record<string, { total: number; name: string; id: string }> = {};

    expenses.forEach(e => {
        const rawName = e.name || e.category;
        const key = normalizeText(rawName).toLowerCase();
        if (!nameGroups[key]) {
            nameGroups[key] = {
                total: 0,
                name: normalizeText(rawName),
                id: e.id
            };
        }
        nameGroups[key].total += e.amount;
    });

    const sortedSubItems = Object.values(nameGroups).sort((a, b) => b.total - a.total);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-white/10 max-w-sm w-full max-h-[70vh] flex flex-col pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {sortedSubItems.length} {sortedSubItems.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto flex-1 p-6 pb-2">
                                <div className="space-y-4 pb-4">
                                    {sortedSubItems.map((item, idx) => (
                                        <motion.div
                                            key={item.id || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">
                                                    {item.name}
                                                </span>
                                                <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">
                                                    {currencySymbol}{item.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(item.total / categoryTotal) * 100}%` }}
                                                    transition={{ delay: idx * 0.05 + 0.1, duration: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                                />
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                                                {((item.total / categoryTotal) * 100).toFixed(1)}% of {category}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {currencySymbol}{categoryTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
