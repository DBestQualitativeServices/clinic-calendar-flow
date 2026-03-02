import React, { forwardRef } from 'react';
import type { Appointment, AppointmentPatient } from '@/types';
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

/** Vertical segmented bar for a single patient's consultations */
function VerticalSegments({
  consultations,
  consultationTypes,
}: {
  consultations: { consultationTypeId: string; durationMinutes: number }[];
  consultationTypes: { id: string; name: string }[];
}) {
  const total = consultations.reduce((s, c) => s + c.durationMinutes, 0);
  if (total <= 0) return null;

  return (
    <div className="flex flex-col w-[5px] rounded-sm overflow-hidden flex-shrink-0 gap-px self-stretch">
      {consultations.map((c, i) => {
        const pct = (c.durationMinutes / total) * 100;
        const name = consultationTypes.find(ct => ct.id === c.consultationTypeId)?.name ?? '';
        return (
          <div
            key={i}
            className="w-full rounded-[2px]"
            style={{
              height: `${pct}%`,
              backgroundColor: getConsultColor(c.consultationTypeId),
              minHeight: '4px',
            }}
            title={`${name} — ${formatDuration(c.durationMinutes)}`}
          />
        );
      })}
    </div>
  );
}

/** Single patient column inside the card */
function PatientColumn({
  patientEntry,
  consultationTypes,
  showName,
}: {
  patientEntry: AppointmentPatient;
  consultationTypes: { id: string; name: string }[];
  showName: boolean;
}) {
  const { data: patient } = usePatientById(patientEntry.patientId);
  const name = patient ? formatPatientName(patient) : 'Necunoscut';

  return (
    <div className="flex gap-1 min-w-0 flex-1">
      <VerticalSegments
        consultations={patientEntry.consultations}
        consultationTypes={consultationTypes}
      />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        {showName && (
          <span className="patient-name text-[10px] font-semibold truncate leading-tight text-foreground">
            {name}
          </span>
        )}
        {patientEntry.consultations.map((c, i) => {
          const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
          return (
            <span key={i} className="text-[9px] leading-tight flex items-center gap-0.5 truncate">
              <span className="text-foreground/80 truncate">{ct?.name ?? c.consultationTypeId}</span>
              <span className="text-muted-foreground flex-shrink-0">({formatDuration(c.durationMinutes)})</span>
            </span>
          );
        })}
      </div>
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
    const multiPatient = patientCount > 1;

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
        {/* Header — only for single patient */}
        {!multiPatient && (
          <div className="flex items-start justify-between gap-1">
            <span className="patient-name text-xs font-semibold truncate leading-tight text-foreground">
              {primaryPatient}
            </span>
            <FormsStatusBadge appointmentId={appointment.id} />
          </div>
        )}

        {/* Multi-patient header */}
        {multiPatient && (
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-medium text-muted-foreground">{patientCount} pacienți</span>
            <FormsStatusBadge appointmentId={appointment.id} />
          </div>
        )}

        {/* Content area */}
        {heightPx > 28 && (
          multiPatient ? (
            <div className={cn(
              "flex gap-1.5 flex-1 min-h-0",
              patientCount > 2 && "gap-1",
            )}>
              {appointment.patients.map((pe, i) => (
                <React.Fragment key={pe.patientId}>
                  {i > 0 && <div className="w-px bg-border flex-shrink-0 self-stretch" />}
                  <PatientColumn
                    patientEntry={pe}
                    consultationTypes={consultationTypes}
                    showName
                  />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex gap-1 flex-1 min-h-0 mt-0.5">
              <VerticalSegments
                consultations={appointment.patients[0]?.consultations ?? []}
                consultationTypes={consultationTypes}
              />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                {appointment.patients[0]?.consultations.map((c, i) => {
                  const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
                  return (
                    <span key={i} className="text-[10px] leading-tight flex items-center gap-0.5">
                      <span className="text-foreground/80">{ct?.name ?? c.consultationTypeId}</span>
                      <span className="text-muted-foreground">({formatDuration(c.durationMinutes)})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )
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
