import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';

export function useStartConsultation() {
  const { setAppointments } = useMockData();

  const mutate = useCallback(
    ({ appointmentId }: { appointmentId: string }) => {
      const now = new Date().toISOString();
      setAppointments(prev =>
        prev.map(a =>
          a.id === appointmentId
            ? {
                ...a,
                status: 'in_consult' as const,
                timeline: [...a.timeline, { timestamp: now, action: 'In consult (manual)', actor: 'Recepție' }],
              }
            : a
        )
      );
    },
    [setAppointments]
  );

  return { mutate, mutateAsync: async (input: { appointmentId: string }) => mutate(input), isPending: false };
}
