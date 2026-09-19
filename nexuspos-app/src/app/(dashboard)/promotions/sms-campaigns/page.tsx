"use client";

import React, { useState } from "react";
import { Send, MessageSquare, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatDateTime } from "@/lib/utils";
import { db } from "@/lib/db";
import { SmsCampaign } from "@/types";
import { toast } from "sonner";

export default function SmsCampaignsPage() {
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([
    {
      id: 1,
      campaignName: "Weekend Double Loyalty Points",
      messageText: "NEXUSPOS: Enjoy double reward points on all artisan coffee and bakery purchases this weekend! Show this SMS at counter.",
      targetGroup: "VIP Elite Members",
      recipientsCount: 86,
      status: "SENT",
      sentAt: "2026-08-01T09:00:00Z",
    },
    {
      id: 2,
      campaignName: "New Cheesecake Launch Announcement",
      messageText: "NEXUSPOS: Try our brand new New York Cheesecake slice with rich berry coulis today. Free beverage upgrade with every slice!",
      targetGroup: "All Registered Customers",
      recipientsCount: 1420,
      status: "SENT",
      sentAt: "2026-08-02T10:30:00Z",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetGroup, setTargetGroup] = useState("All Registered Customers");
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newCamp: SmsCampaign = {
      id: campaigns.length + 1,
      campaignName: name,
      messageText: message,
      targetGroup,
      recipientsCount: targetGroup === "VIP Elite Members" ? 86 : 1420,
      status: "SENT",
      sentAt: new Date().toISOString(),
    };

    setCampaigns([newCamp, ...campaigns]);
    toast.success(`Dispatched SMS campaign to ${newCamp.recipientsCount} customers!`);
    setIsOpen(false);
    setName("");
    setMessage("");
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">SMS Marketing Campaigns</h1>
          <div className="page-sub">
            Broadcast promotional SMS alerts to customer segments and loyalty tiers
          </div>
        </div>
        <Button variant="orange" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
          <Send className="w-4 h-4" /> Dispatch SMS Campaign
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Campaign Dispatch Log</div>
          <div className="text-xs text-text-gray">Total {campaigns.length} broadcasts</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Target Segment</th>
              <th>Message Content</th>
              <th>Recipients</th>
              <th>Dispatched Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-patina" /> {c.campaignName}
                  </div>
                </td>
                <td>
                  <Badge variant="orange">{c.targetGroup || "All"}</Badge>
                </td>
                <td className="text-xs text-text-gray max-w-sm truncate">
                  {c.messageText}
                </td>
                <td className="font-bold text-xs text-text-dark">
                  {c.recipientsCount} SMS
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDateTime(c.sentAt)}
                </td>
                <td>
                  <Badge variant="green">Delivered</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Compose SMS Broadcast"
        maxWidth="md"
      >
        <form onSubmit={handleSend} className="space-y-4">
          <Input
            label="Campaign Title"
            placeholder="e.g. Flash Sunday 20% Off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            label="Target Customer Segment"
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
          >
            <option value="All Registered Customers">All Registered Customers (1,420 Nos)</option>
            <option value="VIP Elite Members">VIP Elite Tier (86 Nos)</option>
            <option value="Corporate Accounts">Corporate Accounts (34 Nos)</option>
          </Select>
          <div>
            <label className="block text-xs font-bold text-text-dark mb-1">
              SMS Message Text (Max 160 Characters)
            </label>
            <textarea
              maxLength={160}
              className="textarea w-full text-xs"
              placeholder="Enter marketing SMS message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <div className="text-[10px] text-text-gray text-right mt-0.5">
              {message.length} / 160 chars
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange" className="flex items-center gap-1.5">
              <Send className="w-4 h-4" /> Send Broadcast
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
