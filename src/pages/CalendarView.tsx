import { useState } from "react";
import { Header } from "../components/layout/Header";
import { useExpenseStore } from "../store/useExpenseStore";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { CategoryIcon } from "../components/ui/CategoryIcon";

export default function CalendarView() {
    const { expenses } = useExpenseStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate empty cells for start of month
    const startDay = getDay(monthStart);
    const emptyDays = Array(startDay).fill(null);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getExpensesForDay = (date: Date) => {
        return expenses.filter(e => isSameDay(new Date(e.date), date));
    };

    const getTotalForDay = (date: Date) => {
        return getExpensesForDay(date).reduce((sum, e) => sum + e.amount, 0);
    };

    const selectedDayExpenses = getExpensesForDay(selectedDate);

    return (
        <div className="animate-fade-in pb-24">
            <Header title="Calendar" large />

            <div className="p-4 space-y-6">
                {/* Calendar Card */}
                <div className="card-gradient rounded-3xl p-4 shadow-ios">
                    {/* Month Navigation */}
                    <div className="flex justify-between items-center mb-4 px-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-ios-gray6 rounded-full transition-colors">
                            <ChevronLeft size={20} className="text-ios-blue" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-ios-gray6 rounded-full transition-colors">
                            <ChevronRight size={20} className="text-ios-blue" />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {daysInMonth.map((date) => {
                            const dayTotal = getTotalForDay(date);
                            const isSelected = isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());
                            const hasExpenses = dayTotal > 0;

                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "aspect-square rounded-full flex flex-col items-center justify-center relative transition-all duration-200",
                                        isSelected ? "bg-ios-blue text-white shadow-md scale-105" : "hover:bg-gray-100 dark:hover:bg-white/10",
                                        isToday && !isSelected && "text-ios-blue font-bold"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm",
                                        isSelected ? "text-white" : "text-gray-900 dark:text-white"
                                    )}>{format(date, "d")}</span>
                                    {hasExpenses && (
                                        <div className={cn(
                                            "w-1 h-1 rounded-full mt-0.5",
                                            isSelected ? "bg-white/80" : "bg-ios-red"
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold px-2 text-gray-900 dark:text-white">
                        {isSameDay(selectedDate, new Date()) ? "Today" : format(selectedDate, "EEEE, MMM d")}
                    </h3>

                    {selectedDayExpenses.length === 0 ? (
                        <div className="text-center py-8 text-gray-900 dark:text-white font-medium card-gradient/50 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                            No expenses on this day
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayExpenses.map((expense) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="card-gradient p-4 rounded-xl shadow-sm flex justify-between items-center"
                                >
                                    <div className="flex gap-3 items-center">
                                        <CategoryIcon category={expense.category} size="sm" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{expense.category}</div>
                                            {expense.note && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{expense.note}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        -₹{expense.amount.toFixed(2)}
                                    </div>
                                </motion.div>
                            ))}
                            <div className="flex justify-between items-center px-4 pt-2 border-t border-gray-200 dark:border-white/10">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    -₹{getTotalForDay(selectedDate).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}






