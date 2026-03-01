import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import type { TimeBlock } from '@/types';

export function useCreateBlockedSlot() {
  const { setTimeBlocks } = useMockData();

  const mutate = useCallback(
    (tb: TimeBlock) => {
      setTimeBlocks(prev => [...prev, tb]);
    },
    [setTimeBlocks]
  );

  return { mutate, mutateAsync: async (tb: TimeBlock) => { mutate(tb); return tb; }, isPending: false };
}
