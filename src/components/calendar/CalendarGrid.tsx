import React, { useMemo } from 'react';
import { useUIState } from '@/store/uiStore';
import { useDoctors, useAppointments, useBlockedSlots, usePatients, useConsultationTypes } from '@/hooks/data';
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
  const { data: patients } = usePatients();
  const { data: consultationTypes } = useConsultationTypes();
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const searchQuery = calendar.searchQuery?.toLowerCase().trim() ?? '';

  const matchingAppointmentIds = useMemo(() => {
    if (!searchQuery) return new Set<string>();
    const ids = new Set<string>();
    for (const apt of appointments) {
      // Match doctor name
      const doctor = doctors.find(d => d.id === apt.doctorId);
      if (doctor?.name.toLowerCase().includes(searchQuery)) {
        ids.add(apt.id);
        continue;
      }
      // Match patient names
      const patientMatch = apt.patients.some(pe => {
        const p = patients.find(pt => pt.id === pe.patientId);
        if (!p) return false;
        return `${p.lastName} ${p.firstName}`.toLowerCase().includes(searchQuery) ||
               `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery);
      });
      if (patientMatch) { ids.add(apt.id); continue; }
      // Match consultation type names
      const consultMatch = apt.patients.some(pe =>
        pe.consultations.some(c => {
          const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
          return ct?.name.toLowerCase().includes(searchQuery);
        })
      );
      if (consultMatch) ids.add(apt.id);
    }
    return ids;
  }, [searchQuery, appointments, doctors, patients, consultationTypes]);

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
          {doctors.map(doctor => (
            <DoctorColumn
              key={doctor.id}
              doctor={doctor}
              appointments={appointments.filter(a => a.doctorId === doctor.id && a.startTime)}
              timeBlocks={timeBlocks.filter(tb => tb.doctorId === doctor.id)}
              slotHeight={SLOT_HEIGHT}
              timeSlots={timeSlots}
              highlightedIds={matchingAppointmentIds}
              hasSearch={!!searchQuery}
            />
          ))}
          {doctors.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-20 text-muted-foreground">
              Niciun doctor disponibil.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
