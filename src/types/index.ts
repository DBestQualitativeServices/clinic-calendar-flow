// ===== Specialization (2-level hierarchy) =====

export interface SpecializationCategory {
  id: string;
  name: string; // e.g. "Estetică", "Medicală", "Generală"
  color: string; // HSL CSS variable name for chips
}

export interface ConsultationType {
  id: string;
  categoryId: string;
  name: string; // e.g. "Dermapen", "Chirurgie", "Consultație"
  defaultDurationMinutes: number; // default 15, customizable per doctor
}

// ===== Doctor =====

export interface Doctor {
  id: string;
  name: string;
  categoryIds: string[]; // level-1 specialization IDs — can perform all sub-consultations
  /** Per-consultation duration overrides (consultationTypeId → minutes) */
  durationOverrides?: Record<string, number>;
  isOnVacation?: boolean; // grayed column
}

// ===== Patient =====

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string; // ISO date
  cnp?: string;
  email?: string;
  address?: string;
  medicalNotes?: string;
  /** true when created with minimal data (phone booking) */
  isIncomplete?: boolean;
}

// ===== Appointment statuses =====

export type AppointmentStatus =
  | 'programat'
  | 'sosit'
  | 'in_consult'
  | 'finalizat'
  | 'anulat'
  | 'no_show';

// ===== Appointment =====

export interface AppointmentConsultation {
  consultationTypeId: string;
  durationMinutes: number; // resolved duration (doctor override or default)
}

export interface AppointmentPatient {
  patientId: string;
  consultations: AppointmentConsultation[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  date: string; // ISO date (YYYY-MM-DD)
  startTime?: string; // HH:mm — undefined for walk-ins without fixed time
  totalDurationMinutes: number;
  patients: AppointmentPatient[];
  status: AppointmentStatus;
  isWalkIn?: boolean;
  smsConfirmationSent?: boolean;
  createdAt: string; // ISO datetime
  timeline: TimelineEntry[];
  notes?: string;
  /** Recurring group ID — all appointments in a recurring series share this */
  recurringGroupId?: string;
}

export interface TimelineEntry {
  timestamp: string; // ISO datetime
  action: string; // e.g. "Creat", "Check-in", "In consult", "Finalizat"
  actor?: string; // e.g. "Receptie"
}

// ===== Time Block (doctor unavailability) =====

export interface TimeBlock {
  id: string;
  doctorId: string;
  date: string; // ISO date
  startTime: string; // HH:mm
  durationMinutes: number;
  reason?: string; // "Pauză", "Personal", "Indisponibil", free text
}

// ===== Calendar view modes =====

export type CalendarViewMode = 'daily' | 'weekly';

export interface CalendarState {
  viewMode: CalendarViewMode;
  selectedDate: string; // ISO date
  selectedDoctorId?: string; // set in weekly mode
  specialtyFilter?: string; // category ID filter
  searchQuery?: string; // search across appointments
}

// ===== Medical Forms =====

export interface FormQuestion {
  id: string;
  text: string;
  type: 'checkbox' | 'text' | 'single_select' | 'multi_select';
  options?: string[];
  required: boolean;
}

export interface FormTemplate {
  id: string;
  title: string;
  validityDays: number;
  signatureCount: number;
  questions: FormQuestion[];
}

export interface CompletedForm {
  id: string;
  patientId: string;
  formTemplateId: string;
  completedAt: string; // ISO datetime
  expiresAt: string; // ISO datetime
  answers: { questionId: string; value: unknown }[];
  signatures: string[]; // base64 data URLs
  appointmentId?: string;
}

export interface TabletSession {
  accessCode: string;
  appointmentId: string;
  patientId: string;
  active: boolean;
  createdAt: string; // ISO datetime
}

export type ConsultFormRequirements = Record<string, string[]>; // consultation name → template IDs
