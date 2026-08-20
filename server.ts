import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { generateSeedData, DEFAULT_CATEGORIES, DEFAULT_USER, DEFAULT_MUTUAL_FUNDS, DEFAULT_BANK_SAVINGS } from './src/data/defaultData';
import { Transaction, Budget, Category, RecurringPayment, User, AppNotification, MonthlySummary, FinancialInsight, MutualFundInvestment, BankSavingAccount, SavingsSummary } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize data storage directory and file
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  recurringPayments: RecurringPayment[];
  notifications: AppNotification[];
  mutualFunds: MutualFundInvestment[];
  bankSavings: BankSavingAccount[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.transactions && parsed.categories && parsed.budgets) {
        // Ensure default income categories exist
        DEFAULT_CATEGORIES.forEach((defCat) => {
          if (!parsed.categories.some((c: Category) => c.id === defCat.id)) {
            parsed.categories.push(defCat);
          }
        });
        if (!parsed.mutualFunds || parsed.mutualFunds.length === 0) {
          parsed.mutualFunds = DEFAULT_MUTUAL_FUNDS;
        }
        if (!parsed.bankSavings || parsed.bankSavings.length === 0) {
          parsed.bankSavings = DEFAULT_BANK_SAVINGS;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database file, resetting to defaults:', err);
  }

  // Initialize with realistic seed data
  const seed = generateSeedData();
  const initialDb: DatabaseSchema = {
    users: [seed.user],
    transactions: seed.transactions,
    budgets: seed.budgets,
    categories: seed.categories,
    recurringPayments: seed.recurringPayments,
    mutualFunds: seed.mutualFunds || DEFAULT_MUTUAL_FUNDS,
    bankSavings: seed.bankSavings || DEFAULT_BANK_SAVINGS,
    notifications: [
      {
        id: 'notif-welcome',
        userId: seed.user.id,
        title: 'കുടുക്കയിലേക്ക് സ്വാഗതം!',
        message: 'നിങ്ങളുടെ വരവ് ചിലവ് കണക്കുകൾ കൃത്യമായി രേഖപ്പെടുത്താനും സൂക്ഷിക്കാനും കുടുക്ക തയ്യാറാണ്.',
        type: 'insight',
        date: new Date().toISOString(),
        read: false
      },
      {
        id: 'notif-daily-reminder',
        userId: seed.user.id,
        title: 'ദിവസേനയുള്ള ഓർമ്മപ്പെടുത്തൽ (9:00 PM)',
        message: "ഇന്നത്തെ ചിലവുകളും വരവുകളും ചേർക്കാൻ മറക്കരുത്.",
        type: 'daily_reminder',
        date: new Date().toISOString(),
        read: false
      }
    ]
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// Helper for Gemini AI client (lazy initialization)
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Auth Routes ---
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || db.users[0];
  res.json({ success: true, user });
});

app.post('/api/auth/demo', (req, res) => {
  const user = db.users[0] || DEFAULT_USER;
  res.json({ success: true, user });
});

app.get('/api/auth/me', (req, res) => {
  const user = db.users[0] || DEFAULT_USER;
  res.json({ success: true, user });
});

app.put('/api/auth/profile', (req, res) => {
  const updates = req.body;
  if (!db.users[0]) {
    db.users[0] = { ...DEFAULT_USER, ...updates };
  } else {
    db.users[0] = { ...db.users[0], ...updates };
  }
  saveDatabase(db);
  res.json({ success: true, user: db.users[0] });
});

// --- Transactions Routes ---
app.get('/api/transactions', (req, res) => {
  const { search, categoryId, paymentMethod, month, startDate, endDate, type, sortBy = 'date_desc' } = req.query;
  let list = [...db.transactions];

  if (type && type !== 'all') {
    if (type === 'income') {
      list = list.filter((t) => t.type === 'income');
    } else if (type === 'expense') {
      list = list.filter((t) => t.type !== 'income');
    }
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (t) =>
        t.merchant.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.categoryName.toLowerCase().includes(q) ||
        (t.subCategory && t.subCategory.toLowerCase().includes(q))
    );
  }

  if (categoryId && categoryId !== 'all') {
    list = list.filter((t) => t.categoryId === categoryId);
  }

  if (paymentMethod && paymentMethod !== 'all') {
    list = list.filter((t) => t.paymentMethod === paymentMethod);
  }

  if (month) {
    list = list.filter((t) => t.date.startsWith(String(month)));
  }

  if (startDate) {
    list = list.filter((t) => t.date >= String(startDate));
  }

  if (endDate) {
    list = list.filter((t) => t.date <= String(endDate));
  }

  // Sorting
  list.sort((a, b) => {
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
    // default date_desc
    return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
  });

  res.json({ success: true, data: list, count: list.length });
});

app.post('/api/transactions', (req, res) => {
  const { amount, date, categoryId, subCategory, paymentMethod, merchant, notes, type = 'expense' } = req.body;
  if (!amount || !categoryId || !merchant) {
    return res.status(400).json({ error: 'Amount, category, and merchant/description are required' });
  }

  const category = db.categories.find((c) => c.id === categoryId);
  const newTx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: db.users[0]?.id || 'user-demo-01',
    type: type === 'income' ? 'income' : 'expense',
    amount: Number(amount),
    date: date || new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    categoryId,
    categoryName: category ? category.name : 'Other',
    subCategory: subCategory || undefined,
    paymentMethod: paymentMethod || 'UPI',
    merchant: String(merchant).trim(),
    notes: notes ? String(notes).trim() : undefined,
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  saveDatabase(db);
  res.status(201).json({ success: true, data: newTx });
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const index = db.transactions.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const updates = req.body;
  if (updates.categoryId) {
    const cat = db.categories.find((c) => c.id === updates.categoryId);
    if (cat) updates.categoryName = cat.name;
  }

  db.transactions[index] = {
    ...db.transactions[index],
    ...updates,
    amount: updates.amount ? Number(updates.amount) : db.transactions[index].amount,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({ success: true, data: db.transactions[index] });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = db.transactions.length;
  db.transactions = db.transactions.filter((t) => t.id !== id);
  if (db.transactions.length === initialLength) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  saveDatabase(db);
  res.json({ success: true, message: 'Transaction deleted successfully' });
});

// Bulk import
app.post('/api/transactions/bulk', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const newItems: Transaction[] = items.map((item) => {
    const cat = db.categories.find((c) => c.id === item.categoryId || c.name.toLowerCase() === (item.categoryName || '').toLowerCase());
    return {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: db.users[0]?.id || 'user-demo-01',
      amount: Number(item.amount),
      date: item.date || new Date().toISOString().split('T')[0],
      categoryId: cat ? cat.id : 'cat-other',
      categoryName: cat ? cat.name : (item.categoryName || 'Other'),
      subCategory: item.subCategory,
      paymentMethod: item.paymentMethod || 'UPI',
      merchant: item.merchant || 'Imported Expense',
      notes: item.notes,
      createdAt: new Date().toISOString()
    };
  });

  db.transactions = [...newItems, ...db.transactions];
  saveDatabase(db);
  res.json({ success: true, count: newItems.length });
});

// --- Categories Routes ---
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: db.categories });
});

app.post('/api/categories', (req, res) => {
  const { name, icon, color, subcategories } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    icon: icon || 'Tag',
    color: color || '#6366F1',
    isDefault: false,
    subcategories: subcategories || []
  };

  db.categories.push(newCat);
  saveDatabase(db);
  res.status(201).json({ success: true, data: newCat });
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  db.categories[idx] = { ...db.categories[idx], ...req.body };
  // Also update transaction categoryNames if name changed
  if (req.body.name) {
    db.transactions.forEach((t) => {
      if (t.categoryId === id) {
        t.categoryName = req.body.name;
      }
    });
  }

  saveDatabase(db);
  res.json({ success: true, data: db.categories[idx] });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  if (db.categories.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the last remaining category' });
  }
  db.categories = db.categories.filter((c) => c.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Category removed' });
});

app.post('/api/categories/reset', (req, res) => {
  db.categories = [...DEFAULT_CATEGORIES];
  saveDatabase(db);
  res.json({ success: true, data: db.categories });
});

// --- Budgets Routes ---
app.get('/api/budgets', (req, res) => {
  const { month } = req.query;
  const currentMonth = month ? String(month) : new Date().toISOString().substring(0, 7);

  let budget = db.budgets.find((b) => b.month === currentMonth);
  if (!budget) {
    // Look for previous month to inherit or fallback default
    const prevMonth = db.budgets[0];
    budget = {
      id: `budget-${currentMonth}`,
      userId: db.users[0]?.id || 'user-demo-01',
      month: currentMonth,
      overallBudget: prevMonth ? prevMonth.overallBudget : 75000,
      categoryBudgets: prevMonth ? { ...prevMonth.categoryBudgets } : {},
      alertThreshold: 0.8,
      updatedAt: new Date().toISOString()
    };
    db.budgets.push(budget);
    saveDatabase(db);
  }

  res.json({ success: true, data: budget });
});

app.post('/api/budgets', (req, res) => {
  const { month, overallBudget, categoryBudgets, alertThreshold } = req.body;
  if (!month) {
    return res.status(400).json({ error: 'Month (YYYY-MM) is required' });
  }

  let index = db.budgets.findIndex((b) => b.month === month);
  if (index === -1) {
    const newBudget: Budget = {
      id: `budget-${month}`,
      userId: db.users[0]?.id || 'user-demo-01',
      month,
      overallBudget: Number(overallBudget) || 0,
      categoryBudgets: categoryBudgets || {},
      alertThreshold: alertThreshold !== undefined ? Number(alertThreshold) : 0.8,
      updatedAt: new Date().toISOString()
    };
    db.budgets.push(newBudget);
    index = db.budgets.length - 1;
  } else {
    db.budgets[index] = {
      ...db.budgets[index],
      overallBudget: overallBudget !== undefined ? Number(overallBudget) : db.budgets[index].overallBudget,
      categoryBudgets: categoryBudgets !== undefined ? categoryBudgets : db.budgets[index].categoryBudgets,
      alertThreshold: alertThreshold !== undefined ? Number(alertThreshold) : db.budgets[index].alertThreshold,
      updatedAt: new Date().toISOString()
    };
  }

  saveDatabase(db);
  res.json({ success: true, data: db.budgets[index] });
});

app.post('/api/budgets/copy-previous', (req, res) => {
  const { targetMonth, sourceMonth } = req.body;
  if (!targetMonth) {
    return res.status(400).json({ error: 'Target month is required' });
  }

  const source = sourceMonth ? db.budgets.find((b) => b.month === sourceMonth) : db.budgets[0];
  if (!source) {
    return res.status(404).json({ error: 'Source budget not found' });
  }

  let index = db.budgets.findIndex((b) => b.month === targetMonth);
  const updated: Budget = {
    id: `budget-${targetMonth}`,
    userId: db.users[0]?.id || 'user-demo-01',
    month: targetMonth,
    overallBudget: source.overallBudget,
    categoryBudgets: { ...source.categoryBudgets },
    alertThreshold: source.alertThreshold,
    updatedAt: new Date().toISOString()
  };

  if (index === -1) {
    db.budgets.push(updated);
  } else {
    db.budgets[index] = updated;
  }

  saveDatabase(db);
  res.json({ success: true, data: updated });
});

// --- Recurring Payments Routes ---
app.get('/api/recurring', (req, res) => {
  res.json({ success: true, data: db.recurringPayments });
});

app.post('/api/recurring', (req, res) => {
  const { name, amount, categoryId, frequency = 'monthly', dueDay = 1, paymentMethod = 'UPI', notes, autoLogExpense = false } = req.body;
  if (!name || !amount || !categoryId) {
    return res.status(400).json({ error: 'Name, amount, and category are required' });
  }

  const cat = db.categories.find((c) => c.id === categoryId);
  const now = new Date();
  const nextDueDate = new Date(now.getFullYear(), now.getMonth(), Number(dueDay)).toISOString().split('T')[0];

  const newRec: RecurringPayment = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: db.users[0]?.id || 'user-demo-01',
    name: name.trim(),
    amount: Number(amount),
    categoryId,
    categoryName: cat ? cat.name : 'Other',
    frequency,
    dueDay: Number(dueDay),
    nextDueDate,
    paymentMethod,
    notes,
    isActive: true,
    autoLogExpense: Boolean(autoLogExpense),
    createdAt: new Date().toISOString()
  };

  db.recurringPayments.push(newRec);
  saveDatabase(db);
  res.status(201).json({ success: true, data: newRec });
});

app.put('/api/recurring/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.recurringPayments.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Recurring payment not found' });
  }

  const updates = req.body;
  if (updates.categoryId) {
    const cat = db.categories.find((c) => c.id === updates.categoryId);
    if (cat) updates.categoryName = cat.name;
  }

  db.recurringPayments[idx] = {
    ...db.recurringPayments[idx],
    ...updates,
    amount: updates.amount ? Number(updates.amount) : db.recurringPayments[idx].amount
  };

  saveDatabase(db);
  res.json({ success: true, data: db.recurringPayments[idx] });
});

app.delete('/api/recurring/:id', (req, res) => {
  const { id } = req.params;
  db.recurringPayments = db.recurringPayments.filter((r) => r.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Recurring payment deleted' });
});

// Mark recurring payment as paid & optionally create expense
app.post('/api/recurring/:id/mark-paid', (req, res) => {
  const { id } = req.params;
  const { createExpense = true, date } = req.body;
  const rec = db.recurringPayments.find((r) => r.id === id);
  if (!rec) {
    return res.status(404).json({ error: 'Recurring payment not found' });
  }

  const paymentDate = date || new Date().toISOString().split('T')[0];
  rec.lastPaidDate = paymentDate;

  let createdTx: Transaction | null = null;
  if (createExpense) {
    createdTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: rec.userId,
      amount: rec.amount,
      date: paymentDate,
      time: '12:00',
      categoryId: rec.categoryId,
      categoryName: rec.categoryName,
      subCategory: 'Recurring Bill',
      paymentMethod: rec.paymentMethod,
      merchant: rec.name,
      notes: `Recurring ${rec.frequency} payment (${rec.notes || ''})`.trim(),
      isRecurringInstance: true,
      recurringPaymentId: rec.id,
      createdAt: new Date().toISOString()
    };
    db.transactions.unshift(createdTx);
  }

  saveDatabase(db);
  res.json({ success: true, recurringPayment: rec, transaction: createdTx });
});

// --- Savings Portfolio Routes (Mutual Funds & Bank Accounts) ---

app.get('/api/savings/summary', (req, res) => {
  const mutualFunds = db.mutualFunds || [];
  const bankSavings = db.bankSavings || [];

  const totalMutualFundsCurrent = mutualFunds.reduce((sum, f) => sum + (Number(f.currentValue) || 0), 0);
  const totalMutualFundsInvested = mutualFunds.reduce((sum, f) => sum + (Number(f.investedAmount) || 0), 0);
  const mfReturnsAmount = totalMutualFundsCurrent - totalMutualFundsInvested;
  const mfReturnsPercentage = totalMutualFundsInvested > 0 ? (mfReturnsAmount / totalMutualFundsInvested) * 100 : 0;

  const totalBankSavings = bankSavings.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  const totalLiquidBankBalance = bankSavings
    .filter((b) => b.accountType === 'Savings Account')
    .reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  const totalTermDeposits = bankSavings
    .filter((b) => b.accountType === 'Fixed Deposit (FD)' || b.accountType === 'Recurring Deposit (RD)' || b.accountType === 'PPF')
    .reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  const totalEmergencyFund = bankSavings
    .filter((b) => b.accountType === 'Emergency Fund')
    .reduce((sum, b) => sum + (Number(b.balance) || 0), 0);

  const totalMonthlySIP = mutualFunds.reduce((sum, f) => sum + (Number(f.sipAmount) || 0), 0);
  const totalMonthlyRD = bankSavings.reduce((sum, b) => sum + (Number(b.monthlyDeposit) || 0), 0);

  const totalSavings = totalMutualFundsCurrent + totalBankSavings;

  const summary: SavingsSummary = {
    totalSavings,
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

  res.json({ success: true, data: summary });
});

// Mutual Funds CRUD
app.get('/api/savings/mutual-funds', (req, res) => {
  res.json({ success: true, data: db.mutualFunds || [] });
});

app.post('/api/savings/mutual-funds', (req, res) => {
  const { name, category, investedAmount, currentValue, sipAmount, sipDate, folioNumber, units, nav, notes } = req.body;
  if (!name || investedAmount === undefined) {
    return res.status(400).json({ error: 'Fund name and invested amount are required' });
  }

  const newFund: MutualFundInvestment = {
    id: `mf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: db.users[0]?.id || 'user-001',
    name,
    category: category || 'Equity',
    investedAmount: Number(investedAmount) || 0,
    currentValue: currentValue !== undefined ? Number(currentValue) : Number(investedAmount) || 0,
    sipAmount: sipAmount ? Number(sipAmount) : undefined,
    sipDate: sipDate ? Number(sipDate) : undefined,
    folioNumber: folioNumber || undefined,
    units: units ? Number(units) : undefined,
    nav: nav ? Number(nav) : undefined,
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.mutualFunds) db.mutualFunds = [];
  db.mutualFunds.push(newFund);
  saveDatabase(db);
  res.status(201).json({ success: true, data: newFund });
});

app.put('/api/savings/mutual-funds/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = db.mutualFunds.findIndex((f) => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Mutual fund not found' });
  }

  db.mutualFunds[idx] = {
    ...db.mutualFunds[idx],
    ...updates,
    investedAmount: updates.investedAmount !== undefined ? Number(updates.investedAmount) : db.mutualFunds[idx].investedAmount,
    currentValue: updates.currentValue !== undefined ? Number(updates.currentValue) : db.mutualFunds[idx].currentValue,
    sipAmount: updates.sipAmount !== undefined ? (updates.sipAmount ? Number(updates.sipAmount) : undefined) : db.mutualFunds[idx].sipAmount,
    sipDate: updates.sipDate !== undefined ? (updates.sipDate ? Number(updates.sipDate) : undefined) : db.mutualFunds[idx].sipDate,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({ success: true, data: db.mutualFunds[idx] });
});

app.delete('/api/savings/mutual-funds/:id', (req, res) => {
  const { id } = req.params;
  db.mutualFunds = db.mutualFunds.filter((f) => f.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Mutual fund deleted' });
});

// Bank Savings CRUD
app.get('/api/savings/bank-accounts', (req, res) => {
  res.json({ success: true, data: db.bankSavings || [] });
});

app.post('/api/savings/bank-accounts', (req, res) => {
  const { bankName, accountType, accountNumberLast4, balance, interestRate, maturityDate, monthlyDeposit, notes } = req.body;
  if (!bankName || balance === undefined) {
    return res.status(400).json({ error: 'Bank name and balance are required' });
  }

  const newAccount: BankSavingAccount = {
    id: `bank-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: db.users[0]?.id || 'user-001',
    bankName,
    accountType: accountType || 'Savings Account',
    accountNumberLast4: accountNumberLast4 || undefined,
    balance: Number(balance) || 0,
    interestRate: interestRate !== undefined && interestRate !== '' ? Number(interestRate) : undefined,
    maturityDate: maturityDate || undefined,
    monthlyDeposit: monthlyDeposit ? Number(monthlyDeposit) : undefined,
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.bankSavings) db.bankSavings = [];
  db.bankSavings.push(newAccount);
  saveDatabase(db);
  res.status(201).json({ success: true, data: newAccount });
});

app.put('/api/savings/bank-accounts/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = db.bankSavings.findIndex((b) => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Bank account not found' });
  }

  db.bankSavings[idx] = {
    ...db.bankSavings[idx],
    ...updates,
    balance: updates.balance !== undefined ? Number(updates.balance) : db.bankSavings[idx].balance,
    interestRate: updates.interestRate !== undefined ? (updates.interestRate !== '' ? Number(updates.interestRate) : undefined) : db.bankSavings[idx].interestRate,
    monthlyDeposit: updates.monthlyDeposit !== undefined ? (updates.monthlyDeposit ? Number(updates.monthlyDeposit) : undefined) : db.bankSavings[idx].monthlyDeposit,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({ success: true, data: db.bankSavings[idx] });
});

app.delete('/api/savings/bank-accounts/:id', (req, res) => {
  const { id } = req.params;
  db.bankSavings = db.bankSavings.filter((b) => b.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Bank account deleted' });
});

// --- Monthly Summary & Analytics / Insights ---
app.get('/api/insights', (req, res) => {
  const { month } = req.query;
  const targetMonth = month ? String(month) : new Date().toISOString().substring(0, 7);

  // Month transactions
  const monthTxs = db.transactions.filter((t) => t.date.startsWith(targetMonth));
  const monthExpenseTxs = monthTxs.filter((t) => t.type !== 'income');
  const monthIncomeTxs = monthTxs.filter((t) => t.type === 'income');
  const totalSpent = monthExpenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthIncomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalSpent;

  // Previous month transactions
  const [yearStr, mStr] = targetMonth.split('-');
  const prevDate = new Date(Number(yearStr), Number(mStr) - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthTxs = db.transactions.filter((t) => t.date.startsWith(prevMonthStr) && t.type !== 'income');
  const prevTotalSpent = prevMonthTxs.reduce((sum, t) => sum + t.amount, 0);

  // Budget
  const budget = db.budgets.find((b) => b.month === targetMonth) || {
    overallBudget: 75000,
    categoryBudgets: {},
    alertThreshold: 0.8
  };

  const categoryBudgetVals = Object.values(budget.categoryBudgets || {}) as number[];
  const totalBudget = (budget.overallBudget as number) || categoryBudgetVals.reduce((a: number, b: number) => a + b, 0) || 75000;
  const remainingBudget = Math.max(0, (totalBudget as number) - totalSpent);
  const percentageConsumed = (totalBudget as number) > 0 ? (totalSpent / (totalBudget as number)) * 100 : 0;

  // Today's spending
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySpending = monthExpenseTxs.filter((t) => t.date === todayStr).reduce((s, t) => s + t.amount, 0);

  // Days in month & velocity
  const daysInMonth = new Date(Number(yearStr), Number(mStr), 0).getDate();
  const currentDay = targetMonth === todayStr.substring(0, 7) ? new Date().getDate() : daysInMonth;
  const averageDailySpending = currentDay > 0 ? totalSpent / currentDay : 0;
  const projectedSpending = Math.round(averageDailySpending * daysInMonth);

  // Category breakdown
  const categoryMap: { [catId: string]: number } = {};
  monthExpenseTxs.forEach((t) => {
    categoryMap[t.categoryId] = (categoryMap[t.categoryId] || 0) + t.amount;
  });

  const categoryBreakdown = db.categories.map((cat) => {
    const spent = categoryMap[cat.id] || 0;
    const catBudget = (budget.categoryBudgets && budget.categoryBudgets[cat.id]) || 0;
    const catRemaining = catBudget > 0 ? Math.max(0, catBudget - spent) : 0;
    const catPct = catBudget > 0 ? (spent / catBudget) * 100 : 0;

    let status: 'healthy' | 'warning' | 'exceeded' = 'healthy';
    if (catBudget > 0) {
      if (catPct >= 100) status = 'exceeded';
      else if (catPct >= (budget.alertThreshold || 0.8) * 100) status = 'warning';
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      icon: cat.icon,
      color: cat.color,
      spent,
      budget: catBudget,
      remaining: catRemaining,
      percentage: Number(catPct.toFixed(1)),
      status
    };
  }).filter((c) => c.spent > 0 || c.budget > 0);

  // Highest spending category
  let highestSpendingCategory = null;
  if (categoryBreakdown.length > 0) {
    const sortedCats = [...categoryBreakdown].sort((a, b) => b.spent - a.spent);
    if (sortedCats[0] && sortedCats[0].spent > 0) {
      highestSpendingCategory = {
        categoryId: sortedCats[0].categoryId,
        name: sortedCats[0].categoryName,
        amount: sortedCats[0].spent,
        percentage: totalSpent > 0 ? Number(((sortedCats[0].spent / totalSpent) * 100).toFixed(1)) : 0
      };
    }
  }

  // Day wise spending (expenses)
  const dayMap: { [day: number]: { amount: number; count: number } } = {};
  monthExpenseTxs.forEach((t) => {
    const d = parseInt(t.date.split('-')[2], 10);
    if (!dayMap[d]) dayMap[d] = { amount: 0, count: 0 };
    dayMap[d].amount += t.amount;
    dayMap[d].count += 1;
  });

  const dayWiseSpending = [];
  let highestDay = { date: '', amount: 0 };
  for (let d = 1; d <= daysInMonth; d++) {
    const info = dayMap[d] || { amount: 0, count: 0 };
    const dateStr = `${targetMonth}-${String(d).padStart(2, '0')}`;
    dayWiseSpending.push({ date: dateStr, day: d, amount: info.amount, count: info.count });
    if (info.amount > highestDay.amount) {
      highestDay = { date: dateStr, amount: info.amount };
    }
  }

  // Recurring vs non-recurring
  const activeRecurringTotal = db.recurringPayments
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  // Natural Language Insights
  const naturalInsights = [];
  if (prevTotalSpent > 0) {
    const diffPct = Math.round(((totalSpent - prevTotalSpent) / prevTotalSpent) * 100);
    if (diffPct > 0) {
      naturalInsights.push({
        id: 'ins-mom-high',
        title: 'Month-over-Month Trend',
        description: `Your spending is ${diffPct}% higher than last month at this point.`,
        type: 'warning',
        icon: 'TrendingUp',
        stat: `+${diffPct}%`
      });
    } else {
      naturalInsights.push({
        id: 'ins-mom-low',
        title: 'Spending Reduced',
        description: `Great job! You are spending ${Math.abs(diffPct)}% less compared to last month.`,
        type: 'positive',
        icon: 'TrendingDown',
        stat: `${diffPct}%`
      });
    }
  }

  if (highestSpendingCategory) {
    naturalInsights.push({
      id: 'ins-highest-cat',
      title: 'Top Expense Category',
      description: `${highestSpendingCategory.name} accounts for ${highestSpendingCategory.percentage}% of your total spending this month.`,
      type: 'neutral',
      icon: 'PieChart',
      stat: `${highestSpendingCategory.percentage}%`
    });
  }

  const exceededCategories = categoryBreakdown.filter((c) => c.status === 'exceeded');
  if (exceededCategories.length > 0) {
    naturalInsights.push({
      id: 'ins-budget-alert',
      title: 'Budget Alert',
      description: `${exceededCategories.map((c) => c.categoryName).join(', ')} exceeded allocated monthly budget.`,
      type: 'warning',
      icon: 'AlertTriangle',
      stat: `${exceededCategories.length} categories`
    });
  }

  naturalInsights.push({
    id: 'ins-daily-avg',
    title: 'Daily Velocity',
    description: `Your average daily spending is ${db.users[0]?.currency || '₹'}${Math.round(averageDailySpending)}. Projected total: ${db.users[0]?.currency || '₹'}${projectedSpending.toLocaleString()}.`,
    type: 'neutral',
    icon: 'Activity',
    stat: `${db.users[0]?.currency || '₹'}${Math.round(averageDailySpending)}/day`
  });

  if (activeRecurringTotal > 0) {
    naturalInsights.push({
      id: 'ins-recurring',
      title: 'Fixed Monthly Commitments',
      description: `Your active recurring payments total ${db.users[0]?.currency || '₹'}${activeRecurringTotal.toLocaleString()} every month.`,
      type: 'neutral',
      icon: 'Calendar',
      stat: `${db.users[0]?.currency || '₹'}${activeRecurringTotal.toLocaleString()}`
    });
  }

  const summary: MonthlySummary = {
    month: targetMonth,
    totalSpent,
    totalIncome,
    netBalance,
    totalBudget,
    remainingBudget,
    percentageConsumed: Number(percentageConsumed.toFixed(1)),
    todaySpending,
    transactionCount: monthTxs.length,
    projectedSpending,
    averageDailySpending: Math.round(averageDailySpending),
    highestSpendingDay: highestDay.amount > 0 ? highestDay : null,
    highestSpendingCategory,
    categoryBreakdown,
    fixedExpenses: activeRecurringTotal,
    variableExpenses: Math.max(0, totalSpent - activeRecurringTotal),
    dayWiseSpending
  };

  res.json({
    success: true,
    summary,
    insights: naturalInsights,
    previousMonth: {
      month: prevMonthStr,
      totalSpent: prevTotalSpent
    }
  });
});

// --- Smart Expense Parser (Natural Language / SMS text) ---
app.post('/api/ai/parse-expense', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text query is required' });
  }

  const categories = db.categories.map((c) => ({ id: c.id, name: c.name }));
  const ai = getAIClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expense extraction assistant. Extract transaction details from the user's text or bank SMS:
"${text}"

Categories available: ${JSON.stringify(categories)}
Payment methods: ["UPI", "Credit Card", "Debit Card", "Cash", "NetBanking", "Wallet", "Other"]

Return ONLY valid JSON in this format (no markdown blocks, no backticks, just raw json):
{
  "amount": number,
  "merchant": "string",
  "categoryId": "string id matching available categories",
  "subCategory": "string or empty",
  "paymentMethod": "one of the payment methods",
  "notes": "string or empty",
  "date": "YYYY-MM-DD or today's date if unspecified"
}`
      });

      const raw = response.text?.trim() || '';
      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, data: parsed, parsedBy: 'gemini' });
    } catch (err) {
      console.warn('Gemini parsing fallback to regex:', err);
    }
  }

  // Fallback intelligent regex parser
  const amountMatch = text.match(/(?:rs\.?|inr|₹|\$|€|£)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;

  let paymentMethod: any = 'UPI';
  if (/credit\s*card/i.test(text)) paymentMethod = 'Credit Card';
  else if (/debit\s*card/i.test(text)) paymentMethod = 'Debit Card';
  else if (/cash/i.test(text)) paymentMethod = 'Cash';
  else if (/netbanking|transfer|neft|rtgs/i.test(text)) paymentMethod = 'NetBanking';

  let matchedCategory = db.categories[0];
  const textLower = text.toLowerCase();
  for (const cat of db.categories) {
    if (textLower.includes(cat.name.toLowerCase())) {
      matchedCategory = cat;
      break;
    }
  }

  if (matchedCategory.id === db.categories[0].id) {
    if (/swiggy|zomato|starbucks|food|lunch|dinner|breakfast|coffee|cafe|pizza|burger|restaurant/i.test(text)) {
      matchedCategory = db.categories.find((c) => c.id === 'cat-food') || matchedCategory;
    } else if (/supermarket|grocery|instamart|zepto|blinkit|vegetable|fruit|dairy|milk/i.test(text)) {
      matchedCategory = db.categories.find((c) => c.id === 'cat-groceries') || matchedCategory;
    } else if (/uber|ola|rapido|metro|cab|taxi|train|bus|auto/i.test(text)) {
      matchedCategory = db.categories.find((c) => c.id === 'cat-transport') || matchedCategory;
    } else if (/petrol|diesel|fuel|cng|indian\s*oil|hp|shell/i.test(text)) {
      matchedCategory = db.categories.find((c) => c.id === 'cat-fuel') || matchedCategory;
    } else if (/amazon|flipkart|zara|myntra|shop|clothes|shoes/i.test(text)) {
      matchedCategory = db.categories.find((c) => c.id === 'cat-shopping') || matchedCategory;
    } else if (/rent|society/i.test(text)) {
      matchedCategory = db.categories.find((c) => c.id === 'cat-rent') || matchedCategory;
    } else if (/netflix|movie|cinema|pvr|spotify|game/i.test(text)) {
      matchedCategory = db.categories.find((c) => c.id === 'cat-entertainment') || matchedCategory;
    }
  }

  res.json({
    success: true,
    data: {
      amount,
      merchant: text.replace(/(?:rs\.?|inr|₹|\$|€|£)?\s*[0-9]+(?:\.[0-9]{1,2})?/i, '').replace(/on|via|paid|spent|at|for/gi, ' ').trim() || 'Expense',
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      notes: text
    },
    parsedBy: 'nlp-regex'
  });
});

// --- Notifications / Reminders ---
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: db.notifications });
});

app.post('/api/notifications/mark-read', (req, res) => {
  const { id } = req.body;
  if (id === 'all') {
    db.notifications.forEach((n) => (n.read = true));
  } else {
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }
  saveDatabase(db);
  res.json({ success: true });
});

// Reset database to initial seed data
app.post('/api/database/reset', (req, res) => {
  const seed = generateSeedData();
  db = {
    users: [seed.user],
    transactions: seed.transactions,
    budgets: seed.budgets,
    categories: seed.categories,
    recurringPayments: seed.recurringPayments,
    mutualFunds: seed.mutualFunds,
    bankSavings: seed.bankSavings,
    notifications: [
      {
        id: 'notif-welcome',
        userId: seed.user.id,
        title: 'Personal Ledger Reset to Demo Seed Data',
        message: 'Successfully populated ledger with realistic multi-month expenses, savings and recurring payments.',
        type: 'insight',
        date: new Date().toISOString(),
        read: false
      }
    ]
  };
  saveDatabase(db);
  res.json({ success: true, message: 'Ledger database reset successfully' });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Willow Expense Ledger server running on http://localhost:${PORT}`);
  });
}

startServer();
