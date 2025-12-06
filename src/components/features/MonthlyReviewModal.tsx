import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpenseStore } from "../../store/useExpenseStore";
import { PiggyBank, PartyPopper, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

export const MonthlyReviewModal = () => {
    const {
        expenses,
        income,
        addToSavings,
        lastReviewDate,
        setLastReviewDate,
        getCurrencySymbol,
        investmentGoal,
        savingsGoal, // Need this for Goal Progress
        addMonthlyReport,
        getTotalBudget
    } = useExpenseStore();

    const [isOpen, setIsOpen] = useState(false);
    const [reviewData, setReviewData] = useState<{
        month: string;
        income: number;
        spent: number;
        savings: number; // This is now "Total Potential Savings"
        year: number;
        monthIndex: number;
        // Detailed Report Data
        budgetLimit: number;
        savedFromBudget: number;
        plannedSavings: number;
        plannedInvestment: number;
    } | null>(null);

    const currencySymbol = getCurrencySymbol();

    useEffect(() => {
        const checkMonthlyReview = () => {
            const now = new Date();
            const currentMonth = now.getMonth();
            // const currentYear = now.getFullYear(); // Unused

            // If never reviewed, set to now (first install/update) and skip
            if (!lastReviewDate) {
                setLastReviewDate(now.toISOString());
                return;
            }

            const lastDate = new Date(lastReviewDate);
            const lastMonth = lastDate.getMonth();

            // Trigger if we are in a new month compared to last review
            if (currentMonth !== lastMonth) {
                // Calculate details for the PREVIOUS month (or the specific month passed)
                // Actually, simple logic: Review the JUST COMPLETED month.
                // If now is Feb, we review Jan.

                // Identify the month to review (Previous Month)
                const reviewDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const reviewMonthIndex = reviewDate.getMonth();
                const reviewYear = reviewDate.getFullYear();

                const monthName = reviewDate.toLocaleDateString('en-US', { month: 'long' });

                // Calculate stats for that specific month
                const start = new Date(reviewYear, reviewMonthIndex, 1);
                const end = new Date(reviewYear, reviewMonthIndex + 1, 0, 23, 59, 59);

                const monthlyExpenses = expenses
                    .filter(e => {
                        const d = new Date(e.date);
                        return d >= start && d <= end;
                    })
                    .reduce((acc, e) => acc + e.amount, 0);

                // ALLOCATION LOGIC
                // 1. Budget Efficiency
                const totalBudget = getTotalBudget();
                const rawBudgetDiff = totalBudget - monthlyExpenses;
                const savedFromBudget = rawBudgetDiff > 0 ? rawBudgetDiff : 0;

                // 2. Planned Allocations
                const realLeftover = income - monthlyExpenses;

                // Simplified Logic:
                // Potential Savings = realLeftover - investmentGoal (Investment is separate bucket)
                // If negative, potential savings is 0.
                const potentialSavings = realLeftover - (investmentGoal || 0);

                setReviewData({
                    month: monthName,
                    year: reviewYear,
                    income: income,
                    spent: monthlyExpenses,
                    savings: potentialSavings > 0 ? potentialSavings : 0,
                    monthIndex: reviewMonthIndex,
                    // Details
                    budgetLimit: totalBudget,
                    savedFromBudget: savedFromBudget,
                    plannedSavings: useExpenseStore.getState().savingsGoal, // Explicit setting
                    plannedInvestment: investmentGoal || 0
                });
                setIsOpen(true);
            }
        };

        checkMonthlyReview();
    }, [lastReviewDate, expenses, income, setLastReviewDate, getTotalBudget, investmentGoal]);

    const handleConfirm = () => {
        if (reviewData && reviewData.savings > 0) {
            addToSavings(reviewData.savings);

            // Save Report
            addMonthlyReport({
                id: `${reviewData.year}-${String(reviewData.monthIndex + 1).padStart(2, '0')}`,
                month: reviewData.month,
                year: reviewData.year,
                income: reviewData.income,
                budgetLimit: reviewData.budgetLimit,
                actualSpent: reviewData.spent,
                savedFromBudget: reviewData.savedFromBudget,
                plannedSavings: useExpenseStore.getState().savingsGoal,
                plannedInvestment: reviewData.plannedInvestment,
                totalSpent: reviewData.spent,
                totalSaved: reviewData.savings,
                totalInvested: reviewData.plannedInvestment
            });
        }
        completeReview();
    };

    const handleDismiss = () => {
        completeReview();
    };

    const completeReview = () => {
        setIsOpen(false);
        setLastReviewDate(new Date().toISOString());
    };

    if (!isOpen || !reviewData) return null;

    // Calculate Goal Progress contribution
    const goalContribution = savingsGoal && savingsGoal > 0
        ? (reviewData.savings / savingsGoal) * 100
        : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400 relative">
                                <PiggyBank size={32} />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-1.5"
                                >
                                    <PartyPopper size={14} className="text-white" />
                                </motion.div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Woohoo! 🎉
                                </h2>
                                <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                    You saved {currencySymbol}{reviewData.savings.toLocaleString()} in {reviewData.month}!
                                </p>
                            </div>

                            {/* Goal Progress Insight */}
                            {goalContribution > 0 && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/30">
                                    <div className="flex items-center gap-2 justify-center mb-1">
                                        <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Goal Impact</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        That's <span className="font-bold text-gray-900 dark:text-white">{goalContribution.toFixed(1)}%</span> of your total savings goal!
                                    </p>
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Income</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {currencySymbol}{reviewData.income.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Expenses</span>
                                    <span className="font-semibold text-red-500">
                                        -{currencySymbol}{reviewData.spent.toLocaleString()}
                                    </span>
                                </div>

                                {reviewData.plannedInvestment > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Investments</span>
                                        <span className="font-semibold text-purple-500">
                                            -{currencySymbol}{reviewData.plannedInvestment.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs text-emerald-600/70 dark:text-emerald-400/70">
                                        <span>Saved from Budget</span>
                                        <span>+{currencySymbol}{reviewData.savedFromBudget.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold">
                                        <span className="text-gray-900 dark:text-white">Total To Bank</span>
                                        <span className={cn(
                                            reviewData.savings >= 0 ? "text-emerald-500" : "text-red-500"
                                        )}>
                                            {currencySymbol}{reviewData.savings.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={handleDismiss}
                                    className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-4 py-3 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <PiggyBank size={18} />
                                    Bank It!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
