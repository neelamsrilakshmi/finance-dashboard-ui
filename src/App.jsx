import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "./App.css";

function App() {
  const [role, setRole] = useState("viewer");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const [transactions, setTransactions] = useState([
    { id: 1, date: "2026-03-01", description: "Salary", amount: 65000, category: "Salary", type: "income" },
    { id: 2, date: "2026-03-02", description: "Groceries", amount: 3200, category: "Food", type: "expense" },
    { id: 3, date: "2026-03-04", description: "Rent", amount: 18000, category: "Housing", type: "expense" },
    { id: 4, date: "2026-03-05", description: "Freelance Work", amount: 12000, category: "Freelance", type: "income" },
    { id: 5, date: "2026-03-07", description: "Electricity Bill", amount: 2400, category: "Utilities", type: "expense" },
    { id: 6, date: "2026-03-09", description: "Movie", amount: 900, category: "Entertainment", type: "expense" },
    { id: 7, date: "2026-03-11", description: "Fuel", amount: 2500, category: "Transport", type: "expense" },
    { id: 8, date: "2026-03-12", description: "Investment Return", amount: 5000, category: "Investment", type: "income" },
    { id: 9, date: "2026-04-01", description: "Salary", amount: 65000, category: "Salary", type: "income" },
    { id: 10, date: "2026-04-03", description: "Groceries", amount: 2800, category: "Food", type: "expense" },
    { id: 11, date: "2026-04-05", description: "Rent", amount: 18000, category: "Housing", type: "expense" },
    { id: 12, date: "2026-04-06", description: "Internet Bill", amount: 1000, category: "Utilities", type: "expense" },
  ]);

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    amount: "",
    category: "",
    type: "expense",
  });

  const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#14b8a6", "#84cc16"];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const getMonthLabel = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

  const categories = useMemo(() => {
    return [...new Set(transactions.map((t) => t.category))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" ? true : t.type === typeFilter;
      const matchesCategory = categoryFilter === "all" ? true : t.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const trendData = useMemo(() => {
    const grouped = {};

    transactions.forEach((t) => {
      const month = getMonthLabel(t.date);

      if (!grouped[month]) {
        grouped[month] = { month, income: 0, expenses: 0, balance: 0 };
      }

      if (t.type === "income") grouped[month].income += t.amount;
      else grouped[month].expenses += t.amount;

      grouped[month].balance = grouped[month].income - grouped[month].expenses;
    });

    return Object.values(grouped);
  }, [transactions]);

  const expenseBreakdown = useMemo(() => {
    const grouped = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        grouped[t.category] = (grouped[t.category] || 0) + t.amount;
      });

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const highestSpendingCategory = useMemo(() => {
    if (expenseBreakdown.length === 0) return null;
    return [...expenseBreakdown].sort((a, b) => b.value - a.value)[0];
  }, [expenseBreakdown]);

  const monthlyInsight = useMemo(() => {
    if (trendData.length < 2) return "Not enough monthly data for comparison.";

    const current = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];

    if (current.expenses > previous.expenses) {
      return `Expenses increased by ${formatCurrency(
        current.expenses - previous.expenses
      )} compared to ${previous.month}.`;
    }
    if (current.expenses < previous.expenses) {
      return `Expenses decreased by ${formatCurrency(
        previous.expenses - current.expenses
      )} compared to ${previous.month}.`;
    }
    return `Expenses stayed the same as ${previous.month}.`;
  }, [trendData]);

  const handleAddTransaction = () => {
    if (!formData.date || !formData.description || !formData.amount || !formData.category) {
      alert("Please fill all fields.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      date: formData.date,
      description: formData.description,
      amount: Number(formData.amount),
      category: formData.category,
      type: formData.type,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setFormData({
      date: "",
      description: "",
      amount: "",
      category: "",
      type: "expense",
    });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="app">
      <div className="container">
        <header className="card header">
          <div>
            <h1>Finance Dashboard</h1>
            <p>Track financial activity, transactions, and role-based actions.</p>
          </div>

          <div className="header-actions">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>

            {role === "admin" && (
              <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close Form" : "Add Transaction"}
              </button>
            )}
          </div>
        </header>

        {role === "admin" && showForm && (
          <section className="card form-card">
            <h3>Add Transaction</h3>
            <div className="form-grid">
              <input
                type="date"
                className="input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount"
                className="input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <input
                type="text"
                placeholder="Category"
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <button className="primary-btn" onClick={handleAddTransaction}>
                Save Transaction
              </button>
            </div>
          </section>
        )}

        <section className="summary-grid">
          <div className="card">
            <p>Total Balance</p>
            <h2>{formatCurrency(balance)}</h2>
          </div>
          <div className="card">
            <p>Income</p>
            <h2>{formatCurrency(income)}</h2>
          </div>
          <div className="card">
            <p>Expenses</p>
            <h2>{formatCurrency(expenses)}</h2>
          </div>
          <div className="card">
            <p>Role</p>
            <h2 style={{ textTransform: "capitalize" }}>{role}</h2>
          </div>
        </section>

        <section className="charts-grid">
          <div className="card">
            <h3>Balance Trend</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3>Spending Breakdown</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ name }) => name}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="card" style={{ marginTop: "20px" }}>
          <h3>Transactions</h3>

          <div className="filters-row">
            <input
              type="text"
              placeholder="Search by description or category"
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input">
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="empty-state">No transactions found for the selected filters.</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    {role === "admin" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>
  {new Date(t.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>
                      <td>{t.description}</td>
                      <td>{t.category}</td>
                      <td>
                        <span className={t.type === "income" ? "badge income" : "badge expense"}>
                          {t.type}
                        </span>
                      </td>
                      <td>{formatCurrency(t.amount)}</td>
                      {role === "admin" && (
                        <td>
                          <button className="danger-btn" onClick={() => handleDelete(t.id)}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="summary-grid" style={{ marginTop: "20px" }}>
          <div className="card">
            <p>Highest spending category</p>
            <h3>{highestSpendingCategory ? highestSpendingCategory.name : "N/A"}</h3>
            <p>{highestSpendingCategory ? formatCurrency(highestSpendingCategory.value) : "-"}</p>
          </div>
          <div className="card">
            <p>Monthly comparison</p>
            <h3>{monthlyInsight}</h3>
          </div>
          <div className="card">
            <p>Observation</p>
            <h3>{income > expenses ? "Income is greater than expenses" : "Expenses are higher than income"}</h3>
          </div>
          <div className="card">
            <p>Status</p>
            <h3>Final assignment version</h3>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;