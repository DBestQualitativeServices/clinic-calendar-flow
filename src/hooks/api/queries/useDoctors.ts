import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Doctor } from '@/types';

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => apiFetch<Doctor[]>('/doctors'),
  });
}
