import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types';

const EMPTY: Appointment[] = [];

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: () => apiFetch<Appointment[]>(`/appointments?patientId=${patientId}`),
    enabled: !!patientId,
    placeholderData: EMPTY,
  });
}
