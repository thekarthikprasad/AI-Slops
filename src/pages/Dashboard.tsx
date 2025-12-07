import { Header } from "../components/layout/Header";
import { MonthlyReviewModal } from "../components/features/MonthlyReviewModal";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useExpenseStore } from "../store/useExpenseStore";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { generateCommentary } from "../lib/aiLogic";
import { Sparkles, TrendingUp, TrendingDown, Trash2, Wallet, Eye, EyeOff } from "lucide-react";
import { cn, normalizeText } from "../lib/utils";
import { useState } from "react";

export default function Dashboard() {
    const {
        expenses,
        deleteExpense,
        getTotalBudget,
        income,
        getCurrencySymbol,
        monthlyBudget,
        investmentGoal,
        savingsGoal,
        totalSavings
    } = useExpenseStore();

    const currencySymbol = getCurrencySymbol();

    // 1. State Definitions
    const [comparisonPeriod, setComparisonPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date; label: string } | null>(null);
    const [showSensitive, setShowSensitive] = useState(false); // Global Privacy State (Default: Blurred)

    // 2. Core Variables
    const totalBudget = getTotalBudget(); // Monthly Budget (Operating)

    // Dynamic filtering: Use selectedRange if set, otherwise current month
    const getFilteredExpenses = () => {
        if (selectedRange) {
            return expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= selectedRange.start && expenseDate <= selectedRange.end;
            });
        }

        // Default: Current month
        const now = new Date();
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        });
    };

    const currentMonthExpenses = getFilteredExpenses();

    // 3. Derived Display Values (Filtered by Type)
    const displayTotalSpent = currentMonthExpenses
        .filter(e => e.type === 'expense' || (!e.type && !e.isFromSavings))
        .reduce((sum, expense) => sum + expense.amount, 0);

    const displayInvested = currentMonthExpenses
        .filter(e => e.type === 'investment' || e.category === 'Investment')
        .reduce((sum, e) => sum + e.amount, 0);

    // Savings Calculation: Explicit 'savings' type only
    const displaySaved = currentMonthExpenses
        .filter(e => e.type === 'savings')
        .reduce((sum, e) => sum + e.amount, 0);

    // TOTAL SAVINGS (All Time - Non Filtered)
    // Sum of Store Total + All 'savings' transactions in history
    const allTimeSavings = totalSavings + expenses
        .filter(e => e.type === 'savings')
        .reduce((sum, e) => sum + e.amount, 0);

    // TOTAL INVESTMENTS (All Time - Non Filtered)
    const allTimeInvestments = expenses
        .filter(e => e.type === 'investment' || e.category === 'Investment')
        .reduce((sum, e) => sum + e.amount, 0);


    // Net Savings (Cash Flow) = Savings Transactions + Remaining Operating Budget
    const budgetRemains = Math.max(0, monthlyBudget - displayTotalSpent);
    const displayNetSavings = displaySaved + budgetRemains;

    // Commentary
    const commentary = generateCommentary(currentMonthExpenses, totalBudget - displayTotalSpent);
    // budgetStatus computed inline where needed

    // 4. Dynamic Pro-rating Logic for "Budget Insight"
    const getDaysInRange = () => {
        if (selectedRange) {
            const diffTime = Math.abs(selectedRange.end.getTime() - selectedRange.start.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        }
        switch (comparisonPeriod) {
            case 'daily': return 1;
            case 'weekly': return 7;
            case 'monthly': return 30;
        }
    };
    const rangeDays = getDaysInRange();



    // Income Usage Calculation: Budget (Allocated) + Savings + Investment
    const totalAllocated = monthlyBudget + displaySaved + displayInvested;
    const usagePercentage = income > 0 ? (totalAllocated / income) * 100 : 0;



    // 5. Comparison/Chart Data Generation
    const getComparisonData = () => {
        const now = new Date();
        const data: { label: string; amount: number; start: Date; end: Date }[] = [];

        if (comparisonPeriod === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const start = new Date(d); start.setHours(0, 0, 0, 0);
                const end = new Date(d); end.setHours(23, 59, 59, 999);

                const dayAmount = expenses
                    .filter(e => {
                        const ed = new Date(e.date);
                        const isExpense = e.type === 'expense' || (!e.type && !e.isFromSavings);
                        return ed >= start && ed <= end && isExpense;
                    })
                    .reduce((acc, e) => acc + e.amount, 0);

                data.push({
                    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    amount: dayAmount,
                    start,
                    end
                });
            }
        } else if (comparisonPeriod === 'weekly') {
            for (let i = 3; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - (i * 7));
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay()); // Sunday
                const start = new Date(weekStart); start.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                const end = new Date(weekEnd); end.setHours(23, 59, 59, 999);

                const weekAmount = expenses
                    .filter(e => {
                        const ed = new Date(e.date);
                        const isExpense = e.type === 'expense' || (!e.type && !e.isFromSavings);
                        return ed >= start && ed <= end && isExpense;
                    })
                    .reduce((acc, e) => acc + e.amount, 0);

                data.push({
                    label: `Week -${i}`,
                    amount: weekAmount,
                    start,
                    end
                });
            }
        } else if (comparisonPeriod === 'monthly') {
            for (let i = 2; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

                const monthAmount = expenses
                    .filter(e => {
                        const ed = new Date(e.date);
                        const isExpense = e.type === 'expense' || (!e.type && !e.isFromSavings);
                        return ed >= start && ed <= end && isExpense;
                    })
                    .reduce((acc, e) => acc + e.amount, 0);

                data.push({
                    label: d.toLocaleDateString('en-US', { month: 'short' }),
                    amount: monthAmount,
                    start,
                    end
                });
            }
        }
        return data;
    };

    const comparisonData = getComparisonData();
    const maxComparisonAmount = Math.max(...comparisonData.map(d => d.amount), 1);

    // Budget Efficiency is now calculated inline where needed


    return (
        <div className="animate-fade-in pb-24">
            <MonthlyReviewModal />
            <Header title="Summary" large />
            <div className="p-4 space-y-6">

                {/* FINANCIAL HEALTH OVERVIEW */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                {selectedRange ? selectedRange.label : `Current Month Overview`}
                            </h3>
                            <button
                                onClick={() => setShowSensitive(!showSensitive)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showSensitive ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        </div>
                        {selectedRange && (
                            <button
                                onClick={() => setSelectedRange(null)}
                                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                                Reset to Current View
                            </button>
                        )}
                    </div>

                    {/* Consolidated Financial Hero Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            {/* Left Col: Income & Spent */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                        <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                            <Wallet size={14} className="text-blue-500" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "text-2xl font-bold text-gray-900 dark:text-white transition-all",
                                            !showSensitive && "blur-md select-none opacity-50"
                                        )}>
                                            {currencySymbol}{income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                        <div className="p-1 bg-red-50 dark:bg-red-900/20 rounded-md">
                                            <TrendingDown size={14} className="text-red-500" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Expenses</span>
                                    </div>
                                    <div className={cn(
                                        "text-2xl font-bold text-gray-900 dark:text-white transition-all",
                                        !showSensitive && "blur-md select-none opacity-50"
                                    )}>
                                        {currencySymbol}{displayTotalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Savings & Daily Average */}
                            <div className="flex flex-col justify-between">
                                {/* Total Savings Display */}
                                <div className="text-right">
                                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                        Net Savings
                                    </div>
                                    <div className={cn(
                                        "text-3xl font-black transition-all",
                                        displayNetSavings >= 0 ? "text-emerald-500" : "text-amber-500",
                                        !showSensitive && "blur-md select-none opacity-50"
                                    )}>
                                        {displayNetSavings >= 0 ? '+' : ''}{currencySymbol}{displayNetSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        Income - Spent
                                    </div>
                                </div>

                                {/* Daily Average Display (Replaces Saved from Budget) */}
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <TrendingUp size={14} className="text-blue-500" />
                                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                                                Daily Avg
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold text-gray-900 dark:text-white transition-all",
                                            !showSensitive && "blur-md select-none opacity-50"
                                        )}>
                                            {currencySymbol}{(displayTotalSpent / (rangeDays || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    {/* Simple pace bar relative to daily budget allowance */}
                                    {totalBudget > 0 && (
                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(((displayTotalSpent / (rangeDays || 1)) / (totalBudget / 30)) * 100, 100)}%` }}
                                                className={cn("h-full rounded-full bg-blue-500")}
                                            />
                                        </div>
                                    )}
                                    <div className="text-[9px] text-gray-400 mt-1 text-right">
                                        Target: {currencySymbol}{(totalBudget / 30).toFixed(0)}/day
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overall Progress Bar (Income Usage / Invest / Save) */}
                        <div className="mt-5 space-y-4">
                            {/* Income Usage Bar */}
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-500 font-medium">Income Usage</span>
                                    <span className="text-gray-900 dark:text-white font-bold">{usagePercentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            usagePercentage > 100 ? "bg-red-500" : "bg-amber-500"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Investment Progress Bar */}
                            {(investmentGoal && investmentGoal > 0) && (
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                            <span className="text-gray-500 font-medium">Investments</span>
                                        </div>
                                        <span className={cn(
                                            "text-purple-600 dark:text-purple-400 font-bold transition-all",
                                            !showSensitive && "blur-md select-none opacity-50"
                                        )}>
                                            {currencySymbol}{allTimeInvestments.toLocaleString()} / {currencySymbol}{investmentGoal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((allTimeInvestments / investmentGoal) * 100, 100)}%` }}
                                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Savings Progress Bar (Ultimate Goal) */}
                            {(savingsGoal && savingsGoal > 0) && (
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-gray-500 font-medium">Savings Goal</span>
                                        </div>
                                        <span className={cn(
                                            "text-emerald-600 dark:text-emerald-400 font-bold transition-all",
                                            !showSensitive && "blur-md select-none opacity-50"
                                        )}>
                                            {currencySymbol}{allTimeSavings.toLocaleString()} / {currencySymbol}{savingsGoal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((allTimeSavings / savingsGoal) * 100, 100)}%` }}
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Allocated Budget Remaining (Decreasing) */}
                            {monthlyBudget > 0 && (
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-gray-500 font-medium">Allocated Budget Remaining</span>
                                        </div>
                                        <span className={cn(
                                            "font-bold",
                                            displayTotalSpent > monthlyBudget ? "text-red-500" : "text-blue-600 dark:text-blue-400"
                                        )}>
                                            {currencySymbol}{Math.max(0, monthlyBudget - displayTotalSpent).toLocaleString()} / {currencySymbol}{monthlyBudget.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "100%" }}
                                            animate={{ width: `${Math.max(0, Math.min(((monthlyBudget - displayTotalSpent) / monthlyBudget) * 100, 100))}%` }}
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                (monthlyBudget - displayTotalSpent) < (monthlyBudget * 0.2) ? "bg-red-500" : "bg-blue-500"
                                            )}
                                        />
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                                        <span>Total: {currencySymbol}{monthlyBudget.toLocaleString()}</span>
                                        <span>Used: {currencySymbol}{displayTotalSpent.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Dual Metrics: Time to Goal & Financial Runway */}
                            <div className="pt-2 border-t border-gray-50 dark:border-white/5 mt-2 grid grid-cols-2 gap-4">
                                {/* Time to Goal */}
                                {(savingsGoal > 0 && (income - monthlyBudget) > 0) ? (
                                    <div>
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-1 mb-0.5">
                                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Time to Goal</span>
                                                <span className="text-[9px] text-gray-400 font-normal">(at current pace)</span>
                                            </div>
                                            <span className={cn(
                                                "text-blue-600 dark:text-blue-400 font-bold text-sm transition-all",
                                                !showSensitive && "blur-md select-none opacity-50"
                                            )}>
                                                {(() => {
                                                    const remaining = savingsGoal - allTimeSavings;
                                                    const monthlyPace = income - monthlyBudget;

                                                    if (remaining <= 0) return "Goal Reached!";
                                                    if (monthlyPace <= 0) return "Increase pace";

                                                    const months = remaining / monthlyPace;
                                                    const wholeMonths = Math.floor(months);
                                                    const days = Math.round((months - wholeMonths) * 30);

                                                    if (wholeMonths === 0) return `${days} Days`;
                                                    return `${wholeMonths} Mo, ${days} Days`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="opacity-50">
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-1 mb-0.5">
                                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Time to Goal</span>
                                            </div>
                                            <span className="text-gray-400 font-bold text-sm">-</span>
                                        </div>
                                    </div>
                                )}

                                {/* Financial Runway */}
                                <div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Runway</span>
                                        <span className={cn(
                                            "text-purple-600 dark:text-purple-400 font-bold text-sm transition-all",
                                            !showSensitive && "blur-md select-none opacity-50"
                                        )}>
                                            {(() => {
                                                if (monthlyBudget <= 0) return "Set Budget";
                                                const months = allTimeSavings / monthlyBudget;
                                                return `${months.toFixed(1)} Months`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Assets (Net Worth) */}
                            <div className="pt-2 border-t border-gray-50 dark:border-white/5 mt-2 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Assets</span>
                                <span className={cn(
                                    "text-emerald-700 dark:text-emerald-300 font-black text-sm transition-all",
                                    !showSensitive && "blur-md select-none opacity-50"
                                )}>
                                    {currencySymbol}{(allTimeSavings + allTimeInvestments).toLocaleString()}
                                </span>
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* AI Insight Card (Moved here) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-2xl p-5 border border-purple-500/20"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-purple-600 dark:text-violet-400" size={20} />
                        <span className="font-semibold text-gray-900 dark:text-white">Insight</span>
                    </div>
                    <p className="text-sm leading-relaxed">{commentary}</p>
                </motion.div>

                {/* Charts Area */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white">Spending Trend</h3>
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setComparisonPeriod(p)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                                        comparisonPeriod === p
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-40 flex items-end justify-between gap-2">
                        {comparisonData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedRange({ start: d.start, end: d.end, label: d.label })}>
                                <div className="w-full relative h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.amount / maxComparisonAmount) * 100}%` }}
                                        transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-colors"
                                    />
                                    {/* Tooltip on hover/click could go here */}
                                </div>
                                <span className="text-[10px] font-medium text-gray-400">{d.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Selected Range Indicator */}
                    {selectedRange && (
                        <div className="mt-4 flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                Showing data for: {selectedRange.label}
                            </span>
                            <button onClick={() => setSelectedRange(null)} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                                Clear Filter
                            </button>
                        </div>
                    )}
                </div>



                {/* VISUAL CATEGORY BREAKDOWN (Detailed) */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                        <span>{selectedRange ? "Detailed Breakdown" : `Spending by Category`}</span>
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                            {comparisonPeriod}
                        </span>
                    </h3>

                    {(() => {
                        // 1. Get Expenses for the current view
                        const now = new Date();
                        let start = new Date();
                        let end = new Date();

                        if (selectedRange) {
                            start = selectedRange.start;
                            end = selectedRange.end;
                        } else {
                            if (comparisonPeriod === 'daily') {
                                start.setHours(0, 0, 0, 0);
                                end.setHours(23, 59, 59, 999);
                            } else if (comparisonPeriod === 'weekly') {
                                start.setDate(now.getDate() - now.getDay());
                                start.setHours(0, 0, 0, 0);
                                end.setDate(start.getDate() + 6);
                                end.setHours(23, 59, 59, 999);
                            } else {
                                // Monthly
                                start = new Date(now.getFullYear(), now.getMonth(), 1);
                                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                            }
                        }

                        const viewExpenses = expenses.filter(e => {
                            const d = new Date(e.date);
                            return d >= start && d <= end && (e.type === 'expense' || (!e.type && !e.isFromSavings));
                        });

                        // 2. Group by Category
                        type GroupedCat = { total: number; expenses: typeof expenses };
                        const groups: Record<string, GroupedCat> = {};
                        let viewTotal = 0;

                        viewExpenses.forEach(e => {
                            const cat = e.category || 'Uncategorized';
                            if (!groups[cat]) groups[cat] = { total: 0, expenses: [] };
                            groups[cat].total += e.amount;
                            groups[cat].expenses.push(e);
                            viewTotal += e.amount;
                        });

                        const sortedGroups = Object.entries(groups)
                            .sort(([, a], [, b]) => b.total - a.total);

                        if (sortedGroups.length === 0) {
                            return <div className="text-center text-gray-400 py-8 italic">No spending recorded for this period.</div>;
                        }

                        return (
                            <div className="space-y-6">
                                {sortedGroups.map(([cat, data]) => (
                                    <div key={cat} className="space-y-3">
                                        {/* Category Header */}
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                                                    <CategoryIcon category={cat as any} size="sm" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-base leading-none mb-1">{cat}</div>
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                                        {data.expenses.length} Transactions
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {currencySymbol}{data.total.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium">
                                                    {((data.total / viewTotal) * 100).toFixed(0)}% of total
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(data.total / viewTotal) * 100}%` }}
                                                className="h-full bg-gray-900 dark:bg-white rounded-full opacity-80"
                                            />
                                        </div>

                                        {/* Sub-items (Expenses) - Grouped by Name */}
                                        {/* Sub-items (Expenses) - Grouped by Name - TREE STYLE */}
                                        <div className="relative mt-3 pl-2">
                                            {/* Vertical Guide Line */}
                                            <div className="absolute left-[7px] top-0 bottom-4 w-[2px] bg-gray-100 dark:bg-gray-800 rounded-full" />

                                            <div className="space-y-4">
                                                {(() => {
                                                    // Group by Normalized Name
                                                    const nameGroups: Record<string, { total: number; name: string; id: string }> = {};

                                                    data.expenses.forEach(e => {
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
                                                        <>
                                                            {sortedSubItems.slice(0, 4).map((item, idx) => (
                                                                <div key={item.id || idx} className="relative pl-6">


                                                                    <div className="flex justify-between items-end mb-1">
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate pr-2">
                                                                            {item.name}
                                                                        </span>
                                                                        <span className="text-xs text-gray-900 dark:text-white font-bold tabular-nums">
                                                                            {currencySymbol}{item.total.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    {/* Sub-item Progress Bar */}
                                                                    <div className="h-1.5 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${(item.total / data.total) * 100}%` }}
                                                                            className="h-full bg-purple-500/60 dark:bg-purple-400/60 rounded-full"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {sortedSubItems.length > 4 && (
                                                                <div className="relative pl-6 pt-1">

                                                                    <div className="text-[10px] text-gray-400 font-medium">
                                                                        + {sortedSubItems.length - 4} more
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Recent Expenses (Header + limited list) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <div className="flex justify-between items-center mb-2 px-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent Expenses</h3>
                        <Link to="/history" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full">
                            View All
                        </Link>
                    </div>

                    {expenses.slice(0, 5).map((expense, i) => (
                        <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="card-gradient p-4 rounded-xl shadow-sm flex justify-between items-center group cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                        >
                            <div className="flex gap-3 items-center">
                                <CategoryIcon category={expense.category} size="sm" />
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white ">{expense.name || expense.category}</div>
                                    <div className="text-xs text-gray-500 dark:text-ios-subtext">{expense.category} • {new Date(expense.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="font-semibold text-gray-900 dark:text-white ">
                                    -{currencySymbol}{expense.amount.toFixed(2)}
                                </div>
                                <button
                                    onClick={() => deleteExpense(expense.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {expenses.length === 0 && (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                            No expenses recorded yet.
                        </div>
                    )}
                </motion.div>
            </div >
        </div >
    );
}
