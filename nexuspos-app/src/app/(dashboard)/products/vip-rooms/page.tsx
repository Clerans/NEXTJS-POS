"use client";

import React, { useState } from "react";
import { Plus, Crown, Users, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { VipRoom } from "@/types";
import { toast } from "sonner";

export default function VipRoomsPage() {
  const [rooms, setRooms] = useState<VipRoom[]>(db.vipRooms);

  const toggleStatus = (room: VipRoom) => {
    const nextStatus: VipRoom["status"] =
      room.status === "AVAILABLE"
        ? "OCCUPIED"
        : room.status === "OCCUPIED"
        ? "RESERVED"
        : "AVAILABLE";
    room.status = nextStatus;
    setRooms([...db.vipRooms]);
    toast.success(`${room.name} status changed to ${nextStatus}`);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">VIP Dining Rooms</h1>
          <div className="page-sub">
            Private dining suites, minimum spend thresholds, and reservation status
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Add VIP Suite Dialog...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add VIP Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {rooms.map((room) => {
          const isAvailable = room.status === "AVAILABLE";
          const isOccupied = room.status === "OCCUPIED";

          return (
            <div
              key={room.id}
              className="card bg-white p-5 rounded-2xl border border-border shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-patina-light text-patina flex items-center justify-center font-bold text-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-text-dark">
                        {room.name}
                      </h3>
                      <span className="text-[10px] text-text-gray font-mono">
                        {room.roomNumber}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      isAvailable ? "green" : isOccupied ? "red" : "orange"
                    }
                  >
                    {room.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-text-gray">
                    <span>Guest Capacity:</span>
                    <span className="font-bold text-text-dark flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-patina" /> Up to {room.capacity} Guests
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-gray">
                    <span>Minimum Spend Target:</span>
                    <span className="font-black text-patina">
                      {formatCurrency(room.minSpend ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-gray">
                    <span>Hourly Reservation Rate:</span>
                    <span className="font-bold text-text-dark">
                      {formatCurrency(room.hourlyRate ?? 0)} / hr
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant={isAvailable ? "orange" : "default"}
                  onClick={() => toggleStatus(room)}
                  className="w-full text-xs font-bold"
                >
                  {isAvailable ? "Assign Guests" : isOccupied ? "Free Up Room" : "Confirm Booking"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
