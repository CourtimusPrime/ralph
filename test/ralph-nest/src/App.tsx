import { useState } from "react";
import { TransactionList } from "./TransactionList";
import { AddTransactionForm } from "./AddTransactionForm";
import "./index.css";

export function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app">
      <h1>Budget Tracker</h1>
      <h2>Add Transaction</h2>
      <AddTransactionForm onAdded={() => setRefreshKey(k => k + 1)} />
      <h2>Transactions</h2>
      <TransactionList
        refreshKey={refreshKey}
        onDelete={async (id) => {
          await fetch(`/api/transactions/${id}`, { method: "DELETE" });
          setRefreshKey(k => k + 1);
        }}
      />
    </div>
  );
}

export default App;
