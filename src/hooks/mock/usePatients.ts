import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function usePatients(search?: string) {
  const { patients } = useMockData();

  const data = useMemo(() => {
    if (!search || search.length < 2) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      p =>
        `${p.lastName} ${p.firstName}`.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.cnp?.includes(q)
    );
  }, [patients, search]);

  return { data, isLoading: false, error: null };
}
