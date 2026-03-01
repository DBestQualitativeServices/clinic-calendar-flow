import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function useCompletedForms(patientId: string) {
  const { completedForms } = useMockData();
  const data = useMemo(
    () => completedForms.filter(f => f.patientId === patientId),
    [completedForms, patientId]
  );
  return { data, isLoading: false, error: null };
}
