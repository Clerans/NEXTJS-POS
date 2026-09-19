import React, { useEffect, useState } from 'react';
import { settingsService, SystemSettings, AuditLogRecord } from '@/services/api/settingsService';
import { Button } from '@/components/ui/Button';
import { Save, ShieldCheck, History, Store, Receipt, Percent, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // System Settings state
  const [storeName, setStoreName] = useState<string>('NEXUSPOS Store');
  const [taxPercentage, setTaxPercentage] = useState<number>(10);
  const [currencySymbol, setCurrencySymbol] = useState<string>('Rs.');
  const [receiptHeader, setReceiptHeader] = useState<string>('Welcome to NEXUSPOS - Premium Coffee & Bakery');
  const [receiptFooter, setReceiptFooter] = useState<string>('Thank you for visiting! Please come again.');
  const [isNegativeStockAllowed, setIsNegativeStockAllowed] = useState<boolean>(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    setAuditLoading(true);

    try {
      const settings = await settingsService.getSettings();
      if (settings) {
        setStoreName(settings.storeName || 'NEXUSPOS Store');
        setTaxPercentage(Number(settings.taxPercentage) || 0);
        setCurrencySymbol(settings.currencySymbol || 'Rs.');
        setReceiptHeader(settings.receiptHeader || 'Welcome to NEXUSPOS');
        setReceiptFooter(settings.receiptFooter || 'Thank you for your visit');
        setIsNegativeStockAllowed(!!settings.isNegativeStockAllowed);
      }
    } catch (err: any) {
      toast.error('Could not load store settings from server');
    } finally {
      setLoading(false);
    }

    try {
      const logs = await settingsService.getAuditLogs();
      setAuditLogs(logs || []);
    } catch {
      // Fallback
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<SystemSettings> = {
        storeName,
        taxPercentage,
        currencySymbol,
        receiptHeader,
        receiptFooter,
        isNegativeStockAllowed,
      };

      await settingsService.updateSettings(payload);
      toast.success('System settings saved successfully!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Settings & System Audit</h1>
          <div className="page-sub">Configure store defaults, receipt formatting, and view security audit logs</div>
        </div>
        <Button variant="outline" onClick={loadData} className="flex items-center gap-1.5 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings Form */}
        <div className="card space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-patina" /> Store & Tax Configuration
            </h2>
            {loading && <span className="text-xs text-textGray">Loading settings...</span>}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="field">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                className="input w-full"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-gray-400" /> Tax Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input w-full"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  disabled={loading || saving}
                />
              </div>

              <div className="field">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Currency Symbol</label>
                <input
                  className="input w-full"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  disabled={loading || saving}
                />
              </div>
            </div>

            <div className="field">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-gray-400" /> Receipt Header Line
              </label>
              <input
                className="input w-full"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="field">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-gray-400" /> Receipt Footer Line
              </label>
              <input
                className="input w-full"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <input
                type="checkbox"
                id="allowNegative"
                checked={isNegativeStockAllowed}
                onChange={(e) => setIsNegativeStockAllowed(e.target.checked)}
                disabled={loading || saving}
                className="rounded border-gray-300 text-patina focus:ring-patina"
              />
              <label htmlFor="allowNegative" className="text-xs text-gray-700 font-medium">
                Allow Negative Stock Overdraw
              </label>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="orange" type="submit" disabled={loading || saving} className="btn-orange flex items-center gap-1.5">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>

        {/* Security Audit Log Viewer */}
        <div className="card space-y-4 flex flex-col">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <History className="w-4 h-4 text-patina" /> Security & Activity Audit Log
            </h2>
            <span className="text-xs text-textGray">Total Logs: {auditLogs.length}</span>
          </div>

          {auditLoading ? (
            <div className="py-12 text-center text-textGray font-medium text-xs">
              Loading audit logs...
            </div>
          ) : auditLogs.length === 0 ? (
            <EmptyState
              title="No Audit Logs"
              description="No system activity or audit logs recorded yet."
              icon={<ShieldCheck className="w-8 h-8 text-patina" />}
            />
          ) : (
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-patina-light/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-gray-900">{log.username || `User #${log.userId}`}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[11px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
