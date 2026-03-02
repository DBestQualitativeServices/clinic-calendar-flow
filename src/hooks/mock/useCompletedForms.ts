import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function useCompletedForms(patientId: string) {
  const { completedForms } = useMockData();
  const data = useMemo(
    () => patientId ? completedForms.filter(f => f.patientId === patientId) : completedForms,
    [completedForms, patientId]
  );
  return { data, isLoading: false, error: null };
}
