import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  Flame,
  X
} from 'lucide-react';

export const ExpenseCalendarView: React.FC = () => {
  const {
    currentMonth,
    setCurrentMonth,
    currency,
    transactions,
    categories,
    monthlySummary,
    setIsAddExpenseOpen
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDayTransactions, setSelectedDayTransactions] = useState<Transaction[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Parse YYYY-MM
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

  // Aggregate daily expenses
  const dailyMap: { [day: number]: { amount: number; count: number; items: Transaction[] } } = {};
  transactions
    .filter((t) => t.date.startsWith(currentMonth))
    .forEach((t) => {
      const d = parseInt(t.date.split('-')[2], 10);
      if (!dailyMap[d]) dailyMap[d] = { amount: 0, count: 0, items: [] };
      dailyMap[d].amount += t.amount;
      dailyMap[d].count += 1;
      dailyMap[d].items.push(t);
    });

  const avgDaily = monthlySummary?.averageDailySpending || 1000;

  const handleDateClick = (dayNum: number) => {
    const dateStr = `${currentMonth}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedDayTransactions(dailyMap[dayNum]?.items || []);
    setIsDetailModalOpen(true);
  };

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 2, 1);
    setCurrentMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month, 1);
    setCurrentMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-200">
      {/* Calendar Header & Month Navigation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CalendarIcon size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Spending Calendar
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Heat-map visual overview of daily spending patterns. Click any day to see itemized expenses.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-white px-2">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <span>No Spend</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800" />
            <span>Moderate (&lt; {currency}{avgDaily})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800" />
            <span>High Spend</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800" />
            <span>Peak Spending Day</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-18 sm:min-h-24 p-2 rounded-2xl bg-slate-50/40 dark:bg-slate-900/30 opacity-30" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayInfo = dailyMap[dayNum];
            const hasSpend = dayInfo && dayInfo.amount > 0;

            const isHigh = hasSpend && dayInfo.amount > avgDaily * 1.5;
            const isPeak = hasSpend && dayInfo.amount > avgDaily * 3;

            let cellBg = 'bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800';
            if (isPeak) {
              cellBg = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100/70';
            } else if (isHigh) {
              cellBg = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/70';
            } else if (hasSpend) {
              cellBg = 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100/50';
            }

            const isToday =
              new Date().toISOString().split('T')[0] === `${currentMonth}-${String(dayNum).padStart(2, '0')}`;

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => handleDateClick(dayNum)}
                className={`min-h-18 sm:min-h-24 p-2 sm:p-2.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer text-left ${cellBg} ${
                  isToday ? 'ring-2 ring-emerald-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {dayNum}
                  </span>
                  {isPeak && <Flame size={12} className="text-rose-500" />}
                </div>

                {hasSpend ? (
                  <div className="mt-1">
                    <span className={`text-[11px] sm:text-xs font-black block truncate ${
                      isPeak ? 'text-rose-600 dark:text-rose-400' : isHigh ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {currency}{dayInfo.amount >= 1000 ? `${(dayInfo.amount / 1000).toFixed(1)}k` : dayInfo.amount}
                    </span>
                    <span className="text-[9px] text-slate-400 hidden sm:block">
                      {dayInfo.count} exp.
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">
                    —
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Expense Details Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Expenses for {selectedDate}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total: {currency}{selectedDayTransactions.reduce((s, t) => s + t.amount, 0).toLocaleString()} ({selectedDayTransactions.length} items)
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {selectedDayTransactions.length > 0 ? (
                selectedDayTransactions.map((t) => {
                  const catObj = categories.find((c) => c.id === t.categoryId);
                  return (
                    <div key={t.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3 truncate">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: catObj?.color || '#6366F1' }}
                        >
                          <CategoryIcon iconName={catObj?.icon || 'Receipt'} size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {t.merchant}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.categoryName} · {t.paymentMethod} {t.notes ? `· "${t.notes}"` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                        -{currency}{t.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No expenses recorded on this day.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsAddExpenseOpen(true);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Expense on this Date</span>
              </button>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
