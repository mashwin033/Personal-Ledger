-- ============================================================================
-- Willow Expense Ledger - Production Database Schema (PostgreSQL / Supabase)
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT '₹',
    currency_code VARCHAR(10) DEFAULT 'INR',
    theme VARCHAR(20) DEFAULT 'light',
    reminder_time VARCHAR(10) DEFAULT '21:00',
    reminder_enabled BOOLEAN DEFAULT true,
    biometric_lock_enabled BOOLEAN DEFAULT false,
    pin_code VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Tag',
    color VARCHAR(20) NOT NULL DEFAULT '#6366F1',
    is_default BOOLEAN DEFAULT false,
    subcategories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transactions / Expenses Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    time VARCHAR(10) DEFAULT '12:00',
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
    merchant VARCHAR(255) NOT NULL,
    notes TEXT,
    is_recurring_instance BOOLEAN DEFAULT false,
    recurring_payment_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- 4. Monthly Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    overall_budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    category_budgets JSONB NOT NULL DEFAULT '{}'::jsonb,
    alert_threshold NUMERIC(4, 2) DEFAULT 0.80, -- 80% threshold
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month)
);

-- 5. Recurring Payments & Subscriptions Table
CREATE TABLE IF NOT EXISTS recurring_payments (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    frequency VARCHAR(30) DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    due_day INT NOT NULL DEFAULT 1 CHECK (due_day BETWEEN 1 AND 31),
    next_due_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_log_expense BOOLEAN DEFAULT false,
    last_paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_active ON recurring_payments(user_id, is_active);

-- 6. Notifications & Reminders Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'daily_reminder', 'budget_warning', 'budget_exceeded', 'bill_due', 'insight'
    read BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);
