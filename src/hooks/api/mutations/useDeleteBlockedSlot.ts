import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useDeleteBlockedSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockedSlotId }: { blockedSlotId: string }) =>
      apiFetch<void>(`/blocked-slots/${blockedSlotId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blockedSlots'] }),
  });
}
