import React from 'react';
import NoShowBanner from '@/components/toolbar/NoShowBanner';
import CalendarGrid from '@/components/calendar/CalendarGrid';

const Index = () => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <NoShowBanner />
      <CalendarGrid />
    </div>
  );
};

export default Index;
