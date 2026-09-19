import React, { useState, useEffect } from 'react';
import { Unit } from '@/types/unit.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddUnitDialog } from './components/AddUnitDialog';
import { productsService } from '@/services/api/productsService';
import { Plus, Eye, SquarePen, Trash2, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';

export const UnitsPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await productsService.getUnits();
      setUnits(data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch units of measurement');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const total = units.length;
  const active = units.filter((u) => u.status === 'Active').length;
  const inactive = total - active;
  const typesCount = new Set(units.map((u) => u.type)).size;

  const filteredUnits = units.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.abbr.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddUnit = (newUnit: Unit) => {
    setUnits((prev) => [...prev, newUnit]);
    fetchUnits();
  };

  const handleDeleteUnit = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete unit "${name}"?`)) return;
    try {
      await productsService.deleteUnit(id);
      setUnits((prev) => prev.filter((u) => u.id !== id));
      toast.info(`Unit "${name}" deleted`);
      fetchUnits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to delete ${name}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Units of Measurement</h1>
          <div className="page-sub">Manage units for raw materials and products</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setIsDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="card">
          <div className="stat-label">Total Units</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="card">
          <div className="stat-label">Active Units</div>
          <div className="stat-value text-green-600">{active}</div>
        </div>
        <div className="card">
          <div className="stat-label">Inactive Units</div>
          <div className="stat-value text-gray-500">{inactive}</div>
        </div>
        <div className="card">
          <div className="stat-label">Unit Types</div>
          <div className="stat-value">{typesCount}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">All Units</div>
          <div className="text-xs text-textGray">
            Showing {filteredUnits.length} of {units.length} units
          </div>
        </div>

        {/* Filters Grid */}
        <div className="filters-grid">
          <input
            className="input"
            placeholder="Search unit name or abbreviation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select w-full"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Quantity">Quantity</option>
            <option value="Weight">Weight</option>
            <option value="Volume">Volume</option>
          </select>
          <select
            className="select w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading units of measurement...
          </div>
        ) : filteredUnits.length === 0 ? (
          <EmptyState
            title="No Units Found"
            description="No measurement units configured."
            icon={<Scale className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Abbreviation</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUnits.map((item) => {
                let typeBadge: 'orange' | 'green' | 'purple' = 'purple';
                if (item.type === 'Quantity') typeBadge = 'orange';
                if (item.type === 'Weight') typeBadge = 'green';

                return (
                  <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{item.icon || '📏'}</span> {item.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.abbr}</td>
                    <td className="py-3 px-4">
                      <Badge variant={typeBadge}>{item.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.status === 'Active' ? 'green' : 'gray'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                        title="View"
                        onClick={() => toast.info(`Viewing ${item.name} (${item.abbr})`)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                        title="Edit"
                        onClick={() => toast.info(`Editing ${item.name}`)}
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                        title="Delete"
                        onClick={() => handleDeleteUnit(item.id, item.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddUnitDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddUnit={handleAddUnit}
      />
    </div>
  );
};
