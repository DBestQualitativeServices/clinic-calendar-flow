import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import type { Appointment } from '@/types';

export function useUpdateAppointmentStatus() {
  const { setAppointments } = useMockData();

  const mutate = useCallback(
    ({ appointmentId, update }: { appointmentId: string; update: Partial<Appointment> }) => {
      setAppointments(prev => prev.map(a => (a.id === appointmentId ? { ...a, ...update } : a)));
    },
    [setAppointments]
  );

  const mutateAsync = useCallback(
    async (input: { appointmentId: string; update: Partial<Appointment> }) => {
      mutate(input);
    },
    [mutate]
  );

  return { mutate, mutateAsync, isPending: false };
}
