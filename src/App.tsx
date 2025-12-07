import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LaunchScreen } from "./components/LaunchScreen";
import { useAuthStore } from "./store/useAuthStore";
import { AppShell } from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Budget from "./pages/Budget";
import { Investments } from "./pages/Investments";
import { Wrapped } from "./pages/Wrapped";
import CalendarView from "./pages/CalendarView";
import Settings from "./pages/Settings";
import History from "./pages/History";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 2s to allow animation to complete
    const timer = setTimeout(() => setShowSplash(false), 2000);

    // Initialize Auth Listener
    useAuthStore.getState().initialize();

    // Sync with Firestore when user changes
    const unsubSync = useAuthStore.subscribe((state, prevState) => {
      if (state.user?.uid !== prevState.user?.uid) {
        import("./store/useExpenseStore").then(({ useExpenseStore }) => {
          useExpenseStore.getState().subscribeToUser(state.user);
        });
      }
    });

    return () => {
      clearTimeout(timer);
      unsubSync();
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <LaunchScreen key="launch-screen" />}
      </AnimatePresence>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="budget" element={<Budget />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="settings" element={<Settings />} />
          <Route path="invest" element={<Investments />} />
          <Route path="wrapped" element={<Wrapped />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
