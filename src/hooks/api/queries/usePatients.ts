import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Patient } from '@/types';

export function usePatients(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return useQuery({
    queryKey: ['patients', search ?? ''],
    queryFn: () => apiFetch<Patient[]>(`/patients${params}`),
  });
}
