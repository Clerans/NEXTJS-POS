import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { usePOSStore } from '../store/usePOSStore';
import { Printer } from 'lucide-react';
import { settingsService } from '@/services/api/settingsService';

export const ReceiptDialog: React.FC = () => {
  const { isReceiptOpen, currentReceiptOrder, closeReceipt } = usePOSStore();
  const [receiptHeader, setReceiptHeader] = useState<string>('NEXUSPOS SYSTEM');
  const [receiptFooter, setReceiptFooter] = useState<string>('Thank you for visiting!');

  useEffect(() => {
    if (isReceiptOpen) {
      settingsService.getSettings().then((s) => {
        if (s) {
          if (s.receiptHeader) setReceiptHeader(s.receiptHeader);
          if (s.receiptFooter) setReceiptFooter(s.receiptFooter);
        }
      }).catch(() => {});
    }
  }, [isReceiptOpen]);

  if (!currentReceiptOrder) return null;

  return (
    <Dialog isOpen={isReceiptOpen} onClose={closeReceipt} title="Receipt" maxWidth="max-w-sm">
      <div className="text-left font-mono text-xs p-3 bg-gray-50 rounded-lg space-y-2 border">
        <div className="text-center font-bold text-sm mb-1">{receiptHeader}</div>
        <div className="text-center text-[10px] text-gray-500 border-b pb-2 mb-2">
          Order #{currentReceiptOrder.id} · {currentReceiptOrder.type}
        </div>
        {currentReceiptOrder.items.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{item}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2 space-y-1">
          <div className="flex justify-between font-bold text-sm">
            <span>Total Paid:</span>
            <span>Rs. {currentReceiptOrder.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-center text-[10px] text-gray-600 mt-4 border-t pt-2 font-medium">
          {receiptFooter}
        </div>
      </div>

      <div className="flex gap-2 justify-center mt-4">
        <Button variant="outline" onClick={closeReceipt}>
          Close
        </Button>
        <Button variant="orange" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>
    </Dialog>
  );
};
