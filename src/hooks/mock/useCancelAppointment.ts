import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';

export function useCancelAppointment() {
  const { setAppointments } = useMockData();

  const mutate = useCallback(
    ({ appointmentId }: { appointmentId: string }) => {
      const now = new Date().toISOString();
      setAppointments(prev =>
        prev.map(a =>
          a.id === appointmentId
            ? {
                ...a,
                status: 'anulat' as const,
                timeline: [...a.timeline, { timestamp: now, action: 'Anulat', actor: 'Recepție' }],
              }
            : a
        )
      );
    },
    [setAppointments]
  );

  return { mutate, mutateAsync: async (input: { appointmentId: string }) => mutate(input), isPending: false };
}
