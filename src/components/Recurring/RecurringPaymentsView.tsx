import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { RecurringPayment, PaymentMethod, RecurringFrequency } from '../../types';
import {
  Repeat,
  Plus,
  Calendar,
  CreditCard,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Zap,
  DollarSign,
  AlertCircle,
  X,
  Check
} from 'lucide-react';

export const RecurringPaymentsView: React.FC = () => {
  const {
    recurringPayments,
    categories,
    currency,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    markRecurringAsPaid,
    showToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'due_today' | 'due_week' | 'upcoming'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-bills');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [dueDay, setDueDay] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [autoLogExpense, setAutoLogExpense] = useState(true);

  // Calculations
  const activePayments = recurringPayments.filter((r) => r.isActive);
  const monthlyCommitment = activePayments.reduce((sum, r) => {
    if (r.frequency === 'yearly') return sum + Math.round(r.amount / 12);
    if (r.frequency === 'quarterly') return sum + Math.round(r.amount / 3);
    if (r.frequency === 'weekly') return sum + r.amount * 4;
    return sum + r.amount;
  }, 0);

  const now = new Date();
  const currentDay = now.getDate();

  // Filter items
  const filteredPayments = recurringPayments.filter((r) => {
    if (activeFilter === 'due_today') {
      return r.isActive && r.dueDay === currentDay;
    }
    if (activeFilter === 'due_week') {
      return r.isActive && r.dueDay >= currentDay && r.dueDay <= currentDay + 7;
    }
    if (activeFilter === 'upcoming') {
      return r.isActive && r.dueDay >= currentDay;
    }
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid bill amount', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('Please enter bill/subscription name', 'error');
      return;
    }

    try {
      await addRecurringPayment({
        name: name.trim(),
        amount: numAmount,
        categoryId,
        frequency,
        dueDay: Number(dueDay),
        paymentMethod,
        notes: notes.trim() || undefined,
        autoLogExpense
      });

      handleCloseModal();
    } catch (err: any) {
      showToast(err.message || 'Failed to add recurring payment', 'error');
    }
  };

  const handleCloseModal = () => {
    setName('');
    setAmount('');
    setNotes('');
    setDueDay(1);
    setFrequency('monthly');
    setIsAddModalOpen(false);
    setEditingPayment(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-200">
      {/* Header & Monthly Commitment Summary */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Repeat size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recurring Payments & Subscriptions
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automate tracking for rent, EMIs, utilities, OTT, and SIP investments.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Recurring Bill</span>
          </button>
        </div>

        {/* Commitment Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Fixed Commitment
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {currency}{monthlyCommitment.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {activePayments.length} active recurring commitments
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Due Today (Day {currentDay})
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {activePayments.filter((r) => r.dueDay === currentDay).length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bills needing confirmation today
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Due This Week
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {activePayments.filter((r) => r.dueDay >= currentDay && r.dueDay <= currentDay + 7).length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Upcoming over the next 7 days
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: `All Bills (${recurringPayments.length})` },
            { id: 'due_today', label: 'Due Today' },
            { id: 'due_week', label: 'Due This Week' },
            { id: 'upcoming', label: 'Upcoming this month' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recurring Bills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((item) => {
            const catObj = categories.find((c) => c.id === item.categoryId);
            const isDueToday = item.dueDay === currentDay;
            const isUpcomingSoon = item.dueDay > currentDay && item.dueDay <= currentDay + 5;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                  !item.isActive
                    ? 'opacity-60 border-slate-200 dark:border-slate-800'
                    : isDueToday
                    ? 'border-amber-300 dark:border-amber-800 ring-1 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: catObj?.color || '#6366F1' }}
                      >
                        <CategoryIcon iconName={catObj?.icon || 'Receipt'} size={18} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </h4>
                          {isDueToday && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
                              Due Today
                            </span>
                          )}
                          {isUpcomingSoon && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              Due in {item.dueDay - currentDay} days
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.categoryName} · <span className="capitalize">{item.frequency}</span> · Due day: <strong>{item.dueDay}th</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        {currency}{item.amount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400">{item.paymentMethod}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl mt-3 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {/* Active toggle */}
                    <button
                      onClick={() => updateRecurringPayment(item.id, { isActive: !item.isActive })}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Paused'}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete recurring bill "${item.name}"?`)) {
                          deleteRecurringPayment(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete bill"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Mark as Paid button */}
                  <button
                    onClick={() => markRecurringAsPaid(item.id, true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Paid</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Repeat size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Recurring Bills</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Add your monthly rent, subscriptions, mobile bills, and loan EMIs to never miss a due date.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Add First Recurring Bill
            </button>
          </div>
        )}
      </div>

      {/* Add Recurring Bill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Recurring Payment</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. House Rent, Netflix, Cult.fit, Car EMI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Amount</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g. Auto-debit from salary account"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
