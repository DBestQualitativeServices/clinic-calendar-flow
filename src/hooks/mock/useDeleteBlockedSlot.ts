import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';

export function useDeleteBlockedSlot() {
  const { setTimeBlocks } = useMockData();

  const mutate = useCallback(
    ({ blockedSlotId }: { blockedSlotId: string }) => {
      setTimeBlocks(prev => prev.filter(t => t.id !== blockedSlotId));
    },
    [setTimeBlocks]
  );

  return { mutate, mutateAsync: async (input: { blockedSlotId: string }) => mutate(input), isPending: false };
}
