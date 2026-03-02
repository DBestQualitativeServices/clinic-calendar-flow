import React, { forwardRef } from 'react';
import type { Appointment } from '@/types';
import { usePatientById, useConsultationTypes } from '@/hooks/data';
import { formatPatientName, formatDuration } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { getConsultColor } from '@/lib/constants';
import AppointmentPopover from './AppointmentPopover';
import FormsStatusBadge from '@/components/forms/FormsStatusBadge';

interface AppointmentCardProps {
  appointment: Appointment;
  slotHeight: number;
}

const statusStyles: Record<string, string> = {
  programat: 'border-l-[3px] border-l-status-programat bg-card',
  sosit: 'border-l-[3px] border-l-status-sosit bg-card animate-status-pulse',
  in_consult: 'border-l-[3px] border-l-status-in-consult bg-card',
  finalizat: 'border-l-[3px] border-l-status-finalizat bg-card opacity-60',
  anulat: 'border-l-[3px] border-l-status-anulat bg-card opacity-50',
  no_show: 'border-l-[3px] border-l-status-no-show bg-card',
};

/** Segmented bar showing each consultation type proportionally */
function ConsultationSegments({
  consultations,
  consultationTypes,
  totalDuration,
}: {
  consultations: { consultationTypeId: string; durationMinutes: number }[];
  consultationTypes: { id: string; name: string }[];
  totalDuration: number;
}) {
  if (totalDuration <= 0 || consultations.length === 0) return null;

  return (
    <div className="flex w-full h-[6px] rounded-sm overflow-hidden mt-auto gap-px">
      {consultations.map((c, i) => {
        const pct = (c.durationMinutes / totalDuration) * 100;
        const name = consultationTypes.find(ct => ct.id === c.consultationTypeId)?.name ?? '';
        return (
          <div
            key={i}
            className="h-full rounded-[2px] relative group"
            style={{
              width: `${pct}%`,
              backgroundColor: getConsultColor(c.consultationTypeId),
              minWidth: '6px',
            }}
            title={`${name} — ${formatDuration(c.durationMinutes)}`}
          />
        );
      })}
    </div>
  );
}

const AppointmentCardInner = forwardRef<HTMLDivElement, AppointmentCardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ appointment, slotHeight, ...props }, ref) => {
    const heightPx = Math.max((appointment.totalDurationMinutes / 30) * slotHeight, slotHeight * 0.5);
    const patientCount = appointment.patients.length;
    const { data: patient } = usePatientById(appointment.patients[0]?.patientId);
    const { data: consultationTypes } = useConsultationTypes();
    const primaryPatient = patient ? formatPatientName(patient) : 'Necunoscut';
    const allConsultations = appointment.patients.flatMap(p => p.consultations);

    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          "absolute left-1 right-1 rounded-md px-2 py-1.5 cursor-pointer overflow-hidden transition-shadow hover:shadow-md border border-border flex flex-col",
          statusStyles[appointment.status] ?? 'bg-card',
          appointment.status === 'anulat' && '[&_.patient-name]:line-through',
          props.className,
        )}
        style={{ height: `${heightPx}px`, ...props.style }}
        title={primaryPatient}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="patient-name text-xs font-semibold truncate leading-tight text-foreground">
            {primaryPatient}
          </span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <FormsStatusBadge appointmentId={appointment.id} />
            {patientCount > 1 && (
              <span className="bg-muted rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                {patientCount}
              </span>
            )}
          </div>
        </div>
        {heightPx > 28 && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {allConsultations.map((c, i) => {
              const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
              return (
                <span key={i} className="text-[10px] leading-tight flex items-center gap-0.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getConsultColor(c.consultationTypeId) }}
                  />
                  <span className="text-foreground/80">{ct?.name ?? c.consultationTypeId}</span>
                  <span className="text-muted-foreground">({formatDuration(c.durationMinutes)})</span>
                </span>
              );
            })}
          </div>
        )}
        <ConsultationSegments
          consultations={allConsultations}
          consultationTypes={consultationTypes}
          totalDuration={appointment.totalDurationMinutes}
        />
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
