import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { SaleOrder } from '@/types/sales.types';
import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/app/router/routes';
import { posService } from '@/services/api/posService';
import { Plus, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

export const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchSales = async (query?: string) => {
    try {
      const orders = await posService.getSalesOrders(query);
      if (orders && orders.length > 0) {
        setSales(orders);
      }
    } catch (err) {
      console.warn('Falling back to local sales data', err);
    }
  };

  useEffect(() => {
    fetchSales(searchQuery);
  }, [searchQuery]);

  const handleViewOrder = async (orderNo: string) => {
    try {
      const details = await posService.getSalesOrderById(orderNo);
      if (details) {
        setSelectedOrder(details);
      } else {
        toast.info(`Viewing order ${orderNo}`);
      }
    } catch (err) {
      toast.info(`Viewing order ${orderNo}`);
    }
  };

  const columns: ColumnDef<SaleOrder>[] = [
    {
      accessorKey: 'id',
      header: 'Order No',
      cell: ({ row }) => (
        <span className="font-bold text-teal-900">{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="purple">{row.original.type}</Badge>,
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-bold">Rs. {row.original.total.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'Completed' ? 'green' : row.original.status === 'Cancelled' ? 'red' : 'yellow'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="actions-cell">
          <button
            className="act-btn"
            title="View Order"
            onClick={() => handleViewOrder(row.original.id)}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Sales</h1>
          <div className="page-sub">Track and manage all sales transactions</div>
        </div>
        <Button
          variant="orange"
          onClick={() => navigate(ROUTES.POS)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Sale
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Sales History</div>
          <input
            className="input w-56"
            placeholder="Search order no. or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={sales}
          globalFilter={searchQuery}
          emptyTitle="No sales orders found"
        />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-border">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-textDark">Order Details: {selectedOrder.orderNo}</h3>
                <p className="text-xs text-textGray">Cashier: {selectedOrder.cashierName} | Customer: {selectedOrder.customerName}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-textGray hover:text-textDark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="text-xs font-semibold text-textGray uppercase border-b pb-1">Items Breakdown</div>
              {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/40">
                  <span className="font-medium">{item.productName} (x{item.quantity})</span>
                  <span className="font-bold">Rs. {item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>Rs. {selectedOrder.discountAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax & Service:</span>
                <span>Rs. {(selectedOrder.taxAmount + selectedOrder.serviceCharge)?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t">
                <span>Total Amount:</span>
                <span className="text-teal-900">Rs. {selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
