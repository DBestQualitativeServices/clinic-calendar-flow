import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types';

export function useUnresolvedAppointments() {
  return useQuery({
    queryKey: ['appointments', 'unresolved'],
    queryFn: () => apiFetch<Appointment[]>('/appointments?status=unresolved'),
  });
}
