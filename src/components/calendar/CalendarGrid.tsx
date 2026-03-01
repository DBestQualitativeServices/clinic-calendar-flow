import React, { useMemo } from 'react';
import { useUIState } from '@/store/uiStore';
import { useDoctors, useAppointments, useBlockedSlots } from '@/hooks/mock';
import { generateTimeSlots } from '@/lib/calendar-utils';
import TimeColumn from './TimeColumn';
import DoctorColumn from './DoctorColumn';
import WalkInZone from './WalkInZone';

const SLOT_HEIGHT = 60;

export default function CalendarGrid() {
  const { calendar } = useUIState();
  const { data: doctors } = useDoctors();
  const { data: appointments } = useAppointments(calendar.selectedDate);
  const { data: timeBlocks } = useBlockedSlots(calendar.selectedDate);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const visibleDoctors = useMemo(() => {
    if (!calendar.specialtyFilter) return doctors;
    return doctors.filter(d => d.categoryIds.includes(calendar.specialtyFilter!));
  }, [doctors, calendar.specialtyFilter]);

  const walkIns = useMemo(
    () => appointments.filter(a => !a.startTime && a.isWalkIn),
    [appointments]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <WalkInZone walkIns={walkIns} />
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-fit">
          <TimeColumn slotHeight={SLOT_HEIGHT} />
          {visibleDoctors.map(doctor => (
            <DoctorColumn
              key={doctor.id}
              doctor={doctor}
              appointments={appointments.filter(a => a.doctorId === doctor.id && a.startTime)}
              timeBlocks={timeBlocks.filter(tb => tb.doctorId === doctor.id)}
              slotHeight={SLOT_HEIGHT}
              timeSlots={timeSlots}
            />
          ))}
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
