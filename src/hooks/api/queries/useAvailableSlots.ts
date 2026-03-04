import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface AvailableSlot {
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
}

const EMPTY: AvailableSlot[] = [];

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
    placeholderData: EMPTY,
  });
}
