import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function usePatientById(id: string) {
  const { patients } = useMockData();
  const data = useMemo(() => patients.find(p => p.id === id), [patients, id]);
  return { data, isLoading: false, error: null };
}
