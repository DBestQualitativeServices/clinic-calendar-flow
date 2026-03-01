import React from 'react';
import GlobalToolbar from '@/components/toolbar/GlobalToolbar';
import NoShowBanner from '@/components/toolbar/NoShowBanner';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import PanelContainer from '@/components/panels/PanelContainer';

const Index = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <GlobalToolbar />
      <NoShowBanner />
      <CalendarGrid />
      <PanelContainer />
    </div>
  );
};

export default Index;
