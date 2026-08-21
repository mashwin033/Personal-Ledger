export type TransactionType = 'expense' | 'income';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'NetBanking'
  | 'Wallet'
  | 'Other';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault?: boolean;
  subcategories?: string[];
  type?: 'expense' | 'income';
}

export interface Transaction {
  id: string;
  userId: string;
  type?: 'expense' | 'income'; // 'expense' (debit/ചിലവ്) or 'income' (credit/വരവ്)
  amount: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  paymentMethod: PaymentMethod;
  merchant: string;
  notes?: string;
  isRecurringInstance?: boolean;
  recurringPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  overallBudget: number;
  categoryBudgets: { [categoryId: string]: number }; // categoryId -> allocated amount
  alertThreshold: number; // default 80% (0.8)
  updatedAt: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringPayment {
  id: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  frequency: RecurringFrequency;
  dueDay: number; // Day of month (1-31) or weekday
  nextDueDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isActive: boolean;
  autoLogExpense?: boolean;
  lastPaidDate?: string;
  totalOccurrences?: number; // Total number of payments / installments (e.g., 12 for 1-year loan), undefined/null for ongoing
  paidOccurrences?: number; // Number of payments completed so far
  isCompleted?: boolean; // True when paidOccurrences >= totalOccurrences
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'daily_reminder' | 'budget_warning' | 'budget_exceeded' | 'bill_due' | 'insight';
  date: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string; // e.g. '₹', '$', '€', '£'
  currencyCode: string; // e.g. 'INR', 'USD'
  theme: 'light' | 'dark' | 'system';
  reminderTime: string; // '21:00' default
  reminderEnabled: boolean;
  biometricLockEnabled: boolean;
  pinCode?: string;
  createdAt: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalSpent: number;
  totalIncome?: number;
  netBalance?: number;
  totalBudget: number;
  remainingBudget: number;
  percentageConsumed: number;
  todaySpending: number;
  transactionCount: number;
  projectedSpending: number;
  averageDailySpending: number;
  highestSpendingDay: { date: string; amount: number } | null;
  highestSpendingCategory: { categoryId: string; name: string; amount: number; percentage: number } | null;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    icon: string;
    color: string;
    spent: number;
    budget: number;
    remaining: number;
    percentage: number;
    status: 'healthy' | 'warning' | 'exceeded';
  }>;
  fixedExpenses: number; // Recurring
  variableExpenses: number; // Non-recurring
  dayWiseSpending: Array<{ date: string; day: number; amount: number; count: number }>;
}

export type MutualFundCategory =
  | 'Equity'
  | 'Debt'
  | 'Hybrid'
  | 'ELSS (Tax Saver)'
  | 'Index Fund'
  | 'Commodity/Gold'
  | 'Other';

export interface MutualFundInvestment {
  id: string;
  userId?: string;
  name: string;
  category: MutualFundCategory;
  investedAmount: number;
  currentValue: number;
  sipAmount?: number;
  sipDate?: number;
  folioNumber?: string;
  units?: number;
  nav?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BankAccountType =
  | 'Savings Account'
  | 'Fixed Deposit (FD)'
  | 'Recurring Deposit (RD)'
  | 'Emergency Fund'
  | 'PPF'
  | 'Other';

export interface BankSavingAccount {
  id: string;
  userId?: string;
  bankName: string;
  accountType: BankAccountType;
  accountNumberLast4?: string;
  balance: number;
  interestRate?: number;
  maturityDate?: string;
  monthlyDeposit?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsSummary {
  totalSavings: number;
  totalMutualFundsCurrent: number;
  totalMutualFundsInvested: number;
  mfReturnsAmount: number;
  mfReturnsPercentage: number;
  totalBankSavings: number;
  totalLiquidBankBalance: number;
  totalTermDeposits: number;
  totalEmergencyFund: number;
  totalMonthlySIP: number;
  totalMonthlyRD: number;
  savingsGoal?: number;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral' | 'suggestion';
  icon: string;
  stat?: string;
}
