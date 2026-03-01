import { doctors } from '@/data/mock';

export function useDoctors() {
  return { data: doctors, isLoading: false, error: null };
}
