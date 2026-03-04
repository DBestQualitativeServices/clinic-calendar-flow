import type { ReactNode } from 'react';

// Queries
export { useDoctors } from './queries/useDoctors';
export { usePatients } from './queries/usePatients';
export { usePatientById } from './queries/usePatientById';
export { useCategories } from './queries/useCategories';
export { useConsultationTypes } from './queries/useConsultationTypes';
export { useAppointments } from './queries/useAppointments';
export { useAppointmentById } from './queries/useAppointmentById';
export { usePatientAppointments } from './queries/usePatientAppointments';
export { useUnresolvedAppointments } from './queries/useUnresolvedAppointments';
export { useBlockedSlots } from './queries/useBlockedSlots';
export { useAvailableSlots } from './queries/useAvailableSlots';
export { useFormTemplates } from './queries/useFormTemplates';
export { useFormsStatus, useFormsStatusForPatient } from './queries/useFormsStatus';
export { useCompletedForms } from './queries/useCompletedForms';
export { useTabletSession } from './queries/useTabletSession';
export { useTabletSessionByCode } from './queries/useTabletSessionByCode';

// Mutations
export { useCreateAppointment } from './mutations/useCreateAppointment';
export { useUpdateAppointmentStatus } from './mutations/useUpdateAppointmentStatus';
export { useCheckinAppointment } from './mutations/useCheckinAppointment';
export { useStartConsultation } from './mutations/useStartConsultation';
export { useCompleteAppointment } from './mutations/useCompleteAppointment';
export { useCancelAppointment } from './mutations/useCancelAppointment';
export { useMarkNoShow } from './mutations/useMarkNoShow';
export { useRescheduleAppointment } from './mutations/useRescheduleAppointment';
export { useCreateBlockedSlot } from './mutations/useCreateBlockedSlot';
export { useDeleteBlockedSlot } from './mutations/useDeleteBlockedSlot';
export { useCreateTabletSession, useRemoveTabletSession } from './mutations/useCreateTabletSession';
export { useSubmitForm } from './mutations/useSubmitForm';
export { useCreatePatient } from './mutations/useCreatePatient';
export { useUpdatePatient } from './mutations/useUpdatePatient';

// No-op provider (React Query handles caching — no context needed)
export function MockDataProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Types
export type { FormsStatus } from './types';
