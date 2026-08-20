import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Lock,
  Calendar,
  RefreshCw,
  WalletCards
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    currentMonth,
    setCurrentMonth,
    unreadNotificationCount,
    setIsNotificationCenterOpen,
    setIsSettingsOpen,
    openAddExpense,
    setIsBiometricLocked,
    refreshAllData,
    loading
  } = useApp();

  // Parse YYYY-MM
  const [yearStr, monthStr] = currentMonth.split('-');
  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const fullFormattedMonth = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
  const shortFormattedMonth = dateObj.toLocaleString('default', { month: 'short' }) + " '" + yearStr.slice(2);

  const handlePrevMonth = () => {
    const prev = new Date(Number(yearStr), Number(monthStr) - 2, 1);
    setCurrentMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const next = new Date(Number(yearStr), Number(monthStr), 1);
    setCurrentMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  };

  const isCurrentMonthNow = (() => {
    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return currentMonth === nowStr;
  })();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-18 gap-1.5 sm:gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xs ring-2 ring-indigo-400/30 shrink-0">
              <WalletCards size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                  Personal Ledger
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block font-medium truncate">
                Expense & Budget Tracker
              </p>
            </div>
          </div>

          {/* Month Selector in Center */}
          <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink min-w-0">
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0"
              title="Previous Month"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              id="current-month-display"
              onClick={handleCurrentMonth}
              className="px-1.5 sm:px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center space-x-1 sm:space-x-1.5 cursor-pointer truncate"
              title="Current Month"
            >
              <Calendar size={13} className="text-slate-500 dark:text-slate-400 shrink-0 hidden xs:inline" />
              <span className="hidden sm:inline truncate">{fullFormattedMonth}</span>
              <span className="inline sm:hidden truncate text-[11px]">{shortFormattedMonth}</span>
              {!isCurrentMonthNow && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Viewing past/future month" />
              )}
            </button>

            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0"
              title="Next Month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Quick Top Controls & Utilities (Guaranteed shrink-0 and within bounds) */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* Quick Add Expense / Transaction */}
            <button
              id="header-add-expense-btn"
              onClick={openAddExpense}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              title="Add Transaction"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add</span>
            </button>

            {/* Refresh Data */}
            <button
              id="header-refresh-btn"
              onClick={() => refreshAllData()}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="Sync & Refresh Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-slate-900 dark:text-white' : ''} />
            </button>

            {/* Notification Bell */}
            <button
              id="header-notifications-btn"
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Notifications & Daily Reminders"
            >
              <Bell size={16} />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 text-[8px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Privacy Lock Toggle (desktop/tablet) */}
            <button
              id="header-lock-btn"
              onClick={() => setIsBiometricLocked(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden md:block shrink-0"
              title="Lock Screen"
            >
              <Lock size={15} />
            </button>

            {/* Settings Gear */}
            <button
              id="header-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
