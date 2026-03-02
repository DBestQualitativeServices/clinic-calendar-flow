import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Patient } from '@/types';

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patient: Omit<Patient, 'id'>) =>
      apiFetch<Patient>('/patients', {
        method: 'POST',
        body: JSON.stringify(patient),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });
}
