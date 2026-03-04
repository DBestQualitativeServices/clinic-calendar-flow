import React from 'react';
import { useAppointmentById, usePatientById, useFormTemplates, useFormsStatusForPatient } from '@/hooks/data';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormsStatusPanelProps {
  appointmentId: string;
}

export default function FormsStatusPanel({ appointmentId }: FormsStatusPanelProps) {
  const { data: apt } = useAppointmentById(appointmentId);
  const { data: formTemplates } = useFormTemplates();

  if (!apt) return null;

  const multiPatient = apt.patients.length > 1;

  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Formulare medicale</p>
      {multiPatient ? (
        <Tabs defaultValue={apt.patients[0].patientId}>
          <TabsList className="h-8">
            {apt.patients.map(ap => (
              <PatientTab key={ap.patientId} patientId={ap.patientId} />
            ))}
          </TabsList>
          {apt.patients.map(ap => (
            <TabsContent key={ap.patientId} value={ap.patientId}>
              <PatientFormsSection
                patientId={ap.patientId}
                consultationTypeIds={ap.consultations.map(c => c.consultationTypeId)}
                formTemplates={formTemplates}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <PatientFormsSection
          patientId={apt.patients[0]?.patientId}
          consultationTypeIds={apt.patients[0]?.consultations.map(c => c.consultationTypeId) || []}
          formTemplates={formTemplates}
        />
      )}
    </div>
  );
}

function PatientFormsSection({ patientId, consultationTypeIds, formTemplates }: {
  patientId: string;
  consultationTypeIds: string[];
  formTemplates: { id: string; title: string }[] | undefined;
}) {
  const { data: status } = useFormsStatusForPatient(patientId, consultationTypeIds);

  return (
    <div className="space-y-3">
      {(status?.requiredTemplateIds ?? []).map((tid: string) => {
        const template = (formTemplates ?? []).find(t => t.id === tid);
        if (!template) return null;

        const isCompleted = status?.completedTemplateIds?.includes(tid);
        const isExpired = status?.expiredTemplateIds?.includes(tid);
        const isMissing = !isCompleted && !isExpired;

        return (
          <div
            key={tid}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-md bg-accent/30 border border-border",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium">{template.title}</p>
              </div>
              {isExpired && <p className="text-[10px] text-destructive mt-0.5">Expirat</p>}
              {isMissing && <p className="text-[10px] text-muted-foreground mt-0.5">Nesemnat</p>}
            </div>
            <span className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
              isCompleted && 'bg-emerald-500/20 text-emerald-700',
              isExpired && 'bg-red-500/20 text-red-700',
              isMissing && 'bg-amber-500/20 text-amber-700',
            )}>
              {isCompleted ? 'Valid' : isExpired ? 'Expirat' : 'Pending'}
            </span>
          </div>
        );
      })}

      {(status?.total ?? 0) === 0 && (
        <p className="text-xs text-muted-foreground">Niciun formular necesar.</p>
      )}
    </div>
  );
}

function PatientTab({ patientId }: { patientId: string }) {
  const { data: patient } = usePatientById(patientId);
  return (
    <TabsTrigger value={patientId} className="text-xs">
      {patient ? `${patient.lastName} ${patient.firstName}` : patientId}
    </TabsTrigger>
  );
}
