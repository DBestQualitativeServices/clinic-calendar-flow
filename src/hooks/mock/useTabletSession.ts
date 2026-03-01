import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function useTabletSession(appointmentId: string) {
  const { tabletSessions } = useMockData();
  const data = useMemo(
    () => tabletSessions.find(s => s.appointmentId === appointmentId && s.active),
    [tabletSessions, appointmentId]
  );
  return { data, isLoading: false, error: null };
}
