import { useMemo } from 'react';
import type { Appointment, Patient, ConsultationType, Doctor } from '@/types';

/**
 * Shared search-matching logic for appointment lists.
 * Returns a Set of appointment IDs that match the query.
 *
 * Matches against: doctor name, patient names (first+last both orderings), consultation type names.
 *
 * Used by: CalendarGrid (/scheduling) and ConsultationsPage (/consultations).
 */
export function useAppointmentSearch(
  searchQuery: string,
  appointments: Appointment[],
  doctors: Doctor[],
  patients: Patient[],
  consultationTypes: ConsultationType[],
): Set<string> {
  return useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return new Set<string>();

    const ids = new Set<string>();
    for (const apt of appointments) {
      // Match doctor name
      const doctor = doctors.find(d => d.id === apt.doctorId);
      if (doctor?.name.toLowerCase().includes(q)) {
        ids.add(apt.id);
        continue;
      }
      // Match patient names
      const patientMatch = apt.patients.some(pe => {
        const p = patients.find(pt => pt.id === pe.patientId);
        if (!p) return false;
        return `${p.lastName} ${p.firstName}`.toLowerCase().includes(q) ||
               `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
      });
      if (patientMatch) { ids.add(apt.id); continue; }
      // Match consultation type names
      const consultMatch = apt.patients.some(pe =>
        pe.consultations.some(c => {
          const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
          return ct?.name.toLowerCase().includes(q);
        })
      );
      if (consultMatch) ids.add(apt.id);
    }
    return ids;
  }, [searchQuery, appointments, doctors, patients, consultationTypes]);
}
