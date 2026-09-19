import React, { useState, useEffect } from 'react';
import { Supplier } from '@/types/supplier.types';
import { suppliersService } from '@/services/api/suppliersService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddSupplierDialog } from './components/AddSupplierDialog';
import { Plus, Eye, SquarePen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersService.getAll();
      if (data && data.length > 0) {
        const mapped = data.map((s) => ({
          name: s.name,
          contact: s.contactPerson || 'N/A',
          phone: s.phone,
          branch: 'Colombo Central',
          status: 'Active' as 'Active' | 'Inactive',
        }));
        setSuppliers(mapped);
      }
    } catch {
      // Keep fallback
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleAddSupplier = async (newSup: Supplier) => {
    try {
      await suppliersService.create({
        code: `SUP-${Date.now().toString().slice(-4)}`,
        name: newSup.name,
        contactPerson: newSup.contact,
        phone: newSup.phone,
      });
      toast.success('Supplier added successfully to database');
      await loadSuppliers();
    } catch {
      setSuppliers((prev) => [...prev, newSup]);
      toast.success('Supplier added to list');
    }
  };

  const handleDelete = (name: string) => {
    setSuppliers((prev) => prev.filter((s) => s.name !== name));
    toast.info('Supplier removed');
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <div className="page-sub">Vendor directory and contact details</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setIsDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Suppliers Directory</div>
          <div className="text-xs text-textGray">Total Vendors: {suppliers.length}</div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, idx) => (
              <tr key={idx} className="hover:bg-patina-light/50 transition-colors">
                <td className="font-bold">{s.name}</td>
                <td>{s.contact}</td>
                <td>{s.phone}</td>
                <td>{s.branch}</td>
                <td>
                  <Badge variant="green">{s.status}</Badge>
                </td>
                <td className="actions-cell">
                  <button
                    className="act-btn"
                    title="View"
                    onClick={() => toast.info(`Viewing ${s.name}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="act-btn"
                    title="Edit"
                    onClick={() => toast.info(`Editing ${s.name}`)}
                  >
                    <SquarePen className="w-4 h-4" />
                  </button>
                  <button
                    className="act-btn act-delete"
                    title="Delete"
                    onClick={() => handleDelete(s.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddSupplierDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddSupplier={handleAddSupplier}
      />
    </div>
  );
};
