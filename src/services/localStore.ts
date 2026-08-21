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
import { generateSeedData, DEFAULT_USER, DEFAULT_CATEGORIES, DEFAULT_MUTUAL_FUNDS, DEFAULT_BANK_SAVINGS } from '../data/defaultData';

const STORAGE_KEYS = {
  USER: 'personal_ledger_user',
  CATEGORIES: 'personal_ledger_categories',
  TRANSACTIONS: 'personal_ledger_transactions',
  BUDGETS: 'personal_ledger_budgets',
  RECURRING: 'personal_ledger_recurring',
  MUTUAL_FUNDS: 'personal_ledger_mutual_funds',
  BANK_SAVINGS: 'personal_ledger_bank_savings',
  NOTIFICATIONS: 'personal_ledger_notifications',
  INITIALIZED: 'personal_ledger_initialized'
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save to localStorage for key: ${key}`, e);
  }
}

export function initLocalStore() {
  if (!getStorage<boolean>(STORAGE_KEYS.INITIALIZED, false)) {
    const seed = generateSeedData();
    setStorage(STORAGE_KEYS.USER, seed.user);
    setStorage(STORAGE_KEYS.CATEGORIES, seed.categories);
    setStorage(STORAGE_KEYS.TRANSACTIONS, seed.transactions);
    setStorage(STORAGE_KEYS.BUDGETS, seed.budgets);
    setStorage(STORAGE_KEYS.RECURRING, seed.recurringPayments);
    setStorage(STORAGE_KEYS.MUTUAL_FUNDS, seed.mutualFunds);
    setStorage(STORAGE_KEYS.BANK_SAVINGS, seed.bankSavings);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-welcome',
        userId: seed.user.id,
        title: 'Welcome to Personal Ledger',
        message: 'Your personal finance ledger is active. Track budgets, expenses, and savings seamlessly.',
        type: 'insight',
        date: new Date().toISOString(),
        read: false
      }
    ]);
    setStorage(STORAGE_KEYS.INITIALIZED, true);
  }
}

// Auto-initialize on load
initLocalStore();

export const localStore = {
  // Auth / Profile
  getProfile(): User {
    return getStorage<User>(STORAGE_KEYS.USER, DEFAULT_USER);
  },

  updateProfile(updates: Partial<User>): User {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    setStorage(STORAGE_KEYS.USER, updated);
    return updated;
  },

  // Categories
  getCategories(): Category[] {
    return getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  addCategory(cat: { name: string; icon?: string; color?: string; subcategories?: string[] }): Category {
    const cats = this.getCategories();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cat.name,
      icon: cat.icon || 'tag',
      color: cat.color || '#6366F1',
      subcategories: cat.subcategories || [],
      type: 'expense'
    };
    cats.push(newCat);
    setStorage(STORAGE_KEYS.CATEGORIES, cats);
    return newCat;
  },

  updateCategory(id: string, updates: Partial<Category>): Category {
    const cats = this.getCategories();
    const index = cats.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    cats[index] = { ...cats[index], ...updates };
    setStorage(STORAGE_KEYS.CATEGORIES, cats);
    return cats[index];
  },

  deleteCategory(id: string): boolean {
    let cats = this.getCategories();
    cats = cats.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CATEGORIES, cats);
    return true;
  },

  resetCategories(): Category[] {
    setStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },

  // Budgets
  getBudgets(): Budget[] {
    return getStorage<Budget[]>(STORAGE_KEYS.BUDGETS, []);
  },

  getBudget(month: string): Budget {
    const budgets = this.getBudgets();
    let budget = budgets.find((b) => b.month === month);
    if (!budget) {
      const prevBudget = budgets.length > 0 ? budgets[0] : null;
      budget = {
        id: `budget-${month}`,
        userId: this.getProfile().id,
        month,
        overallBudget: prevBudget ? prevBudget.overallBudget : 75000,
        categoryBudgets: prevBudget ? { ...prevBudget.categoryBudgets } : {},
        alertThreshold: prevBudget?.alertThreshold ?? 0.8,
        updatedAt: new Date().toISOString()
      };
      budgets.push(budget);
      setStorage(STORAGE_KEYS.BUDGETS, budgets);
    }
    return budget;
  },

  saveBudget(data: {
    month: string;
    overallBudget?: number;
    categoryBudgets?: { [catId: string]: number };
    alertThreshold?: number;
  }): Budget {
    const budgets = this.getBudgets();
    const month = data.month || new Date().toISOString().substring(0, 7);
    const index = budgets.findIndex((b) => b.month === month);

    if (index === -1) {
      const prevBudget = budgets.length > 0 ? budgets[0] : null;
      const initialCatBudgets = prevBudget ? { ...prevBudget.categoryBudgets } : {};
      const mergedCatBudgets = data.categoryBudgets !== undefined
        ? { ...initialCatBudgets, ...data.categoryBudgets }
        : initialCatBudgets;

      const newBudget: Budget = {
        id: `budget-${month}`,
        userId: this.getProfile().id,
        month,
        overallBudget: data.overallBudget !== undefined ? Number(data.overallBudget) : (prevBudget ? prevBudget.overallBudget : 75000),
        categoryBudgets: mergedCatBudgets,
        alertThreshold: data.alertThreshold !== undefined ? Number(data.alertThreshold) : (prevBudget ? prevBudget.alertThreshold : 0.8),
        updatedAt: new Date().toISOString()
      };
      budgets.push(newBudget);
      setStorage(STORAGE_KEYS.BUDGETS, budgets);
      return newBudget;
    } else {
      const existing = budgets[index];
      const mergedCatBudgets = data.categoryBudgets !== undefined
        ? { ...(existing.categoryBudgets || {}), ...data.categoryBudgets }
        : (existing.categoryBudgets || {});

      const updated: Budget = {
        ...existing,
        overallBudget: data.overallBudget !== undefined ? Number(data.overallBudget) : existing.overallBudget,
        categoryBudgets: mergedCatBudgets,
        alertThreshold: data.alertThreshold !== undefined ? Number(data.alertThreshold) : existing.alertThreshold,
        updatedAt: new Date().toISOString()
      };
      budgets[index] = updated;
      setStorage(STORAGE_KEYS.BUDGETS, budgets);
      return updated;
    }
  },

  copyPreviousBudget(targetMonth: string, sourceMonth?: string): Budget {
    const budgets = this.getBudgets();
    let srcBudget: Budget | undefined;
    if (sourceMonth) {
      srcBudget = budgets.find((b) => b.month === sourceMonth);
    }
    if (!srcBudget && budgets.length > 0) {
      srcBudget = budgets[0];
    }

    const payload = {
      month: targetMonth,
      overallBudget: srcBudget ? srcBudget.overallBudget : 75000,
      categoryBudgets: srcBudget ? { ...srcBudget.categoryBudgets } : {},
      alertThreshold: srcBudget?.alertThreshold ?? 0.8
    };

    return this.saveBudget(payload);
  },

  // Transactions
  getTransactions(params: {
    search?: string;
    categoryId?: string;
    paymentMethod?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    sortBy?: string;
  } = {}): Transaction[] {
    let list = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);

    if (params.month) {
      list = list.filter((t) => t.date.startsWith(params.month!));
    }
    if (params.categoryId) {
      list = list.filter((t) => t.categoryId === params.categoryId);
    }
    if (params.paymentMethod) {
      list = list.filter((t) => t.paymentMethod === params.paymentMethod);
    }
    if (params.type) {
      list = list.filter((t) => (t.type || 'expense') === params.type);
    }
    if (params.startDate) {
      list = list.filter((t) => t.date >= params.startDate!);
    }
    if (params.endDate) {
      list = list.filter((t) => t.date <= params.endDate!);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.categoryName && t.categoryName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  },

  addTransaction(tx: {
    type?: 'expense' | 'income';
    amount: number;
    date: string;
    categoryId: string;
    subCategory?: string;
    paymentMethod: PaymentMethod;
    merchant: string;
    notes?: string;
  }): Transaction {
    const list = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const cats = this.getCategories();
    const cat = cats.find((c) => c.id === tx.categoryId);

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: this.getProfile().id,
      type: tx.type || 'expense',
      amount: Number(tx.amount),
      date: tx.date || new Date().toISOString().substring(0, 10),
      categoryId: tx.categoryId,
      categoryName: cat ? cat.name : 'Uncategorized',
      subCategory: tx.subCategory,
      paymentMethod: tx.paymentMethod || 'UPI',
      merchant: tx.merchant || 'General Expense',
      notes: tx.notes,
      createdAt: new Date().toISOString()
    };

    list.unshift(newTx);
    setStorage(STORAGE_KEYS.TRANSACTIONS, list);
    return newTx;
  },

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction {
    const list = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const cats = this.getCategories();
    let catName = list[index].categoryName;
    if (updates.categoryId && updates.categoryId !== list[index].categoryId) {
      const cat = cats.find((c) => c.id === updates.categoryId);
      if (cat) catName = cat.name;
    }

    list[index] = {
      ...list[index],
      ...updates,
      categoryName: catName
    };
    setStorage(STORAGE_KEYS.TRANSACTIONS, list);
    return list[index];
  },

  deleteTransaction(id: string): boolean {
    let list = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    list = list.filter((t) => t.id !== id);
    setStorage(STORAGE_KEYS.TRANSACTIONS, list);
    return true;
  },

  bulkImportTransactions(items: any[]): number {
    let count = 0;
    for (const item of items) {
      if (item && item.amount) {
        this.addTransaction(item);
        count++;
      }
    }
    return count;
  },

  // Recurring
  getRecurring(): RecurringPayment[] {
    return getStorage<RecurringPayment[]>(STORAGE_KEYS.RECURRING, []);
  },

  addRecurring(data: {
    name: string;
    amount: number;
    categoryId: string;
    frequency?: string;
    dueDay?: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
    autoLogExpense?: boolean;
    totalOccurrences?: number;
    paidOccurrences?: number;
  }): RecurringPayment {
    const list = this.getRecurring();
    const cats = this.getCategories();
    const cat = cats.find((c) => c.id === data.categoryId);

    const now = new Date();
    const dueDay = data.dueDay || 1;
    const nextDueDate = new Date(now.getFullYear(), now.getMonth(), dueDay).toISOString().substring(0, 10);

    const totalNum = data.totalOccurrences ? Number(data.totalOccurrences) : undefined;
    const paidNum = Number(data.paidOccurrences) || 0;
    const isCompleted = Boolean(totalNum && totalNum > 0 && paidNum >= totalNum);

    const item: RecurringPayment = {
      id: `rec-${Date.now()}`,
      userId: this.getProfile().id,
      name: data.name,
      amount: Number(data.amount),
      categoryId: data.categoryId,
      categoryName: cat ? cat.name : 'Bills',
      frequency: (data.frequency as any) || 'monthly',
      dueDay,
      nextDueDate,
      paymentMethod: data.paymentMethod || 'UPI',
      notes: data.notes,
      isActive: !isCompleted,
      isCompleted,
      totalOccurrences: totalNum,
      paidOccurrences: paidNum,
      autoLogExpense: data.autoLogExpense ?? true,
      createdAt: new Date().toISOString()
    };

    list.push(item);
    setStorage(STORAGE_KEYS.RECURRING, list);
    return item;
  },

  updateRecurring(id: string, updates: Partial<RecurringPayment>): RecurringPayment {
    const list = this.getRecurring();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Recurring payment not found');

    const cats = this.getCategories();
    let catName = list[index].categoryName;
    if (updates.categoryId && updates.categoryId !== list[index].categoryId) {
      const cat = cats.find((c) => c.id === updates.categoryId);
      if (cat) catName = cat.name;
    }

    const existing = list[index];
    const totalNum = updates.totalOccurrences !== undefined
      ? (updates.totalOccurrences ? Number(updates.totalOccurrences) : undefined)
      : existing.totalOccurrences;
    const paidNum = updates.paidOccurrences !== undefined
      ? Number(updates.paidOccurrences)
      : (existing.paidOccurrences || 0);

    const isCompleted = updates.isCompleted !== undefined
      ? Boolean(updates.isCompleted)
      : Boolean(totalNum && totalNum > 0 && paidNum >= totalNum);

    list[index] = {
      ...existing,
      ...updates,
      categoryName: catName,
      totalOccurrences: totalNum,
      paidOccurrences: paidNum,
      isCompleted,
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : (isCompleted ? false : existing.isActive)
    };
    setStorage(STORAGE_KEYS.RECURRING, list);
    return list[index];
  },

  deleteRecurring(id: string): boolean {
    let list = this.getRecurring();
    list = list.filter((r) => r.id !== id);
    setStorage(STORAGE_KEYS.RECURRING, list);
    return true;
  },

  markRecurringPaid(id: string, createExpense = true, date?: string): { recurringPayment: RecurringPayment; transaction?: Transaction } {
    const list = this.getRecurring();
    const item = list.find((r) => r.id === id);
    if (!item) throw new Error('Recurring payment not found');

    const payDate = date || new Date().toISOString().substring(0, 10);
    item.lastPaidDate = payDate;

    // Increment occurrences
    item.paidOccurrences = (item.paidOccurrences || 0) + 1;

    // Check if limit reached
    if (item.totalOccurrences && item.totalOccurrences > 0 && item.paidOccurrences >= item.totalOccurrences) {
      item.isCompleted = true;
      item.isActive = false; // Taken out of active bills
    } else {
      // advance next due date
      const curDue = new Date(item.nextDueDate);
      curDue.setMonth(curDue.getMonth() + 1);
      item.nextDueDate = curDue.toISOString().substring(0, 10);
    }

    setStorage(STORAGE_KEYS.RECURRING, list);

    let createdTx: Transaction | undefined;
    if (createExpense) {
      const installmentNote = item.totalOccurrences
        ? ` (Installment ${item.paidOccurrences}/${item.totalOccurrences})`
        : '';

      createdTx = this.addTransaction({
        type: 'expense',
        amount: item.amount,
        date: payDate,
        categoryId: item.categoryId,
        paymentMethod: item.paymentMethod,
        merchant: item.name,
        notes: `Recurring Payment: ${item.name}${installmentNote}`
      });
    }

    return { recurringPayment: item, transaction: createdTx };
  },

  // Savings (Mutual Funds & Bank Accounts)
  getMutualFunds(): MutualFundInvestment[] {
    return getStorage<MutualFundInvestment[]>(STORAGE_KEYS.MUTUAL_FUNDS, DEFAULT_MUTUAL_FUNDS);
  },

  addMutualFund(fund: Partial<MutualFundInvestment>): MutualFundInvestment {
    const list = this.getMutualFunds();
    const invested = Number(fund.investedAmount) || 0;
    const current = Number(fund.currentValue) || invested;
    const units = Number(fund.units) || 0;
    const nav = Number(fund.nav) || (units > 0 ? current / units : 0);

    const item: MutualFundInvestment = {
      id: `mf-${Date.now()}`,
      name: fund.name || 'Mutual Fund Scheme',
      category: fund.category || 'Equity',
      investedAmount: invested,
      currentValue: current,
      sipAmount: fund.sipAmount ? Number(fund.sipAmount) : undefined,
      sipDate: fund.sipDate ? Number(fund.sipDate) : undefined,
      folioNumber: fund.folioNumber,
      units,
      nav,
      notes: fund.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(item);
    setStorage(STORAGE_KEYS.MUTUAL_FUNDS, list);
    return item;
  },

  updateMutualFund(id: string, updates: Partial<MutualFundInvestment>): MutualFundInvestment {
    const list = this.getMutualFunds();
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Fund not found');

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.MUTUAL_FUNDS, list);
    return list[index];
  },

  deleteMutualFund(id: string): boolean {
    let list = this.getMutualFunds();
    list = list.filter((m) => m.id !== id);
    setStorage(STORAGE_KEYS.MUTUAL_FUNDS, list);
    return true;
  },

  getBankAccounts(): BankSavingAccount[] {
    return getStorage<BankSavingAccount[]>(STORAGE_KEYS.BANK_SAVINGS, DEFAULT_BANK_SAVINGS);
  },

  addBankAccount(account: Partial<BankSavingAccount>): BankSavingAccount {
    const list = this.getBankAccounts();
    const item: BankSavingAccount = {
      id: `bank-${Date.now()}`,
      bankName: account.bankName || 'Bank Account',
      accountType: account.accountType || 'Savings Account',
      accountNumberLast4: account.accountNumberLast4 || '0000',
      balance: Number(account.balance) || 0,
      interestRate: account.interestRate ? Number(account.interestRate) : 3.5,
      maturityDate: account.maturityDate,
      notes: account.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(item);
    setStorage(STORAGE_KEYS.BANK_SAVINGS, list);
    return item;
  },

  updateBankAccount(id: string, updates: Partial<BankSavingAccount>): BankSavingAccount {
    const list = this.getBankAccounts();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Bank account not found');

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.BANK_SAVINGS, list);
    return list[index];
  },

  deleteBankAccount(id: string): boolean {
    let list = this.getBankAccounts();
    list = list.filter((b) => b.id !== id);
    setStorage(STORAGE_KEYS.BANK_SAVINGS, list);
    return true;
  },

  getSavingsSummary(): SavingsSummary {
    const funds = this.getMutualFunds();
    const banks = this.getBankAccounts();

    const totalMutualFundsInvested = funds.reduce((s, f) => s + (f.investedAmount || 0), 0);
    const totalMutualFundsCurrent = funds.reduce((s, f) => s + (f.currentValue || 0), 0);
    const mfReturnsAmount = totalMutualFundsCurrent - totalMutualFundsInvested;
    const mfReturnsPercentage =
      totalMutualFundsInvested > 0
        ? Number(((mfReturnsAmount / totalMutualFundsInvested) * 100).toFixed(2))
        : 0;

    const totalBankSavings = banks.reduce((s, b) => s + (b.balance || 0), 0);
    const totalLiquidBankBalance = banks
      .filter((b) => b.accountType === 'Savings Account' || b.accountType === 'Emergency Fund')
      .reduce((s, b) => s + (b.balance || 0), 0);
    const totalTermDeposits = banks
      .filter((b) => b.accountType === 'Fixed Deposit (FD)' || b.accountType === 'Recurring Deposit (RD)' || b.accountType === 'PPF')
      .reduce((s, b) => s + (b.balance || 0), 0);
    const totalEmergencyFund = banks
      .filter((b) => b.accountType === 'Emergency Fund')
      .reduce((s, b) => s + (b.balance || 0), 0);

    const totalMonthlySIP = funds.reduce((s, f) => s + (f.sipAmount || 0), 0);
    const totalMonthlyRD = banks.reduce((s, b) => s + (b.monthlyDeposit || 0), 0);

    return {
      totalSavings: totalMutualFundsCurrent + totalBankSavings,
      totalMutualFundsCurrent,
      totalMutualFundsInvested,
      mfReturnsAmount,
      mfReturnsPercentage,
      totalBankSavings,
      totalLiquidBankBalance,
      totalTermDeposits,
      totalEmergencyFund,
      totalMonthlySIP,
      totalMonthlyRD
    };
  },

  // Notifications
  getNotifications(): AppNotification[] {
    return getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const n = notifs.find((x) => x.id === id);
    if (n) {
      n.read = true;
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  // Insights and Analytics Calculation
  getInsights(month: string): {
    summary: MonthlySummary;
    insights: FinancialInsight[];
    previousMonth: { month: string; totalSpent: number };
  } {
    const currentMonth = month || new Date().toISOString().substring(0, 7);
    const budget = this.getBudget(currentMonth);
    const transactions = this.getTransactions({ month: currentMonth });
    const categories = this.getCategories();
    const recurring = this.getRecurring();

    const expenseTxs = transactions.filter((t) => (t.type || 'expense') === 'expense');
    const incomeTxs = transactions.filter((t) => t.type === 'income');

    const totalSpent = expenseTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalIncome = incomeTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalBudget = budget.overallBudget || 75000;
    const remainingBudget = Math.max(0, totalBudget - totalSpent);
    const percentageConsumed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // Daily average & projection
    const [year, m] = currentMonth.split('-').map(Number);
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === m;
    const daysInMonth = new Date(year, m, 0).getDate();
    const dayOfMonth = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

    const averageDailySpending = dayOfMonth > 0 ? Math.round(totalSpent / dayOfMonth) : 0;
    const projectedSpending = Math.round(averageDailySpending * daysInMonth);

    // Today spending
    const todayStr = new Date().toISOString().substring(0, 10);
    const todaySpending = expenseTxs
      .filter((t) => t.date === todayStr)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // Category breakdown
    const categoryBreakdown = categories
      .filter((c) => c.type !== 'income')
      .map((cat) => {
        const catTxs = expenseTxs.filter((t) => t.categoryId === cat.id);
        const spent = catTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const allocatedBudget = (budget.categoryBudgets && budget.categoryBudgets[cat.id]) || 0;
        const percentage = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
        const remaining = Math.max(0, allocatedBudget - spent);
        const status: 'healthy' | 'warning' | 'exceeded' =
          allocatedBudget > 0 && spent > allocatedBudget
            ? 'exceeded'
            : allocatedBudget > 0 && spent >= allocatedBudget * 0.8
            ? 'warning'
            : 'healthy';

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          color: cat.color,
          icon: cat.icon,
          spent,
          budget: allocatedBudget,
          remaining,
          percentage,
          status
        };
      })
      .sort((a, b) => b.spent - a.spent);

    // Highest spending category
    const highestSpendingCategory =
      categoryBreakdown.length > 0 && categoryBreakdown[0].spent > 0
        ? {
            categoryId: categoryBreakdown[0].categoryId,
            name: categoryBreakdown[0].categoryName,
            amount: categoryBreakdown[0].spent,
            percentage: categoryBreakdown[0].percentage
          }
        : null;

    // Day-wise spending
    const dayWiseMap: { [day: number]: { day: number; amount: number; count: number; date: string } } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`;
      dayWiseMap[d] = { day: d, date: dateStr, amount: 0, count: 0 };
    }
    for (const t of expenseTxs) {
      const d = parseInt(t.date.substring(8, 10), 10);
      if (dayWiseMap[d]) {
        dayWiseMap[d].amount += Number(t.amount);
        dayWiseMap[d].count += 1;
      }
    }
    const dayWiseSpending = Object.values(dayWiseMap);

    // Highest spending day
    let highestSpendingDay: { date: string; amount: number } | null = null;
    for (const item of dayWiseSpending) {
      if (item.amount > 0 && (!highestSpendingDay || item.amount > highestSpendingDay.amount)) {
        highestSpendingDay = { date: item.date, amount: item.amount };
      }
    }

    const fixedExpenses = recurring
      .filter((r) => r.isActive)
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const variableExpenses = Math.max(0, totalSpent - fixedExpenses);

    const summary: MonthlySummary = {
      month: currentMonth,
      totalSpent,
      totalIncome,
      netBalance: totalIncome - totalSpent,
      totalBudget,
      remainingBudget,
      percentageConsumed,
      todaySpending,
      transactionCount: expenseTxs.length,
      projectedSpending,
      averageDailySpending,
      highestSpendingDay,
      highestSpendingCategory,
      categoryBreakdown,
      fixedExpenses,
      variableExpenses,
      dayWiseSpending
    };

    // Previous month comparison
    const prevDate = new Date(year, m - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevTxs = this.getTransactions({ month: prevMonthStr }).filter((t) => (t.type || 'expense') === 'expense');
    const prevTotalSpent = prevTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const insights: FinancialInsight[] = [];
    if (totalSpent > totalBudget) {
      insights.push({
        id: 'ins-overbudget',
        type: 'warning',
        title: 'Budget Limit Exceeded',
        description: `You have crossed your total monthly budget of ₹${totalBudget.toLocaleString()} by ₹${(totalSpent - totalBudget).toLocaleString()}.`,
        icon: 'AlertTriangle',
        stat: `₹${totalSpent.toLocaleString()}`
      });
    } else if (percentageConsumed >= 80) {
      insights.push({
        id: 'ins-near-limit',
        type: 'warning',
        title: 'Approaching Budget Limit',
        description: `You have utilized ${percentageConsumed}% of your allocated monthly spending capacity.`,
        icon: 'Sliders',
        stat: `${percentageConsumed}%`
      });
    } else {
      insights.push({
        id: 'ins-budget-health',
        type: 'positive',
        title: 'Budget on Track',
        description: `You have consumed ${percentageConsumed}% of your monthly allowance with ₹${remainingBudget.toLocaleString()} remaining.`,
        icon: 'CheckCircle2',
        stat: `₹${remainingBudget.toLocaleString()}`
      });
    }

    return {
      summary,
      insights,
      previousMonth: {
        month: prevMonthStr,
        totalSpent: prevTotalSpent
      }
    };
  },

  // Reset all data
  resetDatabase(): boolean {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    initLocalStore();
    return true;
  }
};
