import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function usePatientAppointments(patientId: string) {
  const { appointments } = useMockData();

  const data = useMemo(() => {
    if (!patientId) return [];
    return appointments
      .filter(a => a.patients.some(p => p.patientId === patientId))
      .sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        if (dateComp !== 0) return dateComp;
        return (b.startTime || '').localeCompare(a.startTime || '');
      });
  }, [appointments, patientId]);

  return { data, isLoading: false, error: null };
}
