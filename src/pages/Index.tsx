import React from 'react';
import { AppProvider } from '@/store/appStore';
import GlobalToolbar from '@/components/toolbar/GlobalToolbar';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import PanelContainer from '@/components/panels/PanelContainer';

const Index = () => {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <GlobalToolbar />
        <CalendarGrid />
        <PanelContainer />
      </div>
    </AppProvider>
  );
};

export default Index;
