import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function useUnresolvedAppointments() {
  const { appointments } = useMockData();

  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00');
      return (
        aptDate < today &&
        (apt.status === 'programat' || apt.status === 'sosit' || apt.status === 'in_consult')
      );
    });
  }, [appointments]);

  return { data, isLoading: false, error: null };
}
