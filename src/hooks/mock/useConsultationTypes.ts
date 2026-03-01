import { useMemo } from 'react';
import { consultationTypes } from '@/data/mock';

export function useConsultationTypes(categoryId?: string) {
  const data = useMemo(() => {
    if (!categoryId) return consultationTypes;
    return consultationTypes.filter(ct => ct.categoryId === categoryId);
  }, [categoryId]);

  return { data, isLoading: false, error: null };
}
