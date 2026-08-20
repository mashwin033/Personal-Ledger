import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { NavigationTabs } from './components/common/NavigationTabs';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { AddExpenseModal } from './components/Expenses/AddExpenseModal';
import { DashboardView } from './components/Dashboard/DashboardView';
import { TransactionListView } from './components/Transactions/TransactionListView';
import { BudgetManagerView } from './components/Budgets/BudgetManagerView';
import { RecurringPaymentsView } from './components/Recurring/RecurringPaymentsView';
import { ExpenseCalendarView } from './components/Calendar/ExpenseCalendarView';
import { InsightsView } from './components/Insights/InsightsView';
import { TotalSavingsView } from './components/Savings/TotalSavingsView';
import { NotificationCenterModal } from './components/Notifications/NotificationCenterModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { BiometricLockModal } from './components/Auth/BiometricLockModal';

const AppContent: React.FC = () => {
  const { activeTab, isBiometricLocked } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      {/* Biometric Privacy Overlay */}
      {isBiometricLocked && <BiometricLockModal />}

      {/* Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        {/* Navigation Tabs (Desktop & Tablet) */}
        <NavigationTabs />

        {/* View Switcher */}
        <div className="mt-2">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && <TransactionListView />}
          {activeTab === 'budgets' && <BudgetManagerView />}
          {activeTab === 'savings' && <TotalSavingsView />}
          {activeTab === 'recurring' && <RecurringPaymentsView />}
          {activeTab === 'calendar' && <ExpenseCalendarView />}
          {activeTab === 'insights' && <InsightsView />}
        </div>
      </main>

      {/* Mobile Floating Bottom Bar */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <AddExpenseModal />
      <NotificationCenterModal />
      <SettingsModal />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
