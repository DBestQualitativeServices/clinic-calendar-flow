// calendar-utils.ts — Pure functions, NO import from data/mock.ts

export function formatPatientName(patient: { firstName: string; lastName: string }): string {
  return `${patient.lastName} ${patient.firstName}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export function getConsultationsSummary(
  consultations: { consultationTypeId: string; durationMinutes: number }[],
  consultationTypes: { id: string; name: string }[]
): string {
  return consultations
    .map(c => consultationTypes.find(ct => ct.id === c.consultationTypeId)?.name ?? c.consultationTypeId)
    .join(' + ');
}

/** Time string "HH:mm" to minutes from midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Minutes from midnight to "HH:mm" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Generate time slots from 08:00 to 18:00 in 30-min increments */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let m = 480; m < 1080; m += 30) {
    slots.push(minutesToTime(m));
  }
  return slots;
}
