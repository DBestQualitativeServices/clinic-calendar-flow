import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types';

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, update }: { appointmentId: string; update: Partial<Appointment> }) =>
      apiFetch<void>(`/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
