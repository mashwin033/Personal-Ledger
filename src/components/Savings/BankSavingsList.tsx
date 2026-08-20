import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankSavingAccount, BankAccountType } from '../../types';
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Percent,
  ShieldCheck,
  CreditCard,
  Lock,
  Wallet
} from 'lucide-react';

interface BankSavingsListProps {
  onAddAccount: () => void;
  onEditAccount: (account: BankSavingAccount) => void;
}

export const BankSavingsList: React.FC<BankSavingsListProps> = ({
  onAddAccount,
  onEditAccount
}) => {
  const { bankSavings, deleteBankAccount, currency } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');

  const types = ['all', ...Array.from(new Set(bankSavings.map((b) => b.accountType)))];

  const filteredAccounts = bankSavings.filter((acc) => {
    if (selectedType === 'all') return true;
    return acc.accountType === selectedType;
  });

  const totalBankSavings = bankSavings.reduce((acc, b) => acc + (b.balance || 0), 0);

  const getAccountBadgeStyle = (type: BankAccountType) => {
    switch (type) {
      case 'Emergency Fund':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Fixed Deposit (FD)':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Recurring Deposit (RD)':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'PPF':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Account Type Pills & Add Account Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === t
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'all' ? 'All Accounts' : t}
            </button>
          ))}
        </div>

        <button
          id="add-bank-account-btn"
          onClick={onAddAccount}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Add Bank / Deposit</span>
        </button>
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Landmark className="mx-auto text-slate-400 mb-3" size={36} />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No bank accounts or deposits added</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Add your primary savings bank, Fixed Deposits, RDs, and Emergency Reserve balances.
          </p>
          <button
            onClick={onAddAccount}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
          >
            Add Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAccounts.map((account) => {
            const isDeposit =
              account.accountType === 'Fixed Deposit (FD)' ||
              account.accountType === 'Recurring Deposit (RD)' ||
              account.accountType === 'PPF';

            return (
              <div
                key={account.id}
                id={`bank-card-${account.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Type badge & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getAccountBadgeStyle(
                          account.accountType
                        )}`}
                      >
                        {account.accountType}
                      </span>
                      {account.interestRate !== undefined && account.interestRate > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1">
                          <Percent size={10} />
                          <span>{account.interestRate}% p.a.</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditAccount(account)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteBankAccount(account.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Bank Title & Last 4 */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {account.bankName}
                    </h4>
                    {account.accountNumberLast4 && (
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        •••• {account.accountNumberLast4}
                      </span>
                    )}
                  </div>

                  {account.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                      {account.notes}
                    </p>
                  )}

                  {/* Balance Display */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 my-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                      Available Balance / Corpus
                    </p>
                    <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      {currency}{(account.balance || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Extra Details footer (Maturity / Monthly deposit) */}
                {(account.maturityDate || account.monthlyDeposit) && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    {account.maturityDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>Matures: {account.maturityDate}</span>
                      </div>
                    )}
                    {account.monthlyDeposit && (
                      <div className="flex items-center space-x-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        <span>+{currency}{account.monthlyDeposit.toLocaleString('en-IN')}/mo</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
