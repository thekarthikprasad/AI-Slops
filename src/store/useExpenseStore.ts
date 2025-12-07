import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, getDocs, query } from 'firebase/firestore';

export type Category = 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Bills' | 'Health' | 'Investment' | 'Misc';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface Expense {
    id: string;
    name: string;
    amount: number;
    category: Category;
    date: string; // ISO string
    note?: string;
    type?: 'expense' | 'savings' | 'investment';
    isFromSavings?: boolean;
}

export interface Budget {
    id: string;
    name: string;
    category: Category;
    amount: number;
}

export interface MonthlyReport {
    id?: string;
    month: string;
    year?: number;
    income?: number;
    budgetLimit?: number;
    actualSpent?: number;
    savedFromBudget?: number;
    plannedSavings?: number;
    plannedInvestment?: number;
    totalSpent: number;
    totalSaved: number;
    totalInvested: number;
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
    // Financial allocation fields
    income: number;
    setIncome: (income: number) => void;
    monthlyBudget: number;
    setMonthlyBudget: (budget: number) => void;
    investmentGoal: number;
    setInvestmentGoal: (goal: number) => void;
    savingsGoal: number;
    setSavingsGoal: (goal: number) => void;
    totalSavings: number;
    setTotalSavings: (savings: number) => void;
    addToSavings: (amount: number) => void;
    monthlyReports: MonthlyReport[];
    addMonthlyReport: (report: MonthlyReport) => void;
    categories: Category[];
    lastReviewDate: string | null;
    setLastReviewDate: (date: string) => void;

    // Firebase Sync
    subscribeToUser: (user: any) => Promise<void>;
    unsubscribeFromFirestore: () => void;
    unsubscribers: Array<() => void>;
}

export const useExpenseStore = create<ExpenseStore>()(
    persist(
        (set, get) => ({
            expenses: [],
            budgets: [],
            theme: 'system',
            notifications: false,
            currency: 'INR',
            // Financial allocation defaults
            income: 0,
            monthlyBudget: 0,
            investmentGoal: 0,
            savingsGoal: 0,
            totalSavings: 0,
            monthlyReports: [],
            lastReviewDate: null,
            categories: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Investment', 'Misc'],

            unsubscribers: [],

            subscribeToUser: async (user) => {
                const state = get();
                state.unsubscribeFromFirestore();

                if (!user) return;

                const uid = user.uid;

                // Check if remote is empty to perform initial migration
                const expensesRef = collection(db, 'users', uid, 'expenses');
                const budgetsRef = collection(db, 'users', uid, 'budgets');
                const settingsRef = doc(db, 'users', uid, 'settings', 'general');

                try {
                    const expSnap = await getDocs(query(expensesRef));
                    if (expSnap.empty && state.expenses.length > 0) {
                        // Upload local expenses
                        const batch = writeBatch(db);
                        state.expenses.forEach(e => {
                            batch.set(doc(expensesRef, e.id), e);
                        });
                        state.budgets.forEach(b => {
                            batch.set(doc(budgetsRef, b.id), b);
                        });
                        // Upload settings
                        batch.set(settingsRef, {
                            income: state.income || 0,
                            monthlyBudget: state.monthlyBudget || 0,
                            investmentGoal: state.investmentGoal || 0,
                            savingsGoal: state.savingsGoal || 0,
                            currency: state.currency || 'INR',
                            theme: state.theme || 'system'
                        });
                        await batch.commit();
                    }
                } catch (e) {
                    console.error("Error migrating data", e);
                }

                // Subscriptions
                const unsubExpenses = onSnapshot(expensesRef, (snap) => {
                    const expenses = snap.docs.map(d => d.data() as Expense);
                    // Sort descending by date
                    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    set({ expenses });
                });

                const unsubBudgets = onSnapshot(budgetsRef, (snap) => {
                    const budgets = snap.docs.map(d => d.data() as Budget);
                    set({ budgets });
                });

                const unsubSettings = onSnapshot(settingsRef, (snap) => {
                    if (snap.exists()) {
                        const data = snap.data();
                        set({
                            income: data.income,
                            monthlyBudget: data.monthlyBudget,
                            investmentGoal: data.investmentGoal,
                            savingsGoal: data.savingsGoal,
                            currency: data.currency,
                            theme: data.theme // Handle theme change side-effect?
                        });
                        // Trigger theme update
                        if (data.theme) {
                            const root = window.document.documentElement;
                            root.classList.remove('light', 'dark');
                            if (data.theme === 'system') {
                                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                root.classList.add(systemTheme);
                            } else {
                                root.classList.add(data.theme);
                            }
                        }
                    }
                });

                set({ unsubscribers: [unsubExpenses, unsubBudgets, unsubSettings] });
            },

            unsubscribeFromFirestore: () => {
                get().unsubscribers.forEach(unsub => unsub());
                set({ unsubscribers: [] });
            },

            setIncome: (income) => {
                set({ income });
                const user = auth.currentUser;
                if (user) setDoc(doc(db, 'users', user.uid, 'settings', 'general'), { income }, { merge: true });
            },
            setMonthlyBudget: (monthlyBudget) => {
                set({ monthlyBudget });
                const user = auth.currentUser;
                if (user) setDoc(doc(db, 'users', user.uid, 'settings', 'general'), { monthlyBudget }, { merge: true });
            },
            setInvestmentGoal: (investmentGoal) => {
                set({ investmentGoal });
                const user = auth.currentUser;
                if (user) setDoc(doc(db, 'users', user.uid, 'settings', 'general'), { investmentGoal }, { merge: true });
            },
            setSavingsGoal: (savingsGoal) => {
                set({ savingsGoal });
                const user = auth.currentUser;
                if (user) setDoc(doc(db, 'users', user.uid, 'settings', 'general'), { savingsGoal }, { merge: true });
            },
            setTotalSavings: (totalSavings) => set({ totalSavings }),

            addToSavings: (amount) => set((state) => ({ totalSavings: state.totalSavings + amount })),
            addMonthlyReport: (report) => set((state) => ({ monthlyReports: [...state.monthlyReports, report] })),
            setLastReviewDate: (lastReviewDate) => set({ lastReviewDate }),

            setCurrency: (currency) => {
                set({ currency });
                const user = auth.currentUser;
                if (user) setDoc(doc(db, 'users', user.uid, 'settings', 'general'), { currency }, { merge: true });
            },
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

                const user = auth.currentUser;
                if (user) setDoc(doc(db, 'users', user.uid, 'settings', 'general'), { theme }, { merge: true });
            },
            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
            setExpenses: (expenses) => set({ expenses }),
            clearExpenses: () => {
                set({ expenses: [] });
                const user = auth.currentUser;
                if (user) {
                    // This is dangerous/hard to do efficiently without cloud function, but iterating is OK for small data
                    getDocs(collection(db, 'users', user.uid, 'expenses')).then(snap => {
                        snap.forEach(d => deleteDoc(d.ref));
                    });
                }
            },
            addExpense: (expense) => {
                const newExpense = { ...expense, id: Math.random().toString(36).substr(2, 9) };
                set((state) => ({
                    expenses: [newExpense, ...state.expenses]
                }));

                const user = auth.currentUser;
                if (user) {
                    setDoc(doc(db, 'users', user.uid, 'expenses', newExpense.id), newExpense);
                }
            },
            deleteExpense: (id) => {
                set((state) => ({
                    expenses: state.expenses.filter((e) => e.id !== id)
                }));
                const user = auth.currentUser;
                if (user) deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
            },
            createBudget: (name, category, amount) => {
                const newBudget = { id: Math.random().toString(36).substr(2, 9), name, category, amount };
                set((state) => ({
                    budgets: [...state.budgets, newBudget]
                }));
                const user = auth.currentUser;
                if (user) setDoc(doc(db, 'users', user.uid, 'budgets', newBudget.id), newBudget);
            },
            updateBudget: (id, amount) => {
                set((state) => {
                    const updated = state.budgets.map(b => b.id === id ? { ...b, amount } : b);
                    const budget = updated.find(b => b.id === id);
                    const user = auth.currentUser;
                    if (user && budget) setDoc(doc(db, 'users', user.uid, 'budgets', id), budget, { merge: true });
                    return { budgets: updated };
                });
            },
            deleteBudget: (id) => {
                set((state) => ({
                    budgets: state.budgets.filter(b => b.id !== id)
                }));
                const user = auth.currentUser;
                if (user) deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
            },
            getTotalBudget: () => {
                const state = get();
                return state.monthlyBudget > 0 ? state.monthlyBudget : state.budgets.reduce((acc, b) => acc + b.amount, 0);
            },
            getOverallBudgetStatus: () => {
                const state = get();
                const totalBudget = state.monthlyBudget > 0 ? state.monthlyBudget : state.budgets.reduce((acc, b) => acc + b.amount, 0);
                const totalSpent = state.expenses
                    .filter(e => e.type === 'expense' || (!e.type && !e.isFromSavings))
                    .reduce((acc, e) => acc + e.amount, 0);
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
                const dateStr = date.toISOString().split('T')[0];
                return get().expenses.filter(e => e.date.startsWith(dateStr));
            },
            getTotalBalance: () => {
                return 0;
            }
        }),
        {
            name: 'expense-storage',
            partialize: (state) => ({
                expenses: state.expenses,
                budgets: state.budgets,
                theme: state.theme,
                currency: state.currency,
                income: state.income,
                monthlyBudget: state.monthlyBudget,
                investmentGoal: state.investmentGoal,
                savingsGoal: state.savingsGoal,
                totalSavings: state.totalSavings,
                monthlyReports: state.monthlyReports,
                lastReviewDate: state.lastReviewDate
            })
        }
    )
);
