import React from 'react';
import { generateTimeSlots } from '@/lib/calendar-utils';

interface TimeColumnProps {
  slotHeight: number;
}

export default function TimeColumn({ slotHeight }: TimeColumnProps) {
  const slots = generateTimeSlots();

  return (
    <div className="flex flex-col sticky left-0 z-20 bg-card">
      {/* Header spacer */}
      <div className="sticky top-0 z-30 border-b border-r border-border bg-card p-2.5 min-h-[88px]" />

      {/* Time labels */}
      {slots.map(slot => (
        <div
          key={slot}
          className="border-b border-r border-border flex items-start px-2 pt-1"
          style={{ height: `${slotHeight}px` }}
        >
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums">{slot}</span>
        </div>
      ))}
    </div>
  );
}
