import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import { transactionAPI } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    paymentMethod: 'UPI',
    description: '',
  });

  const categories = ['All Categories', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  const categoryColors = {
    Food: 'bg-orange-500/15 text-orange-300',
    Travel: 'bg-blue-500/15 text-blue-300',
    Shopping: 'bg-purple-500/15 text-purple-300',
    Bills: 'bg-red-500/15 text-red-300',
    Entertainment: 'bg-pink-500/15 text-pink-300',
    Healthcare: 'bg-green-500/15 text-green-300',
    Education: 'bg-cyan-500/15 text-cyan-300',
    Other: 'bg-slate-500/15 text-slate-300',
  };

  const fetchTransactions = async (pageNum = 1, categoryFilter = '') => {
    setLoading(true);
    try {
      const response = await transactionAPI.getTransactions(pageNum, 10, categoryFilter);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, category);
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.merchant && formData.amount) {
      setLoading(true);
      setMessage('');
      try {
        const response = await transactionAPI.createTransaction(
          formData.merchant,
          parseFloat(formData.amount),
          formData.paymentMethod,
          formData.description
        );

        const fraudAlert = response.data?.data?.fraudAlert;
        setFormData({ merchant: '', amount: '', paymentMethod: 'UPI', description: '' });
        await fetchTransactions(1, category);

        if (fraudAlert) {
          setMessage(`🚨 Fraud detected: ${fraudAlert.alertMessage}`);
        } else {
          setMessage('✅ Transaction added successfully.');
        }
      } catch (error) {
        console.error('Error adding transaction:', error);
        const apiMessage = error.response?.data?.message || error.message || 'Failed to add transaction.';
        setMessage(`❌ ${apiMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setLoading(true);
      try {
        await transactionAPI.deleteTransaction(id);
        await fetchTransactions(page, category);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Transaction Hub</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Manage Your Transactions</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Add, view, and manage your UPI transactions with intelligent categorization and fraud detection.</p>
        </motion.div>

        {/* Add Transaction Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card mb-10 space-y-5 p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Add New Transaction</h2>
              <p className="mt-1 text-sm text-slate-400">Auto-categorized by merchant name</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Merchant Name</label>
              <input
                type="text"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                placeholder="e.g., Swiggy, Uber, Amazon"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                step="0.01"
                min="1"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 transition focus:border-cyan-400/50 focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add notes"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-center font-semibold text-slate-950 shadow-soft transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Adding...' : '✓ Add Transaction'}
          </button>
          {message && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
              {message}
            </div>
          )}
        </motion.form>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 transition focus:border-cyan-400/50 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            Showing {transactions.length} transactions
          </div>
        </motion.div>

        {/* Transaction List Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/80">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Merchant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="transition hover:bg-slate-900/40">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-100">{tx.merchant}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[tx.category] || categoryColors.Other}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-cyan-300">₹{tx.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tx.isFraudulent ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                          {tx.isFraudulent ? 'Fraud' : 'Safe'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(tx._id)}
                          className="rounded-2xl bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No transactions found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button
              onClick={() => fetchTransactions(page - 1, category)}
              disabled={page === 1 || loading}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchTransactions(page + 1, category)}
              disabled={page === totalPages || loading}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Next →
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Transactions;
