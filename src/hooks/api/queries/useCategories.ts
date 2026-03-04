import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { SpecializationCategory } from '@/types';

const EMPTY: SpecializationCategory[] = [];

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<SpecializationCategory[]>('/categories'),
    placeholderData: EMPTY,
  });
}
