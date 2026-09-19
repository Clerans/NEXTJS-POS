import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { Menu, Bell, Coffee, MonitorSmartphone, User } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden icon-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="lucide" />
        </button>
        <div className="date">Monday, August 3, 2026</div>
      </div>

      <div className="top-actions">
        <button
          onClick={() => navigate(ROUTES.POS)}
          className="btn bg-patina text-white hover:bg-patina-dark border-none rounded-full px-4 py-2 flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
          style={{ backgroundColor: 'var(--patina)', color: '#ffffff' }}
        >
          <Coffee className="w-4 h-4" /> Barista
        </button>

        <button
          onClick={() => navigate(ROUTES.POS)}
          className="btn bg-patina text-white hover:bg-patina-dark border-none rounded-full px-4 py-2 flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
          style={{ backgroundColor: 'var(--patina)', color: '#ffffff' }}
        >
          <MonitorSmartphone className="w-4 h-4" /> Access POS
        </button>

        <div className="user-chip text-right hidden md:block">
          <div className="name font-bold text-xs text-textDark">NEXUSPOS</div>
          <div className="role text-[10px] tracking-wider text-textGray font-semibold uppercase">ADMINISTRATOR</div>
        </div>

        <button className="icon-btn rounded-full" aria-label="Notifications">
          <Bell className="w-4 h-4 text-textDark" />
        </button>

        <div className="avatar rounded-full bg-white border border-border text-textDark flex items-center justify-center cursor-pointer">
          <User className="w-4 h-4 text-textDark" />
        </div>
      </div>
    </header>
  );
};

