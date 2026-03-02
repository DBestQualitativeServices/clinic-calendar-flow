import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types';

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (apt: Partial<Appointment>) =>
      apiFetch<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(apt),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
