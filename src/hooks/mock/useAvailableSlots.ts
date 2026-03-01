import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';
import { doctors } from '@/data/mock';
import { generateTimeSlots, timeToMinutes } from '@/lib/calendar-utils';

export interface AvailableSlot {
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
}

export function useAvailableSlots(
  date: string,
  doctorId?: string,
  durationMinutes?: number,
  eligibleDoctorIds?: string[]
) {
  const { appointments, timeBlocks } = useMockData();

  const data = useMemo(() => {
    if (!durationMinutes || durationMinutes <= 0) return [];

    const targetDocs = doctorId
      ? doctors.filter(d => d.id === doctorId)
      : eligibleDoctorIds
      ? doctors.filter(d => eligibleDoctorIds.includes(d.id))
      : doctors.filter(d => !d.isOnVacation);

    const slots: AvailableSlot[] = [];
    const timeSlots = generateTimeSlots();

    for (let dayOffset = 0; dayOffset < 14 && slots.length < 10; dayOffset++) {
      const d = new Date(date + 'T00:00:00');
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];
      if (d.getDay() === 0) continue;

      for (const doc of targetDocs) {
        for (const slot of timeSlots) {
          const startMin = timeToMinutes(slot);
          const endMin = startMin + durationMinutes;
          if (endMin > 1080) continue;

          const hasOverlap = appointments.some(
            a =>
              a.doctorId === doc.id &&
              a.date === dateStr &&
              a.startTime &&
              a.status !== 'anulat' &&
              timeToMinutes(a.startTime) < endMin &&
              timeToMinutes(a.startTime) + a.totalDurationMinutes > startMin
          );

          const hasBlock = timeBlocks.some(
            tb =>
              tb.doctorId === doc.id &&
              tb.date === dateStr &&
              timeToMinutes(tb.startTime) < endMin &&
              timeToMinutes(tb.startTime) + tb.durationMinutes > startMin
          );

          if (!hasOverlap && !hasBlock) {
            slots.push({ date: dateStr, time: slot, doctorId: doc.id, doctorName: doc.name });
            if (slots.length >= 10) break;
          }
        }
        if (slots.length >= 10) break;
      }
    }
    return slots;
  }, [date, doctorId, durationMinutes, eligibleDoctorIds, appointments, timeBlocks]);

  return { data, isLoading: false, error: null };
}
