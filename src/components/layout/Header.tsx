import { cn } from "../../lib/utils";


interface HeaderProps {
    title: string;
    rightAction?: React.ReactNode;
    large?: boolean;
}

export function Header({ title, rightAction, large = false }: HeaderProps) {

    return (
        <header
            className={cn(
                "sticky top-0 z-40 transition-all duration-200 px-4",
                large ? "pt-14 pb-4" : "pt-safe pt-4 pb-3"
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
                </div>
            </div>
        </header>
    );
}
