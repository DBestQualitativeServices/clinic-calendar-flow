import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface Slot {
  time: string;
  available: boolean;
}

export function useAvailableSlots(
  date: string,
  doctorId?: string,
  durationMinutes?: number,
  eligibleDoctorIds?: string[]
) {
  const params = new URLSearchParams({ date });
  if (doctorId) params.set('doctorId', doctorId);
  if (durationMinutes) params.set('durationMinutes', String(durationMinutes));
  if (eligibleDoctorIds?.length) params.set('eligibleDoctorIds', eligibleDoctorIds.join(','));

  return useQuery({
    queryKey: ['availableSlots', date, doctorId ?? '', durationMinutes ?? 0, eligibleDoctorIds ?? []],
    queryFn: () => apiFetch<Slot[]>(`/appointments/available-slots?${params}`),
    enabled: !!date,
  });
}
