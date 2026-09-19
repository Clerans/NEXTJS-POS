import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePOSStore } from '../store/usePOSStore';
import { posService, KDSOrderTicket } from '@/services/api/posService';
import { Coffee, Play, CheckCircle2, CheckSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const BaristaKDSModal: React.FC = () => {
  const { isBaristaKdsOpen, closeBaristaKds } = usePOSStore();
  const [tickets, setTickets] = useState<KDSOrderTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchKdsTickets = useCallback(async () => {
    try {
      const data = await posService.getKdsOrders();
      setTickets(data);
    } catch {
      // Ignore background refresh errors gracefully
    }
  }, []);

  useEffect(() => {
    if (!isBaristaKdsOpen) return;

    setLoading(true);
    fetchKdsTickets().finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchKdsTickets();
    }, 4000);

    return () => clearInterval(interval);
  }, [isBaristaKdsOpen, fetchKdsTickets]);

  const handleAdvanceStatus = async (ticket: KDSOrderTicket) => {
    let nextStatus: 'PREPARING' | 'READY' | 'SERVED';
    let actionLabel = '';

    if (ticket.kdsStatus === 'RECEIVED') {
      nextStatus = 'PREPARING';
      actionLabel = 'Prep started';
    } else if (ticket.kdsStatus === 'PREPARING') {
      nextStatus = 'READY';
      actionLabel = 'Marked ready';
    } else {
      nextStatus = 'SERVED';
      actionLabel = 'Served';
    }

    setUpdatingId(ticket.orderId);

    // Optimistic state update
    setTickets((prev) =>
      prev
        .map((t) => (t.orderId === ticket.orderId ? { ...t, kdsStatus: nextStatus } : t))
        .filter((t) => t.kdsStatus !== 'SERVED')
    );

    try {
      await posService.updateKdsOrderStatus(ticket.orderId, nextStatus);
      toast.success(`Ticket ${ticket.orderNo}: ${actionLabel}`);
      fetchKdsTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to update ticket ${ticket.orderNo}`);
      fetchKdsTickets();
    } finally {
      setUpdatingId(null);
    }
  };

  const receivedTickets = tickets.filter((t) => t.kdsStatus === 'RECEIVED');
  const preparingTickets = tickets.filter((t) => t.kdsStatus === 'PREPARING');
  const readyTickets = tickets.filter((t) => t.kdsStatus === 'READY');

  return (
    <Dialog
      isOpen={isBaristaKdsOpen}
      onClose={closeBaristaKds}
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <span className="flex items-center gap-2 text-base font-bold">
            <Coffee className="w-5 h-5 text-patina" /> Barista Kitchen Display System (KDS)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchKdsTickets}
            disabled={loading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      }
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[420px] max-h-[75vh] overflow-y-auto pr-1">
        {/* Column 1: Received */}
        <div className="space-y-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Received ({receivedTickets.length})
            </span>
            <Badge variant="orange">New</Badge>
          </div>

          {receivedTickets.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400 font-medium">No new orders</div>
          ) : (
            receivedTickets.map((t) => (
              <div key={t.orderId} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-teal-950 font-mono">{t.orderNo}</span>
                  <span className="text-[11px] font-semibold text-gray-500">{t.orderType}</span>
                </div>
                <div className="space-y-1">
                  {t.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-800 font-medium flex justify-between">
                      <span>{item.productName}</span>
                      <span className="font-bold text-teal-900">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Button
                    size="sm"
                    variant="orange"
                    disabled={updatingId === t.orderId}
                    onClick={() => handleAdvanceStatus(t)}
                    className="w-full text-xs font-bold py-1.5"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" /> Start Prep
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
          <div className="flex justify-between items-center pb-2 border-b border-amber-200">
            <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Preparing ({preparingTickets.length})
            </span>
            <Badge variant="orange">In Progress</Badge>
          </div>

          {preparingTickets.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400 font-medium">No orders in preparation</div>
          ) : (
            preparingTickets.map((t) => (
              <div key={t.orderId} className="p-3 bg-white border border-amber-200 rounded-xl shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-amber-950 font-mono">{t.orderNo}</span>
                  <span className="text-[11px] font-semibold text-amber-800">{t.orderType}</span>
                </div>
                <div className="space-y-1">
                  {t.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-800 font-medium flex justify-between">
                      <span>{item.productName}</span>
                      <span className="font-bold text-amber-900">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    disabled={updatingId === t.orderId}
                    onClick={() => handleAdvanceStatus(t)}
                    className="w-full text-xs font-bold py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Ready
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 3: Ready */}
        <div className="space-y-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
            <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ready for Pickup ({readyTickets.length})
            </span>
            <Badge variant="green">Done</Badge>
          </div>

          {readyTickets.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400 font-medium">No orders ready</div>
          ) : (
            readyTickets.map((t) => (
              <div key={t.orderId} className="p-3 bg-white border border-emerald-200 rounded-xl shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-emerald-950 font-mono">{t.orderNo}</span>
                  <span className="text-[11px] font-semibold text-emerald-800">{t.orderType}</span>
                </div>
                <div className="space-y-1">
                  {t.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-800 font-medium flex justify-between">
                      <span>{item.productName}</span>
                      <span className="font-bold text-emerald-900">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    disabled={updatingId === t.orderId}
                    onClick={() => handleAdvanceStatus(t)}
                    className="w-full text-xs font-bold py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1" /> Complete / Serve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
};
