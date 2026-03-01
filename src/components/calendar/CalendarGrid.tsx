import React, { useMemo } from 'react';
import { useAppState } from '@/store/appStore';
import { doctors } from '@/data/mock';
import { generateTimeSlots } from '@/lib/calendar-utils';
import TimeColumn from './TimeColumn';
import DoctorColumn from './DoctorColumn';
import WalkInZone from './WalkInZone';

const SLOT_HEIGHT = 60;

export default function CalendarGrid() {
  const { appointments, timeBlocks, calendar } = useAppState();
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Filter doctors by specialty
  const visibleDoctors = useMemo(() => {
    if (!calendar.specialtyFilter) return doctors;
    return doctors.filter(d => d.categoryIds.includes(calendar.specialtyFilter!));
  }, [calendar.specialtyFilter]);

  // Filter appointments and blocks for selected date
  const dayAppointments = useMemo(
    () => appointments.filter(a => a.date === calendar.selectedDate),
    [appointments, calendar.selectedDate]
  );

  const dayTimeBlocks = useMemo(
    () => timeBlocks.filter(tb => tb.date === calendar.selectedDate),
    [timeBlocks, calendar.selectedDate]
  );

  // Walk-in appointments (no startTime)
  const walkIns = useMemo(
    () => dayAppointments.filter(a => !a.startTime && a.isWalkIn),
    [dayAppointments]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Walk-in zone */}
      <WalkInZone walkIns={walkIns} />

      {/* Calendar scroll area */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-fit">
          {/* Time column */}
          <TimeColumn slotHeight={SLOT_HEIGHT} />

          {/* Doctor columns */}
          {visibleDoctors.map(doctor => (
            <DoctorColumn
              key={doctor.id}
              doctor={doctor}
              appointments={dayAppointments.filter(a => a.doctorId === doctor.id && a.startTime)}
              timeBlocks={dayTimeBlocks.filter(tb => tb.doctorId === doctor.id)}
              slotHeight={SLOT_HEIGHT}
              timeSlots={timeSlots}
            />
          ))}

          {/* Empty state */}
          {visibleDoctors.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-20 text-muted-foreground">
              Niciun doctor disponibil pentru filtrul selectat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
