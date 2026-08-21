import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Sparkles,
  Wallet,
  Coins,
  Receipt
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    currency,
    currentMonth,
    monthlySummary,
    budget,
    transactions,
    recurringPayments,
    insights,
    openAddExpense,
    openAddCredit,
    setActiveTab,
    markRecurringAsPaid
  } = useApp();

  const [activeChartTab, setActiveChartTab] = useState<'trend' | 'categories'>('trend');
  const [trendRange, setTrendRange] = useState<'week' | 'month'>('month');

  const summary = monthlySummary || {
    totalSpent: 0,
    totalIncome: 0,
    netBalance: 0,
    totalBudget: 75000,
    remainingBudget: 75000,
    percentageConsumed: 0,
    todaySpending: 0,
    transactionCount: 0,
    projectedSpending: 0,
    averageDailySpending: 0,
    categoryBreakdown: [],
    dayWiseSpending: [],
    fixedExpenses: 0,
    variableExpenses: 0,
    highestSpendingDay: null,
    highestSpendingCategory: null
  };

  const totalIncome = summary.totalIncome || 0;
  const totalSpent = summary.totalSpent || 0;
  const netBalance = summary.netBalance ?? (totalIncome - totalSpent);

  const isOverBudget = summary.percentageConsumed >= 100;
  const isNearBudget =
    summary.percentageConsumed >= (budget?.alertThreshold ? budget.alertThreshold * 100 : 80) &&
    !isOverBudget;

  // Categories closest to exceeding or exceeded
  const atRiskCategories = [...(summary.categoryBreakdown || [])]
    .filter((c) => c.budget > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  // Upcoming recurring payments (due in current month)
  const now = new Date();
  const currentDay = now.getDate();
  const upcomingBills = recurringPayments
    .filter((r) => r.isActive && !r.isCompleted && r.dueDay >= currentDay)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 3);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Pie chart data (Expense breakdown)
  const pieData = (summary.categoryBreakdown || [])
    .filter((c) => c.spent > 0)
    .map((c) => ({
      name: c.categoryName,
      value: c.spent,
      color: c.color,
      icon: c.icon
    }));

  // Filter trend data based on range
  const chartData =
    trendRange === 'week'
      ? (summary.dayWiseSpending || []).slice(-7)
      : summary.dayWiseSpending || [];

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* TOP HERO SECTION: QUICK ACTIONS (ADD EXPENSE & CREDIT) & BALANCE CARDS */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Top Header Row: Greeting & Top Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                കുടുക്ക
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {currentMonth} Overview
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Financial Overview
            </h2>
          </div>

          {/* Primary Top Action Buttons: Add Expense & Add Credit */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Add Credit / Income Button */}
            <button
              id="top-add-credit-btn"
              onClick={openAddCredit}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <ArrowDownLeft size={17} strokeWidth={2.5} />
              <span>+ Add Income</span>
            </button>

            {/* Add Expense Button */}
            <button
              id="top-add-expense-btn"
              onClick={openAddExpense}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm shadow-md shadow-slate-900/20 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus size={17} strokeWidth={2.5} />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>

        {/* 4-Column Top Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Credit / Total Income */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Total Income
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                <ArrowDownLeft size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-200 tracking-tight">
                {currency}{totalIncome.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                Income received this month
              </p>
            </div>
          </div>

          {/* Card 2: Total Spent / Expense */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Expenses
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shadow-xs">
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currency}{totalSpent.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                {summary.transactionCount} transactions · {summary.percentageConsumed}% of budget
              </p>
            </div>
          </div>

          {/* Card 3: Net Balance */}
          <div className="bg-slate-900 dark:bg-slate-800 p-5 rounded-2xl text-white shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Net Balance
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-800 dark:bg-slate-700 text-amber-400 flex items-center justify-center shadow-xs">
                <Coins size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${netBalance < 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                {currency}{netBalance.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {netBalance >= 0 ? 'Surplus cash remaining' : 'Expenses exceed income'}
              </p>
            </div>
          </div>

          {/* Card 4: Monthly Budget & Remaining Limit */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Monthly Budget
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs">
                <Wallet size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currency}{summary.totalBudget.toLocaleString()}
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {currency}{summary.remainingBudget.toLocaleString()} left
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOverBudget ? 'bg-rose-500' : isNearBudget ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, summary.percentageConsumed)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Alert if budget exceeded or near limit */}
      {isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Monthly Budget Exceeded
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                You have spent {currency}{summary.totalSpent.toLocaleString()} this month against your budget of {currency}{summary.totalBudget.toLocaleString()} ({summary.percentageConsumed}%).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {isNearBudget && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Approaching Budget Limit ({summary.percentageConsumed}%)
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Only {currency}{summary.remainingBudget.toLocaleString()} remaining in your budget for this month.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            View Details
          </button>
        </div>
      )}

      {/* Main 12-Column Geometric Layout Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left 8-Column Zone */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Section: Spending Insights Chart */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Spending Insights
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Average daily spend: <span className="font-bold text-slate-800 dark:text-slate-200">{currency}{summary.averageDailySpending}/day</span>
                  {summary.todaySpending > 0 && ` · Today's spend: ${currency}${summary.todaySpending.toLocaleString()}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setActiveChartTab('trend')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeChartTab === 'trend'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Trend
                  </button>
                  <button
                    onClick={() => setActiveChartTab('categories')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeChartTab === 'categories'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Categories
                  </button>
                </div>

                {activeChartTab === 'trend' && (
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setTrendRange('week')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        trendRange === 'week'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setTrendRange('month')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        trendRange === 'month'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-64 sm:h-72 w-full">
              {activeChartTab === 'trend' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="geomSpendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(val) => `D${val}`}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(val) => `${currency}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700">
                              <p className="font-semibold text-emerald-400">{data.date}</p>
                              <p className="font-black mt-1 text-base">{currency}{data.amount.toLocaleString()}</p>
                              <p className="text-[11px] text-slate-400">{data.count} transactions</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#geomSpendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-full sm:w-1/2 h-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-700">
                                  <p className="font-semibold">{data.name}</p>
                                  <p className="font-bold text-emerald-400 mt-0.5">{currency}{data.value.toLocaleString()}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full sm:w-1/2 max-h-56 overflow-y-auto space-y-2 pr-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                          {currency}{item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Recent Transactions */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest income and expense entries
                </p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                View All ({transactions.length}) <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t) => {
                  const isIncome = t.type === 'income';
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3.5 truncate">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft size={18} strokeWidth={2.5} /> : <ArrowUpRight size={18} strokeWidth={2.5} />}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {t.merchant}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {t.date} · {t.paymentMethod} · <span className="font-semibold">{t.categoryName}</span>
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-black shrink-0 ml-3 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {isIncome ? '+' : '-'}{currency}{t.amount.toLocaleString()}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No transactions recorded for this month yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right 4-Column Sidebar Zone */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Category Budgets Card */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Category Budgets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Spending vs. category limits
                </p>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase tracking-wider flex items-center cursor-pointer"
              >
                Manage <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-5">
              {atRiskCategories.length > 0 ? (
                atRiskCategories.map((cat) => {
                  let barColor = 'bg-emerald-500';
                  let warningText = `Spent: ${currency}${cat.spent.toLocaleString()} / ${currency}${cat.budget.toLocaleString()}`;
                  let isWarning = false;

                  if (cat.status === 'exceeded') {
                    barColor = 'bg-rose-500';
                    warningText = 'Budget Exceeded!';
                    isWarning = true;
                  } else if (cat.status === 'warning') {
                    barColor = 'bg-amber-500';
                    warningText = 'Approaching limit';
                    isWarning = true;
                  }

                  return (
                    <div key={cat.categoryId} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {cat.categoryName}
                        </span>
                        <span className={`font-bold ${cat.status === 'exceeded' ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {cat.percentage}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${barColor} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        />
                      </div>

                      <p className={`text-[10px] mt-1 uppercase font-semibold ${isWarning ? (cat.status === 'exceeded' ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400') : 'text-slate-400 dark:text-slate-500'}`}>
                        {warningText}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No category budgets defined yet.</p>
              )}
            </div>
          </section>

          {/* Upcoming Recurring */}
          <section className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recurring Bills
                </h3>
                <p className="text-[11px] text-slate-500">Upcoming commitments</p>
              </div>
              <button
                onClick={() => setActiveTab('recurring')}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBills.length > 0 ? (
                upcomingBills.map((bill) => {
                  const isDueToday = bill.dueDay === currentDay;
                  const daysLeft = bill.dueDay - currentDay;
                  return (
                    <div key={bill.id} className="flex justify-between items-center py-1">
                      <div className="text-xs truncate pr-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {bill.name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                          <span>{isDueToday ? 'Due Today' : `Due on ${bill.dueDay}th (${daysLeft}d)`}</span>
                          {bill.totalOccurrences ? (
                            <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
                              {bill.paidOccurrences || 0}/{bill.totalOccurrences}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {currency}{bill.amount.toLocaleString()}
                        </p>
                        <button
                          onClick={() => markRecurringAsPaid(bill.id, true)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors cursor-pointer"
                          title="Mark as Paid"
                        >
                          Paid
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 py-2">No pending bills for this month.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
