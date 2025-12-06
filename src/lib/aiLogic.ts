import type { Expense, Category } from "../store/useExpenseStore";

export function generateCommentary(expenses: Expense[], balance: number): string {
    if (expenses.length === 0) {
        return "Start tracking your expenses to get personalized insights!";
    }

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const topCategory = getTopCategory(expenses);

    if (balance < 1000) {
        return `Careful! Your balance is getting low (₹${balance.toFixed(0)}). You've spent a lot on ${topCategory} recently.`;
    }

    if (totalSpent > 2000) {
        return `Whoa, big spender! You've spent ₹${totalSpent.toFixed(0)} this month. Maybe cut back on ${topCategory}?`;
    }

    return `You're doing great! Your spending on ${topCategory} is within reasonable limits. Keep saving!`;
}

function getTopCategory(expenses: Expense[]): Category {
    const totals: Record<string, number> = {};
    expenses.forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0] as Category;
}
