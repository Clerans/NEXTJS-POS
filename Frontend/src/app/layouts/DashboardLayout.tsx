import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Topbar } from '@/components/navbar/Topbar';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main">
        <Topbar onToggleSidebar={() => setMobileOpen((prev) => !prev)} />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
