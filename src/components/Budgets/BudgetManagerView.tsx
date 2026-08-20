import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  PiggyBank,
  Copy,
  Plus,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  DollarSign,
  ChevronRight,
  Sparkles,
  Edit3,
  Check
} from 'lucide-react';

export const BudgetManagerView: React.FC = () => {
  const {
    currentMonth,
    currency,
    budget,
    categories,
    monthlySummary,
    updateBudget,
    copyPreviousMonthBudget,
    showToast
  } = useApp();

  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [overallInput, setOverallInput] = useState<string>(
    budget?.overallBudget ? String(budget.overallBudget) : '75000'
  );

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryBudgetInput, setCategoryBudgetInput] = useState<string>('');
  const [thresholdInput, setThresholdInput] = useState<number>(
    budget?.alertThreshold ? Math.round(budget.alertThreshold * 100) : 80
  );

  const summary = monthlySummary || {
    totalSpent: 0,
    totalBudget: 75000,
    remainingBudget: 75000,
    percentageConsumed: 0,
    projectedSpending: 0,
    categoryBreakdown: []
  };

  const handleSaveOverall = async () => {
    const val = parseFloat(overallInput);
    if (isNaN(val) || val < 0) {
      showToast('Please enter a valid budget amount', 'error');
      return;
    }
    await updateBudget({ overallBudget: val });
    setIsEditingOverall(false);
  };

  const handleStartEditCategory = (catId: string, currentVal: number) => {
    setEditingCategoryId(catId);
    setCategoryBudgetInput(currentVal > 0 ? String(currentVal) : '');
  };

  const handleSaveCategoryBudget = async (catId: string) => {
    const val = parseFloat(categoryBudgetInput) || 0;
    const currentCatBudgets = { ...(budget?.categoryBudgets || {}) };
    currentCatBudgets[catId] = val;

    await updateBudget({ categoryBudgets: currentCatBudgets });
    setEditingCategoryId(null);
  };

  const handleUpdateThreshold = async (newVal: number) => {
    setThresholdInput(newVal);
    await updateBudget({ alertThreshold: newVal / 100 });
  };

  // Calculate sum of category budgets
  const allocatedCategoryTotal = (Object.values(budget?.categoryBudgets || {}) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-200">
      {/* Overview & Month Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PiggyBank size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Monthly Budget Planner
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plan category targets, monitor spend velocity, and maintain financial discipline.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyPreviousMonthBudget()}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Copy size={14} />
              <span>Copy Previous Month</span>
            </button>
          </div>
        </div>

        {/* Overall Budget Progress Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
          {/* Main Number & Inline Edit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Monthly Budget
              </span>
              {!isEditingOverall && (
                <button
                  onClick={() => {
                    setOverallInput(String(budget?.overallBudget || 75000));
                    setIsEditingOverall(true);
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Target</span>
                </button>
              )}
            </div>

            {isEditingOverall ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={overallInput}
                  onChange={(e) => setOverallInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveOverall}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingOverall(false)}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currency}{(budget?.overallBudget || 75000).toLocaleString()}
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Allocated across categories: <span className="font-semibold text-slate-700 dark:text-slate-300">{currency}{allocatedCategoryTotal.toLocaleString()}</span>
            </p>
          </div>

          {/* Progress & Remaining */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Spent vs Target</span>
              <span className={summary.percentageConsumed >= 100 ? 'text-rose-600 font-bold' : summary.percentageConsumed >= thresholdInput ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                {summary.percentageConsumed}% used
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  summary.percentageConsumed >= 100
                    ? 'bg-rose-500'
                    : summary.percentageConsumed >= thresholdInput
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, summary.percentageConsumed)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Spent: <strong className="text-slate-900 dark:text-white">{currency}{summary.totalSpent.toLocaleString()}</strong></span>
              <span>Remaining: <strong className={summary.remainingBudget <= 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}>{currency}{summary.remainingBudget.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Projected End-of-Month Velocity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Projected Velocity</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {currency}{summary.projectedSpending.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {summary.projectedSpending > (budget?.overallBudget || 75000) ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  At current pace, you may exceed budget by {currency}{(summary.projectedSpending - (budget?.overallBudget || 75000)).toLocaleString()}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  On track to stay within your monthly budget
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Warning threshold setting */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sliders size={15} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Budget Warning Alert Threshold:
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {[75, 80, 85, 90].map((pct) => (
              <button
                key={pct}
                onClick={() => handleUpdateThreshold(pct)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  thresholdInput === pct
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Budgets & Breakdown
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {categories.length} Spending Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catBudget = (budget?.categoryBudgets && budget.categoryBudgets[cat.id]) || 0;
            const catSummary = summary.categoryBreakdown?.find((c) => c.categoryId === cat.id);
            const spent = catSummary?.spent || 0;
            const remaining = catBudget > 0 ? Math.max(0, catBudget - spent) : 0;
            const percentage = catBudget > 0 ? Number(((spent / catBudget) * 100).toFixed(1)) : 0;

            const isExceeded = catBudget > 0 && spent > catBudget;
            const isWarning = catBudget > 0 && percentage >= thresholdInput && !isExceeded;

            const isEditing = editingCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs ${
                  isExceeded
                    ? 'border-rose-300 dark:border-rose-800/70 ring-1 ring-rose-500/20'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-800/70 ring-1 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  {/* Category Name & Icon */}
                  <div className="flex items-center space-x-2.5 truncate">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={16} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {cat.name}
                        </h4>
                        {isExceeded && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            Budget Exceeded
                          </span>
                        )}
                        {isWarning && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            {percentage}% Used
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Spent: <strong className="text-slate-800 dark:text-slate-200">{currency}{spent.toLocaleString()}</strong>
                        {catBudget > 0 && (
                          <span> · Remaining: <strong className={isExceeded ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}>{currency}{remaining.toLocaleString()}</strong></span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Budget Allocation & Edit */}
                  <div className="text-right shrink-0 ml-2">
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          placeholder="0"
                          value={categoryBudgetInput}
                          onChange={(e) => setCategoryBudgetInput(e.target.value)}
                          className="w-20 px-2 py-1 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveCategoryBudget(cat.id)}
                          className="p-1 bg-emerald-600 text-white rounded-lg cursor-pointer"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditCategory(cat.id, catBudget)}
                        className="group flex flex-col items-end cursor-pointer"
                        title="Click to set category budget"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {catBudget > 0 ? `${currency}${catBudget.toLocaleString()}` : 'No Budget'}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 flex items-center">
                          Set budget <Edit3 size={10} className="ml-0.5" />
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar if budget set */}
                {catBudget > 0 && (
                  <div className="space-y-1 mt-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>0%</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{percentage}% utilized</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
