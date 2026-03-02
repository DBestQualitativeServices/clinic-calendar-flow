import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Patient } from '@/types';

export function usePatientById(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => apiFetch<Patient>(`/patients/${id}`),
    enabled: !!id,
  });
}
