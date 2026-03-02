import React, { useMemo } from 'react';
import type { Doctor, Appointment, TimeBlock } from '@/types';
import { useCategories } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import AppointmentCard from './AppointmentCard';
import EmptySlotPopover from './EmptySlotPopover';
import { timeToMinutes } from '@/lib/calendar-utils';

interface DoctorColumnProps {
  doctor: Doctor;
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  slotHeight: number;
  timeSlots: string[];
  highlightedIds?: Set<string>;
  hasSearch?: boolean;
}

const SLOT_HEIGHT = 60;

function computeOverlapLayout(appointments: Appointment[]): Map<string, { left: number; width: number }> {
  const layout = new Map<string, { left: number; width: number }>();
  const sorted = [...appointments].sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!));

  const groups: Appointment[][] = [];
  for (const apt of sorted) {
    const start = timeToMinutes(apt.startTime!);
    const end = start + apt.totalDurationMinutes;

    let placed = false;
    for (const group of groups) {
      const groupOverlaps = group.some(g => {
        const gs = timeToMinutes(g.startTime!);
        const ge = gs + g.totalDurationMinutes;
        return start < ge && end > gs;
      });
      if (groupOverlaps) {
        group.push(apt);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([apt]);
  }

  for (const group of groups) {
    const count = group.length;
    group.forEach((apt, i) => {
      layout.set(apt.id, { left: i / count, width: 1 / count });
    });
  }

  return layout;
}

export default function DoctorColumn({ doctor, appointments, timeBlocks, slotHeight, timeSlots, highlightedIds, hasSearch }: DoctorColumnProps) {
  const { setCalendar, calendar } = useUIState();
  const { data: categories } = useCategories();

  const totalSlots = 20;
  const occupiedSlots = Math.ceil(
    appointments.filter(a => a.status !== 'anulat' && a.startTime).reduce((sum, a) => sum + a.totalDurationMinutes, 0) / 30
  );

  const handleDoubleClick = () => {
    setCalendar({ viewMode: 'weekly', selectedDoctorId: doctor.id });
  };

  const getCategoryColor = (catId: string): string => {
    return categories.find(c => c.id === catId)?.color ?? 'spec-generala';
  };

  const activeApts = useMemo(
    () => appointments.filter(a => a.startTime && a.status !== 'anulat'),
    [appointments]
  );
  const overlapLayout = useMemo(() => computeOverlapLayout(activeApts), [activeApts]);

  return (
    <div className="flex flex-col min-w-[180px] flex-1 max-w-[280px]">
      <div
        className={cn(
          "sticky top-0 z-10 border-b border-r border-border p-2.5 bg-card cursor-pointer select-none",
          doctor.isOnVacation && "opacity-50"
        )}
        onDoubleClick={handleDoubleClick}
        title="Dublu-click pentru vedere săptămânală"
      >
        <p className="text-sm font-bold text-foreground truncate">{doctor.name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {doctor.categoryIds.map(catId => (
            <span
              key={catId}
              className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white")}
              style={{ backgroundColor: `hsl(var(--${getCategoryColor(catId)}))` }}
            >
              {categories.find(c => c.id === catId)?.name}
            </span>
          ))}
        </div>
        <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min((occupiedSlots / totalSlots) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{occupiedSlots}/{totalSlots} sloturi</p>
        {doctor.isOnVacation && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/60 rounded">
            <span className="text-xs font-semibold text-muted-foreground">Concediu</span>
          </div>
        )}
      </div>

      <div className="relative border-r border-border">
        {timeSlots.map((slot) => (
          <EmptySlotPopover key={slot} doctorId={doctor.id} date={calendar.selectedDate} startTime={slot}>
            <div
              className="border-b border-border relative hover:bg-accent/30 transition-colors cursor-pointer"
              style={{ height: `${slotHeight}px` }}
            >
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/50" />
              {doctor.isOnVacation && <div className="absolute inset-0 bg-muted/30" />}
            </div>
          </EmptySlotPopover>
        ))}

        {timeBlocks.map(tb => {
          const startMin = timeToMinutes(tb.startTime) - 480;
          const topPx = (startMin / 30) * slotHeight;
          const heightPx = (tb.durationMinutes / 30) * slotHeight;
          return (
            <div
              key={tb.id}
              className="absolute left-0 right-0 pattern-hatch border border-status-blocked/30 rounded-sm flex items-center justify-center pointer-events-none"
              style={{ top: `${topPx}px`, height: `${heightPx}px` }}
            >
              {tb.reason && (
                <span className="text-[10px] text-muted-foreground font-medium bg-card/70 px-1 rounded">
                  {tb.reason}
                </span>
              )}
            </div>
          );
        })}

        {activeApts.map(apt => {
          const startMin = timeToMinutes(apt.startTime!) - 480;
          const topPx = (startMin / 30) * slotHeight;
          const ol = overlapLayout.get(apt.id) || { left: 0, width: 1 };
          return (
            <div
              key={apt.id}
              style={{
                position: 'absolute',
                top: `${topPx}px`,
                left: `${ol.left * 100}%`,
                width: `${ol.width * 100}%`,
              }}
            >
              <AppointmentCard
                appointment={apt}
                slotHeight={slotHeight}
                highlighted={hasSearch && highlightedIds?.has(apt.id)}
                dimmed={hasSearch && !highlightedIds?.has(apt.id)}
              />
            </div>
          );
        })}

        {appointments
          .filter(a => a.startTime && a.status === 'anulat')
          .map(apt => {
            const startMin = timeToMinutes(apt.startTime!) - 480;
            const topPx = (startMin / 30) * slotHeight;
            return (
              <div key={apt.id} style={{ position: 'absolute', top: `${topPx}px`, left: 0, right: 0 }}>
                <AppointmentCard appointment={apt} slotHeight={slotHeight} dimmed={hasSearch} />
              </div>
            );
          })}
      </div>
    </div>
  );
}
