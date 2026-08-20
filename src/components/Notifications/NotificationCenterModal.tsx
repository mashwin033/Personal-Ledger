import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Repeat,
  X,
  Volume2,
  Check,
  Smartphone
} from 'lucide-react';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    notifications,
    markNotificationRead,
    user,
    updateUserPreferences,
    testDailyReminder,
    showToast
  } = useApp();

  const [reminderEnabled, setReminderEnabled] = useState(user.reminderEnabled !== false);
  const [reminderTime, setReminderTime] = useState(user.reminderTime || '21:00');
  const [isSaving, setIsSaving] = useState(false);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  if (!isNotificationCenterOpen) return null;

  const requestDevicePermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPerm(perm);
        if (perm === 'granted') {
          showToast('Device notification bar alerts enabled!', 'success');
          new Notification('Personal Ledger', {
            body: 'Device notification bar alerts are active! You will receive your daily expense reminders here.',
            icon: '/favicon.ico'
          });
        } else if (perm === 'denied') {
          showToast('Notifications blocked in browser settings. Please enable them to receive status bar alerts.', 'warning');
        }
      } catch (e) {
        showToast('Error requesting notification permission', 'error');
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences({
        reminderEnabled,
        reminderTime
      });
      showToast('Notification settings saved', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Notifications & Reminders
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={() => markNotificationRead('all')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsNotificationCenterOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 9:00 PM Daily Reminder Settings Card */}
        <div className="p-6 space-y-5">
          {/* Device Notification Bar Integration Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Device Notification Bar / Status Shade
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Show alerts directly in your phone or PC's system notification tray
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  browserPerm === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : browserPerm === 'denied'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                }`}
              >
                {browserPerm === 'granted' ? 'Active' : browserPerm === 'denied' ? 'Blocked' : 'Needs Permission'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {browserPerm === 'granted'
                  ? 'System notifications are allowed. Reminders will pop up in your notification bar.'
                  : browserPerm === 'denied'
                  ? 'Notifications are blocked in your browser. Click the lock/settings icon in the address bar to allow.'
                  : 'Click enable to allow Personal Ledger to send notifications to your device status bar.'}
              </p>
              {browserPerm !== 'granted' && (
                <button
                  onClick={requestDevicePermission}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Enable Device Notifications
                </button>
              )}
            </div>
          </div>

          {/* Daily Schedule Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Daily Expense Reminder
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    "Don't forget to add today's expenses."
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {reminderEnabled && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Reminder Time (Local):
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-2 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={testDailyReminder}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Test 9:00 PM Alert
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  >
                    Save Time
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* In-App Notifications Feed */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Alerts & Insights ({notifications.length})
            </h4>

            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  let Icon = Bell;
                  let iconColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60';
                  if (notif.type === 'budget_exceeded') {
                    Icon = ShieldAlert;
                    iconColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/60';
                  } else if (notif.type === 'budget_warning') {
                    Icon = AlertTriangle;
                    iconColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/60';
                  } else if (notif.type === 'bill_due') {
                    Icon = Repeat;
                    iconColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60';
                  } else if (notif.type === 'daily_reminder') {
                    Icon = Clock;
                    iconColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60';
                  }

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        notif.read
                          ? 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 opacity-75'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                            {notif.title}
                          </h5>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No notifications right now.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={() => setIsNotificationCenterOpen(false)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
