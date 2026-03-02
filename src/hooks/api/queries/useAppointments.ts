import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types';

export function useAppointments(date: string, doctorId?: string) {
  const params = new URLSearchParams({ date });
  if (doctorId) params.set('doctorId', doctorId);
  return useQuery({
    queryKey: ['appointments', date, doctorId ?? ''],
    queryFn: () => apiFetch<Appointment[]>(`/appointments?${params}`),
    enabled: !!date,
  });
}
