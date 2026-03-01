import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import type { Patient } from '@/types';

export function useUpdatePatient() {
  const { setPatients } = useMockData();

  const mutate = useCallback(
    ({ patientId, updates }: { patientId: string; updates: Partial<Patient> }) => {
      setPatients(prev => prev.map(p => (p.id === patientId ? { ...p, ...updates } : p)));
    },
    [setPatients]
  );

  return { mutate, mutateAsync: async (input: { patientId: string; updates: Partial<Patient> }) => mutate(input), isPending: false };
}
