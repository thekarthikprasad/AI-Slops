import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpenseStore } from "../store/useExpenseStore";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Wrapped() {
    const navigate = useNavigate();
    const { expenses } = useExpenseStore();
    const [step, setStep] = useState(0);

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const topCategory = expenses.length > 0
        ? expenses.sort((a, b) => b.amount - a.amount)[0].category
        : "Nothing";

    const slides = [
        {
            bg: "bg-ios-blue",
            content: (
                <div className="text-center text-gray-900">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-900 ">2025 Wrapped</h1>
                    <p className="text-xl opacity-80">Let's see how you spent your money.</p>
                </div>
            )
        },
        {
            bg: "bg-ios-purple",
            content: (
                <div className="text-center text-gray-900">
                    <p className="text-2xl opacity-80 mb-2">Total Spent</p>
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-900 ">₹{totalSpent.toFixed(0)}</h1>
                </div>
            )
        },
        {
            bg: "bg-ios-orange",
            content: (
                <div className="text-center text-gray-900">
                    <p className="text-2xl opacity-80 mb-2">Top Category</p>
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-900 ">{topCategory}</h1>
                    <p className="mt-4 opacity-80">You really love it!</p>
                </div>
            )
        },
        {
            bg: "bg-black",
            content: (
                <div className="text-center text-gray-900">
                    <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-900 ">That's a Wrap!</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg text-gray-900 dark:text-gray-900 "
                    >
                        Close
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        if (step < slides.length - 1) {
            const timer = setTimeout(() => setStep(s => s + 1), 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <button
                onClick={() => navigate("/")}
                className="absolute top-safe right-4 z-50 text-gray-900/50 hover:text-gray-900"
            >
                <X size={32} />
            </button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 flex items-center justify-center p-8 ${slides[step].bg}`}
                >
                    {slides[step].content}
                </motion.div>
            </AnimatePresence>

            {/* Progress Bars */}
            <div className="absolute top-safe left-0 right-0 flex gap-1 px-2">
                {slides.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: i < step ? "100%" : i === step ? "100%" : "0%" }}
                            transition={{ duration: i === step ? 3 : 0, ease: "linear" }}
                            className="h-full bg-white"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}



