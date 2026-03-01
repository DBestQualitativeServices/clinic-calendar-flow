import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import type { Appointment } from '@/types';

export function useCreateAppointment() {
  const { setAppointments } = useMockData();

  const mutate = useCallback(
    (apt: Appointment) => {
      setAppointments(prev => [...prev, apt]);
    },
    [setAppointments]
  );

  const mutateAsync = useCallback(
    async (apt: Appointment) => {
      mutate(apt);
      return apt;
    },
    [mutate]
  );

  return { mutate, mutateAsync, isPending: false };
}
