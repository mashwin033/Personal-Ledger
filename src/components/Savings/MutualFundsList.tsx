import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MutualFundInvestment, MutualFundCategory } from '../../types';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info
} from 'lucide-react';

interface MutualFundsListProps {
  onAddFund: () => void;
  onEditFund: (fund: MutualFundInvestment) => void;
}

export const MutualFundsList: React.FC<MutualFundsListProps> = ({
  onAddFund,
  onEditFund
}) => {
  const { mutualFunds, deleteMutualFund, currency } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(mutualFunds.map((f) => f.category)))];

  const filteredFunds = mutualFunds.filter((fund) => {
    if (selectedCategory === 'all') return true;
    return fund.category === selectedCategory;
  });

  const totalInvested = mutualFunds.reduce((acc, f) => acc + (f.investedAmount || 0), 0);
  const totalCurrent = mutualFunds.reduce((acc, f) => acc + (f.currentValue || f.investedAmount || 0), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const totalMonthlySip = mutualFunds.reduce((acc, f) => acc + (f.sipAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Category Pills & Add Fund Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Funds' : cat}
            </button>
          ))}
        </div>

        <button
          id="add-mutual-fund-btn"
          onClick={onAddFund}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Add Mutual Fund</span>
        </button>
      </div>

      {/* SIP Total Banner */}
      {totalMonthlySip > 0 && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Active SIP Commitments
              </p>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400">
                {mutualFunds.filter((f) => (f.sipAmount || 0) > 0).length} active systematic investment plans running monthly
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 font-mono">
              {currency}{totalMonthlySip.toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>
      )}

      {/* Funds Grid */}
      {filteredFunds.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <TrendingUp className="mx-auto text-slate-400 mb-3" size={36} />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No mutual funds found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Track your equity, index, ELSS, and hybrid funds to monitor real-time portfolio growth.
          </p>
          <button
            onClick={onAddFund}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Add Your First Mutual Fund
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFunds.map((fund) => {
            const invested = fund.investedAmount || 0;
            const current = fund.currentValue || invested;
            const gain = current - invested;
            const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
            const isProfit = gain >= 0;

            return (
              <div
                key={fund.id}
                id={`mf-card-${fund.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category badge & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {fund.category}
                      </span>
                      {fund.sipAmount && fund.sipAmount > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                          <span>SIP: {currency}{fund.sipAmount.toLocaleString('en-IN')}/mo</span>
                          {fund.sipDate && <span>({fund.sipDate}th)</span>}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditFund(fund)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Mutual Fund"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteMutualFund(fund.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Delete Mutual Fund"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Fund Title */}
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug mb-1">
                    {fund.name}
                  </h4>
                  {fund.folioNumber && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-3">
                      Folio: {fund.folioNumber}
                    </p>
                  )}

                  {/* Investment Metrics */}
                  <div className="grid grid-cols-2 gap-3 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        Invested
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {currency}{invested.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        Current Value
                      </p>
                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                        {currency}{current.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return stats */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Total Growth
                  </span>
                  <div className="flex items-center space-x-1 font-mono font-bold">
                    {isProfit ? (
                      <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ArrowDownRight size={14} className="text-rose-600 dark:text-rose-400" />
                    )}
                    <span
                      className={
                        isProfit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {isProfit ? '+' : ''}{currency}{Math.abs(gain).toLocaleString('en-IN')} ({isProfit ? '+' : ''}{gainPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
