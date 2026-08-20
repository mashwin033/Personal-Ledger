import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MutualFundInvestment, MutualFundCategory } from '../../types';
import { X, TrendingUp, DollarSign, Calendar, FileText, Tag, Hash, Percent } from 'lucide-react';

interface AddMutualFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundToEdit?: MutualFundInvestment | null;
}

const MF_CATEGORIES: MutualFundCategory[] = [
  'Equity',
  'Index Fund',
  'Hybrid',
  'ELSS (Tax Saver)',
  'Debt',
  'Commodity/Gold',
  'Other'
];

export const AddMutualFundModal: React.FC<AddMutualFundModalProps> = ({
  isOpen,
  onClose,
  fundToEdit
}) => {
  const { addMutualFund, updateMutualFund, currency } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<MutualFundCategory>('Equity');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [sipAmount, setSipAmount] = useState('');
  const [sipDate, setSipDate] = useState('10');
  const [folioNumber, setFolioNumber] = useState('');
  const [units, setUnits] = useState('');
  const [nav, setNav] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fundToEdit) {
      setName(fundToEdit.name || '');
      setCategory(fundToEdit.category || 'Equity');
      setInvestedAmount(String(fundToEdit.investedAmount || ''));
      setCurrentValue(String(fundToEdit.currentValue || ''));
      setSipAmount(fundToEdit.sipAmount ? String(fundToEdit.sipAmount) : '');
      setSipDate(fundToEdit.sipDate ? String(fundToEdit.sipDate) : '10');
      setFolioNumber(fundToEdit.folioNumber || '');
      setUnits(fundToEdit.units ? String(fundToEdit.units) : '');
      setNav(fundToEdit.nav ? String(fundToEdit.nav) : '');
      setNotes(fundToEdit.notes || '');
    } else {
      setName('');
      setCategory('Equity');
      setInvestedAmount('');
      setCurrentValue('');
      setSipAmount('');
      setSipDate('10');
      setFolioNumber('');
      setUnits('');
      setNav('');
      setNotes('');
    }
  }, [fundToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !investedAmount) return;

    setIsSubmitting(true);
    try {
      const invNum = parseFloat(investedAmount) || 0;
      const curNum = currentValue ? parseFloat(currentValue) : invNum;
      const sipNum = sipAmount ? parseFloat(sipAmount) : undefined;
      const sipDayNum = sipDate ? parseInt(sipDate, 10) : undefined;
      const unitsNum = units ? parseFloat(units) : undefined;
      const navNum = nav ? parseFloat(nav) : undefined;

      if (fundToEdit) {
        await updateMutualFund(fundToEdit.id, {
          name: name.trim(),
          category,
          investedAmount: invNum,
          currentValue: curNum,
          sipAmount: sipNum,
          sipDate: sipDayNum,
          folioNumber: folioNumber.trim() || undefined,
          units: unitsNum,
          nav: navNum,
          notes: notes.trim() || undefined
        });
      } else {
        await addMutualFund({
          name: name.trim(),
          category,
          investedAmount: invNum,
          currentValue: curNum,
          sipAmount: sipNum,
          sipDate: sipDayNum,
          folioNumber: folioNumber.trim() || undefined,
          units: unitsNum,
          nav: navNum,
          notes: notes.trim() || undefined
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const invVal = parseFloat(investedAmount) || 0;
  const curVal = parseFloat(currentValue) || invVal;
  const returnsVal = curVal - invVal;
  const returnsPerc = invVal > 0 ? ((returnsVal / invVal) * 100).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        id="mutual-fund-modal-content"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {fundToEdit ? 'Edit Mutual Fund' : 'Add Mutual Fund'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track NAV, SIP schedules, invested corpus & returns
              </p>
            </div>
          </div>
          <button
            id="close-mf-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Fund Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Fund Name *
            </label>
            <input
              id="mf-name-input"
              type="text"
              required
              placeholder="e.g. Parag Parikh Flexi Cap Fund - Direct Growth"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Fund Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Category / Asset Class
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MF_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Invested Amount & Current Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Invested Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {currency}
                </span>
                <input
                  id="mf-invested-input"
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="100000"
                  value={investedAmount}
                  onChange={(e) => setInvestedAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Current Value ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {currency}
                </span>
                <input
                  id="mf-current-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder={investedAmount || '125000'}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Live Gain Preview Pill */}
          {invVal > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Estimated Return:</span>
              <span
                className={`font-mono font-bold ${
                  returnsVal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {returnsVal >= 0 ? '+' : ''}{currency}{returnsVal.toLocaleString('en-IN')} ({returnsVal >= 0 ? '+' : ''}{returnsPerc}%)
              </span>
            </div>
          )}

          {/* Monthly SIP settings */}
          <div className="p-3.5 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                Monthly SIP (Systematic Investment Plan)
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  SIP Amount ({currency}/mo)
                </label>
                <input
                  id="mf-sip-input"
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  SIP Execution Day
                </label>
                <select
                  id="mf-sip-day-select"
                  value={sipDate}
                  onChange={(e) => setSipDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of month
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Folio / Units / NAV / Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Folio Number
              </label>
              <input
                type="text"
                placeholder="10849204/92"
                value={folioNumber}
                onChange={(e) => setFolioNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Units Held
              </label>
              <input
                type="number"
                step="any"
                placeholder="1200.50"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                NAV ({currency})
              </label>
              <input
                type="number"
                step="any"
                placeholder="85.40"
                value={nav}
                onChange={(e) => setNav(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. For retirement corpus, long term holding"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              id="save-mf-btn"
              type="submit"
              disabled={isSubmitting || !name.trim() || !investedAmount}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : fundToEdit ? 'Update Fund' : 'Add Mutual Fund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
