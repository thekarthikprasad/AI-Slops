import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
    title: string;
    rightAction?: React.ReactNode;
    large?: boolean;
    showBack?: boolean;
}

export function Header({ title, rightAction, large = false, showBack = false }: HeaderProps) {
    const navigate = useNavigate();

    return (
        <header
            className={cn(
                "sticky top-0 z-40 transition-all duration-200 px-4",
                large ? "pt-14 pb-4" : "pt-safe pt-4 pb-3"
            )}
        >
            <div className="flex items-center justify-between relative">
                {showBack && (
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                <h1
                    className={cn(
                        "font-bold tracking-tight transition-all",
                        large ? "text-3xl" : "text-lg text-center w-full",
                        showBack && !large ? "mx-10" : ""
                    )}
                >
                    {title}
                </h1>

                <div className="absolute right-4 flex items-center gap-2">
                    {rightAction}
                </div>
            </div>
        </header>
    );
}
