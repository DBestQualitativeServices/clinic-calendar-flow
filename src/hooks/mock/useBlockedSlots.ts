import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';

export function useBlockedSlots(date: string) {
  const { timeBlocks } = useMockData();
  const data = useMemo(() => timeBlocks.filter(tb => tb.date === date), [timeBlocks, date]);
  return { data, isLoading: false, error: null };
}
