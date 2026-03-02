import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { TabletSession } from '@/types';

export function useTabletSession(appointmentId: string) {
  return useQuery({
    queryKey: ['tabletSession', appointmentId],
    queryFn: () => apiFetch<TabletSession | undefined>(`/signing-sessions?appointmentId=${encodeURIComponent(appointmentId)}`),
    enabled: !!appointmentId,
  });
}
