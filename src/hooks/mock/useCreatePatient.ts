import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import type { Patient } from '@/types';

export function useCreatePatient() {
  const { setPatients } = useMockData();

  const mutate = useCallback(
    (patient: Omit<Patient, 'id'>) => {
      const newPatient = { ...patient, id: `p-${Date.now()}` } as Patient;
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    },
    [setPatients]
  );

  return { mutate, mutateAsync: async (p: Omit<Patient, 'id'>) => mutate(p), isPending: false };
}
