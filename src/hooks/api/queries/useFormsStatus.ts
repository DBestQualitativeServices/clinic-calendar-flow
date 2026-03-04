import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { FormsStatus } from '../types';

const EMPTY_STATUS: FormsStatus = {
  total: 0, completed: 0,
  requiredTemplateIds: [], completedTemplateIds: [],
  missingTemplateIds: [], expiredTemplateIds: [],
};

export function useFormsStatus(appointmentId: string) {
  return useQuery({
    queryKey: ['formsStatus', appointmentId],
    queryFn: () => apiFetch<FormsStatus>(`/appointments/${appointmentId}/form-readiness`),
    enabled: !!appointmentId,
  });
}

export function useFormsStatusForPatient(patientId: string, consultationTypeIds: string[]) {
  return useQuery({
    queryKey: ['formReadiness', patientId, consultationTypeIds],
    queryFn: () => {
      const params = new URLSearchParams({ patientId });
      consultationTypeIds.forEach(id => params.append('consultationTypeId', id));
      return apiFetch<FormsStatus>(`/form-readiness?${params}`);
    },
    enabled: !!patientId,
    placeholderData: EMPTY_STATUS,
  });
}
