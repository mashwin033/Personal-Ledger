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
import { localStore } from './localStore';

const API_BASE = '/api';

async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  fallbackFn?: () => T
): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (fallbackFn) return fallbackFn();
      throw new Error(`HTTP Error ${res.status}`);
    }
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (fallbackFn) return fallbackFn();
      throw new Error('Response is not JSON');
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    if (fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

export const apiService = {
  // Auth
  async getProfile(): Promise<User> {
    return safeFetch<User>(`${API_BASE}/auth/me`, undefined, () => localStore.getProfile());
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          localStore.updateProfile(json.user);
          return json.user;
        }
      }
    } catch (e) {
      // ignore
    }
    return localStore.updateProfile(updates);
  },

  async login(email: string): Promise<User> {
    return this.updateProfile({ email });
  },

  async demoLogin(): Promise<User> {
    return localStore.getProfile();
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

    return safeFetch<Transaction[]>(
      `${API_BASE}/transactions?${query.toString()}`,
      undefined,
      () => localStore.getTransactions(params)
    );
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
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          localStore.addTransaction(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // fallback
    }
    return localStore.addTransaction(tx);
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          localStore.updateTransaction(id, json.data);
          return json.data;
        }
      }
    } catch (e) {
      // fallback
    }
    return localStore.updateTransaction(id, updates);
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        localStore.deleteTransaction(id);
        return true;
      }
    } catch (e) {
      // fallback
    }
    return localStore.deleteTransaction(id);
  },

  async bulkImportTransactions(items: any[]): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/transactions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        const json = await res.json();
        localStore.bulkImportTransactions(items);
        return json.count || items.length;
      }
    } catch (e) {
      // fallback
    }
    return localStore.bulkImportTransactions(items);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return safeFetch<Category[]>(`${API_BASE}/categories`, undefined, () => localStore.getCategories());
  },

  async addCategory(cat: { name: string; icon?: string; color?: string; subcategories?: string[] }): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // fallback
    }
    return localStore.addCategory(cat);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.updateCategory(id, updates);
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      // fallback
    }
    return localStore.deleteCategory(id);
  },

  async resetCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories/reset`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.resetCategories();
  },

  // Budgets
  async getBudget(month: string): Promise<Budget> {
    return safeFetch<Budget>(
      `${API_BASE}/budgets?month=${encodeURIComponent(month)}`,
      undefined,
      () => localStore.getBudget(month)
    );
  },

  async saveBudget(data: {
    month: string;
    overallBudget?: number;
    categoryBudgets?: { [catId: string]: number };
    alertThreshold?: number;
  }): Promise<Budget> {
    try {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          localStore.saveBudget(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API saveBudget fallback to local storage:', err);
    }
    return localStore.saveBudget(data);
  },

  async copyPreviousBudget(targetMonth: string, sourceMonth?: string): Promise<Budget> {
    try {
      const res = await fetch(`${API_BASE}/budgets/copy-previous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMonth, sourceMonth })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          localStore.saveBudget(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // fallback
    }
    return localStore.copyPreviousBudget(targetMonth, sourceMonth);
  },

  // Recurring
  async getRecurring(): Promise<RecurringPayment[]> {
    return safeFetch<RecurringPayment[]>(`${API_BASE}/recurring`, undefined, () => localStore.getRecurring());
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
    try {
      const res = await fetch(`${API_BASE}/recurring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.addRecurring(data);
  },

  async updateRecurring(id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> {
    try {
      const res = await fetch(`${API_BASE}/recurring/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.updateRecurring(id, updates);
  },

  async deleteRecurring(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/recurring/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      // fallback
    }
    return localStore.deleteRecurring(id);
  },

  async markRecurringPaid(id: string, createExpense = true, date?: string): Promise<{ recurringPayment: RecurringPayment; transaction?: Transaction }> {
    try {
      const res = await fetch(`${API_BASE}/recurring/${id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createExpense, date })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.recurringPayment) return json;
      }
    } catch (e) {
      // fallback
    }
    return localStore.markRecurringPaid(id, createExpense, date);
  },

  // Monthly Insights & Summary
  async getInsights(month: string): Promise<{
    summary: MonthlySummary;
    insights: FinancialInsight[];
    previousMonth: { month: string; totalSpent: number };
  }> {
    return safeFetch<{
      summary: MonthlySummary;
      insights: FinancialInsight[];
      previousMonth: { month: string; totalSpent: number };
    }>(
      `${API_BASE}/insights?month=${encodeURIComponent(month)}`,
      undefined,
      () => localStore.getInsights(month)
    );
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
    try {
      const res = await fetch(`${API_BASE}/ai/parse-expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) return json;
      }
    } catch (e) {
      // fallback regex heuristic parser
    }

    // Heuristic client fallback
    const numMatch = text.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d{1,2})?)/i);
    const amount = numMatch ? parseFloat(numMatch[1]) : 0;

    let paymentMethod: PaymentMethod = 'UPI';
    if (/card|credit/i.test(text)) paymentMethod = 'Credit Card';
    else if (/debit/i.test(text)) paymentMethod = 'Debit Card';
    else if (/cash/i.test(text)) paymentMethod = 'Cash';
    else if (/net\s*banking|transfer/i.test(text)) paymentMethod = 'NetBanking';

    let categoryId = 'cat-other';
    let merchant = 'Expense';

    if (/swiggy|zomato|dinner|lunch|food|tea|coffee|restaurant|hotel|snack/i.test(text)) {
      categoryId = 'cat-food';
      merchant = text.includes('swiggy') ? 'Swiggy' : text.includes('zomato') ? 'Zomato' : 'Food & Dining';
    } else if (/blinkit|zepto|instamart|grocery|supermarket|vegetable|milk/i.test(text)) {
      categoryId = 'cat-groceries';
      merchant = text.includes('blinkit') ? 'Blinkit' : text.includes('zepto') ? 'Zepto' : 'Groceries';
    } else if (/uber|ola|rapido|auto|cab|metro|petrol|fuel|diesel/i.test(text)) {
      categoryId = /petrol|fuel|diesel/i.test(text) ? 'cat-fuel' : 'cat-transport';
      merchant = text.includes('uber') ? 'Uber' : text.includes('ola') ? 'Ola' : 'Transport';
    } else if (/amazon|flipkart|myntra|clothes|shopping/i.test(text)) {
      categoryId = 'cat-shopping';
      merchant = text.includes('amazon') ? 'Amazon' : text.includes('flipkart') ? 'Flipkart' : 'Shopping';
    } else if (/airtel|jio|wifi|bescom|electricity|water|recharge/i.test(text)) {
      categoryId = 'cat-bills';
      merchant = 'Bill Payment';
    }

    return {
      data: {
        amount,
        merchant,
        categoryId,
        paymentMethod,
        date: new Date().toISOString().substring(0, 10),
        notes: text
      },
      parsedBy: 'Smart Heuristic Engine'
    };
  },

  // Savings Portfolio (Mutual Funds & Bank Accounts)
  async getSavingsSummary(): Promise<SavingsSummary> {
    return safeFetch<SavingsSummary>(`${API_BASE}/savings/summary`, undefined, () => localStore.getSavingsSummary());
  },

  async getMutualFunds(): Promise<MutualFundInvestment[]> {
    return safeFetch<MutualFundInvestment[]>(`${API_BASE}/savings/mutual-funds`, undefined, () => localStore.getMutualFunds());
  },

  async addMutualFund(fund: Partial<MutualFundInvestment>): Promise<MutualFundInvestment> {
    try {
      const res = await fetch(`${API_BASE}/savings/mutual-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fund)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.addMutualFund(fund);
  },

  async updateMutualFund(id: string, updates: Partial<MutualFundInvestment>): Promise<MutualFundInvestment> {
    try {
      const res = await fetch(`${API_BASE}/savings/mutual-funds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.updateMutualFund(id, updates);
  },

  async deleteMutualFund(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/savings/mutual-funds/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      // fallback
    }
    return localStore.deleteMutualFund(id);
  },

  async getBankAccounts(): Promise<BankSavingAccount[]> {
    return safeFetch<BankSavingAccount[]>(`${API_BASE}/savings/bank-accounts`, undefined, () => localStore.getBankAccounts());
  },

  async addBankAccount(account: Partial<BankSavingAccount>): Promise<BankSavingAccount> {
    try {
      const res = await fetch(`${API_BASE}/savings/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.addBankAccount(account);
  },

  async updateBankAccount(id: string, updates: Partial<BankSavingAccount>): Promise<BankSavingAccount> {
    try {
      const res = await fetch(`${API_BASE}/savings/bank-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return localStore.updateBankAccount(id, updates);
  },

  async deleteBankAccount(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/savings/bank-accounts/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      // fallback
    }
    return localStore.deleteBankAccount(id);
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return safeFetch<AppNotification[]>(`${API_BASE}/notifications`, undefined, () => localStore.getNotifications());
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      // fallback
    }
    localStore.markNotificationRead(id);
  },

  // Database Reset
  async resetDatabase(): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/database/reset`, { method: 'POST' });
    } catch (e) {
      // fallback
    }
    return localStore.resetDatabase();
  }
};
