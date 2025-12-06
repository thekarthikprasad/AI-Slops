import { useState } from "react";
import { Header } from "../components/layout/Header";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart } from "lucide-react";

export function Investments() {
    const [investedAmount, setInvestedAmount] = useState(5000);

    return (
        <div className="animate-fade-in pb-24">
            <Header title="Investments" large />
            <div className="p-4 space-y-6">
                {/* Portfolio Value */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-ios-blue to-ios-indigo text-white rounded-2xl p-6 shadow-ios-lg"
                >
                    <span className="text-white/80">Total Portfolio Value</span>
                    <div className="text-4xl font-bold mt-1 tracking-tight text-white">
                        ₹{(investedAmount * 1.12).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md text-white">
                        <TrendingUp size={16} />
                        <span>+12.4% All Time</span>
                    </div>
                </motion.div>

                {/* Input Section */}
                <div className="card-gradient rounded-2xl p-6 shadow-ios">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Update Investment</h3>
                    <div className="flex items-center gap-4">
                        <div className="bg-ios-gray6 p-3 rounded-xl">
                            <DollarSign className="text-ios-gray" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 dark:text-ios-subtext ">Invested Amount</label>
                            <input
                                type="number"
                                value={investedAmount}
                                onChange={(e) => setInvestedAmount(parseInt(e.target.value) || 0)}
                                className="w-full font-bold text-xl focus:outline-none bg-transparent text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Trending Ideas */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg px-2 text-black dark:text-white">Trending Ideas</h3>
                    {[
                        { name: "S&P 500 ETF", code: "VOO", change: "+1.2%", color: "text-ios-green" },
                        { name: "Tech Growth", code: "QQQ", change: "+2.4%", color: "text-ios-green" },
                        { name: "Green Energy", code: "ICLN", change: "-0.5%", color: "text-ios-red" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.code}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card-gradient p-4 rounded-xl shadow-ios flex justify-between items-center"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-ios-gray6 p-2 rounded-full">
                                    <PieChart size={20} className="text-ios-blue" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-ios-subtext">{item.code}</div>
                                </div>
                            </div>
                            <div className={`font-bold ${item.color}`}>{item.change}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div >
    );
}



