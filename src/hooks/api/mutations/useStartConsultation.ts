import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useStartConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId }: { appointmentId: string }) =>
      apiFetch<void>(`/appointments/${appointmentId}/start-consult`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
