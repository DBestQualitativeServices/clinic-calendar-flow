import React, { forwardRef } from 'react';
import type { Appointment } from '@/types';
import { usePatientById, useConsultationTypes } from '@/hooks/mock';
import { formatPatientName, getConsultationsSummary, formatDuration } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import AppointmentPopover from './AppointmentPopover';
import FormsStatusBadge from '@/components/forms/FormsStatusBadge';

interface AppointmentCardProps {
  appointment: Appointment;
  slotHeight: number;
}

const statusStyles: Record<string, string> = {
  programat: 'bg-status-programat text-white',
  sosit: 'bg-status-sosit text-white animate-status-pulse',
  in_consult: 'bg-status-in-consult text-white',
  finalizat: 'bg-status-finalizat/50 text-foreground',
  anulat: 'bg-status-anulat/40 text-foreground',
  no_show: 'bg-status-no-show text-white',
};

const AppointmentCardInner = forwardRef<HTMLDivElement, AppointmentCardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ appointment, slotHeight, ...props }, ref) => {
    const heightPx = Math.max((appointment.totalDurationMinutes / 30) * slotHeight, slotHeight * 0.5);
    const patientCount = appointment.patients.length;
    const { data: patient } = usePatientById(appointment.patients[0]?.patientId);
    const { data: consultationTypes } = useConsultationTypes();
    const primaryPatient = patient ? formatPatientName(patient) : 'Necunoscut';
    const allConsultations = appointment.patients.flatMap(p => p.consultations);
    const consultsSummary = getConsultationsSummary(allConsultations, consultationTypes);

    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          "absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer overflow-hidden transition-shadow hover:shadow-md border border-white/20",
          statusStyles[appointment.status] ?? 'bg-muted',
          appointment.status === 'anulat' && '[&_.patient-name]:line-through',
          props.className,
        )}
        style={{ height: `${heightPx}px`, ...props.style }}
        title={`${primaryPatient} — ${consultsSummary}`}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="patient-name text-xs font-semibold truncate leading-tight">
            {primaryPatient}
          </span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <FormsStatusBadge appointmentId={appointment.id} />
            {patientCount > 1 && (
              <span className="bg-white/30 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {patientCount}
              </span>
            )}
          </div>
        </div>
        {heightPx > 28 && (
          <p className="text-[10px] leading-tight opacity-90 truncate mt-0.5">
            {consultsSummary}
          </p>
        )}
        {heightPx > 42 && (
          <p className="text-[10px] opacity-70 mt-0.5 text-right">
            {formatDuration(appointment.totalDurationMinutes)}
          </p>
        )}
      </div>
    );
  }
);
AppointmentCardInner.displayName = 'AppointmentCardInner';

export default function AppointmentCard({ appointment, slotHeight }: AppointmentCardProps) {
  return (
    <AppointmentPopover appointment={appointment}>
      <AppointmentCardInner appointment={appointment} slotHeight={slotHeight} />
    </AppointmentPopover>
  );
}
