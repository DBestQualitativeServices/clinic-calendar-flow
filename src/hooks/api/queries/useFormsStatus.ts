import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { FormsStatus } from '../types';

export function useFormsStatus(appointmentId: string) {
  return useQuery({
    queryKey: ['formsStatus', appointmentId],
    queryFn: () => apiFetch<FormsStatus>(`/appointments/${appointmentId}/form-readiness`),
    enabled: !!appointmentId,
  });
}

export function useFormsStatusForPatient() {
  return useCallback(
    async (patientId: string, consultationTypeIds: string[]): Promise<FormsStatus> => {
      const params = new URLSearchParams({ patientId });
      consultationTypeIds.forEach(id => params.append('consultationTypeId', id));
      return apiFetch<FormsStatus>(`/form-readiness?${params}`);
    },
    []
  );
}
