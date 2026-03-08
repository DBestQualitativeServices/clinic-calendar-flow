import { timeToMinutes } from './calendar-utils';

/**
 * Shared grid positioning helpers for calendar-style views.
 * Used by /scheduling (CalendarGrid/DoctorColumn) and /consultations (ConsultationsPage).
 */

/** Convert an appointment/block start time to absolute top-offset in pixels */
export function slotTopPx(startTime: string, slotHeight: number, dayStartMinutes = 480): number {
  const startMin = timeToMinutes(startTime) - dayStartMinutes;
  return (startMin / 15) * slotHeight;
}

/** Convert a duration in minutes to height in pixels */
export function slotHeightPx(durationMinutes: number, slotHeight: number, minHeight?: number): number {
  const h = (durationMinutes / 15) * slotHeight;
  return minHeight ? Math.max(h, minHeight) : h;
}
