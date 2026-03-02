import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Appointment, Patient, TabletSession } from '@/types';

interface TabletSessionData {
  session: TabletSession;
  appointment: Appointment;
  patient: Patient;
  pendingForms: string[];
  completedFormIds: string[];
  requiredTemplateIds: string[];
}

export function useTabletSessionByCode(code: string) {
  return useQuery({
    queryKey: ['tabletSession', 'code', code],
    queryFn: () => apiFetch<TabletSessionData>(`/signing-sessions/code/${encodeURIComponent(code)}`),
    enabled: !!code,
  });
}
