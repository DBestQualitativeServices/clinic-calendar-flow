import { useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import type { CompletedForm } from '@/types';

export function useSubmitForm() {
  const { setCompletedForms } = useMockData();

  const mutate = useCallback(
    (form: CompletedForm) => {
      setCompletedForms(prev => [...prev, form]);
    },
    [setCompletedForms]
  );

  return { mutate, mutateAsync: async (f: CompletedForm) => { mutate(f); return f; }, isPending: false };
}
