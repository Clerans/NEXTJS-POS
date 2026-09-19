"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Coffee, Clock, CheckCircle2, Flame, User } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

interface KdsTicket {
  id: string;
  orderNo: string;
  table: string;
  type: string;
  items: { name: string; qty: number; notes?: string }[];
  status: "RECEIVED" | "PREPARING" | "READY" | "SERVED";
  time: string;
}

const initialTickets: KdsTicket[] = [
  {
    id: "ORD-20260803-014",
    orderNo: "ORD-014",
    table: "Table T-02 (Window)",
    type: "Dine-In",
    items: [
      { name: "Caffe Latte (Large)", qty: 2, notes: "Oat milk sub for 1" },
      { name: "Artisan Butter Croissant", qty: 1, notes: "Warmed" },
    ],
    status: "PREPARING",
    time: "10:45 AM",
  },
  {
    id: "ORD-20260803-013",
    orderNo: "ORD-013",
    table: "Takeaway",
    type: "Take Away",
    items: [
      { name: "Iced Caramel Macchiato", qty: 1, notes: "Extra caramel drizzle" },
      { name: "Spicy Tuna Melt Panini", qty: 1, notes: "Extra toasted" },
    ],
    status: "RECEIVED",
    time: "10:32 AM",
  },
  {
    id: "ORD-20260803-012",
    orderNo: "ORD-012",
    table: "VIP-A Lounge",
    type: "Dine-In",
    items: [
      { name: "Signature Cappuccino", qty: 4, notes: "Cinnamon dusting" },
      { name: "Warm Lava Chocolate Brownie", qty: 4, notes: "With vanilla gelato" },
    ],
    status: "READY",
    time: "10:15 AM",
  },
];

interface BaristaKdsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BaristaKdsModal: React.FC<BaristaKdsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tickets, setTickets] = useState<KdsTicket[]>(initialTickets);

  const updateStatus = (id: string, newStatus: KdsTicket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    toast.success(`Order ${id} marked as ${newStatus}`);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Barista & Kitchen Display System (KDS)"
      description="Live kitchen order workflow and prep status"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Ticket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const isPreparing = ticket.status === "PREPARING";
            const isReady = ticket.status === "READY";
            const isReceived = ticket.status === "RECEIVED";

            return (
              <div
                key={ticket.id}
                className="bg-white border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <div>
                      <span className="font-extrabold text-sm text-text-dark">
                        {ticket.orderNo}
                      </span>
                      <span className="text-[10px] text-text-gray block">
                        {ticket.table}
                      </span>
                    </div>
                    <Badge
                      variant={
                        isReady ? "green" : isPreparing ? "orange" : "blue"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 py-1">
                    {ticket.items.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center justify-between font-bold text-text-dark">
                          <span>{item.name}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-patina font-extrabold">
                            x{item.qty}
                          </span>
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-amber-700 italic bg-amber-50 rounded px-2 py-0.5 mt-0.5">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Switcher Action */}
                <div className="border-t border-border pt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-text-gray">
                    <Clock className="w-3 h-3" /> {ticket.time}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isReceived && (
                      <Button
                        size="sm"
                        variant="orange"
                        onClick={() => updateStatus(ticket.id, "PREPARING")}
                        className="text-[11px] py-1 px-2.5"
                      >
                        <Flame className="w-3 h-3" /> Start Prep
                      </Button>
                    )}
                    {isPreparing && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatus(ticket.id, "READY")}
                        className="text-[11px] py-1 px-2.5 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark Ready
                      </Button>
                    )}
                    {isReady && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(ticket.id, "SERVED")}
                        className="text-[11px] py-1 px-2.5 text-text-gray"
                      >
                        Served
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
};
