import { formTemplates } from '@/data/mock';

export function useFormTemplates() {
  return { data: formTemplates, isLoading: false, error: null };
}
