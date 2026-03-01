import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function useAppointments(date: string, doctorId?: string) {
  const { appointments } = useMockData();

  const data = useMemo(() => {
    let filtered = appointments.filter(a => a.date === date);
    if (doctorId) filtered = filtered.filter(a => a.doctorId === doctorId);
    return filtered;
  }, [appointments, date, doctorId]);

  return { data, isLoading: false, error: null };
}
