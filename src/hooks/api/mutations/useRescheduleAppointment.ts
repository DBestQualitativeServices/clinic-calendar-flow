import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, newDate, newTime, newDoctorId }: {
      appointmentId: string;
      newDate: string;
      newTime: string;
      newDoctorId?: string;
    }) =>
      apiFetch<void>(`/appointments/${appointmentId}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ newDate, newTime, newDoctorId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
