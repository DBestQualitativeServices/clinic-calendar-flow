import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ConsultationType } from '@/types';

export function useConsultationTypes(categoryId?: string) {
  const params = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return useQuery({
    queryKey: ['consultationTypes', categoryId ?? ''],
    queryFn: () => apiFetch<ConsultationType[]>(`/consultation-types${params}`),
  });
}
