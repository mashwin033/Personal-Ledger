import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BankSavingAccount, BankAccountType } from '../../types';
import { X, Landmark, Percent, Calendar, FileText, Hash, ShieldCheck } from 'lucide-react';

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: BankSavingAccount | null;
}

const BANK_TYPES: BankAccountType[] = [
  'Savings Account',
  'Fixed Deposit (FD)',
  'Recurring Deposit (RD)',
  'Emergency Fund',
  'PPF',
  'Other'
];

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit
}) => {
  const { addBankAccount, updateBankAccount, currency } = useApp();

  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<BankAccountType>('Savings Account');
  const [balance, setBalance] = useState('');
  const [accountNumberLast4, setAccountNumberLast4] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [monthlyDeposit, setMonthlyDeposit] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setBankName(accountToEdit.bankName || '');
      setAccountType(accountToEdit.accountType || 'Savings Account');
      setBalance(String(accountToEdit.balance || ''));
      setAccountNumberLast4(accountToEdit.accountNumberLast4 || '');
      setInterestRate(accountToEdit.interestRate !== undefined ? String(accountToEdit.interestRate) : '');
      setMaturityDate(accountToEdit.maturityDate || '');
      setMonthlyDeposit(accountToEdit.monthlyDeposit ? String(accountToEdit.monthlyDeposit) : '');
      setNotes(accountToEdit.notes || '');
    } else {
      setBankName('');
      setAccountType('Savings Account');
      setBalance('');
      setAccountNumberLast4('');
      setInterestRate('');
      setMaturityDate('');
      setMonthlyDeposit('');
      setNotes('');
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !balance) return;

    setIsSubmitting(true);
    try {
      const balNum = parseFloat(balance) || 0;
      const rateNum = interestRate ? parseFloat(interestRate) : undefined;
      const depositNum = monthlyDeposit ? parseFloat(monthlyDeposit) : undefined;

      if (accountToEdit) {
        await updateBankAccount(accountToEdit.id, {
          bankName: bankName.trim(),
          accountType,
          balance: balNum,
          accountNumberLast4: accountNumberLast4.trim() || undefined,
          interestRate: rateNum,
          maturityDate: maturityDate || undefined,
          monthlyDeposit: depositNum,
          notes: notes.trim() || undefined
        });
      } else {
        await addBankAccount({
          bankName: bankName.trim(),
          accountType,
          balance: balNum,
          accountNumberLast4: accountNumberLast4.trim() || undefined,
          interestRate: rateNum,
          maturityDate: maturityDate || undefined,
          monthlyDeposit: depositNum,
          notes: notes.trim() || undefined
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDepositType =
    accountType === 'Fixed Deposit (FD)' ||
    accountType === 'Recurring Deposit (RD)' ||
    accountType === 'PPF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        id="bank-account-modal-content"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Landmark size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {accountToEdit ? 'Edit Bank Account / Deposit' : 'Add Bank Account / Deposit'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track liquid balances, Fixed Deposits, RDs & interest
              </p>
            </div>
          </div>
          <button
            id="close-bank-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Bank Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Bank / Institution Name *
            </label>
            <input
              id="bank-name-input"
              type="text"
              required
              placeholder="e.g. Federal Bank, SBI, HDFC Bank, Kerala Gramin Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Account / Deposit Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BANK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                    accountType === type
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Balance & Interest Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Current Balance ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {currency}
                </span>
                <input
                  id="bank-balance-input"
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="85000"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Interest Rate / APY (%)
              </label>
              <div className="relative">
                <input
                  id="bank-rate-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 7.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Masked Account Number & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Last 4 Digits of A/C
              </label>
              <input
                id="bank-last4-input"
                type="text"
                maxLength={4}
                placeholder="4821"
                value={accountNumberLast4}
                onChange={(e) => setAccountNumberLast4(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* If RD: Monthly Deposit */}
            {accountType === 'Recurring Deposit (RD)' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Monthly Deposit ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="3000"
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* If FD or RD: Maturity Date */}
            {isDepositType && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Maturity Date
                </label>
                <input
                  type="date"
                  value={maturityDate}
                  onChange={(e) => setMaturityDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Account Purpose / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Salary account, Emergency 6 months fund"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-bank-btn"
              type="submit"
              disabled={isSubmitting || !bankName.trim() || !balance}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : accountToEdit ? 'Update Account' : 'Add Bank Savings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
