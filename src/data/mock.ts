import type {
  SpecializationCategory,
  ConsultationType,
  Doctor,
  Patient,
  Appointment,
  TimeBlock,
} from '@/types';

// ===== Specialization Categories =====
export const categories: SpecializationCategory[] = [
  { id: 'cat-estetica', name: 'Estetică', color: 'spec-estetica' },
  { id: 'cat-medicala', name: 'Medicală', color: 'spec-medicala' },
  { id: 'cat-generala', name: 'Generală', color: 'spec-generala' },
];

// ===== Consultation Types =====
export const consultationTypes: ConsultationType[] = [
  // Estetică
  { id: 'ct-dermapen', categoryId: 'cat-estetica', name: 'Dermapen', defaultDurationMinutes: 30 },
  { id: 'ct-botox', categoryId: 'cat-estetica', name: 'Botox', defaultDurationMinutes: 30 },
  { id: 'ct-acid-hialuronic', categoryId: 'cat-estetica', name: 'Acid hialuronic', defaultDurationMinutes: 45 },
  { id: 'ct-peeling', categoryId: 'cat-estetica', name: 'Peeling chimic', defaultDurationMinutes: 30 },
  // Medicală
  { id: 'ct-chirurgie', categoryId: 'cat-medicala', name: 'Chirurgie minoră', defaultDurationMinutes: 60 },
  { id: 'ct-dermatoscopie', categoryId: 'cat-medicala', name: 'Dermatoscopie', defaultDurationMinutes: 30 },
  { id: 'ct-crioterapie', categoryId: 'cat-medicala', name: 'Crioterapie', defaultDurationMinutes: 15 },
  { id: 'ct-biopsie', categoryId: 'cat-medicala', name: 'Biopsie', defaultDurationMinutes: 30 },
  // Generală
  { id: 'ct-consultatie', categoryId: 'cat-generala', name: 'Consultație', defaultDurationMinutes: 15 },
  { id: 'ct-control', categoryId: 'cat-generala', name: 'Control', defaultDurationMinutes: 15 },
  { id: 'ct-gdpr', categoryId: 'cat-generala', name: 'Consult GDPR', defaultDurationMinutes: 15 },
];

// ===== Doctors =====
export const doctors: Doctor[] = [
  { id: 'dr-1', name: 'Dr. Andrei Popescu', categoryIds: ['cat-estetica', 'cat-generala'] },
  { id: 'dr-2', name: 'Dr. Maria Ionescu', categoryIds: ['cat-medicala', 'cat-generala'] },
  { id: 'dr-3', name: 'Dr. Elena Dumitrescu', categoryIds: ['cat-estetica'] },
  { id: 'dr-4', name: 'Dr. Radu Constantinescu', categoryIds: ['cat-medicala', 'cat-estetica'] },
  { id: 'dr-5', name: 'Dr. Ana Vasilescu', categoryIds: ['cat-generala', 'cat-medicala'] },
  { id: 'dr-6', name: 'Dr. Mihai Stanescu', categoryIds: ['cat-estetica', 'cat-medicala', 'cat-generala'], isOnVacation: true },
];

// ===== Patients =====
export const patients: Patient[] = [
  { id: 'p-1', firstName: 'Ion', lastName: 'Marinescu', phone: '0722111222', dateOfBirth: '1985-03-15' },
  { id: 'p-2', firstName: 'Ana', lastName: 'Popa', phone: '0733222333', dateOfBirth: '1990-07-22' },
  { id: 'p-3', firstName: 'Gheorghe', lastName: 'Radu', phone: '0744333444', dateOfBirth: '1978-11-03' },
  { id: 'p-4', firstName: 'Elena', lastName: 'Stoica', phone: '0755444555', dateOfBirth: '1995-01-30' },
  { id: 'p-5', firstName: 'Vasile', lastName: 'Munteanu', phone: '0766555666', dateOfBirth: '1982-06-18' },
  { id: 'p-6', firstName: 'Maria', lastName: 'Florescu', phone: '0777666777', dateOfBirth: '1988-09-25' },
  { id: 'p-7', firstName: 'Cristian', lastName: 'Barbu', phone: '0788777888', dateOfBirth: '1973-12-08', isIncomplete: true },
  { id: 'p-8', firstName: 'Daniela', lastName: 'Neagu', phone: '0799888999', dateOfBirth: '1992-04-12' },
  { id: 'p-9', firstName: 'Adrian', lastName: 'Dinu', phone: '0722999000', dateOfBirth: '1980-08-05' },
  { id: 'p-10', firstName: 'Simona', lastName: 'Tudor', phone: '0733000111', dateOfBirth: '1997-02-28' },
  { id: 'p-11', firstName: 'Florin', lastName: 'Georgescu', phone: '0744111222', dateOfBirth: '1975-05-20' },
  { id: 'p-12', firstName: 'Roxana', lastName: 'Lazar', phone: '0755222333', dateOfBirth: '1993-10-14' },
  { id: 'p-13', firstName: 'Mihai', lastName: 'Serban', phone: '0766333444', dateOfBirth: '1986-07-01', isIncomplete: true },
  { id: 'p-14', firstName: 'Andreea', lastName: 'Matei', phone: '0777444555', dateOfBirth: '1991-03-09' },
  { id: 'p-15', firstName: 'Dan', lastName: 'Preda', phone: '0788555666', dateOfBirth: '1970-11-17' },
];

// Helper to get today's date as ISO string
function today(): string {
  return new Date().toISOString().split('T')[0];
}

function todayISO(): string {
  return new Date().toISOString();
}

// ===== Appointments (for today) =====
export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    doctorId: 'dr-1',
    date: today(),
    startTime: '08:30',
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-1', consultations: [{ consultationTypeId: 'ct-dermapen', durationMinutes: 30 }] }],
    status: 'programat',
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat', actor: 'Recepție' }],
  },
  {
    id: 'apt-2',
    doctorId: 'dr-1',
    date: today(),
    startTime: '09:30',
    totalDurationMinutes: 45,
    patients: [{ patientId: 'p-2', consultations: [{ consultationTypeId: 'ct-acid-hialuronic', durationMinutes: 45 }] }],
    status: 'programat',
    smsConfirmationSent: true,
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat', actor: 'Recepție' }],
  },
  {
    id: 'apt-3',
    doctorId: 'dr-2',
    date: today(),
    startTime: '08:00',
    totalDurationMinutes: 60,
    patients: [{ patientId: 'p-3', consultations: [{ consultationTypeId: 'ct-chirurgie', durationMinutes: 60 }] }],
    status: 'sosit',
    createdAt: todayISO(),
    timeline: [
      { timestamp: todayISO(), action: 'Creat', actor: 'Recepție' },
      { timestamp: todayISO(), action: 'Check-in', actor: 'Recepție' },
    ],
  },
  {
    id: 'apt-4',
    doctorId: 'dr-2',
    date: today(),
    startTime: '10:00',
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-4', consultations: [{ consultationTypeId: 'ct-dermatoscopie', durationMinutes: 30 }] }],
    status: 'programat',
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat', actor: 'Recepție' }],
  },
  {
    id: 'apt-5',
    doctorId: 'dr-3',
    date: today(),
    startTime: '09:00',
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-5', consultations: [{ consultationTypeId: 'ct-peeling', durationMinutes: 30 }] }],
    status: 'in_consult',
    createdAt: todayISO(),
    timeline: [
      { timestamp: todayISO(), action: 'Creat', actor: 'Recepție' },
      { timestamp: todayISO(), action: 'Check-in', actor: 'Recepție' },
      { timestamp: todayISO(), action: 'In consult' },
    ],
  },
  {
    id: 'apt-6',
    doctorId: 'dr-3',
    date: today(),
    startTime: '10:00',
    totalDurationMinutes: 60,
    patients: [
      { patientId: 'p-6', consultations: [{ consultationTypeId: 'ct-dermapen', durationMinutes: 30 }] },
      { patientId: 'p-8', consultations: [{ consultationTypeId: 'ct-botox', durationMinutes: 30 }] },
    ],
    status: 'programat',
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat', actor: 'Recepție' }],
  },
  {
    id: 'apt-7',
    doctorId: 'dr-4',
    date: today(),
    startTime: '08:00',
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-9', consultations: [{ consultationTypeId: 'ct-botox', durationMinutes: 30 }] }],
    status: 'finalizat',
    createdAt: todayISO(),
    timeline: [
      { timestamp: todayISO(), action: 'Creat', actor: 'Recepție' },
      { timestamp: todayISO(), action: 'Check-in', actor: 'Recepție' },
      { timestamp: todayISO(), action: 'In consult' },
      { timestamp: todayISO(), action: 'Finalizat', actor: 'Recepție' },
    ],
  },
  {
    id: 'apt-8',
    doctorId: 'dr-4',
    date: today(),
    startTime: '09:00',
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-10', consultations: [{ consultationTypeId: 'ct-dermatoscopie', durationMinutes: 30 }] }],
    status: 'programat',
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat', actor: 'Recepție' }],
  },
  {
    id: 'apt-9',
    doctorId: 'dr-5',
    date: today(),
    startTime: '08:30',
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-11', consultations: [
      { consultationTypeId: 'ct-consultatie', durationMinutes: 15 },
      { consultationTypeId: 'ct-gdpr', durationMinutes: 15 },
    ] }],
    status: 'programat',
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat', actor: 'Recepție' }],
  },
  {
    id: 'apt-10',
    doctorId: 'dr-5',
    date: today(),
    startTime: '11:00',
    totalDurationMinutes: 15,
    patients: [{ patientId: 'p-12', consultations: [{ consultationTypeId: 'ct-control', durationMinutes: 15 }] }],
    status: 'anulat',
    createdAt: todayISO(),
    timeline: [
      { timestamp: todayISO(), action: 'Creat', actor: 'Recepție' },
      { timestamp: todayISO(), action: 'Anulat', actor: 'Recepție' },
    ],
  },
  {
    id: 'apt-11',
    doctorId: 'dr-1',
    date: today(),
    startTime: '14:00',
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-7', consultations: [{ consultationTypeId: 'ct-dermapen', durationMinutes: 30 }] }],
    status: 'no_show',
    createdAt: todayISO(),
    timeline: [
      { timestamp: todayISO(), action: 'Creat', actor: 'Recepție' },
      { timestamp: todayISO(), action: 'No-show' },
    ],
  },
  // Walk-in without fixed time
  {
    id: 'apt-12',
    doctorId: 'dr-2',
    date: today(),
    totalDurationMinutes: 15,
    patients: [{ patientId: 'p-13', consultations: [{ consultationTypeId: 'ct-consultatie', durationMinutes: 15 }] }],
    status: 'programat',
    isWalkIn: true,
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat (walk-in)', actor: 'Recepție' }],
  },
  {
    id: 'apt-13',
    doctorId: 'dr-4',
    date: today(),
    totalDurationMinutes: 30,
    patients: [{ patientId: 'p-14', consultations: [{ consultationTypeId: 'ct-crioterapie', durationMinutes: 15 }, { consultationTypeId: 'ct-control', durationMinutes: 15 }] }],
    status: 'programat',
    isWalkIn: true,
    createdAt: todayISO(),
    timeline: [{ timestamp: todayISO(), action: 'Creat (walk-in)', actor: 'Recepție' }],
  },
];

// ===== Time Blocks =====
export const initialTimeBlocks: TimeBlock[] = [
  { id: 'tb-1', doctorId: 'dr-1', date: today(), startTime: '12:00', durationMinutes: 60, reason: 'Pauză de masă' },
  { id: 'tb-2', doctorId: 'dr-3', date: today(), startTime: '13:00', durationMinutes: 30, reason: 'Personal' },
  { id: 'tb-3', doctorId: 'dr-5', date: today(), startTime: '15:00', durationMinutes: 120, reason: 'Indisponibil' },
];
