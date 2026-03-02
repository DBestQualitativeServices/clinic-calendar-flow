import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import SidebarNav from './SidebarNav';
import GlobalToolbar from '@/components/toolbar/GlobalToolbar';
import PanelContainer from '@/components/panels/PanelContainer';

export default function AppLayout() {
  const defaultOpen = localStorage.getItem('sidebar-open') !== 'false';

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      onOpenChange={(open) => localStorage.setItem('sidebar-open', String(open))}
    >
      <div className="min-h-screen flex w-full">
        <SidebarNav />
        <div className="flex-1 flex flex-col min-w-0">
          <GlobalToolbar />
          <Outlet />
        </div>
      </div>
      <PanelContainer />
    </SidebarProvider>
  );
}
