import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { TabletSession } from '@/types';

export function useCreateTabletSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: TabletSession) =>
      apiFetch<TabletSession>('/signing-sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tabletSession'] }),
  });
}

export function useRemoveTabletSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      apiFetch<void>(`/signing-sessions/${encodeURIComponent(code)}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tabletSession'] }),
  });
}
