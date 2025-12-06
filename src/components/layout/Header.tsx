import { cn } from "../../lib/utils";
import { Moon, Sun } from "lucide-react";
import { useExpenseStore } from "../../store/useExpenseStore";

interface HeaderProps {
    title: string;
    rightAction?: React.ReactNode;
    large?: boolean;
}

export function Header({ title, rightAction, large = false }: HeaderProps) {
    const { theme, setTheme } = useExpenseStore();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-40 transition-all duration-200 px-4",
                large ? "pt-12 pb-4" : "pt-safe pb-3"
            )}
        >
            <div className="flex items-center justify-between">
                <h1
                    className={cn(
                        "font-bold tracking-tight transition-all",
                        large ? "text-3xl" : "text-lg text-center w-full"
                    )}
                >
                    {title}
                </h1>

                <div className="absolute right-4 flex items-center gap-2">
                    {rightAction}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-purple-500/20 dark:bg-white/10 hover:bg-purple-500/30 dark:hover:bg-white/20 transition-all shadow-md"
                    >
                        {theme === 'dark' ? <Sun size={18} className="text-purple-600 dark:text-violet-400" /> : <Moon size={18} className="text-purple-600" />}
                    </button>
                </div>
            </div>
        </header>
    );
}
