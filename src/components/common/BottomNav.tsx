import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Landmark,
  Repeat,
  Sparkles
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'savings', label: 'Savings', icon: Landmark },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'insights', label: 'Insights', icon: Sparkles },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 pb-safe">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 cursor-pointer transition-all ${
                isActive
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {isActive ? (
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mb-0.5" />
              ) : (
                <div className="w-1.5 h-1.5 bg-transparent rounded-full mb-0.5" />
              )}
              <Icon size={18} />
              <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
