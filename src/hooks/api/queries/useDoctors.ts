import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Doctor } from '@/types';

const EMPTY: Doctor[] = [];

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => apiFetch<Doctor[]>('/doctors'),
    placeholderData: EMPTY,
  });
}
