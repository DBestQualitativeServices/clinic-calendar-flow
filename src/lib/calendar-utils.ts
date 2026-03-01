import { patients, consultationTypes, categories } from '@/data/mock';
import type { Appointment } from '@/types';

export function getPatientName(patientId: string): string {
  const p = patients.find(p => p.id === patientId);
  return p ? `${p.lastName} ${p.firstName}` : 'Necunoscut';
}

export function getConsultationName(typeId: string): string {
  return consultationTypes.find(c => c.id === typeId)?.name ?? typeId;
}

export function getCategoryName(catId: string): string {
  return categories.find(c => c.id === catId)?.name ?? catId;
}

export function getCategoryColor(catId: string): string {
  return categories.find(c => c.id === catId)?.color ?? 'spec-generala';
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export function getConsultationsSummary(apt: Appointment): string {
  return apt.patients
    .flatMap(p => p.consultations)
    .map(c => getConsultationName(c.consultationTypeId))
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
  for (let m = 480; m < 1080; m += 30) { // 08:00 to 17:30
    slots.push(minutesToTime(m));
  }
  return slots;
}
