import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types';

export function useAppointmentById(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => apiFetch<Appointment>(`/appointments/${id}`),
    enabled: !!id,
  });
}
