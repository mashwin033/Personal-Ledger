import { Category, RecurringPayment, Transaction, Budget, User, MutualFundInvestment, BankSavingAccount } from '../types';

export const DEFAULT_MUTUAL_FUNDS: MutualFundInvestment[] = [
  {
    id: 'mf-001',
    name: 'Parag Parikh Flexi Cap Fund - Direct Growth',
    category: 'Equity',
    investedAmount: 120000,
    currentValue: 154800,
    sipAmount: 5000,
    sipDate: 10,
    folioNumber: '10849204/92',
    units: 1845.23,
    nav: 83.89,
    notes: 'Long-term core equity compounder',
    createdAt: '2023-01-10T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mf-002',
    name: 'UTI Nifty 50 Index Fund - Direct Plan',
    category: 'Index Fund',
    investedAmount: 90000,
    currentValue: 112400,
    sipAmount: 4000,
    sipDate: 15,
    folioNumber: '99201482/10',
    units: 620.4,
    nav: 181.17,
    notes: 'Low-cost passive index fund tracking large caps',
    createdAt: '2023-03-15T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mf-003',
    name: 'Mirae Asset Large & Midcap Fund',
    category: 'Equity',
    investedAmount: 75000,
    currentValue: 96800,
    sipAmount: 3000,
    sipDate: 5,
    folioNumber: '38192044/01',
    units: 742.1,
    nav: 130.44,
    notes: 'Growth oriented hybrid allocation',
    createdAt: '2023-06-05T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mf-004',
    name: 'HDFC Balanced Advantage Fund - Direct Growth',
    category: 'Hybrid',
    investedAmount: 60000,
    currentValue: 71200,
    sipAmount: 2500,
    sipDate: 20,
    folioNumber: '44810293/55',
    units: 141.2,
    nav: 504.25,
    notes: 'Dynamic asset allocation for stability',
    createdAt: '2023-08-20T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mf-005',
    name: 'Mirae Asset ELSS Tax Saver Fund',
    category: 'ELSS (Tax Saver)',
    investedAmount: 50000,
    currentValue: 63500,
    folioNumber: '38192044/88',
    units: 512.8,
    nav: 123.83,
    notes: 'Section 80C tax saving with 3-year lock-in',
    createdAt: '2023-11-10T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_BANK_SAVINGS: BankSavingAccount[] = [
  {
    id: 'bank-001',
    bankName: 'Federal Bank',
    accountType: 'Savings Account',
    accountNumberLast4: '4821',
    balance: 85400,
    interestRate: 3.5,
    notes: 'Primary salary and UPI payment account',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bank-002',
    bankName: 'State Bank of India (SBI)',
    accountType: 'Fixed Deposit (FD)',
    accountNumberLast4: '9104',
    balance: 200000,
    interestRate: 7.25,
    maturityDate: '2027-03-15',
    notes: 'Cumulative fixed deposit for emergency buffer',
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bank-003',
    bankName: 'HDFC Bank',
    accountType: 'Emergency Fund',
    accountNumberLast4: '3022',
    balance: 120000,
    interestRate: 4.0,
    notes: '6-months liquid emergency reserve',
    createdAt: '2023-05-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bank-004',
    bankName: 'Kerala Gramin Bank',
    accountType: 'Recurring Deposit (RD)',
    accountNumberLast4: '7741',
    balance: 45000,
    interestRate: 7.1,
    monthlyDeposit: 3000,
    maturityDate: '2027-12-01',
    notes: 'Monthly automated RD for festive goal',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#F97316', // Orange
    isDefault: true,
    subcategories: ['Restaurants', 'Food Delivery', 'Coffee & Cafes', 'Snacks', 'Bars & Drinks']
  },
  {
    id: 'cat-groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#10B981', // Emerald
    isDefault: true,
    subcategories: ['Supermarket', 'Fruits & Veggies', 'Dairy', 'Bakery', 'Spices & Staples']
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    icon: 'Car',
    color: '#3B82F6', // Blue
    isDefault: true,
    subcategories: ['Cab & Taxi', 'Metro & Subway', 'Bus', 'Auto-Rickshaw', 'Train']
  },
  {
    id: 'cat-fuel',
    name: 'Fuel',
    icon: 'Fuel',
    color: '#EAB308', // Amber/Yellow
    isDefault: true,
    subcategories: ['Petrol', 'Diesel', 'CNG', 'EV Charging']
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
    isDefault: true,
    subcategories: ['Clothing & Shoes', 'Electronics', 'Home Decor', 'Gadgets', 'Books']
  },
  {
    id: 'cat-bills',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#8B5CF6', // Purple
    isDefault: true,
    subcategories: ['Electricity', 'Water', 'LPG Gas', 'Broadband / WiFi', 'Mobile Postpaid']
  },
  {
    id: 'cat-rent',
    name: 'Rent',
    icon: 'Home',
    color: '#6366F1', // Indigo
    isDefault: true,
    subcategories: ['House Rent', 'Maintenance', 'Parking Fee']
  },
  {
    id: 'cat-healthcare',
    name: 'Healthcare',
    icon: 'HeartPulse',
    color: '#EF4444', // Red
    isDefault: true,
    subcategories: ['Doctor Consultation', 'Pharmacy & Medicine', 'Diagnostics / Tests', 'Dental', 'Therapy']
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#A855F7', // Violet
    isDefault: true,
    subcategories: ['Movies & Events', 'Streaming OTT', 'Gaming', 'Concerts', 'Hobbies']
  },
  {
    id: 'cat-travel',
    name: 'Travel',
    icon: 'Plane',
    color: '#06B6D4', // Cyan
    isDefault: true,
    subcategories: ['Flights', 'Hotels & Stays', 'Holiday Packages', 'Sightseeing']
  },
  {
    id: 'cat-personal-care',
    name: 'Personal Care',
    icon: 'Sparkles',
    color: '#14B8A6', // Teal
    isDefault: true,
    subcategories: ['Salon & Spa', 'Skincare', 'Gym & Fitness', 'Haircut']
  },
  {
    id: 'cat-education',
    name: 'Education',
    icon: 'GraduationCap',
    color: '#3B82F6', // Sky
    isDefault: true,
    subcategories: ['Courses & Certifications', 'Books & Learning', 'Tuition', 'Stationery']
  },
  {
    id: 'cat-investments',
    name: 'Investments',
    icon: 'TrendingUp',
    color: '#059669', // Deep Green
    isDefault: true,
    subcategories: ['Mutual Fund SIP', 'Stocks', 'Gold & SGB', 'Fixed Deposit', 'Crypto']
  },
  {
    id: 'cat-emi-loans',
    name: 'EMI/Loans',
    icon: 'CreditCard',
    color: '#D97706', // Brown/Amber
    isDefault: true,
    subcategories: ['Car Loan EMI', 'Home Loan EMI', 'Credit Card Bill', 'Personal Loan']
  },
  {
    id: 'cat-other',
    name: 'Other Expenses',
    icon: 'MoreHorizontal',
    color: '#64748B', // Slate
    isDefault: true,
    type: 'expense',
    subcategories: ['Gifts & Charity', 'Govt Taxes', 'Office Expenses', 'Miscellaneous']
  },
  // Income / Credit Categories
  {
    id: 'cat-inc-salary',
    name: 'Salary',
    icon: 'Briefcase',
    color: '#10B981', // Emerald
    isDefault: true,
    type: 'income',
    subcategories: ['Monthly Salary', 'Bonus', 'Overtime', 'Incentive']
  },
  {
    id: 'cat-inc-business',
    name: 'Business',
    icon: 'Building2',
    color: '#059669', // Dark Emerald
    isDefault: true,
    type: 'income',
    subcategories: ['Sales Revenue', 'Client Payment', 'Consulting', 'Partnership']
  },
  {
    id: 'cat-inc-freelance',
    name: 'Freelance & Side Gig',
    icon: 'Laptop',
    color: '#0D9488', // Teal
    isDefault: true,
    type: 'income',
    subcategories: ['Projects', 'Design / Dev', 'Writing', 'Tutoring']
  },
  {
    id: 'cat-inc-investment',
    name: 'Investments & Returns',
    icon: 'TrendingUp',
    color: '#0284C7', // Sky
    isDefault: true,
    type: 'income',
    subcategories: ['Mutual Fund Dividend', 'Stock Gains', 'Interest / FD', 'Rental Income']
  },
  {
    id: 'cat-inc-gift',
    name: 'Gifts & Cashback',
    icon: 'Gift',
    color: '#8B5CF6', // Purple
    isDefault: true,
    type: 'income',
    subcategories: ['UPI Cashback', 'Family Gift', 'Refund', 'Reward']
  },
  {
    id: 'cat-inc-other',
    name: 'Other Income',
    icon: 'PlusCircle',
    color: '#64748B', // Slate
    isDefault: true,
    type: 'income',
    subcategories: ['Borrowed Repayment', 'Claim', 'Miscellaneous']
  }
];

export const DEFAULT_USER: User = {
  id: 'user-demo-01',
  name: 'Ashwin',
  email: 'ashwin@example.com',
  currency: '₹',
  currencyCode: 'INR',
  theme: 'light',
  reminderTime: '21:00',
  reminderEnabled: true,
  biometricLockEnabled: false,
  createdAt: new Date().toISOString()
};

// Generates realistic seed data based on the current date
export function generateSeedData(userId = 'user-demo-01') {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1; // 1-12
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  
  // Previous month string
  const prevDate = new Date(currentYear, now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentDay = now.getDate();

  // Helper to format date
  const makeDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const transactions: Transaction[] = [];

  // Seed transactions for current month up to today
  const seedExpenses = [
    { day: 1, amount: 22000, cat: 'cat-rent', sub: 'House Rent', method: 'NetBanking' as const, merchant: 'Greenwood Society Rent', notes: 'Monthly Apartment Rent' },
    { day: 1, amount: 5000, cat: 'cat-investments', sub: 'Mutual Fund SIP', method: 'UPI' as const, merchant: 'Zerodha Coin SIP', notes: 'Nifty 50 Index Fund' },
    { day: 2, amount: 649, cat: 'cat-entertainment', sub: 'Streaming OTT', method: 'Credit Card' as const, merchant: 'Netflix India', notes: '4K Ultra Subscription' },
    { day: 2, amount: 450, cat: 'cat-food', sub: 'Food Delivery', method: 'UPI' as const, merchant: 'Swiggy', notes: 'Dinner with friends' },
    { day: 3, amount: 999, cat: 'cat-bills', sub: 'Broadband / WiFi', method: 'UPI' as const, merchant: 'Airtel Fiber Broadband', notes: '300 Mbps Plan' },
    { day: 4, amount: 2850, cat: 'cat-groceries', sub: 'Supermarket', method: 'Debit Card' as const, merchant: 'Nature Basket Supermarket', notes: 'Monthly pantry staples' },
    { day: 5, amount: 320, cat: 'cat-transport', sub: 'Cab & Taxi', method: 'UPI' as const, merchant: 'Uber Ride', notes: 'Commute to Tech Park' },
    { day: 6, amount: 2100, cat: 'cat-fuel', sub: 'Petrol', method: 'Credit Card' as const, merchant: 'Indian Oil Fuel Station', notes: 'Full tank for highway trip' },
    { day: 7, amount: 1850, cat: 'cat-food', sub: 'Restaurants', method: 'UPI' as const, merchant: 'Toscano Italian Bistro', notes: 'Sunday brunch with family' },
    { day: 8, amount: 9500, cat: 'cat-emi-loans', sub: 'Car Loan EMI', method: 'NetBanking' as const, merchant: 'HDFC Auto Loan EMI', notes: 'Auto Debit' },
    { day: 9, amount: 1200, cat: 'cat-personal-care', sub: 'Salon & Spa', method: 'UPI' as const, merchant: 'Enrich Salon', notes: 'Haircut & grooming' },
    { day: 10, amount: 1650, cat: 'cat-groceries', sub: 'Fruits & Veggies', method: 'UPI' as const, merchant: 'Instamart & Organic Bazaar', notes: 'Fresh fruits and veggies' },
    { day: 11, amount: 399, cat: 'cat-bills', sub: 'Mobile Postpaid', method: 'UPI' as const, merchant: 'Jio Postpaid Plus', notes: 'Monthly mobile bill' },
    { day: 12, amount: 2499, cat: 'cat-shopping', sub: 'Clothing & Shoes', method: 'Credit Card' as const, merchant: 'Zara Mall', notes: 'Summer linen shirt' },
    { day: 13, amount: 550, cat: 'cat-food', sub: 'Coffee & Cafes', method: 'UPI' as const, merchant: 'Blue Tokai Roasters', notes: 'Work from cafe coffee & pastry' },
    { day: 14, amount: 280, cat: 'cat-transport', sub: 'Metro & Subway', method: 'UPI' as const, merchant: 'Namma Metro Card Recharge', notes: 'Smart card recharge' },
    { day: 15, amount: 750, cat: 'cat-healthcare', sub: 'Pharmacy & Medicine', method: 'UPI' as const, merchant: 'Apollo Pharmacy', notes: 'Multivitamins and allergy meds' },
    { day: 16, amount: 890, cat: 'cat-food', sub: 'Food Delivery', method: 'UPI' as const, merchant: 'Zomato', notes: 'Biryani lunch delivery' },
    { day: 17, amount: 1400, cat: 'cat-entertainment', sub: 'Movies & Events', method: 'UPI' as const, merchant: 'PVR Cinemas IMAX', notes: 'Movie tickets & popcorn' },
    { day: 18, amount: 3100, cat: 'cat-groceries', sub: 'Supermarket', method: 'Credit Card' as const, merchant: 'Zepto & BigBasket', notes: 'Weekly grocery restock' },
    { day: 19, amount: 420, cat: 'cat-transport', sub: 'Auto-Rickshaw', method: 'Cash' as const, merchant: 'Metro Station to Home', notes: 'Evening commute' },
    { day: 20, amount: 480, cat: 'cat-food', sub: 'Coffee & Cafes', method: 'UPI' as const, merchant: 'Third Wave Coffee', notes: 'Cold brew and bagel' },
  ];

  let idCounter = 1;
  // Add Salary and credit income for current month
  transactions.push({
    id: `tx-curr-inc-01`,
    userId,
    type: 'income',
    amount: 85000,
    date: makeDate(currentYear, currentMonthNum, 1),
    time: '09:00',
    categoryId: 'cat-inc-salary',
    categoryName: 'Salary',
    subCategory: 'Monthly Salary',
    paymentMethod: 'NetBanking',
    merchant: 'Company Salary Credit',
    notes: 'Monthly salary credited to bank account',
    createdAt: new Date(currentYear, currentMonthNum - 1, 1, 9, 0).toISOString()
  });

  transactions.push({
    id: `tx-curr-inc-02`,
    userId,
    type: 'income',
    amount: 15000,
    date: makeDate(currentYear, currentMonthNum, Math.min(10, currentDay > 0 ? currentDay : 10)),
    time: '16:00',
    categoryId: 'cat-inc-freelance',
    categoryName: 'Freelance & Side Gig',
    subCategory: 'Projects',
    paymentMethod: 'UPI',
    merchant: 'Client Web Design Project',
    notes: 'Freelance project milestone payment',
    createdAt: new Date(currentYear, currentMonthNum - 1, 10, 16, 0).toISOString()
  });

  for (const item of seedExpenses) {
    if (item.day <= currentDay || item.day <= 20) {
      const catObj = DEFAULT_CATEGORIES.find(c => c.id === item.cat);
      const effectiveDay = Math.min(item.day, currentDay > 0 ? currentDay : 20);
      transactions.push({
        id: `tx-curr-${String(idCounter++).padStart(3, '0')}`,
        userId,
        type: 'expense',
        amount: item.amount,
        date: makeDate(currentYear, currentMonthNum, effectiveDay),
        time: '14:30',
        categoryId: item.cat,
        categoryName: catObj ? catObj.name : 'Other',
        subCategory: item.sub,
        paymentMethod: item.method,
        merchant: item.merchant,
        notes: item.notes,
        createdAt: new Date(currentYear, currentMonthNum - 1, effectiveDay, 14, 30).toISOString()
      });
    }
  }

  // Previous month realistic transactions for comparison
  const prevMonthExpenses = [
    { day: 1, amount: 22000, cat: 'cat-rent', sub: 'House Rent', method: 'NetBanking' as const, merchant: 'Greenwood Society Rent' },
    { day: 1, amount: 5000, cat: 'cat-investments', sub: 'Mutual Fund SIP', method: 'UPI' as const, merchant: 'Zerodha Coin SIP' },
    { day: 3, amount: 8900, cat: 'cat-food', sub: 'Restaurants', method: 'Credit Card' as const, merchant: 'Various Dining & Swiggy' },
    { day: 7, amount: 6500, cat: 'cat-groceries', sub: 'Supermarket', method: 'UPI' as const, merchant: 'Supermarket & Instamart' },
    { day: 8, amount: 9500, cat: 'cat-emi-loans', sub: 'Car Loan EMI', method: 'NetBanking' as const, merchant: 'HDFC Auto Loan EMI' },
    { day: 12, amount: 3400, cat: 'cat-transport', sub: 'Cab & Taxi', method: 'UPI' as const, merchant: 'Uber & Fuel' },
    { day: 15, amount: 4200, cat: 'cat-shopping', sub: 'Clothing & Shoes', method: 'Credit Card' as const, merchant: 'Myntra & Amazon' },
    { day: 18, amount: 2800, cat: 'cat-bills', sub: 'Electricity', method: 'UPI' as const, merchant: 'Bescom Electricity' },
    { day: 22, amount: 1800, cat: 'cat-entertainment', sub: 'Movies & Events', method: 'UPI' as const, merchant: 'BookMyShow' },
    { day: 26, amount: 1500, cat: 'cat-personal-care', sub: 'Salon & Spa', method: 'UPI' as const, merchant: 'Salon & Spa' }
  ];

  for (const item of prevMonthExpenses) {
    const catObj = DEFAULT_CATEGORIES.find(c => c.id === item.cat);
    transactions.push({
      id: `tx-prev-${String(idCounter++).padStart(3, '0')}`,
      userId,
      amount: item.amount,
      date: makeDate(prevDate.getFullYear(), prevDate.getMonth() + 1, item.day),
      time: '12:00',
      categoryId: item.cat,
      categoryName: catObj ? catObj.name : 'Other',
      subCategory: item.sub,
      paymentMethod: item.method,
      merchant: item.merchant,
      notes: 'Previous month transaction',
      createdAt: new Date(prevDate.getFullYear(), prevDate.getMonth(), item.day).toISOString()
    });
  }

  // Budgets for current month
  const currentBudget: Budget = {
    id: `budget-${currentMonthStr}`,
    userId,
    month: currentMonthStr,
    overallBudget: 75000,
    categoryBudgets: {
      'cat-food': 8000,
      'cat-groceries': 9000,
      'cat-transport': 3500,
      'cat-fuel': 4000,
      'cat-shopping': 6000,
      'cat-bills': 3000,
      'cat-rent': 22000,
      'cat-healthcare': 3000,
      'cat-entertainment': 2500,
      'cat-travel': 5000,
      'cat-personal-care': 2500,
      'cat-education': 2000,
      'cat-investments': 5000,
      'cat-emi-loans': 9500,
      'cat-other': 2000
    },
    alertThreshold: 0.8,
    updatedAt: new Date().toISOString()
  };

  // Previous month budget
  const prevBudget: Budget = {
    id: `budget-${prevMonthStr}`,
    userId,
    month: prevMonthStr,
    overallBudget: 75000,
    categoryBudgets: { ...currentBudget.categoryBudgets },
    alertThreshold: 0.8,
    updatedAt: new Date(prevDate.getFullYear(), prevDate.getMonth(), 1).toISOString()
  };

  // Recurring Payments
  const recurringPayments: RecurringPayment[] = [
    {
      id: 'rec-001',
      userId,
      name: 'House Rent (Greenwood Apt)',
      amount: 22000,
      categoryId: 'cat-rent',
      categoryName: 'Rent',
      frequency: 'monthly',
      dueDay: 1,
      nextDueDate: makeDate(currentYear, currentMonthNum, 1),
      paymentMethod: 'NetBanking',
      notes: 'Direct transfer to landlord',
      isActive: true,
      autoLogExpense: true,
      lastPaidDate: makeDate(currentYear, currentMonthNum, 1),
      createdAt: new Date(currentYear, 0, 1).toISOString()
    },
    {
      id: 'rec-002',
      userId,
      name: 'Car Loan EMI (HDFC)',
      amount: 9500,
      categoryId: 'cat-emi-loans',
      categoryName: 'EMI/Loans',
      frequency: 'monthly',
      dueDay: 8,
      nextDueDate: makeDate(currentYear, currentMonthNum, 8),
      paymentMethod: 'NetBanking',
      notes: 'Auto debited from salary account',
      isActive: true,
      autoLogExpense: true,
      totalOccurrences: 24,
      paidOccurrences: 8,
      isCompleted: false,
      lastPaidDate: makeDate(currentYear, currentMonthNum, 8),
      createdAt: new Date(currentYear, 0, 1).toISOString()
    },
    {
      id: 'rec-003',
      userId,
      name: 'Mutual Fund SIP (Index 50)',
      amount: 5000,
      categoryId: 'cat-investments',
      categoryName: 'Investments',
      frequency: 'monthly',
      dueDay: 1,
      nextDueDate: makeDate(currentYear, currentMonthNum, 1),
      paymentMethod: 'UPI',
      notes: 'Zerodha Coin auto-debit',
      isActive: true,
      autoLogExpense: true,
      lastPaidDate: makeDate(currentYear, currentMonthNum, 1),
      createdAt: new Date(currentYear, 0, 1).toISOString()
    },
    {
      id: 'rec-004',
      userId,
      name: 'Airtel Fiber Broadband',
      amount: 999,
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      frequency: 'monthly',
      dueDay: 24,
      nextDueDate: makeDate(currentYear, currentMonthNum, 24),
      paymentMethod: 'UPI',
      notes: '300 Mbps unlimited plan',
      isActive: true,
      autoLogExpense: false,
      createdAt: new Date(currentYear, 0, 1).toISOString()
    },
    {
      id: 'rec-005',
      userId,
      name: 'Netflix Premium 4K',
      amount: 649,
      categoryId: 'cat-entertainment',
      categoryName: 'Entertainment',
      frequency: 'monthly',
      dueDay: 26,
      nextDueDate: makeDate(currentYear, currentMonthNum, 26),
      paymentMethod: 'Credit Card',
      notes: 'Family sharing plan',
      isActive: true,
      autoLogExpense: false,
      createdAt: new Date(currentYear, 0, 1).toISOString()
    },
    {
      id: 'rec-006',
      userId,
      name: 'Cult.fit Gym Membership',
      amount: 1800,
      categoryId: 'cat-personal-care',
      categoryName: 'Personal Care',
      frequency: 'monthly',
      dueDay: 28,
      nextDueDate: makeDate(currentYear, currentMonthNum, 28),
      paymentMethod: 'Credit Card',
      notes: 'Elite pass monthly billing',
      isActive: true,
      autoLogExpense: false,
      createdAt: new Date(currentYear, 0, 1).toISOString()
    },
    {
      id: 'rec-007',
      userId,
      name: 'Bescom Electricity Bill',
      amount: 2400,
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      frequency: 'monthly',
      dueDay: 22,
      nextDueDate: makeDate(currentYear, currentMonthNum, 22),
      paymentMethod: 'UPI',
      notes: 'Average monthly meter bill',
      isActive: true,
      autoLogExpense: false,
      createdAt: new Date(currentYear, 0, 1).toISOString()
    }
  ];

  return {
    user: DEFAULT_USER,
    categories: DEFAULT_CATEGORIES,
    transactions,
    budgets: [currentBudget, prevBudget],
    recurringPayments,
    mutualFunds: DEFAULT_MUTUAL_FUNDS,
    bankSavings: DEFAULT_BANK_SAVINGS
  };
}
