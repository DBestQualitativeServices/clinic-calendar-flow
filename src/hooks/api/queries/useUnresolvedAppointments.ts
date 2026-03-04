import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types';

const EMPTY: Appointment[] = [];

export function useUnresolvedAppointments() {
  return useQuery({
    queryKey: ['appointments', 'unresolved'],
    queryFn: () => apiFetch<Appointment[]>('/appointments?status=programat,sosit,in_consult&beforeToday=true'),
    placeholderData: EMPTY,
    retry: false,
  });
}
