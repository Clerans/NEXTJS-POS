import React, { useState, useEffect } from 'react';
import { tablesService, DiningTable, CreateDiningTablePayload, UpdateDiningTablePayload } from '@/services/api/tablesService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddTableDialog } from './components/AddTableDialog';
import { Plus, Eye, Pencil, Trash2, Users, Check, MapPin, ToggleRight, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

export const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [viewTable, setViewTable] = useState<DiningTable | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DiningTable | null>(null);

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTables = async () => {
    setLoading(true);
    try {
      const data = await tablesService.getAll();
      setTables(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch dining tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filtered = tables.filter((item) => {
    const matchesSearch = item.tableNumber.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === 'All' || (item.branchName || '').toLowerCase().includes(branchFilter.toLowerCase());
    const matchesAvail = availFilter === 'All' || item.availability === availFilter;
    const itemStatus = item.isActive !== false ? 'Active' : 'Inactive';
    const matchesStatus = statusFilter === 'All' || itemStatus === statusFilter;
    return matchesSearch && matchesBranch && matchesAvail && matchesStatus;
  });

  const handleSaveTable = async (payload: CreateDiningTablePayload | UpdateDiningTablePayload) => {
    setSaving(true);
    try {
      if (selectedTable) {
        await tablesService.update(selectedTable.id, payload);
        toast.success(`Table #${payload.tableNumber} updated successfully`);
      } else {
        await tablesService.create(payload as CreateDiningTablePayload);
        toast.success(`Table #${payload.tableNumber} created successfully`);
      }
      await fetchTables();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save dining table');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (table: DiningTable) => {
    const nextAvail = table.availability === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    try {
      await tablesService.updateAvailability(table.id, nextAvail);
      toast.success(`Table #${table.tableNumber} status updated to ${nextAvail}`);
      await fetchTables();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update table status');
    }
  };

  const handleDeleteTable = async () => {
    if (!deleteConfirm) return;
    try {
      await tablesService.delete(deleteConfirm.id);
      toast.success(`Table #${deleteConfirm.tableNumber} deleted successfully`);
      setDeleteConfirm(null);
      await fetchTables();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete dining table');
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Tables</h1>
          <div className="page-sub">Outlet floor plan table assignment and availability</div>
        </div>
        <Button
          variant="orange"
          onClick={() => {
            setSelectedTable(null);
            setIsDialogOpen(true);
          }}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Table
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Dining Floor Tables</div>
          <div className="text-xs text-textGray">
            Showing {filtered.length} of {tables.length} tables
          </div>
        </div>

        <div className="filters-grid four">
          <input
            className="input"
            placeholder="Search table number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select w-full"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Branches</option>
            <option value="Malabe">Malabe</option>
            <option value="Colombo">Colombo Main</option>
          </select>
          <select
            className="select w-full"
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value)}
          >
            <option value="All">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
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
            Loading dining floor tables...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Dining Tables Found"
            description="No dining floor tables have been created for this outlet yet."
            icon={<LayoutGrid className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Table #</th>
                <th className="py-3 px-4">Seating Capacity</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((item) => {
                const isAvail = item.availability === 'AVAILABLE';

                return (
                  <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900"># {item.tableNumber}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.capacity} Seats</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={isAvail ? 'green' : 'red'}>
                        {isAvail ? <Check className="w-3 h-3" /> : null}{' '}
                        {isAvail ? 'Available' : 'Occupied'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.branchName || `Branch #${item.branchId}`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.isActive !== false ? 'green' : 'gray'}>
                        {item.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                        title="View Table Details"
                        onClick={() => setViewTable(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-teal-600 inline-flex items-center"
                        title="Toggle Availability"
                        onClick={() => handleToggleAvailability(item)}
                      >
                        <ToggleRight className="w-4 h-4 text-teal-600" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                        title="Edit Table"
                        onClick={() => {
                          setSelectedTable(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                        title="Delete Table"
                        onClick={() => setDeleteConfirm(item)}
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

      {/* Add / Edit Table Dialog */}
      <AddTableDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTable}
        initialData={selectedTable}
        loading={saving}
      />

      {/* View Table Details Modal */}
      {viewTable && (
        <Dialog
          isOpen={!!viewTable}
          onClose={() => setViewTable(null)}
          title={`Table Details — #${viewTable.tableNumber}`}
        >
          <div className="space-y-3 text-sm pt-1">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Table Number:</span>
              <span className="font-bold text-gray-900"># {viewTable.tableNumber}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Branch Location:</span>
              <span className="font-semibold text-gray-800">
                {viewTable.branchName || `Branch #${viewTable.branchId}`}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Seating Capacity:</span>
              <span className="text-gray-900">{viewTable.capacity} seats</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Current Availability:</span>
              <Badge variant={viewTable.availability === 'AVAILABLE' ? 'green' : 'red'}>
                {viewTable.availability === 'AVAILABLE' ? 'Available' : 'Occupied'}
              </Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Master Data Status:</span>
              <Badge variant={viewTable.isActive !== false ? 'green' : 'gray'}>
                {viewTable.isActive !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setViewTable(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Confirm Delete Dialog */}
      {deleteConfirm && (
        <Dialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete Table"
        >
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete table{' '}
              <strong className="text-gray-900">#{deleteConfirm.tableNumber}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleDeleteTable} className="bg-red-600 hover:bg-red-700">
                Delete Table
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
