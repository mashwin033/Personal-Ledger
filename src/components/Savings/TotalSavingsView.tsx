import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MutualFundsList } from './MutualFundsList';
import { BankSavingsList } from './BankSavingsList';
import { AddMutualFundModal } from './AddMutualFundModal';
import { AddBankAccountModal } from './AddBankAccountModal';
import { MutualFundInvestment, BankSavingAccount } from '../../types';
import {
  Landmark,
  TrendingUp,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Calendar,
  Layers,
  PieChart as PieIcon,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const TotalSavingsView: React.FC = () => {
  const { mutualFunds, bankSavings, currency } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'mutual_funds' | 'bank_savings'>('all');
  
  // Modals state
  const [isAddMfOpen, setIsAddMfOpen] = useState(false);
  const [editingMf, setEditingMf] = useState<MutualFundInvestment | null>(null);

  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankSavingAccount | null>(null);

  // Computations
  const totalMfInvested = mutualFunds.reduce((acc, f) => acc + (f.investedAmount || 0), 0);
  const totalMfCurrent = mutualFunds.reduce((acc, f) => acc + (f.currentValue || f.investedAmount || 0), 0);
  const totalMfReturns = totalMfCurrent - totalMfInvested;
  const mfReturnPct = totalMfInvested > 0 ? (totalMfReturns / totalMfInvested) * 100 : 0;
  const totalMonthlySip = mutualFunds.reduce((acc, f) => acc + (f.sipAmount || 0), 0);

  const totalBankSavings = bankSavings.reduce((acc, b) => acc + (b.balance || 0), 0);
  const totalMonthlyRd = bankSavings.reduce((acc, b) => acc + (b.monthlyDeposit || 0), 0);

  const grandTotalSavings = totalMfCurrent + totalBankSavings;
  const totalMonthlyInvestment = totalMonthlySip + totalMonthlyRd;

  const mfRatio = grandTotalSavings > 0 ? (totalMfCurrent / grandTotalSavings) * 100 : 0;
  const bankRatio = grandTotalSavings > 0 ? (totalBankSavings / grandTotalSavings) * 100 : 0;

  const chartData = [
    { name: 'Mutual Funds', value: totalMfCurrent, color: '#6366F1' },
    { name: 'Bank Accounts & Deposits', value: totalBankSavings, color: '#10B981' }
  ].filter(d => d.value > 0);

  const handleEditMf = (fund: MutualFundInvestment) => {
    setEditingMf(fund);
    setIsAddMfOpen(true);
  };

  const handleEditBank = (acc: BankSavingAccount) => {
    setEditingBank(acc);
    setIsAddBankOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Landmark size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Total Savings & Investments
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolidated wealth tracker for Mutual Funds & Bank Accounts
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            id="quick-add-mf-btn"
            onClick={() => {
              setEditingMf(null);
              setIsAddMfOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <TrendingUp size={15} />
            <span>+ Mutual Fund</span>
          </button>

          <button
            id="quick-add-bank-btn"
            onClick={() => {
              setEditingBank(null);
              setIsAddBankOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Landmark size={15} />
            <span>+ Bank Account</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Savings */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-slate-400">
                Total Net Wealth
              </span>
              <div className="p-1.5 rounded-lg bg-white/10 text-amber-400">
                <PiggyBank size={16} />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {currency}{grandTotalSavings.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Monthly Inflow:</span>
            <span className="font-mono font-bold text-emerald-400">
              +{currency}{totalMonthlyInvestment.toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>

        {/* Mutual Funds Summary */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400">
                Mutual Funds Value
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {currency}{totalMfCurrent.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Invested: {currency}{totalMfInvested.toLocaleString('en-IN')}</span>
            <span
              className={`font-mono font-bold ${
                totalMfReturns >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totalMfReturns >= 0 ? '+' : ''}{mfReturnPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Bank Savings & FDs */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Bank Savings & Deposits
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Landmark size={16} />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {currency}{totalBankSavings.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{bankSavings.length} Accounts / Deposits</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Safe Liquid Assets</span>
          </div>
        </div>

        {/* Monthly Systematic Inflow */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">
                Monthly SIP & RD
              </span>
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Calendar size={16} />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {currency}{totalMonthlyInvestment.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>SIP: {currency}{totalMonthlySip.toLocaleString('en-IN')}</span>
            <span>RD: {currency}{totalMonthlyRd.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation Split Bar */}
      {grandTotalSavings > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Portfolio Allocation & Distribution
            </h4>
            <div className="flex items-center space-x-4 text-xs font-bold">
              <span className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                <span>Mutual Funds ({mfRatio.toFixed(1)}%)</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Bank Accounts ({bankRatio.toFixed(1)}%)</span>
              </span>
            </div>
          </div>

          {/* Progress Split Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${mfRatio}%` }}
              className="bg-indigo-600 h-full transition-all duration-500"
              title={`Mutual Funds: ${mfRatio.toFixed(1)}%`}
            />
            <div
              style={{ width: `${bankRatio}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Bank Accounts: ${bankRatio.toFixed(1)}%`}
            />
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Portfolio ({mutualFunds.length + bankSavings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('mutual_funds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'mutual_funds'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp size={14} />
          <span>Mutual Funds ({mutualFunds.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bank_savings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'bank_savings'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Landmark size={14} />
          <span>Bank Savings ({bankSavings.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'all' ? (
        <div className="space-y-8">
          {/* Section 1: Mutual Funds */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mutual Funds Portfolio
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {currency}{totalMfCurrent.toLocaleString('en-IN')}
              </span>
            </div>
            <MutualFundsList
              onAddFund={() => {
                setEditingMf(null);
                setIsAddMfOpen(true);
              }}
              onEditFund={handleEditMf}
            />
          </section>

          {/* Section 2: Bank Savings */}
          <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bank Savings & Deposits
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {currency}{totalBankSavings.toLocaleString('en-IN')}
              </span>
            </div>
            <BankSavingsList
              onAddAccount={() => {
                setEditingBank(null);
                setIsAddBankOpen(true);
              }}
              onEditAccount={handleEditBank}
            />
          </section>
        </div>
      ) : activeSubTab === 'mutual_funds' ? (
        <MutualFundsList
          onAddFund={() => {
            setEditingMf(null);
            setIsAddMfOpen(true);
          }}
          onEditFund={handleEditMf}
        />
      ) : (
        <BankSavingsList
          onAddAccount={() => {
            setEditingBank(null);
            setIsAddBankOpen(true);
          }}
          onEditAccount={handleEditBank}
        />
      )}

      {/* Modals */}
      <AddMutualFundModal
        isOpen={isAddMfOpen}
        onClose={() => {
          setIsAddMfOpen(false);
          setEditingMf(null);
        }}
        fundToEdit={editingMf}
      />

      <AddBankAccountModal
        isOpen={isAddBankOpen}
        onClose={() => {
          setIsAddBankOpen(false);
          setEditingBank(null);
        }}
        accountToEdit={editingBank}
      />
    </div>
  );
};
