"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, Coffee, MonitorSmartphone, User } from "lucide-react";
import { toast } from "sonner";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formatted);
  }, []);

  return (
    <header className="topbar">
      {/* Left side: Hamburger on mobile + Live Date */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden icon-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="lucide w-4.5 h-4.5 text-text-dark" />
        </button>
        <div className="date-badge">{currentDate || "Monday, August 3, 2026"}</div>
      </div>

      {/* Right side action triggers */}
      <div className="top-actions">
        <Link
          href="/pos?mode=kds"
          className="btn-patina px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-xs hover:shadow-md transition-all"
        >
          <Coffee className="w-3.5 h-3.5" /> Barista
        </Link>

        <Link
          href="/pos"
          className="btn-patina px-4 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-xs hover:shadow-md transition-all"
        >
          <MonitorSmartphone className="w-3.5 h-3.5" /> Access POS
        </Link>

        <div className="user-chip text-right hidden md:flex">
          <div className="name font-bold text-xs text-text-dark">NEXUSPOS</div>
          <div className="role text-[10px] tracking-wider text-text-gray font-semibold uppercase">
            ADMINISTRATOR
          </div>
        </div>

        <button
          className="icon-btn rounded-full relative"
          aria-label="Notifications"
          onClick={() => toast.info("No unread system alerts.")}
        >
          <Bell className="w-4 h-4 text-text-dark" />
          <span className="badge-dot" />
        </button>

        <Link
          href="/permissions/users"
          className="avatar rounded-full bg-white border border-border text-text-dark flex items-center justify-center cursor-pointer hover:border-patina transition-colors"
          title="User Profile"
        >
          <User className="w-4 h-4 text-text-dark" />
        </Link>
      </div>
    </header>
  );
};
