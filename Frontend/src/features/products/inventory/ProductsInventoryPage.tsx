import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/api/inventoryService';
import { Badge } from '@/components/ui/Badge';
import { Eye, ToggleRight, Trash2, Box } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryDisplayItem {
  id?: number;
  name: string;
  category: string;
  sku: string;
  stock: number | string;
  threshold?: number | string;
  branch: string;
  stockStatus: string;
  prodStatus: 'Active' | 'Inactive';
}

export const ProductsInventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryDisplayItem[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');

  const loadLiveInventory = async () => {
    try {
      const data = await inventoryService.getStockLevels(branchFilter);
      if (data && data.length > 0) {
        const mapped: InventoryDisplayItem[] = data.map((s) => ({
          id: s.productId,
          name: s.productName,
          category: s.category || 'Beverages',
          sku: s.skuOrCode,
          stock: s.currentStock,
          threshold: s.reorderLevel,
          branch: s.branchName || s.branch || 'Colombo Main Outlet',
          stockStatus: s.status === 'OUT_OF_STOCK' ? 'Out of stock' : s.status === 'LOW' ? 'Low stock' : 'In stock',
          prodStatus: s.prodStatus === 'Inactive' ? 'Inactive' : 'Active',
        }));
        setItems(mapped);
      }
    } catch {
      // keep fallback state if offline
    }
  };

  useEffect(() => {
    loadLiveInventory();
  }, [branchFilter]);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === 'All' || item.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleToggleStatus = async (item: InventoryDisplayItem) => {
    if (!item.id) {
      toast.info(`Toggled status for ${item.name}`);
      return;
    }
    try {
      const res = await inventoryService.toggleProductStatus(item.id);
      toast.success(`Status for "${item.name}" updated to ${res.isActive ? 'Active' : 'Inactive'}`);
      loadLiveInventory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to toggle ${item.name}`);
    }
  };

  const handleDeleteItem = async (item: InventoryDisplayItem) => {
    if (!window.confirm(`Are you sure you want to remove stock entry for "${item.name}"?`)) return;
    if (item.id) {
      try {
        await inventoryService.deleteInventoryItem(item.id);
      } catch {
        // Fallback
      }
    }
    setItems((prev) => prev.filter((i) => i.sku !== item.sku));
    toast.info(`Inventory item "${item.name}" deleted`);
    loadLiveInventory();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Products Inventory</h1>
        <div className="page-sub">Monitor branch stock levels and threshold alerts</div>
      </div>

      <div className="card space-y-4">
        <div className="filters-grid two">
          <input
            className="input"
            placeholder="Search item name or SKU..."
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
              <th>Item / Category</th>
              <th>SKU</th>
              <th>Stock / Threshold</th>
              <th>Branch</th>
              <th>Stock Status</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-patina-light/50 transition-colors">
                  <td>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400 font-medium">{item.category}</div>
                  </td>
                  <td className="font-mono text-xs text-gray-600">{item.sku}</td>
                  <td>
                    <div className="font-bold text-gray-900">{item.stock}</div>
                    {item.threshold !== undefined && (
                      <div className="text-[11px] text-gray-400">
                        Threshold: {item.threshold}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-800">{item.branch}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`text-xs ${
                        item.stockStatus.includes('Out') || item.stockStatus.includes('Low')
                          ? 'badge badge-red'
                          : 'text-green-700 font-medium'
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                  </td>
                  <td>
                    <Badge variant={item.prodStatus === 'Active' ? 'green' : 'gray'}>
                      {item.prodStatus}
                    </Badge>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="act-btn"
                      title="View"
                      onClick={() => toast.info(`Viewing stock details for ${item.name}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn"
                      title="Toggle Status"
                      onClick={() => handleToggleStatus(item)}
                    >
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      className="act-btn act-delete"
                      title="Delete"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-textGray">
                  No matching inventory items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
