import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/api/inventoryService';
import { Badge } from '@/components/ui/Badge';
import { Box, Building2 } from 'lucide-react';

interface AlertDisplayItem {
  item: string;
  code: string;
  current: number;
  required: number;
  status: string;
  branch: string;
}

export const StockAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertDisplayItem[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');

  const loadAlerts = async () => {
    try {
      const data = await inventoryService.getAlerts(branchFilter);
      if (data && Array.isArray(data)) {
        const mapped = data.map((a) => ({
          item: a.name,
          code: a.code,
          current: a.currentStock,
          required: a.reorderLevel,
          status: a.alertType === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock',
          branch: 'Colombo Main Outlet',
        }));
        setAlerts(mapped);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [branchFilter]);

  const filtered = alerts.filter((item) => {
    const matchesSearch =
      item.item.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === 'All' || item.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Stock Alerts</h1>
        <div className="page-sub">Low stock warnings and reorder threshold notifications</div>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Active Stock Alerts</div>
          <div className="text-xs text-textGray">
            Showing {filtered.length} of {alerts.length} stock alerts
          </div>
        </div>

        <div className="filters-grid two">
          <input
            className="input"
            placeholder="Search item or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select w-full"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Branches</option>
            <option value="Colombo Main Outlet">Colombo Main Outlet</option>
            <option value="Malabe">Malabe</option>
            <option value="Hyde Park Corner">Hyde Park Corner</option>
          </select>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Item / Code</th>
              <th>Current Stock</th>
              <th>Required Level</th>
              <th>Status</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-patina-light/50 transition-colors">
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Box className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{item.item}</div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {item.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="font-bold text-gray-900">{item.current}</td>
                  <td className="text-xs text-gray-500">{item.required}</td>
                  <td>
                    <Badge variant="red">{item.status}</Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.branch}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-textGray">
                  No stock alerts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
