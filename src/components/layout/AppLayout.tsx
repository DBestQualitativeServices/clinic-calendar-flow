import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppProvider } from '@/store/appStore';
import SidebarNav from './SidebarNav';

export default function AppLayout() {
  const defaultOpen = localStorage.getItem('sidebar-open') !== 'false';

  return (
    <AppProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        onOpenChange={(open) => localStorage.setItem('sidebar-open', String(open))}
      >
        <div className="min-h-screen flex w-full">
          <SidebarNav />
          <div className="flex-1 flex flex-col min-w-0">
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </AppProvider>
  );
}
