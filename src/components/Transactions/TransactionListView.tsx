import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction, PaymentMethod, TransactionType } from '../../types';
import {
  Search,
  Download,
  Trash2,
  Edit2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  X,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';

export const TransactionListView: React.FC = () => {
  const {
    transactions,
    categories,
    currency,
    deleteExpense,
    updateExpense,
    openAddExpense,
    openAddCredit,
    showToast
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');

  // Edit Modal State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type Filter
      if (typeFilter === 'income' && t.type !== 'income') return false;
      if (typeFilter === 'expense' && t.type === 'income') return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.merchant.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.subCategory && t.subCategory.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Category
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
        return false;
      }

      // Payment method
      if (selectedPaymentMethod !== 'all' && t.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      // Date Filter
      if (dateFilter !== 'all') {
        const todayStr = new Date().toISOString().split('T')[0];
        const txDate = t.date;
        if (dateFilter === 'today' && txDate !== todayStr) return false;
        if (dateFilter === 'yesterday') {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          if (txDate !== y.toISOString().split('T')[0]) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });
  }, [transactions, typeFilter, searchQuery, selectedCategory, selectedPaymentMethod, dateFilter, sortBy]);

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type !== 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalFilteredIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // Group by Date for cleaner UI
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export', 'warning');
      return;
    }

    const headers = ['ID', 'Type', 'Date', 'Time', 'Merchant/Source', 'Category', 'Sub-Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.type || 'expense',
      t.date,
      t.time || '',
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.categoryName}"`,
      `"${t.subCategory || ''}"`,
      t.amount,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kudukka_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV statement exported', 'success');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTransactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kudukka_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON backup exported', 'success');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    try {
      await updateExpense(editingTransaction.id, {
        type: editingTransaction.type,
        amount: Number(editingTransaction.amount),
        merchant: editingTransaction.merchant,
        categoryId: editingTransaction.categoryId,
        subCategory: editingTransaction.subCategory,
        paymentMethod: editingTransaction.paymentMethod,
        date: editingTransaction.date,
        notes: editingTransaction.notes
      });
      setEditingTransaction(null);
      showToast('Transaction updated', 'success');
    } catch (err: any) {
      showToast('Could not update transaction', 'error');
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const [year, month, day] = dateStr.split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-200">
      {/* Header & Top Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Transactions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Total Income: <span className="font-bold text-emerald-600 dark:text-emerald-400">+{currency}{totalFilteredIncome.toLocaleString()}</span>
              {' · '}
              Total Expenses: <span className="font-bold text-slate-900 dark:text-white">-{currency}{totalFilteredExpense.toLocaleString()}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Download CSV"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center space-x-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Download JSON"
            >
              <FileSpreadsheet size={14} />
              <span>JSON</span>
            </button>

            {/* Quick Add Credit */}
            <button
              onClick={openAddCredit}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <ArrowDownLeft size={15} strokeWidth={2.5} />
              <span>+ Add Income</span>
            </button>

            {/* Quick Add Expense */}
            <button
              onClick={openAddExpense}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>

        {/* Type Switcher Tabs (All, Expenses, Credits) */}
        <div className="flex bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl w-fit text-xs font-bold">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            Income
          </button>
        </div>

        {/* Search & Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search merchant, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="NetBanking">Net Banking</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>

          {/* Date Filter & Sort */}
          <div className="flex space-x-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-1/2 px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-1/2 px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List with Date Grouping */}
      {Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([dateStr, txList]) => {
            const items = txList as Transaction[];
            return (
              <div key={dateStr} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={14} className="text-slate-500" />
                    <span>{formatFriendlyDate(dateStr)}</span>
                    <span className="text-[11px] opacity-70 font-normal">({dateStr})</span>
                  </div>
                  <span className="font-semibold text-slate-500">
                    {items.length} {items.length === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>

                {/* Items in this group */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {items.map((t) => {
                    const catObj = categories.find((c) => c.id === t.categoryId);
                    const isIncome = t.type === 'income';
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Left: Icon & Details */}
                        <div className="flex items-center space-x-3.5 truncate">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                              isIncome ? 'bg-emerald-600' : ''
                            }`}
                            style={{ backgroundColor: isIncome ? '#059669' : (catObj?.color || '#0f172a') }}
                          >
                            {isIncome ? (
                              <ArrowDownLeft size={20} strokeWidth={2.5} />
                            ) : (
                              <CategoryIcon iconName={catObj?.icon || 'Receipt'} size={18} />
                            )}
                          </div>

                          <div className="truncate">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {t.merchant}
                              </h4>
                              {isIncome && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Income
                                </span>
                              )}
                              {t.subCategory && (
                                <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {t.subCategory}
                                </span>
                              )}
                              {t.isRecurringInstance && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                  Recurring
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.categoryName}</span>
                              {' · '}
                              <span>{t.paymentMethod}</span>
                              {t.notes && (
                                <span className="text-slate-400 italic"> · "{t.notes}"</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center space-x-3 shrink-0 ml-3">
                          <div className="text-right">
                            <span className={`text-sm sm:text-base font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                              {isIncome ? '+' : '-'}{currency}{t.amount.toLocaleString()}
                            </span>
                            {t.time && (
                              <p className="text-[10px] text-slate-400">{t.time}</p>
                            )}
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingTransaction(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete transaction "${t.merchant}" (${currency}${t.amount})?`)) {
                                  deleteExpense(t.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Receipt size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No transactions found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Try adjusting your filters or add a new transaction.
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={openAddCredit}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              + Add Income
            </button>
            <button
              onClick={openAddExpense}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              + Add Expense
            </button>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingTransaction.type === 'income' ? 'Edit Income' : 'Edit Expense'}
              </h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Amount</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Merchant / Source</label>
                <input
                  type="text"
                  required
                  value={editingTransaction.merchant}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, merchant: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                <select
                  value={editingTransaction.categoryId}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    setEditingTransaction({
                      ...editingTransaction,
                      categoryId: e.target.value,
                      categoryName: cat ? cat.name : editingTransaction.categoryName
                    });
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Payment Method</label>
                <select
                  value={editingTransaction.paymentMethod}
                  onChange={(e) =>
                    setEditingTransaction({
                      ...editingTransaction,
                      paymentMethod: e.target.value as PaymentMethod
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={editingTransaction.date}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Notes</label>
                <input
                  type="text"
                  value={editingTransaction.notes || ''}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
