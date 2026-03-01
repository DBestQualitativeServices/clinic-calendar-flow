import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function useAppointmentById(id: string) {
  const { appointments } = useMockData();
  const data = useMemo(() => appointments.find(a => a.id === id), [appointments, id]);
  return { data, isLoading: false, error: null };
}
