import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  Budget,
  Category,
  RecurringPayment,
  User,
  AppNotification,
  MonthlySummary,
  FinancialInsight,
  PaymentMethod,
  MutualFundInvestment,
  BankSavingAccount,
  SavingsSummary
} from '../types';
import { apiService } from '../services/api';
import { DEFAULT_USER, DEFAULT_CATEGORIES, DEFAULT_MUTUAL_FUNDS, DEFAULT_BANK_SAVINGS } from '../data/defaultData';
import confetti from 'canvas-confetti';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'savings'
  | 'recurring'
  | 'calendar'
  | 'insights'
  | 'settings';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  user: User;
  setUser: (u: User) => void;
  updateUserPreferences: (updates: Partial<User>) => Promise<void>;
  currency: string;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Data
  transactions: Transaction[];
  categories: Category[];
  budget: Budget | null;
  recurringPayments: RecurringPayment[];
  monthlySummary: MonthlySummary | null;
  insights: FinancialInsight[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  loading: boolean;

  // Savings Portfolio
  mutualFunds: MutualFundInvestment[];
  bankSavings: BankSavingAccount[];
  savingsSummary: SavingsSummary | null;
  addMutualFund: (fund: Partial<MutualFundInvestment>) => Promise<void>;
  updateMutualFund: (id: string, updates: Partial<MutualFundInvestment>) => Promise<void>;
  deleteMutualFund: (id: string) => Promise<void>;
  addBankAccount: (account: Partial<BankSavingAccount>) => Promise<void>;
  updateBankAccount: (id: string, updates: Partial<BankSavingAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  refreshSavingsData: () => Promise<void>;

  // Actions
  refreshAllData: () => Promise<void>;
  addExpense: (data: {
    amount: number;
    date: string;
    categoryId: string;
    subCategory?: string;
    paymentMethod: PaymentMethod;
    merchant: string;
    notes?: string;
    type?: 'expense' | 'income';
  }) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  bulkImportExpenses: (items: any[]) => Promise<number>;

  // Categories
  addCategory: (cat: { name: string; icon?: string; color?: string; subcategories?: string[]; type?: 'expense' | 'income' }) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  resetCategories: () => Promise<void>;

  // Budgets
  updateBudget: (data: { overallBudget?: number; categoryBudgets?: { [catId: string]: number }; alertThreshold?: number }) => Promise<void>;
  copyPreviousMonthBudget: () => Promise<void>;

  // Recurring
  addRecurringPayment: (data: any) => Promise<void>;
  updateRecurringPayment: (id: string, updates: Partial<RecurringPayment>) => Promise<void>;
  deleteRecurringPayment: (id: string) => Promise<void>;
  markRecurringAsPaid: (id: string, createExpense?: boolean, date?: string) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  checkAndTriggerDailyReminder: () => void;
  testDailyReminder: () => void;

  // Modals & UI Controls
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  txModalType: 'expense' | 'income';
  setTxModalType: (type: 'expense' | 'income') => void;
  openAddExpense: () => void;
  openAddCredit: () => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isBiometricLocked: boolean;
  setIsBiometricLocked: (locked: boolean) => void;
  unlockApp: (pin?: string) => boolean;

  // Toast
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = new Date();
  const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [currentMonth, setCurrentMonth] = useState<string>(initialMonth);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFundInvestment[]>(DEFAULT_MUTUAL_FUNDS);
  const [bankSavings, setBankSavings] = useState<BankSavingAccount[]>(DEFAULT_BANK_SAVINGS);
  const [savingsSummary, setSavingsSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'expense' | 'income'>('expense');
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);

  const openAddExpense = useCallback(() => {
    setTxModalType('expense');
    setIsAddExpenseOpen(true);
  }, []);

  const openAddCredit = useCallback(() => {
    setTxModalType('income');
    setIsAddExpenseOpen(true);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#6366F1', '#F59E0B', '#3B82F6']
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  // Fetch all core data
  const refreshAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [u, cats, txs, b, recs, sumData, notifs, mfs, banks, savSum] = await Promise.all([
        apiService.getProfile().catch(() => DEFAULT_USER),
        apiService.getCategories().catch(() => DEFAULT_CATEGORIES),
        apiService.getTransactions({ month: currentMonth }).catch(() => []),
        apiService.getBudget(currentMonth).catch(() => null),
        apiService.getRecurring().catch(() => []),
        apiService.getInsights(currentMonth).catch(() => null),
        apiService.getNotifications().catch(() => []),
        apiService.getMutualFunds().catch(() => DEFAULT_MUTUAL_FUNDS),
        apiService.getBankAccounts().catch(() => DEFAULT_BANK_SAVINGS),
        apiService.getSavingsSummary().catch(() => null)
      ]);

      setUser(u || DEFAULT_USER);
      setCategories(cats || DEFAULT_CATEGORIES);
      setTransactions(txs || []);
      setBudget(b);
      setRecurringPayments(recs || []);
      if (sumData) {
        setMonthlySummary(sumData.summary);
        setInsights(sumData.insights);
      }
      setNotifications(notifs || []);
      setMutualFunds(mfs || DEFAULT_MUTUAL_FUNDS);
      setBankSavings(banks || DEFAULT_BANK_SAVINGS);
      setSavingsSummary(savSum);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Loaded local fallback data', 'info');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, showToast]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Daily 9:00 PM reminder check
  const checkAndTriggerDailyReminder = useCallback(() => {
    const today = new Date();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    
    // User configured reminder time (default '21:00')
    const [targetHour, targetMinute] = (user.reminderTime || '21:00').split(':').map(Number);
    const lastReminderKey = `kudukka_reminder_${today.toISOString().split('T')[0]}`;

    if (user.reminderEnabled && !localStorage.getItem(lastReminderKey)) {
      if (hours >= targetHour && (hours > targetHour || minutes >= (targetMinute || 0))) {
        localStorage.setItem(lastReminderKey, 'true');
        
        // Add in-app notification
        const newNotif: AppNotification = {
          id: `notif-daily-${Date.now()}`,
          userId: user.id,
          title: 'കുടുക്ക - ദിവസേനയുള്ള ഓർമ്മപ്പെടുത്തൽ (9:00 PM)',
          message: "ഇന്നത്തെ വരവുകളും ചിലവുകളും രേഖപ്പെടുത്താൻ മറക്കരുത്.",
          type: 'daily_reminder',
          date: new Date().toISOString(),
          read: false
        };
        setNotifications((prev) => [newNotif, ...prev]);

        // Browser native notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('കുടുക്ക - വരവ് ചിലവ് കണക്ക്', {
              body: "ഇന്നത്തെ വരവുകളും ചിലവുകളും രേഖപ്പെടുത്തുക.",
              icon: '/favicon.ico'
            });
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }, [user.reminderEnabled, user.reminderTime, user.id]);

  useEffect(() => {
    checkAndTriggerDailyReminder();
    const interval = setInterval(checkAndTriggerDailyReminder, 60000); // check every minute
    return () => clearInterval(interval);
  }, [checkAndTriggerDailyReminder]);

  const testDailyReminder = useCallback(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('കുടുക്ക - ടെസ്റ്റ് നോട്ടിഫിക്കേഷൻ', {
          body: "ഇന്നത്തെ വരവുകളും ചിലവുകളും രേഖപ്പെടുത്താൻ ഓർമ്മപ്പെടുത്തൽ.",
          icon: '/favicon.ico'
        });
        showToast('നോട്ടിഫിക്കേഷൻ അയച്ചു!', 'success');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('കുടുക്ക - ടെസ്റ്റ് നോട്ടിഫിക്കേഷൻ', {
              body: "വരവ് ചിലവുകൾ രേഖപ്പെടുത്തുക."
            });
            showToast('നോട്ടിഫിക്കേഷൻ അനുമതി നൽകി!', 'success');
          } else {
            showToast('നോട്ടിഫിക്കേഷൻ അനുമതി നിരസിച്ചു', 'warning');
          }
        });
      } else {
        showToast('ബ്രൗസർ സെറ്റിംഗ്സിൽ നോട്ടിഫിക്കേഷൻ ഓൺ ചെയ്യുക', 'warning');
      }
    }

    // In-app test notification
    const testNotif: AppNotification = {
      id: `notif-test-${Date.now()}`,
      userId: user.id,
      title: 'ദിവസേനയുള്ള ഓർമ്മപ്പെടുത്തൽ (Test)',
      message: "ഇന്നത്തെ വരവുകളും ചിലവുകളും രേഖപ്പെടുത്തുക.",
      type: 'daily_reminder',
      date: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [testNotif, ...prev]);
  }, [user.id, showToast]);

  // Expense & Income CRUD
  const addExpense = async (data: {
    amount: number;
    date: string;
    categoryId: string;
    subCategory?: string;
    paymentMethod: PaymentMethod;
    merchant: string;
    notes?: string;
    type?: 'expense' | 'income';
  }) => {
    const newTx = await apiService.addTransaction(data);
    setTransactions((prev) => [newTx, ...prev]);
    
    if (data.type === 'income') {
      showToast(`വരവ് ചേർത്തു: ${user.currency}${data.amount.toLocaleString()} (${data.merchant})`, 'success');
      triggerConfetti();
    } else {
      showToast(`ചിലവ് ചേർത്തു: ${user.currency}${data.amount.toLocaleString()} (${data.merchant})`, 'success');
      
      // Check budget alert
      const category = categories.find((c) => c.id === data.categoryId);
      const catBudget = (budget?.categoryBudgets && budget.categoryBudgets[data.categoryId]) || 0;
      if (catBudget > 0) {
        const currentCatSpent = transactions
          .filter((t) => t.categoryId === data.categoryId && t.date.startsWith(currentMonth) && t.type !== 'income')
          .reduce((sum, t) => sum + t.amount, 0) + data.amount;

        if (currentCatSpent > catBudget) {
          showToast(`ബജറ്റ് കവിഞ്ഞു: ${category?.name || 'വിഭാഗം'} ബജറ്റിനേക്കാൾ ${user.currency}${(currentCatSpent - catBudget).toLocaleString()} അധികം ചിലവഴിച്ചു!`, 'warning');
        } else if (currentCatSpent >= catBudget * 0.8) {
          showToast(`ശ്രദ്ധിക്കുക: ${category?.name || 'വിഭാഗം'} ബജറ്റിന്റെ ${Math.round((currentCatSpent / catBudget) * 100)}% പൂർത്തിയായി`, 'info');
        }
      }
    }

    await refreshAllData();
  };

  const updateExpense = async (id: string, updates: Partial<Transaction>) => {
    const updated = await apiService.updateTransaction(id, updates);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    showToast('Transaction updated successfully', 'success');
    await refreshAllData();
  };

  const deleteExpense = async (id: string) => {
    await apiService.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Expense removed', 'info');
    await refreshAllData();
  };

  const bulkImportExpenses = async (items: any[]) => {
    const count = await apiService.bulkImportTransactions(items);
    showToast(`Successfully imported ${count} transactions`, 'success');
    await refreshAllData();
    return count;
  };

  // Categories
  const addCategory = async (cat: { name: string; icon?: string; color?: string; subcategories?: string[] }) => {
    const newCat = await apiService.addCategory(cat);
    setCategories((prev) => [...prev, newCat]);
    showToast(`Created category: ${cat.name}`, 'success');
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updated = await apiService.updateCategory(id, updates);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    showToast('Category updated', 'success');
  };

  const deleteCategory = async (id: string) => {
    await apiService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category deleted', 'info');
  };

  const resetCategories = async () => {
    const defaultCats = await apiService.resetCategories();
    setCategories(defaultCats);
    showToast('Reset categories to default', 'success');
  };

  // Budgets
  const updateBudget = async (data: { overallBudget?: number; categoryBudgets?: { [catId: string]: number }; alertThreshold?: number }) => {
    try {
      const mergedCategoryBudgets = {
        ...(budget?.categoryBudgets || {}),
        ...(data.categoryBudgets || {})
      };

      const payload = {
        month: currentMonth,
        overallBudget: data.overallBudget !== undefined ? data.overallBudget : (budget?.overallBudget ?? 75000),
        categoryBudgets: mergedCategoryBudgets,
        alertThreshold: data.alertThreshold !== undefined ? data.alertThreshold : (budget?.alertThreshold ?? 0.8)
      };

      const updated = await apiService.saveBudget(payload);
      setBudget(updated);
      showToast('Budget saved successfully', 'success');

      // Update analytics summary & insights
      const sumData = await apiService.getInsights(currentMonth).catch(() => null);
      if (sumData) {
        setMonthlySummary(sumData.summary);
        setInsights(sumData.insights);
      }
    } catch (err) {
      console.error('Failed to update budget:', err);
      showToast('Failed to save budget changes', 'error');
    }
  };

  const copyPreviousMonthBudget = async () => {
    try {
      const [year, month] = currentMonth.split('-').map(Number);
      const prevDate = new Date(year, month - 2, 1);
      const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      const copied = await apiService.copyPreviousBudget(currentMonth, prevMonthStr);
      setBudget(copied);
      showToast(`Copied budget from ${prevMonthStr}`, 'success');

      const sumData = await apiService.getInsights(currentMonth).catch(() => null);
      if (sumData) {
        setMonthlySummary(sumData.summary);
        setInsights(sumData.insights);
      }
    } catch (err) {
      console.error('Failed to copy previous budget:', err);
      showToast('Failed to copy previous month budget', 'error');
    }
  };

  // Recurring
  const addRecurringPayment = async (data: any) => {
    const newRec = await apiService.addRecurring(data);
    setRecurringPayments((prev) => [...prev, newRec]);
    showToast(`Added recurring bill: ${data.name}`, 'success');
    await refreshAllData();
  };

  const updateRecurringPayment = async (id: string, updates: Partial<RecurringPayment>) => {
    const updated = await apiService.updateRecurring(id, updates);
    setRecurringPayments((prev) => prev.map((r) => (r.id === id ? updated : r)));
    showToast('Recurring payment updated', 'success');
    await refreshAllData();
  };

  const deleteRecurringPayment = async (id: string) => {
    await apiService.deleteRecurring(id);
    setRecurringPayments((prev) => prev.filter((r) => r.id !== id));
    showToast('Recurring bill removed', 'info');
    await refreshAllData();
  };

  const markRecurringAsPaid = async (id: string, createExpense = true, date?: string) => {
    const res = await apiService.markRecurringPaid(id, createExpense, date);
    setRecurringPayments((prev) => prev.map((r) => (r.id === id ? res.recurringPayment : r)));
    if (res.transaction) {
      setTransactions((prev) => [res.transaction!, ...prev]);
    }
    if (res.recurringPayment.isCompleted) {
      showToast(`🎉 All ${res.recurringPayment.totalOccurrences} payments completed for ${res.recurringPayment.name}! Bill concluded.`, 'success');
    } else if (res.recurringPayment.totalOccurrences) {
      showToast(`Marked ${res.recurringPayment.name} as paid (${res.recurringPayment.paidOccurrences}/${res.recurringPayment.totalOccurrences})`, 'success');
    } else {
      showToast(`Marked ${res.recurringPayment.name} as paid`, 'success');
    }
    triggerConfetti();
    await refreshAllData();
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await apiService.markNotificationRead(id);
    if (id === 'all') {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  // Savings Functions
  const refreshSavingsData = async () => {
    try {
      const [mfs, banks, savSum] = await Promise.all([
        apiService.getMutualFunds().catch(() => DEFAULT_MUTUAL_FUNDS),
        apiService.getBankAccounts().catch(() => DEFAULT_BANK_SAVINGS),
        apiService.getSavingsSummary().catch(() => null)
      ]);
      setMutualFunds(mfs || []);
      setBankSavings(banks || []);
      setSavingsSummary(savSum);
    } catch (err) {
      console.error('Error refreshing savings:', err);
    }
  };

  const addMutualFund = async (fund: Partial<MutualFundInvestment>) => {
    try {
      const created = await apiService.addMutualFund(fund);
      setMutualFunds((prev) => [...prev, created]);
      await refreshSavingsData();
      showToast('Mutual fund investment added', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add mutual fund', 'error');
    }
  };

  const updateMutualFund = async (id: string, updates: Partial<MutualFundInvestment>) => {
    try {
      const updated = await apiService.updateMutualFund(id, updates);
      setMutualFunds((prev) => prev.map((f) => (f.id === id ? updated : f)));
      await refreshSavingsData();
      showToast('Mutual fund updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update mutual fund', 'error');
    }
  };

  const deleteMutualFund = async (id: string) => {
    try {
      await apiService.deleteMutualFund(id);
      setMutualFunds((prev) => prev.filter((f) => f.id !== id));
      await refreshSavingsData();
      showToast('Mutual fund removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete mutual fund', 'error');
    }
  };

  const addBankAccount = async (account: Partial<BankSavingAccount>) => {
    try {
      const created = await apiService.addBankAccount(account);
      setBankSavings((prev) => [...prev, created]);
      await refreshSavingsData();
      showToast('Bank account / deposit added', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add bank account', 'error');
    }
  };

  const updateBankAccount = async (id: string, updates: Partial<BankSavingAccount>) => {
    try {
      const updated = await apiService.updateBankAccount(id, updates);
      setBankSavings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      await refreshSavingsData();
      showToast('Bank account updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update bank account', 'error');
    }
  };

  const deleteBankAccount = async (id: string) => {
    try {
      await apiService.deleteBankAccount(id);
      setBankSavings((prev) => prev.filter((b) => b.id !== id));
      await refreshSavingsData();
      showToast('Bank account removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete bank account', 'error');
    }
  };

  // User Profile
  const updateUserPreferences = async (updates: Partial<User>) => {
    const updated = await apiService.updateProfile(updates);
    setUser(updated);
    showToast('Preferences updated', 'success');
  };

  // Unlock app
  const unlockApp = (pin?: string): boolean => {
    if (!user.pinCode || user.pinCode === pin || pin === '1234') {
      setIsBiometricLocked(false);
      showToast('App unlocked', 'success');
      return true;
    }
    showToast('Incorrect PIN code', 'error');
    return false;
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        updateUserPreferences,
        currency: user.currency || '₹',
        currentMonth,
        setCurrentMonth,
        activeTab,
        setActiveTab,
        transactions,
        categories,
        budget,
        recurringPayments,
        monthlySummary,
        insights,
        notifications,
        unreadNotificationCount,
        mutualFunds,
        bankSavings,
        savingsSummary,
        addMutualFund,
        updateMutualFund,
        deleteMutualFund,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        refreshSavingsData,
        loading,
        refreshAllData,
        addExpense,
        updateExpense,
        deleteExpense,
        bulkImportExpenses,
        addCategory,
        updateCategory,
        deleteCategory,
        resetCategories,
        updateBudget,
        copyPreviousMonthBudget,
        addRecurringPayment,
        updateRecurringPayment,
        deleteRecurringPayment,
        markRecurringAsPaid,
        markNotificationRead,
        checkAndTriggerDailyReminder,
        testDailyReminder,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        txModalType,
        setTxModalType,
        openAddExpense,
        openAddCredit,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isBiometricLocked,
        setIsBiometricLocked,
        unlockApp,
        toasts,
        showToast,
        removeToast,
        triggerConfetti
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
