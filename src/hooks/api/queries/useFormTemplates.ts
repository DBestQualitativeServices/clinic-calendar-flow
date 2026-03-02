import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { FormTemplate } from '@/types';

export function useFormTemplates() {
  return useQuery({
    queryKey: ['formTemplates'],
    queryFn: () => apiFetch<FormTemplate[]>('/form-templates'),
  });
}
