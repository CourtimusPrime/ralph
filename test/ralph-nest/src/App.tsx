import { useState } from "react";
import { TransactionList } from "./TransactionList";
import { AddTransactionForm } from "./AddTransactionForm";
import { CategoryList } from "./CategoryList";
import { CategoryForm } from "./CategoryForm";
import { SpendingByCategoryChart } from "./SpendingByCategoryChart";
import { MonthlyTotalsChart } from "./MonthlyTotalsChart";
import "./index.css";

type Category = { id: number; name: string; monthly_limit: number | null };

export function App() {
  const [txRefreshKey, setTxRefreshKey] = useState(0);
  const [catRefreshKey, setCatRefreshKey] = useState(0);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  function openAddCategory() {
    setEditingCategory(null);
    setShowCatForm(true);
  }

  function openEditCategory(cat: Category) {
    setEditingCategory(cat);
    setShowCatForm(true);
  }

  function closeCatForm() {
    setShowCatForm(false);
    setEditingCategory(null);
  }

  return (
    <div className="app">
      <h1>Budget Tracker</h1>
      <h2>Spending by Category</h2>
      <SpendingByCategoryChart />
      <h2>Monthly Totals (Last 6 Months)</h2>
      <MonthlyTotalsChart />
      <h2>Categories</h2>
      {!showCatForm && <button onClick={openAddCategory}>Add Category</button>}
      {showCatForm && (
        <CategoryForm
          editing={editingCategory}
          onSaved={() => { closeCatForm(); setCatRefreshKey(k => k + 1); }}
          onCancel={closeCatForm}
        />
      )}
      <CategoryList
        refreshKey={catRefreshKey}
        onEdit={openEditCategory}
      />
      <h2>Add Transaction</h2>
      <AddTransactionForm onAdded={() => setTxRefreshKey(k => k + 1)} />
      <h2>Transactions</h2>
      <TransactionList refreshKey={txRefreshKey} />
    </div>
  );
}

export default App;
