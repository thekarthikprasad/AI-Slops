import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
  useEffect(() => {
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
      unsubSync();
    };
  }, []);

  return (
    <>
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
