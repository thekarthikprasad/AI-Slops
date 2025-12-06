import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import { AddExpense } from "./pages/AddExpense";
import Budget from "./pages/Budget";
import { Investments } from "./pages/Investments";
import { Wrapped } from "./pages/Wrapped";
import CalendarView from "./pages/CalendarView";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="budget" element={<Budget />} />
        <Route path="add" element={<AddExpense />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="settings" element={<Settings />} />
        <Route path="invest" element={<Investments />} />
        <Route path="wrapped" element={<Wrapped />} />
      </Route>
    </Routes>
  );
}

export default App;
