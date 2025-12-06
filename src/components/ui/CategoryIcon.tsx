import type { Category } from "../../store/useExpenseStore";
import { Utensils, Bus, ShoppingBag, Film, Receipt, HeartPulse, TrendingUp, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";

const categoryConfig: Record<Category, { icon: any, color: string, bg: string }> = {
    Food: { icon: Utensils, color: "text-ios-orange", bg: "bg-ios-orange/10" },
    Transport: { icon: Bus, color: "text-ios-blue", bg: "bg-ios-blue/10" },
    Shopping: { icon: ShoppingBag, color: "text-ios-purple", bg: "bg-ios-purple/10" },
    Entertainment: { icon: Film, color: "text-ios-red", bg: "bg-ios-red/10" },
    Bills: { icon: Receipt, color: "text-ios-indigo", bg: "bg-ios-indigo/10" },
    Health: { icon: HeartPulse, color: "text-ios-green", bg: "bg-ios-green/10" },
    Investment: { icon: TrendingUp, color: "text-ios-teal", bg: "bg-ios-teal/10" },
    Misc: { icon: MoreHorizontal, color: "text-ios-gray", bg: "bg-ios-gray/10" },
};

export function CategoryIcon({ category, size = "md", className }: { category: Category, size?: "sm" | "md" | "lg", className?: string }) {
    const config = categoryConfig[category] || categoryConfig.Misc;
    const Icon = config.icon;

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };

    return (
        <div className={cn("rounded-full flex items-center justify-center", config.bg, config.color, sizeClasses[size], className)}>
            <Icon size={size === "sm" ? 16 : size === "md" ? 20 : 24} />
        </div>
    );
}
