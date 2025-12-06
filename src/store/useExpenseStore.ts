import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Bills' | 'Health' | 'Investment' | 'Misc';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface Expense {
    id: string;
    name: string;
    amount: number;
    category: Category;
    date: string; // ISO string
    note?: string;
}

export interface Budget {
    id: string;
    name: string;
    category: Category;
    amount: number;
}

interface ExpenseStore {
    expenses: Expense[];
    setExpenses: (expenses: Expense[]) => void;
    clearExpenses: () => void;
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    deleteExpense: (id: string) => void;
    getExpensesByDate: (date: Date) => Expense[];
    getTotalBalance: () => number;
    getTotalBudget: () => number;
    getOverallBudgetStatus: () => 'under' | 'near' | 'over';
    budgets: Budget[];
    createBudget: (name: string, category: Category, amount: number) => void;
    updateBudget: (id: string, amount: number) => void;
    deleteBudget: (id: string) => void;
    getBudgetProgress: (category: Category) => { spent: number; limit: number; percentage: number };
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    notifications: boolean;
    toggleNotifications: () => void;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    getCurrencySymbol: () => string;
}

export const useExpenseStore = create<ExpenseStore>()(
    persist(
        (set, get) => ({
            expenses: [],
            budgets: [],
            theme: 'system',
            notifications: false,
            currency: 'INR',
            setCurrency: (currency) => set({ currency }),
            getCurrencySymbol: () => {
                const currency = get().currency;
                switch (currency) {
                    case 'USD': return '$';
                    case 'EUR': return '€';
                    case 'GBP': return '£';
                    case 'JPY': return '¥';
                    case 'INR':
                    default: return '₹';
                }
            },
            setTheme: (theme) => {
                set({ theme });
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');

                if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                } else {
                    root.classList.add(theme);
                }
            },
            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
            setExpenses: (expenses) => set({ expenses }),
            clearExpenses: () => set({ expenses: [] }),
            addExpense: (expense) => set((state) => ({
                expenses: [
                    { ...expense, id: Math.random().toString(36).substr(2, 9) },
                    ...state.expenses
                ]
            })),
            deleteExpense: (id) => set((state) => ({
                expenses: state.expenses.filter((e) => e.id !== id)
            })),
            createBudget: (name, category, amount) => set((state) => ({
                budgets: [
                    ...state.budgets,
                    { id: Math.random().toString(36).substr(2, 9), name, category, amount }
                ]
            })),
            updateBudget: (id, amount) => set((state) => ({
                budgets: state.budgets.map(b => b.id === id ? { ...b, amount } : b)
            })),
            deleteBudget: (id) => set((state) => ({
                budgets: state.budgets.filter(b => b.id !== id)
            })),
            getTotalBudget: () => {
                return get().budgets.reduce((acc, b) => acc + b.amount, 0);
            },
            getOverallBudgetStatus: () => {
                const state = get();
                const totalBudget = state.budgets.reduce((acc, b) => acc + b.amount, 0);
                const totalSpent = state.expenses.reduce((acc, e) => acc + e.amount, 0);
                const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
                if (percentage >= 100) return 'over';
                if (percentage >= 80) return 'near';
                return 'under';
            },
            getBudgetProgress: (category) => {
                const state = get();
                const categoryBudgets = state.budgets.filter(b => b.category === category);
                const limit = categoryBudgets.reduce((acc, b) => acc + b.amount, 0);
                const spent = state.expenses
                    .filter((e) => e.category === category)
                    .reduce((acc, curr) => acc + curr.amount, 0);
                return { spent, limit, percentage: limit > 0 ? (spent / limit) * 100 : 0 };
            },
            getExpensesByDate: (date) => {
                // Simple filter for now, can be optimized
                const dateStr = date.toISOString().split('T')[0];
                return get().expenses.filter(e => e.date.startsWith(dateStr));
            },
            getTotalBalance: () => {
                // Return 0 as we calculate balance dynamically based on budget or income
                return 0;
            }
        }),
        {
            name: 'expense-storage',
        }
    )
);
