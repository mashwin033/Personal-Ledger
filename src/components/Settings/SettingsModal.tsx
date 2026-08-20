import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon, AVAILABLE_ICONS } from '../common/CategoryIcon';
import { apiService } from '../../services/api';
import {
  Settings,
  X,
  Globe,
  Tag,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Moon,
  Sun,
  Database,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

const CURRENCIES = [
  { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)' },
  { symbol: '$', code: 'USD', label: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', label: 'Euro (€)' },
  { symbol: '£', code: 'GBP', label: 'British Pound (£)' },
  { symbol: '¥', code: 'JPY', label: 'Japanese Yen (¥)' },
  { symbol: 'C$', code: 'CAD', label: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', label: 'Australian Dollar (A$)' },
  { symbol: 'AED', code: 'AED', label: 'UAE Dirham (AED)' }
];

const PRESET_COLORS = [
  '#F97316',
  '#10B981',
  '#3B82F6',
  '#EAB308',
  '#EC4899',
  '#8B5CF6',
  '#6366F1',
  '#EF4444',
  '#14B8A6',
  '#06B6D4',
  '#D97706',
  '#64748B'
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    user,
    updateUserPreferences,
    categories,
    addCategory,
    deleteCategory,
    resetCategories,
    refreshAllData,
    bulkImportExpenses,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'data' | 'vercel'>('general');

  // Category creation state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [newCatSubs, setNewCatSubs] = useState('');

  // Security state
  const [pinCode, setPinCode] = useState(user.pinCode || '1234');
  const [biometricEnabled, setBiometricEnabled] = useState(user.biometricLockEnabled || false);

  if (!isSettingsOpen) return null;

  const handleCurrencyChange = async (curr: typeof CURRENCIES[0]) => {
    await updateUserPreferences({
      currency: curr.symbol,
      currencyCode: curr.code
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const subs = newCatSubs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await addCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor,
      subcategories: subs
    });

    setNewCatName('');
    setNewCatSubs('');
  };

  const handleSaveSecurity = async () => {
    await updateUserPreferences({
      pinCode,
      biometricLockEnabled: biometricEnabled
    });
    showToast('Security PIN updated', 'success');
  };

  const handleResetDatabase = async () => {
    if (window.confirm('Reset all ledger data to default realistic sample transactions and budgets?')) {
      await apiService.resetDatabase();
      await refreshAllData();
      showToast('Ledger re-seeded with sample data', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const items = JSON.parse(content);
        if (Array.isArray(items)) {
          await bulkImportExpenses(items);
        } else {
          showToast('Invalid JSON file format. Expecting array of transactions.', 'error');
        }
      } catch (err) {
        showToast('Error reading import file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Settings size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings & Preferences</h2>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs inside Settings */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-800/20 overflow-x-auto no-scrollbar">
          {[
            { id: 'general', label: 'Preferences', icon: Globe },
            { id: 'categories', label: 'Custom Categories', icon: Tag },
            { id: 'data', label: 'Backup & Seed', icon: Database },
            { id: 'vercel', label: 'Vercel Deploy Guide', icon: ExternalLink }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Display Currency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CURRENCIES.map((curr) => {
                    const isSelected = (user.currency || '₹') === curr.symbol;
                    return (
                      <button
                        key={curr.code}
                        onClick={() => handleCurrencyChange(curr)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-base font-black block">{curr.symbol}</span>
                        <span className="text-[11px] opacity-80 truncate">{curr.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security & PIN Lock */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center space-x-2">
                  <Lock size={16} className="text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Security & Biometric Screen Lock
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Master 4-Digit Security PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold tracking-widest rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      placeholder="1234"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSaveSecurity}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Update Security PIN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add New Category Form */}
              <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Create Custom Category
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Pet Care, Subscriptions"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Sub-categories (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Vet, Pet Food, Toys"
                      value={newCatSubs}
                      onChange={(e) => setNewCatSubs(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Color and Icon row */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Color Accent
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                          newCatColor === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Select Icon
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setNewCatIcon(iconName)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          newCatIcon === iconName ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <CategoryIcon iconName={iconName} size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Category</span>
                  </button>
                </div>
              </form>

              {/* Categories List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Existing Categories ({categories.length})
                  </h4>
                  <button
                    onClick={() => resetCategories()}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Reset to Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: c.color }}
                        >
                          <CategoryIcon iconName={c.icon} size={14} />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {c.name}
                        </span>
                      </div>

                      {!c.isDefault && (
                        <button
                          onClick={() => deleteCategory(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Seed / Reset Database */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Reset & Seed Realistic Sample Data
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Populate your ledger with multi-month realistic expenses, budgets, and recurring payments.
                  </p>
                </div>
                <button
                  onClick={handleResetDatabase}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 ml-3"
                >
                  Reset & Seed
                </button>
              </div>

              {/* Import JSON Backup */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Import JSON Backup
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Restore previously exported transactions into the ledger.
                  </p>
                </div>
                <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 ml-3">
                  <span>Import File</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 font-mono text-[11px]">
                <p className="text-emerald-400 font-bold"># Deploy to Vercel in 1-Click</p>
                <p className="text-slate-400">1. Clone repository to your GitHub</p>
                <p className="text-slate-400">2. Import project in Vercel Dashboard (Framework: Vite)</p>
                <p className="text-slate-400">3. Set Environment Variable: <span className="text-amber-400">GEMINI_API_KEY</span></p>
                <p className="text-slate-400">4. Run DB Migrations using <span className="text-indigo-400">schema.sql</span> on Supabase or Neon</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  Included Database Schema & Vercel Config:
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                  <li><code>schema.sql</code> - Complete PostgreSQL / Supabase table definitions</li>
                  <li><code>vercel.json</code> - Zero-config build pipeline for Vercel static & API routes</li>
                  <li><code>.env.example</code> - Environment variable template</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
