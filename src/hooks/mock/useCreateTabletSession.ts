import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import type { TabletSession } from '@/types';

export function useCreateTabletSession() {
  const { setTabletSessions } = useMockData();

  const mutate = useCallback(
    (session: TabletSession) => {
      setTabletSessions(prev => [...prev, session]);
    },
    [setTabletSessions]
  );

  return { mutate, mutateAsync: async (s: TabletSession) => { mutate(s); return s; }, isPending: false };
}

export function useRemoveTabletSession() {
  const { setTabletSessions } = useMockData();

  const mutate = useCallback(
    (code: string) => {
      setTabletSessions(prev => prev.filter(s => s.accessCode !== code));
    },
    [setTabletSessions]
  );

  return { mutate, isPending: false };
}
