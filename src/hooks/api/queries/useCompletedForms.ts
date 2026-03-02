import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { CompletedForm } from '@/types';

export function useCompletedForms(patientId: string) {
  return useQuery({
    queryKey: ['completedForms', patientId],
    queryFn: () => apiFetch<CompletedForm[]>(`/form-submissions?patientId=${encodeURIComponent(patientId)}`),
    enabled: !!patientId,
  });
}
