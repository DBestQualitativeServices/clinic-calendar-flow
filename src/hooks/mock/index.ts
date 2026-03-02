// Queries
export { useDoctors } from './useDoctors';
export { usePatients } from './usePatients';
export { usePatientById } from './usePatientById';
export { useCategories } from './useCategories';
export { useConsultationTypes } from './useConsultationTypes';
export { useAppointments } from './useAppointments';
export { useAppointmentById } from './useAppointmentById';
export { usePatientAppointments } from './usePatientAppointments';
export { useUnresolvedAppointments } from './useUnresolvedAppointments';
export { useBlockedSlots } from './useBlockedSlots';
export { useAvailableSlots } from './useAvailableSlots';
export { useFormTemplates } from './useFormTemplates';
export { useFormsStatus, useFormsStatusForPatient } from './useFormsStatus';
export { useCompletedForms } from './useCompletedForms';
export { useTabletSession } from './useTabletSession';
export { useTabletSessionByCode } from './useTabletSessionByCode';

// Mutations
export { useCreateAppointment } from './useCreateAppointment';
export { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
export { useCheckinAppointment } from './useCheckinAppointment';
export { useCompleteAppointment } from './useCompleteAppointment';
export { useCancelAppointment } from './useCancelAppointment';
export { useMarkNoShow } from './useMarkNoShow';
export { useRescheduleAppointment } from './useRescheduleAppointment';
export { useCreateBlockedSlot } from './useCreateBlockedSlot';
export { useDeleteBlockedSlot } from './useDeleteBlockedSlot';
export { useCreateTabletSession, useRemoveTabletSession } from './useCreateTabletSession';
export { useSubmitForm } from './useSubmitForm';
export { useCreatePatient } from './useCreatePatient';
export { useUpdatePatient } from './useUpdatePatient';

// Provider
export { MockDataProvider } from './MockDataProvider';

// Types
export type { FormsStatus } from './types';
