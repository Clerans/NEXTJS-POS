import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Send, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { promotionsService, SmsCampaignResponse } from '@/services/api/promotionsService';
import { customersService, CustomerGroup } from '@/services/api/customersService';

export const SmsCampaignsPage: React.FC = () => {
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'ALL'>('ALL');
  const [messageText, setMessageText] = useState<string>(
    'Special weekend offer at NEXUSPOS! Get 15% off on all specialty coffee beverages this Saturday & Sunday.'
  );
  const [sending, setSending] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<SmsCampaignResponse | null>(null);

  useEffect(() => {
    customersService
      .getGroups()
      .then(setCustomerGroups)
      .catch(() => {});
  }, []);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) {
      toast.error('Please enter SMS message content');
      return;
    }

    setSending(true);
    try {
      const payload = {
        customerGroupId: selectedGroupId === 'ALL' ? undefined : (selectedGroupId as number),
        messageText,
      };

      const result = await promotionsService.sendSmsCampaign(payload);
      setLastResponse(result);
      toast.success(
        `SMS Broadcast sent successfully to ${result.recipientsCount || 'all'} registered patrons!`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch SMS campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">SMS Campaigns</h1>
        <div className="page-sub">Send direct SMS marketing messages to registered customer segments</div>
      </div>

      <div className="card space-y-4">
        <form onSubmit={handleSendCampaign} className="space-y-4">
          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-patina" /> Target Audience Segment
            </label>
            <select
              className="select w-full"
              value={selectedGroupId}
              onChange={(e) =>
                setSelectedGroupId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              disabled={sending}
            >
              <option value="ALL">All Registered Patrons (Global Segment)</option>
              {customerGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.discountRate}% OFF Tier)
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              SMS Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input w-full h-28 text-xs py-2"
              placeholder="Type your promotional message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sending}
            />
            <div className="text-[11px] text-gray-400 text-right mt-1">
              Character count: {messageText.length} / 160 (1 SMS)
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="orange" type="submit" disabled={sending} className="btn-orange flex items-center gap-2">
              <Send className="w-4 h-4" /> {sending ? 'Dispatching SMS...' : 'Send Campaign'}
            </Button>
          </div>
        </form>

        {lastResponse && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Latest Broadcast Confirmation</div>
              <div>
                Dispatched to <strong>{lastResponse.recipientsCount}</strong> recipients. Status: <strong>{lastResponse.status}</strong>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
