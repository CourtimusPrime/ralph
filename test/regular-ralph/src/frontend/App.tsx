import { useState } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "./Dashboard";
import { Transactions } from "./Transactions";
import { Categories } from "./Categories";

type Tab = "Dashboard" | "Transactions" | "Categories";

const TABS: Tab[] = ["Dashboard", "Transactions", "Categories"];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");

  function renderPage() {
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard />;
      case "Transactions":
        return <Transactions />;
      case "Categories":
        return <Categories />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
          <span className="text-lg font-bold text-indigo-600 mr-4">
            Budget Tracker
          </span>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "px-4 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700"
                  : "px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto">{renderPage()}</main>
    </div>
  );
}

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}
