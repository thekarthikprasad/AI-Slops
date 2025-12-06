import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function normalizeText(text: string): string {
    if (!text) return "";
    return text.trim().toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
}
