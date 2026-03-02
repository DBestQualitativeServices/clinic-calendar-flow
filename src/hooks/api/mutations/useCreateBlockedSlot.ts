import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { TimeBlock } from '@/types';

export function useCreateBlockedSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slot: Partial<TimeBlock>) =>
      apiFetch<TimeBlock>('/blocked-slots', {
        method: 'POST',
        body: JSON.stringify(slot),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blockedSlots'] }),
  });
}
