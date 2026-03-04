//
// SINGURUL fișier din care componentele importă hooks de date.
//
// Comutare automată: dacă VITE_API_URL e setat → API (Spring Boot),
// altfel → mock (dezvoltare offline).
//
import * as mockHooks from '../mock';
import * as apiHooks from '../api';

const source = import.meta.env.VITE_API_URL ? apiHooks : mockHooks;

// Queries
export const useDoctors = source.useDoctors;
export const usePatients = source.usePatients;
export const usePatientById = source.usePatientById;
export const useCategories = source.useCategories;
export const useConsultationTypes = source.useConsultationTypes;
export const useAppointments = source.useAppointments;
export const useAppointmentById = source.useAppointmentById;
export const usePatientAppointments = source.usePatientAppointments;
export const useUnresolvedAppointments = source.useUnresolvedAppointments;
export const useBlockedSlots = source.useBlockedSlots;
export const useAvailableSlots = source.useAvailableSlots;
export const useFormTemplates = source.useFormTemplates;
export const useFormsStatus = source.useFormsStatus;
export const useFormsStatusForPatient = source.useFormsStatusForPatient;
export const useCompletedForms = source.useCompletedForms;
export const useTabletSession = source.useTabletSession;
export const useTabletSessionByCode = source.useTabletSessionByCode;

// Mutations
export const useCreateAppointment = source.useCreateAppointment;
export const useUpdateAppointmentStatus = source.useUpdateAppointmentStatus;
export const useCheckinAppointment = source.useCheckinAppointment;
export const useStartConsultation = source.useStartConsultation;
export const useCompleteAppointment = source.useCompleteAppointment;
export const useCancelAppointment = source.useCancelAppointment;
export const useMarkNoShow = source.useMarkNoShow;
export const useRescheduleAppointment = source.useRescheduleAppointment;
export const useCreateBlockedSlot = source.useCreateBlockedSlot;
export const useDeleteBlockedSlot = source.useDeleteBlockedSlot;
export const useCreateTabletSession = source.useCreateTabletSession;
export const useRemoveTabletSession = source.useRemoveTabletSession;
export const useSubmitForm = source.useSubmitForm;
export const useCreatePatient = source.useCreatePatient;
export const useUpdatePatient = source.useUpdatePatient;

// Provider
export const MockDataProvider = source.MockDataProvider;

// Types (identical in both layers)
export type { FormsStatus } from '../api/types';
