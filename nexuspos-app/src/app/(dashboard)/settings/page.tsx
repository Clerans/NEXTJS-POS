"use client";

import React, { useState } from "react";
import { Settings2, Save, Store, Receipt, Percent, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db";
import { SystemSettings } from "@/types";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(db.settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.settings = { ...settings };
    toast.success("System configurations updated successfully!");
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Store &amp; System Settings</h1>
          <div className="page-sub">
            Brand identity, thermal receipt headers, tax percentages, and store policies
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Brand Profile Card */}
        <div className="card space-y-4">
          <div className="panel-title flex items-center gap-2">
            <Store className="w-4 h-4 text-patina" /> Store Information &amp; Branding
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Store Brand Name"
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
              required
            />
            <Input
              label="Contact Telephone"
              value={settings.phone || ""}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
            />
            <div className="md:col-span-2">
              <Input
                label="Physical Address"
                value={settings.address || ""}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Taxes & Currency */}
        <div className="card space-y-4">
          <div className="panel-title flex items-center gap-2">
            <Percent className="w-4 h-4 text-patina" /> Taxes &amp; Currency Rates
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Value Added Tax (VAT) %"
              type="number"
              step="0.5"
              value={settings.taxPercentage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  taxPercentage: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
            <Input
              label="Dine-In Service Charge %"
              type="number"
              step="0.5"
              value={settings.serviceChargePercentage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  serviceChargePercentage: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
            <Input
              label="Currency Symbol"
              value={settings.currencySymbol}
              onChange={(e) =>
                setSettings({ ...settings, currencySymbol: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Thermal Receipt Header & Footer */}
        <div className="card space-y-4">
          <div className="panel-title flex items-center gap-2">
            <Receipt className="w-4 h-4 text-patina" /> Thermal Slip Formatting
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-dark mb-1">
                Receipt Header Custom Lines
              </label>
              <textarea
                className="textarea w-full text-xs font-mono"
                rows={3}
                value={settings.receiptHeader || ""}
                onChange={(e) =>
                  setSettings({ ...settings, receiptHeader: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-dark mb-1">
                Receipt Footer (Social / WiFi Credentials)
              </label>
              <textarea
                className="textarea w-full text-xs font-mono"
                rows={3}
                value={settings.receiptFooter || ""}
                onChange={(e) =>
                  setSettings({ ...settings, receiptFooter: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Operational Policies */}
        <div className="card space-y-4">
          <div className="panel-title flex items-center gap-2">
            <Shield className="w-4 h-4 text-patina" /> Operational Policies
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-text-dark cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isNegativeStockAllowed}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    isNegativeStockAllowed: e.target.checked,
                  })
                }
                className="rounded text-patina focus:ring-patina"
              />
              Allow Negative Stock in POS (Permit sales even if inventory is depleted)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" variant="orange" className="flex items-center gap-1.5 px-6">
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
