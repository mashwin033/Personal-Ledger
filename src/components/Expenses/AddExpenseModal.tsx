import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethod, TransactionType } from '../../types';
import { apiService } from '../../services/api';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Check,
  ArrowRight
} from 'lucide-react';

const COMMON_PRESETS = [100, 200, 500, 1000, 2000, 5000];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'NetBanking',
  'Wallet',
  'Other'
];

const RECENT_EXPENSE_MERCHANTS = [
  'Swiggy',
  'Zomato',
  'Supermarket',
  'Fuel',
  'Amazon',
  'Zepto',
  'Pharmacy',
  'Electricity Bill'
];

const RECENT_INCOME_SOURCES = [
  'Monthly Salary',
  'Client Project',
  'Freelance Payment',
  'Investment Return',
  'Rental Income',
  'Cash Gift',
  'Bank Interest'
];

export const AddExpenseModal: React.FC = () => {
  const {
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    txModalType,
    setTxModalType,
    categories,
    addExpense,
    currency,
    showToast,
    triggerConfetti
  } = useApp();

  const [currentType, setCurrentType] = useState<TransactionType>(txModalType || 'expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Smart AI NLP tab
  const [activeTab, setActiveTab] = useState<'quick' | 'ai'>('quick');
  const [nlpText, setNlpText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // Filter categories matching the type
  const availableCategories = categories.filter((c) => {
    if (currentType === 'income') {
      return c.type === 'income';
    }
    return !c.type || c.type === 'expense';
  });

  // Sync currentType when modal opens or txModalType changes
  useEffect(() => {
    if (isAddExpenseOpen) {
      setCurrentType(txModalType);
    }
  }, [isAddExpenseOpen, txModalType]);

  // Set default category when type or categories change
  useEffect(() => {
    if (availableCategories.length > 0) {
      const match = availableCategories.find((c) => c.id === selectedCategoryId);
      if (!match) {
        setSelectedCategoryId(availableCategories[0].id);
        setSubCategory(availableCategories[0].subcategories?.[0] || '');
      }
    }
  }, [currentType, categories]);

  // Load last used payment method from local storage
  useEffect(() => {
    const lastMethod = (localStorage.getItem('personal_ledger_last_payment_method') ||
      localStorage.getItem('kudukka_last_payment_method')) as PaymentMethod;
    if (lastMethod && PAYMENT_METHODS.includes(lastMethod)) {
      setPaymentMethod(lastMethod);
    }
  }, []);

  const selectedCategory = availableCategories.find((c) => c.id === selectedCategoryId) || availableCategories[0];

  const handlePresetAmount = (val: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  const handleQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSmartParse = async () => {
    if (!nlpText.trim()) return;
    setIsParsing(true);
    try {
      const res = await apiService.parseNaturalExpense(nlpText);
      if (res.data) {
        if (res.data.amount) setAmount(String(res.data.amount));
        if (res.data.merchant) setMerchant(res.data.merchant);
        if (res.data.categoryId) setSelectedCategoryId(res.data.categoryId);
        if (res.data.subCategory) setSubCategory(res.data.subCategory);
        if (res.data.paymentMethod) setPaymentMethod(res.data.paymentMethod);
        if (res.data.notes) setNotes(res.data.notes);
        if (res.data.date) setDate(res.data.date);
        setActiveTab('quick');
        showToast('Extracted transaction details!', 'success');
      }
    } catch (err) {
      showToast('Could not extract details. Please enter manually.', 'warning');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (!merchant.trim()) {
      showToast(currentType === 'income' ? 'Please enter the income source' : 'Please enter the merchant or description', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        type: currentType,
        amount: numAmount,
        date,
        categoryId: selectedCategoryId || availableCategories[0]?.id || 'cat-food',
        subCategory: subCategory.trim() || undefined,
        paymentMethod,
        merchant: merchant.trim(),
        notes: notes.trim() || undefined
      });

      // Save preference
      localStorage.setItem('personal_ledger_last_payment_method', paymentMethod);

      triggerConfetti();
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Could not record transaction', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setMerchant('');
    setNotes('');
    setSubCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNlpText('');
    setActiveTab('quick');
    setIsAddExpenseOpen(false);
  };

  if (!isAddExpenseOpen) return null;

  const isIncome = currentType === 'income';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isIncome
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
              }`}
            >
              {isIncome ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {isIncome ? 'Add Income' : 'Add Expense'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isIncome ? 'Credit / Income entry' : 'Debit / Expense entry'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Type Toggle */}
            <div className="flex bg-slate-200/90 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setCurrentType('expense');
                  setTxModalType('expense');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  !isIncome
                    ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentType('income');
                  setTxModalType('income');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  isIncome
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                Income
              </button>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* AI Natural Language Tab */}
        {activeTab === 'ai' ? (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex items-start space-x-3">
                <Sparkles className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <p className="font-semibold mb-0.5">Smart Expense Parser</p>
                  <p className="opacity-90">
                    Paste your bank or UPI transaction SMS, e.g. <br />
                    <span className="italic font-mono text-[11px]">"Paid Rs 450 at Swiggy via UPI"</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <textarea
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                placeholder="E.g. Spent 850 at Starbucks via Credit Card"
                rows={4}
                className="w-full p-3.5 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none font-medium"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSmartParse}
                disabled={isParsing || !nlpText.trim()}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                {isParsing ? <span>Parsing...</span> : <><span>Extract Details</span><ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
            {/* Amount input - prominent and anchored */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isIncome ? 'Amount Credited' : 'Amount Spent'}
              </label>
              <div className="relative flex items-center">
                <span className={`absolute left-3.5 text-2xl font-black ${isIncome ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  {currency}
                </span>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-2xl font-black rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 text-slate-900 dark:text-white shadow-xs ${
                    isIncome ? 'focus:ring-emerald-500 text-emerald-600 dark:text-emerald-400' : 'focus:ring-rose-500'
                  }`}
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {COMMON_PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetAmount(val)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    +{currency}{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Merchant / Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isIncome ? 'Income Source' : 'Merchant / Description'}
              </label>
              <input
                id="expense-merchant-input"
                type="text"
                required
                placeholder={isIncome ? 'e.g. Salary, Client payment, Rental return' : 'e.g. Swiggy, Supermarket, Fuel, Rent'}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-white"
              />

              {/* Quick Merchant / Source Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
                {(isIncome ? RECENT_INCOME_SOURCES : RECENT_EXPENSE_MERCHANTS).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMerchant(m)}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Category
                </label>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedCategory?.name}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                {availableCategories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        if (cat.subcategories && cat.subcategories.length > 0) {
                          setSubCategory(cat.subcategories[0]);
                        } else {
                          setSubCategory('');
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 shadow-md ring-2 ring-slate-900 dark:ring-white'
                          : 'hover:bg-white/80 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon iconName={cat.icon} size={16} />
                      </div>
                      <span className="text-[11px] font-bold leading-tight truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-category (if available) */}
            {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Sub-category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategory.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubCategory(sub)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                        subCategory === sub
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date & Payment Method Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Date
                </label>
                <div className="space-y-1.5">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickDate(0)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDate(1)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                    >
                      Yesterday
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly bill, shared with friends"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white font-medium"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-expense-btn"
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer ${
                  isIncome
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900'
                }`}
              >
                <Check size={16} strokeWidth={2.5} />
                <span>{isSubmitting ? 'Saving...' : isIncome ? 'Save Income' : 'Save Expense'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
