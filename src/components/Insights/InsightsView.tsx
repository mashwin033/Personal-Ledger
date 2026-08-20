import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const InsightsView: React.FC = () => {
  const {
    currentMonth,
    currency,
    monthlySummary,
    insights,
    budget,
    categories
  } = useApp();

  const summary = monthlySummary || {
    totalSpent: 0,
    totalBudget: 75000,
    remainingBudget: 75000,
    percentageConsumed: 0,
    averageDailySpending: 0,
    projectedSpending: 0,
    highestSpendingDay: null,
    highestSpendingCategory: null,
    fixedExpenses: 0,
    variableExpenses: 0,
    categoryBreakdown: []
  };

  // Fixed vs Variable Pie Data
  const fixedVsVariableData = [
    { name: 'Fixed (Recurring)', value: summary.fixedExpenses, color: '#6366F1' },
    { name: 'Variable (Daily)', value: summary.variableExpenses, color: '#10B981' }
  ];

  // Category ranking data
  const categoryRankings = [...(summary.categoryBreakdown || [])]
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Smart Financial Insights
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Automated observations, spending trends, and behavioral intelligence to optimize your monthly cash flow.
        </p>
      </div>

      {/* Observation Cards Grid (Natural Language Insights) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((item) => {
          let bg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
          let iconColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60';
          if (item.type === 'positive') {
            bg = 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/40';
            iconColor = 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60';
          } else if (item.type === 'warning') {
            bg = 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/40';
            iconColor = 'text-amber-600 bg-amber-100 dark:bg-amber-900/60';
          }

          return (
            <div key={item.id} className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between ${bg}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
                    {item.type === 'positive' ? (
                      <TrendingDown size={18} />
                    ) : item.type === 'warning' ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                  </div>
                  {item.stat && (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                      {item.stat}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dives: Fixed vs Variable & Category Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fixed vs Variable Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fixed vs Variable Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recurring commitments vs discretionary everyday expenses
            </p>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fixedVsVariableData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fixedVsVariableData.map((entry, index) => (
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

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center space-x-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Fixed Recurring</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {currency}{summary.fixedExpenses.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Rent, Bills, EMIs, SIPs</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Variable Spend</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {currency}{summary.variableExpenses.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Food, Groceries, Shopping</span>
            </div>
          </div>
        </div>

        {/* Highest Spending Categories Ranking */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Spending Rankings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked from highest to lowest expenditure
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
            {categoryRankings.map((cat, idx) => {
              const pctOfTotal = summary.totalSpent > 0 ? ((cat.spent / summary.totalSpent) * 100).toFixed(1) : 0;
              return (
                <div key={cat.categoryId} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <span className="text-xs font-bold text-slate-400 w-4">
                      #{idx + 1}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={15} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {cat.categoryName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {pctOfTotal}% of total spend
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {currency}{cat.spent.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Velocity & Peak Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Average Velocity</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currency}{summary.averageDailySpending} / day
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated across days elapsed in {currentMonth}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Highest Spending Day</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {summary.highestSpendingDay ? `${currency}${summary.highestSpendingDay.amount.toLocaleString()}` : 'None'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.highestSpendingDay ? `Occurred on ${summary.highestSpendingDay.date}` : 'No spikes recorded'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Target Runway</span>
          <div className={`text-2xl font-black mt-1 ${summary.remainingBudget <= 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {currency}{summary.remainingBudget.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.remainingBudget > 0 ? 'Safe remaining balance' : 'Budget overrun'}
          </p>
        </div>
      </div>
    </div>
  );
};
