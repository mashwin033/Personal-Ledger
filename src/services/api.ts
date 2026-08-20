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

const API_BASE = '/api';

export const apiService = {
  // Auth
  async getProfile(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`);
    const json = await res.json();
    return json.user;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    return json.user;
  },

  async login(email: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json();
    return json.user;
  },

  async demoLogin(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/demo`, { method: 'POST' });
    const json = await res.json();
    return json.user;
  },

  // Transactions
  async getTransactions(params: {
    search?: string;
    categoryId?: string;
    paymentMethod?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    sortBy?: string;
  } = {}): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    if (params.month) query.append('month', params.month);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.type) query.append('type', params.type);
    if (params.sortBy) query.append('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async addTransaction(tx: {
    type?: 'expense' | 'income';
    amount: number;
    date: string;
    categoryId: string;
    subCategory?: string;
    paymentMethod: PaymentMethod;
    merchant: string;
    notes?: string;
  }): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add transaction');
    return json.data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update transaction');
    return json.data;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  async bulkImportTransactions(items: any[]): Promise<number> {
    const res = await fetch(`${API_BASE}/transactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const json = await res.json();
    return json.count;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    return json.data || [];
  },

  async addCategory(cat: { name: string; icon?: string; color?: string; subcategories?: string[] }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add category');
    return json.data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    return json.data;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete category');
    return json.success;
  },

  async resetCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/reset`, { method: 'POST' });
    const json = await res.json();
    return json.data;
  },

  // Budgets
  async getBudget(month: string): Promise<Budget> {
    const res = await fetch(`${API_BASE}/budgets?month=${encodeURIComponent(month)}`);
    const json = await res.json();
    return json.data;
  },

  async saveBudget(data: {
    month: string;
    overallBudget?: number;
    categoryBudgets?: { [catId: string]: number };
    alertThreshold?: number;
  }): Promise<Budget> {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  },

  async copyPreviousBudget(targetMonth: string, sourceMonth?: string): Promise<Budget> {
    const res = await fetch(`${API_BASE}/budgets/copy-previous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMonth, sourceMonth })
    });
    const json = await res.json();
    return json.data;
  },

  // Recurring
  async getRecurring(): Promise<RecurringPayment[]> {
    const res = await fetch(`${API_BASE}/recurring`);
    const json = await res.json();
    return json.data || [];
  },

  async addRecurring(data: {
    name: string;
    amount: number;
    categoryId: string;
    frequency?: string;
    dueDay?: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
    autoLogExpense?: boolean;
  }): Promise<RecurringPayment> {
    const res = await fetch(`${API_BASE}/recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add recurring bill');
    return json.data;
  },

  async updateRecurring(id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> {
    const res = await fetch(`${API_BASE}/recurring/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    return json.data;
  },

  async deleteRecurring(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/recurring/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  async markRecurringPaid(id: string, createExpense = true, date?: string): Promise<{ recurringPayment: RecurringPayment; transaction?: Transaction }> {
    const res = await fetch(`${API_BASE}/recurring/${id}/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createExpense, date })
    });
    const json = await res.json();
    return json;
  },

  // Monthly Insights & Summary
  async getInsights(month: string): Promise<{
    summary: MonthlySummary;
    insights: FinancialInsight[];
    previousMonth: { month: string; totalSpent: number };
  }> {
    const res = await fetch(`${API_BASE}/insights?month=${encodeURIComponent(month)}`);
    const json = await res.json();
    return json;
  },

  // Smart AI Expense Parser
  async parseNaturalExpense(text: string): Promise<{
    data: {
      amount: number;
      merchant: string;
      categoryId: string;
      categoryName?: string;
      subCategory?: string;
      paymentMethod: PaymentMethod;
      notes?: string;
      date?: string;
    };
    parsedBy: string;
  }> {
    const res = await fetch(`${API_BASE}/ai/parse-expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const json = await res.json();
    return json;
  },

  // Savings Portfolio (Mutual Funds & Bank Accounts)
  async getSavingsSummary(): Promise<SavingsSummary> {
    const res = await fetch(`${API_BASE}/savings/summary`);
    const json = await res.json();
    return json.data;
  },

  async getMutualFunds(): Promise<MutualFundInvestment[]> {
    const res = await fetch(`${API_BASE}/savings/mutual-funds`);
    const json = await res.json();
    return json.data || [];
  },

  async addMutualFund(fund: Partial<MutualFundInvestment>): Promise<MutualFundInvestment> {
    const res = await fetch(`${API_BASE}/savings/mutual-funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fund)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add mutual fund');
    return json.data;
  },

  async updateMutualFund(id: string, updates: Partial<MutualFundInvestment>): Promise<MutualFundInvestment> {
    const res = await fetch(`${API_BASE}/savings/mutual-funds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update mutual fund');
    return json.data;
  },

  async deleteMutualFund(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/savings/mutual-funds/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  async getBankAccounts(): Promise<BankSavingAccount[]> {
    const res = await fetch(`${API_BASE}/savings/bank-accounts`);
    const json = await res.json();
    return json.data || [];
  },

  async addBankAccount(account: Partial<BankSavingAccount>): Promise<BankSavingAccount> {
    const res = await fetch(`${API_BASE}/savings/bank-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add bank account');
    return json.data;
  },

  async updateBankAccount(id: string, updates: Partial<BankSavingAccount>): Promise<BankSavingAccount> {
    const res = await fetch(`${API_BASE}/savings/bank-accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update bank account');
    return json.data;
  },

  async deleteBankAccount(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/savings/bank-accounts/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    const json = await res.json();
    return json.data || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  },

  // Database Reset
  async resetDatabase(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/database/reset`, { method: 'POST' });
    const json = await res.json();
    return json.success;
  }
};
