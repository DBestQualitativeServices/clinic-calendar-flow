import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { TimeBlock } from '@/types';

export function useBlockedSlots(date: string) {
  return useQuery({
    queryKey: ['blockedSlots', date],
    queryFn: () => apiFetch<TimeBlock[]>(`/blocked-slots?date=${encodeURIComponent(date)}`),
    enabled: !!date,
  });
}
