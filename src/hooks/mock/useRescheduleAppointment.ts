import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';

export function useRescheduleAppointment() {
  const { setAppointments } = useMockData();

  const mutate = useCallback(
    ({ appointmentId, newDate, newTime, newDoctorId }: { appointmentId: string; newDate: string; newTime: string; newDoctorId?: string }) => {
      const now = new Date().toISOString();
      setAppointments(prev => {
        const old = prev.find(a => a.id === appointmentId);
        if (!old) return prev;
        const cancelled = {
          ...old,
          status: 'anulat' as const,
          timeline: [...old.timeline, { timestamp: now, action: 'Anulat (reprogramare)', actor: 'Recepție' }],
        };
        const newApt = {
          ...old,
          id: `apt-${Date.now()}`,
          date: newDate,
          startTime: newTime,
          doctorId: newDoctorId || old.doctorId,
          status: 'programat' as const,
          createdAt: now,
          timeline: [{ timestamp: now, action: 'Creat (reprogramare)', actor: 'Recepție' }],
        };
        return prev.map(a => (a.id === appointmentId ? cancelled : a)).concat(newApt);
      });
    },
    [setAppointments]
  );

  return { mutate, mutateAsync: async (input: Parameters<typeof mutate>[0]) => mutate(input), isPending: false };
}
