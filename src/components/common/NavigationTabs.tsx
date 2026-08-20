import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Landmark,
  Repeat,
  Calendar,
  Sparkles
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

export const NAV_TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'savings', label: 'Total Savings', icon: Landmark },
  { id: 'recurring', label: 'Recurring Bills', icon: Repeat },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'insights', label: 'Insights', icon: Sparkles }
];

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1.5 py-3">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400' : 'bg-transparent'}`} />
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
