import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { CompletedForm } from '@/types';

export function useSubmitForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: CompletedForm) =>
      apiFetch<CompletedForm>('/form-submissions', {
        method: 'POST',
        body: JSON.stringify(form),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedForms'] });
      queryClient.invalidateQueries({ queryKey: ['formsStatus'] });
    },
  });
}
