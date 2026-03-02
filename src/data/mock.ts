import type {
  SpecializationCategory,
  ConsultationType,
  Doctor,
  Patient,
  Appointment,
  TimeBlock,
  FormTemplate,
  CompletedForm,
  TabletSession,
  ConsultFormRequirements,
} from "@/types";

// ===== Specialization Categories =====
export const categories: SpecializationCategory[] = [
  { id: "cat-estetica", name: "Estetica", color: "spec-estetica" },
  { id: "cat-medicala", name: "Medicala", color: "spec-medicala" },
  { id: "cat-generala", name: "Generala", color: "spec-generala" },
];

// ===== Consultation Types =====
export const consultationTypes: ConsultationType[] = [
  // Estetica
  { id: "ct-dermapen", categoryId: "cat-estetica", name: "Dermapen", defaultDurationMinutes: 30 },
  { id: "ct-botox", categoryId: "cat-estetica", name: "Botox", defaultDurationMinutes: 30 },
  { id: "ct-acid-hialuronic", categoryId: "cat-estetica", name: "Acid hialuronic", defaultDurationMinutes: 45 },
  { id: "ct-peeling", categoryId: "cat-estetica", name: "Peeling chimic", defaultDurationMinutes: 30 },
  // Medicala
  { id: "ct-chirurgie", categoryId: "cat-medicala", name: "Chirurgie minora", defaultDurationMinutes: 60 },
  { id: "ct-dermatoscopie", categoryId: "cat-medicala", name: "Dermatoscopie", defaultDurationMinutes: 30 },
  { id: "ct-crioterapie", categoryId: "cat-medicala", name: "Crioterapie", defaultDurationMinutes: 15 },
  { id: "ct-biopsie", categoryId: "cat-medicala", name: "Biopsie", defaultDurationMinutes: 30 },
  // Generala
  { id: "ct-consultatie", categoryId: "cat-generala", name: "Consultatie", defaultDurationMinutes: 15 },
  { id: "ct-control", categoryId: "cat-generala", name: "Control", defaultDurationMinutes: 15 },
  { id: "ct-gdpr", categoryId: "cat-generala", name: "Consult GDPR", defaultDurationMinutes: 15 },
];

// ===== Doctors =====
export const doctors: Doctor[] = [
  { id: "dr-1", name: "Dr. Andrei Popescu", categoryIds: ["cat-estetica", "cat-generala"] },
  { id: "dr-2", name: "Dr. Maria Ionescu", categoryIds: ["cat-medicala", "cat-generala"] },
  { id: "dr-3", name: "Dr. Elena Dumitrescu", categoryIds: ["cat-estetica"] },
  { id: "dr-4", name: "Dr. Radu Constantinescu", categoryIds: ["cat-medicala", "cat-estetica"] },
  { id: "dr-5", name: "Dr. Ana Vasilescu", categoryIds: ["cat-generala", "cat-medicala"] },
  {
    id: "dr-6",
    name: "Dr. Mihai Stanescu",
    categoryIds: ["cat-estetica", "cat-medicala", "cat-generala"],
    isOnVacation: true,
  },
];

// ===== Patients =====
export const patients: Patient[] = [
  { id: "p-1", firstName: "Ion", lastName: "Marinescu", phone: "0722111222", dateOfBirth: "1985-03-15", cnp: "1850315400123" },
  { id: "p-2", firstName: "Ana", lastName: "Popa", phone: "0733222333", dateOfBirth: "1990-07-22", cnp: "2900722410234" },
  { id: "p-3", firstName: "Gheorghe", lastName: "Radu", phone: "0744333444", dateOfBirth: "1978-11-03", cnp: "1781103420345" },
  { id: "p-4", firstName: "Elena", lastName: "Stoica", phone: "0755444555", dateOfBirth: "1995-01-30", cnp: "2950130430456" },
  { id: "p-5", firstName: "Vasile", lastName: "Munteanu", phone: "0766555666", dateOfBirth: "1982-06-18", cnp: "1820618440567" },
  { id: "p-6", firstName: "Maria", lastName: "Florescu", phone: "0777666777", dateOfBirth: "1988-09-25", cnp: "2880925450678" },
  {
    id: "p-7",
    firstName: "Cristian",
    lastName: "Barbu",
    phone: "0788777888",
    dateOfBirth: "1973-12-08",
    isIncomplete: true,
  },
  { id: "p-8", firstName: "Daniela", lastName: "Neagu", phone: "0799888999", dateOfBirth: "1992-04-12", cnp: "2920412470890" },
  { id: "p-9", firstName: "Adrian", lastName: "Dinu", phone: "0722999000", dateOfBirth: "1980-08-05", cnp: "1800805480901" },
  { id: "p-10", firstName: "Simona", lastName: "Tudor", phone: "0733000111", dateOfBirth: "1997-02-28", cnp: "2970228490012" },
  { id: "p-11", firstName: "Florin", lastName: "Georgescu", phone: "0744111222", dateOfBirth: "1975-05-20", cnp: "1750520400123" },
  { id: "p-12", firstName: "Roxana", lastName: "Lazar", phone: "0755222333", dateOfBirth: "1993-10-14", cnp: "2931014410234" },
  {
    id: "p-13",
    firstName: "Mihai",
    lastName: "Serban",
    phone: "0766333444",
    dateOfBirth: "1986-07-01",
    isIncomplete: true,
  },
  { id: "p-14", firstName: "Andreea", lastName: "Matei", phone: "0777444555", dateOfBirth: "1991-03-09", cnp: "2910309430456" },
  { id: "p-15", firstName: "Dan", lastName: "Preda", phone: "0788555666", dateOfBirth: "1970-11-17", cnp: "1701117440567" },
];

// ===== Form Templates =====
export const formTemplates: FormTemplate[] = [
  {
    id: "ft1",
    title: "Acord prelucrare date (GDPR)",
    validityDays: 365,
    signatureCount: 1,
    questions: [
      { id: "q1", text: "Numele complet al pacientului", type: "text", required: true },
      { id: "q2", text: "Sunt de acord cu prelucrarea datelor personale conform GDPR.", type: "checkbox", required: true },
    ],
  },
  {
    id: "ft2",
    title: "Declaratie alergii - Botox",
    validityDays: 1,
    signatureCount: 1,
    questions: [
      { id: "q3", text: "Enumerati alergiile cunoscute", type: "text", required: true },
      { id: "q4", text: "Confirm ca nu iau medicamente anticoagulante.", type: "checkbox", required: true },
    ],
  },
  {
    id: "ft3",
    title: "Consimtamant procedura",
    validityDays: 1,
    signatureCount: 1,
    questions: [
      { id: "q5", text: "Observatii sau intrebari pentru medic", type: "text", required: false },
      { id: "q6", text: "Am fost informat/a despre riscurile procedurii.", type: "checkbox", required: true },
    ],
  },
  {
    id: "ft4",
    title: "Consimtamant fotografiere",
    validityDays: 365,
    signatureCount: 1,
    questions: [
      { id: "q7", text: "Scopul fotografierii (medical/educational)", type: "text", required: false },
      { id: "q8", text: "Sunt de acord cu fotografierea inainte si dupa procedura.", type: "checkbox", required: true },
    ],
  },
  {
    id: "ft5",
    title: "Acord tratament minor",
    validityDays: 1,
    signatureCount: 2,
    questions: [
      { id: "q9", text: "Numele reprezentantului legal", type: "text", required: true },
      { id: "q10", text: "Confirm ca sunt de acord cu tratamentul minorului.", type: "checkbox", required: true },
    ],
  },
];

// ===== Consultation -> Form Requirements =====
export const consultFormRequirements: ConsultFormRequirements = {
  Dermapen: ["ft1", "ft3", "ft4"],
  Botox: ["ft1", "ft2", "ft4"],
  "Acid hialuronic": ["ft1", "ft4"],
  "Peeling chimic": ["ft1", "ft4"],
  "Chirurgie minora": ["ft1", "ft3", "ft4"],
  Dermatoscopie: ["ft1"],
  Consultatie: ["ft1"],
  Control: ["ft1"],
  Crioterapie: ["ft1"],
  Biopsie: ["ft1", "ft3"],
  "Consult GDPR": ["ft1"],
};

// ===== Helpers =====
function today(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function todayAt(time: string): string {
  return `${today()}T${time}:00`;
}

function yesterdayAt(time: string): string {
  return `${yesterday()}T${time}:00`;
}

// ===== Completed Forms =====
// Scenarii:
//   p-1 (Ion Marinescu):  GDPR valid, foto valid, consimtamant Dermapen EXPIRAT → 1 pending
//   p-3 (Gheorghe Radu):  GDPR valid, consimtamant procedura + foto LIPSA → 2 pending
//   p-5 (Vasile Munteanu): GDPR valid, foto LIPSA → 1 pending
//   p-6 (Maria Florescu): NIMIC → toate pending
//   p-8 (Daniela Neagu):  NIMIC → toate pending
//   p-9 (Adrian Dinu):    GDPR valid, alergii Botox valid, foto valid → 0 pending (totul ok)
//   p-2, p-4, p-10, p-11, p-12, p-13, p-14: NIMIC

export const initialCompletedForms: CompletedForm[] = [
  // === p-1 (Ion Marinescu) — GDPR valid, foto valid, consimtamant EXPIRAT ===
  {
    id: "cf1",
    patientId: "p-1",
    formTemplateId: "ft1",
    completedAt: "2026-01-15T10:30:00",
    expiresAt: "2027-01-15T10:30:00",
    answers: [{ questionId: "q1", value: "Ion Marinescu" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf2",
    patientId: "p-1",
    formTemplateId: "ft4",
    completedAt: "2026-01-15T10:35:00",
    expiresAt: "2027-01-15T10:35:00",
    answers: [{ questionId: "q7", value: "Scop medical" }, { questionId: "q8", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf3",
    patientId: "p-1",
    formTemplateId: "ft3",
    completedAt: yesterdayAt("09:00"),
    expiresAt: todayAt("09:00"),
    answers: [{ questionId: "q5", value: "Fara observatii" }, { questionId: "q6", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-3 (Gheorghe Radu) — doar GDPR valid ===
  {
    id: "cf4",
    patientId: "p-3",
    formTemplateId: "ft1",
    completedAt: "2025-11-20T14:00:00",
    expiresAt: "2026-11-20T14:00:00",
    answers: [{ questionId: "q1", value: "Gheorghe Radu" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-5 (Vasile Munteanu) — doar GDPR valid ===
  {
    id: "cf5",
    patientId: "p-5",
    formTemplateId: "ft1",
    completedAt: "2026-02-20T14:00:00",
    expiresAt: "2027-02-20T14:00:00",
    answers: [{ questionId: "q1", value: "Vasile Munteanu" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-9 (Adrian Dinu) — TOATE formularele Botox ok ===
  {
    id: "cf6",
    patientId: "p-9",
    formTemplateId: "ft1",
    completedAt: todayAt("07:45"),
    expiresAt: `${today().replace("2026", "2027")}T07:45:00`,
    answers: [{ questionId: "q1", value: "Adrian Dinu" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
    appointmentId: "apt-7",
  },
  {
    id: "cf7",
    patientId: "p-9",
    formTemplateId: "ft2",
    completedAt: todayAt("07:50"),
    expiresAt: todayAt("23:59"),
    answers: [{ questionId: "q3", value: "Nicio alergie cunoscuta" }, { questionId: "q4", value: true }],
    signatures: ["data:image/png;base64,SIG"],
    appointmentId: "apt-7",
  },
  {
    id: "cf8",
    patientId: "p-9",
    formTemplateId: "ft4",
    completedAt: todayAt("07:52"),
    expiresAt: `${today().replace("2026", "2027")}T07:52:00`,
    answers: [{ questionId: "q7", value: "Scop medical si educational" }, { questionId: "q8", value: true }],
    signatures: ["data:image/png;base64,SIG"],
    appointmentId: "apt-7",
  },

  // === p-2 (Ana Popa) — ft1 valid, ft4 expired ===
  {
    id: "cf9",
    patientId: "p-2",
    formTemplateId: "ft1",
    completedAt: "2026-01-10T11:00:00",
    expiresAt: "2027-01-10T11:00:00",
    answers: [{ questionId: "q1", value: "Ana Popa" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf10",
    patientId: "p-2",
    formTemplateId: "ft4",
    completedAt: yesterdayAt("08:00"),
    expiresAt: todayAt("08:00"),
    answers: [{ questionId: "q7", value: "Scop medical" }, { questionId: "q8", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-4 (Elena Stoica) — ft1, ft3, ft4 all valid ===
  {
    id: "cf11",
    patientId: "p-4",
    formTemplateId: "ft1",
    completedAt: "2026-02-01T09:00:00",
    expiresAt: "2027-02-01T09:00:00",
    answers: [{ questionId: "q1", value: "Elena Stoica" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf12",
    patientId: "p-4",
    formTemplateId: "ft3",
    completedAt: todayAt("07:30"),
    expiresAt: todayAt("23:59"),
    answers: [{ questionId: "q5", value: "Am inteles procedura" }, { questionId: "q6", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf13",
    patientId: "p-4",
    formTemplateId: "ft4",
    completedAt: "2026-02-01T09:10:00",
    expiresAt: "2027-02-01T09:10:00",
    answers: [{ questionId: "q7", value: "Doar scop medical" }, { questionId: "q8", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-8 (Daniela Neagu) — ft1 expired ===
  {
    id: "cf14",
    patientId: "p-8",
    formTemplateId: "ft1",
    completedAt: "2025-02-15T10:00:00",
    expiresAt: "2026-02-15T10:00:00",
    answers: [{ questionId: "q1", value: "Daniela Neagu" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-10 (Simona Tudor) — ft1, ft2, ft4 all valid ===
  {
    id: "cf15",
    patientId: "p-10",
    formTemplateId: "ft1",
    completedAt: "2026-02-20T10:00:00",
    expiresAt: "2027-02-20T10:00:00",
    answers: [{ questionId: "q1", value: "Simona Tudor" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf16",
    patientId: "p-10",
    formTemplateId: "ft2",
    completedAt: todayAt("08:00"),
    expiresAt: todayAt("23:59"),
    answers: [{ questionId: "q3", value: "Nicio alergie" }, { questionId: "q4", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf17",
    patientId: "p-10",
    formTemplateId: "ft4",
    completedAt: "2026-02-20T10:10:00",
    expiresAt: "2027-02-20T10:10:00",
    answers: [{ questionId: "q7", value: "Medical" }, { questionId: "q8", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-11 (Florin Georgescu) — just GDPR ===
  {
    id: "cf18",
    patientId: "p-11",
    formTemplateId: "ft1",
    completedAt: "2026-01-05T14:00:00",
    expiresAt: "2027-01-05T14:00:00",
    answers: [{ questionId: "q1", value: "Florin Georgescu" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },

  // === p-12 (Roxana Lazar) — ft1, ft3, ft4, ft5 all valid ===
  {
    id: "cf19",
    patientId: "p-12",
    formTemplateId: "ft1",
    completedAt: "2026-02-10T09:00:00",
    expiresAt: "2027-02-10T09:00:00",
    answers: [{ questionId: "q1", value: "Roxana Lazar" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf20",
    patientId: "p-12",
    formTemplateId: "ft3",
    completedAt: todayAt("07:00"),
    expiresAt: todayAt("23:59"),
    answers: [{ questionId: "q5", value: "Totul clar" }, { questionId: "q6", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf21",
    patientId: "p-12",
    formTemplateId: "ft4",
    completedAt: "2026-02-10T09:15:00",
    expiresAt: "2027-02-10T09:15:00",
    answers: [{ questionId: "q7", value: "Medical si educational" }, { questionId: "q8", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf22",
    patientId: "p-12",
    formTemplateId: "ft5",
    completedAt: todayAt("07:10"),
    expiresAt: todayAt("23:59"),
    answers: [{ questionId: "q9", value: "Roxana Lazar - Parinte" }, { questionId: "q10", value: true }],
    signatures: ["data:image/png;base64,SIG1", "data:image/png;base64,SIG2"],
  },

  // === p-14 (Andreea Matei) — ft1 valid, ft2 expired, ft4 valid ===
  {
    id: "cf23",
    patientId: "p-14",
    formTemplateId: "ft1",
    completedAt: "2026-02-25T11:00:00",
    expiresAt: "2027-02-25T11:00:00",
    answers: [{ questionId: "q1", value: "Andreea Matei" }, { questionId: "q2", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf24",
    patientId: "p-14",
    formTemplateId: "ft2",
    completedAt: yesterdayAt("10:00"),
    expiresAt: todayAt("10:00"),
    answers: [{ questionId: "q3", value: "Alergie la latex" }, { questionId: "q4", value: false }],
    signatures: ["data:image/png;base64,SIG"],
  },
  {
    id: "cf25",
    patientId: "p-14",
    formTemplateId: "ft4",
    completedAt: "2026-02-25T11:10:00",
    expiresAt: "2027-02-25T11:10:00",
    answers: [{ questionId: "q7", value: "Doar medical" }, { questionId: "q8", value: true }],
    signatures: ["data:image/png;base64,SIG"],
  },
];
//
// Snapshot: e dimineata (~10:00) pe 1 Martie 2026 (Sambata — policlinica e deschisa L-S)
//
// Scenarii formulare per programare:
//   apt-1  p-1  Dermapen       → ft1 valid, ft4 valid, ft3 EXPIRAT  → badge "2/3"
//   apt-2  p-2  Acid hialuronic → NIMIC                             → badge "0/2"
//   apt-3  p-3  Chirurgie      → ft1 valid, ft3 LIPSA, ft4 LIPSA   → badge "1/3" + tableta activa
//   apt-5  p-5  Peeling        → ft1 valid, ft4 LIPSA              → badge "1/2"
//   apt-6  p-6+p-8 Familie     → NIMIC                             → badge "0/4 + 0/3"
//   apt-7  p-9  Botox finalizat → 3/3 totul ok                     → badge "3/3 ✓"
//   apt-9  p-11 Consultatie+GDPR → NIMIC (deduplicat ft1)          → badge "0/1"
//
// NoShowBanner: apt-y1 si apt-y2 din ziua precedenta, nerezolvate

export const initialAppointments: Appointment[] = [
  // ── IERI (28 Feb) — programari nerezolvate pentru NoShowBanner ──
  {
    id: "apt-y1",
    doctorId: "dr-1",
    date: yesterday(),
    startTime: "15:00",
    totalDurationMinutes: 30,
    patients: [{ patientId: "p-15", consultations: [{ consultationTypeId: "ct-dermapen", durationMinutes: 30 }] }],
    status: "programat", // NEREZOLVAT — nu a venit, nu s-a marcat no-show
    createdAt: yesterdayAt("08:00"),
    timeline: [{ timestamp: yesterdayAt("08:00"), action: "Creat", actor: "Receptie" }],
  },
  {
    id: "apt-y2",
    doctorId: "dr-2",
    date: yesterday(),
    startTime: "16:30",
    totalDurationMinutes: 15,
    patients: [{ patientId: "p-12", consultations: [{ consultationTypeId: "ct-control", durationMinutes: 15 }] }],
    status: "sosit", // NEREZOLVAT — a venit dar nu s-a finalizat
    createdAt: yesterdayAt("09:00"),
    timeline: [
      { timestamp: yesterdayAt("09:00"), action: "Creat", actor: "Receptie" },
      { timestamp: yesterdayAt("16:20"), action: "Check-in", actor: "Receptie" },
    ],
  },

  // ── AZI (1 Mar) — Dr. Andrei Popescu (dr-1, Estetica + Generala) ──
  {
    id: "apt-1",
    doctorId: "dr-1",
    date: today(),
    startTime: "08:30",
    totalDurationMinutes: 30,
    patients: [{ patientId: "p-1", consultations: [{ consultationTypeId: "ct-dermapen", durationMinutes: 30 }] }],
    status: "programat",
    // Formulare: GDPR valid, foto valid, consimtamant Dermapen EXPIRAT → 2/3, 1 pending
    createdAt: yesterdayAt("14:00"),
    timeline: [{ timestamp: yesterdayAt("14:00"), action: "Creat", actor: "Receptie" }],
  },
  {
    id: "apt-2",
    doctorId: "dr-1",
    date: today(),
    startTime: "09:30",
    totalDurationMinutes: 45,
    patients: [
      { patientId: "p-2", consultations: [{ consultationTypeId: "ct-acid-hialuronic", durationMinutes: 45 }] },
    ],
    status: "programat",
    smsConfirmationSent: true,
    // Formulare: p-2 nu are NIMIC → 0/2, toate pending (ft1 + ft4)
    createdAt: yesterdayAt("15:00"),
    timeline: [{ timestamp: yesterdayAt("15:00"), action: "Creat", actor: "Receptie" }],
  },
  {
    id: "apt-11",
    doctorId: "dr-1",
    date: today(),
    startTime: "14:00",
    totalDurationMinutes: 30,
    patients: [{ patientId: "p-7", consultations: [{ consultationTypeId: "ct-dermapen", durationMinutes: 30 }] }],
    status: "programat",
    // p-7 e isIncomplete + nu are formulare → badge date incomplete + 0/3 formulare
    createdAt: todayAt("08:15"),
    timeline: [{ timestamp: todayAt("08:15"), action: "Creat", actor: "Receptie" }],
  },

  // ── AZI — Dr. Maria Ionescu (dr-2, Medicala + Generala) ──
  {
    id: "apt-3",
    doctorId: "dr-2",
    date: today(),
    startTime: "08:00",
    totalDurationMinutes: 60,
    patients: [{ patientId: "p-3", consultations: [{ consultationTypeId: "ct-chirurgie", durationMinutes: 60 }] }],
    status: "sosit",
    // Formulare: GDPR valid, consimtamant LIPSA, foto LIPSA → 1/3, 2 pending
    // Tableta activa (sesiune 4821)
    createdAt: yesterdayAt("10:00"),
    timeline: [
      { timestamp: yesterdayAt("10:00"), action: "Creat", actor: "Receptie" },
      { timestamp: todayAt("07:50"), action: "Check-in", actor: "Receptie" },
    ],
  },
  {
    id: "apt-4",
    doctorId: "dr-2",
    date: today(),
    startTime: "10:00",
    totalDurationMinutes: 30,
    patients: [{ patientId: "p-4", consultations: [{ consultationTypeId: "ct-dermatoscopie", durationMinutes: 30 }] }],
    status: "programat",
    // Formulare: p-4 NIMIC → 0/1 (doar ft1 necesar)
    createdAt: todayAt("08:00"),
    timeline: [{ timestamp: todayAt("08:00"), action: "Creat", actor: "Receptie" }],
  },

  // ── AZI — Dr. Elena Dumitrescu (dr-3, Estetica) ──
  {
    id: "apt-5",
    doctorId: "dr-3",
    date: today(),
    startTime: "09:00",
    totalDurationMinutes: 30,
    patients: [{ patientId: "p-5", consultations: [{ consultationTypeId: "ct-peeling", durationMinutes: 30 }] }],
    status: "in_consult",
    // Formulare: GDPR valid, foto LIPSA → 1/2, 1 pending (dar e deja in consult — warning)
    createdAt: yesterdayAt("16:00"),
    timeline: [
      { timestamp: yesterdayAt("16:00"), action: "Creat", actor: "Receptie" },
      { timestamp: todayAt("08:45"), action: "Check-in", actor: "Receptie" },
      { timestamp: todayAt("09:00"), action: "In consult" },
    ],
  },
  {
    id: "apt-6",
    doctorId: "dr-3",
    date: today(),
    startTime: "10:00",
    totalDurationMinutes: 60,
    patients: [
      { patientId: "p-6", consultations: [{ consultationTypeId: "ct-dermapen", durationMinutes: 30 }] },
      { patientId: "p-8", consultations: [{ consultationTypeId: "ct-botox", durationMinutes: 30 }] },
    ],
    status: "programat",
    // Formulare FAMILIE:
    //   p-6 Dermapen: ft1+ft3+ft4 → NIMIC → 0/3 pending
    //   p-8 Botox:    ft1+ft2+ft4 → NIMIC → 0/3 pending
    // Total deduplicat per pacient, badge per pacient
    createdAt: yesterdayAt("11:00"),
    timeline: [{ timestamp: yesterdayAt("11:00"), action: "Creat", actor: "Receptie" }],
  },

  // ── AZI — Dr. Radu Constantinescu (dr-4, Medicala + Estetica) ──
  {
    id: "apt-7",
    doctorId: "dr-4",
    date: today(),
    startTime: "08:00",
    totalDurationMinutes: 30,
    patients: [{ patientId: "p-9", consultations: [{ consultationTypeId: "ct-botox", durationMinutes: 30 }] }],
    status: "finalizat",
    // Formulare: 3/3 totul completat azi dimineata (cf6, cf7, cf8)
    createdAt: yesterdayAt("09:00"),
    timeline: [
      { timestamp: yesterdayAt("09:00"), action: "Creat", actor: "Receptie" },
      { timestamp: todayAt("07:40"), action: "Check-in", actor: "Receptie" },
      { timestamp: todayAt("08:00"), action: "In consult" },
      { timestamp: todayAt("08:25"), action: "Finalizat", actor: "Receptie" },
    ],
  },
  {
    id: "apt-8",
    doctorId: "dr-4",
    date: today(),
    startTime: "09:00",
    totalDurationMinutes: 30,
    patients: [{ patientId: "p-10", consultations: [{ consultationTypeId: "ct-dermatoscopie", durationMinutes: 30 }] }],
    status: "programat",
    // Formulare: p-10 NIMIC → 0/1 (doar ft1)
    createdAt: todayAt("08:00"),
    timeline: [{ timestamp: todayAt("08:00"), action: "Creat", actor: "Receptie" }],
  },

  // ── AZI — Dr. Ana Vasilescu (dr-5, Generala + Medicala) ──
  {
    id: "apt-9",
    doctorId: "dr-5",
    date: today(),
    startTime: "08:30",
    totalDurationMinutes: 30,
    patients: [
      {
        patientId: "p-11",
        consultations: [
          { consultationTypeId: "ct-consultatie", durationMinutes: 15 },
          { consultationTypeId: "ct-gdpr", durationMinutes: 15 },
        ],
      },
    ],
    status: "programat",
    // Formulare: Consultatie + Consult GDPR — ambele cer ft1 → deduplicat → doar ft1
    // p-11 NIMIC → 0/1 pending
    createdAt: yesterdayAt("17:00"),
    timeline: [{ timestamp: yesterdayAt("17:00"), action: "Creat", actor: "Receptie" }],
  },
  {
    id: "apt-10",
    doctorId: "dr-5",
    date: today(),
    startTime: "11:00",
    totalDurationMinutes: 15,
    patients: [{ patientId: "p-12", consultations: [{ consultationTypeId: "ct-control", durationMinutes: 15 }] }],
    status: "anulat",
    createdAt: yesterdayAt("12:00"),
    timeline: [
      { timestamp: yesterdayAt("12:00"), action: "Creat", actor: "Receptie" },
      { timestamp: todayAt("08:30"), action: "Anulat", actor: "Receptie" },
    ],
  },

  // ── AZI — Walk-in fara ora fixa ──
  {
    id: "apt-12",
    doctorId: "dr-2",
    date: today(),
    totalDurationMinutes: 15,
    patients: [{ patientId: "p-13", consultations: [{ consultationTypeId: "ct-consultatie", durationMinutes: 15 }] }],
    status: "programat",
    isWalkIn: true,
    // p-13 e isIncomplete + fara formulare → dublu warning
    createdAt: todayAt("09:30"),
    timeline: [{ timestamp: todayAt("09:30"), action: "Creat (walk-in)", actor: "Receptie" }],
  },
  {
    id: "apt-13",
    doctorId: "dr-4",
    date: today(),
    totalDurationMinutes: 30,
    patients: [
      {
        patientId: "p-14",
        consultations: [
          { consultationTypeId: "ct-crioterapie", durationMinutes: 15 },
          { consultationTypeId: "ct-control", durationMinutes: 15 },
        ],
      },
    ],
    status: "programat",
    isWalkIn: true,
    // Crioterapie + Control → ambele ft1 → deduplicat ft1 → 0/1
    createdAt: todayAt("09:45"),
    timeline: [{ timestamp: todayAt("09:45"), action: "Creat (walk-in)", actor: "Receptie" }],
  },
];

// ===== Tablet Sessions =====
// Sesiune activa pentru p-3 (Gheorghe Radu) care e sosit la apt-3 (chirurgie)
// Receptia i-a dat codul 4821 la check-in
export const initialTabletSessions: TabletSession[] = [
  {
    accessCode: "4821",
    appointmentId: "apt-3",
    patientId: "p-3",
    active: true,
    createdAt: todayAt("07:50"), // generat la check-in
  },
];

// ===== Time Blocks =====
export const initialTimeBlocks: TimeBlock[] = [
  { id: "tb-1", doctorId: "dr-1", date: today(), startTime: "12:00", durationMinutes: 60, reason: "Pauza de masa" },
  { id: "tb-2", doctorId: "dr-3", date: today(), startTime: "13:00", durationMinutes: 30, reason: "Personal" },
  { id: "tb-3", doctorId: "dr-5", date: today(), startTime: "15:00", durationMinutes: 120, reason: "Indisponibil" },
];
