import React from 'react';
import { useAppointmentById, usePatientById, useFormTemplates, useFormsStatusForPatient, useCreateTabletSession, useRemoveTabletSession } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { useMockData } from '@/hooks/mock/MockDataProvider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RefreshCw, Tablet, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormsStatusPanelProps {
  appointmentId: string;
}

export default function FormsStatusPanel({ appointmentId }: FormsStatusPanelProps) {
  const { data: apt } = useAppointmentById(appointmentId);
  const { data: formTemplates } = useFormTemplates();
  const { completedForms, tabletSessions, patients } = useMockData();
  const getFormsStatusForPatient = useFormsStatusForPatient();
  const { mutate: addTabletSession } = useCreateTabletSession();
  const { mutate: removeTabletSession } = useRemoveTabletSession();
  const { setSecondaryPanel } = useUIState();

  if (!apt) return null;

  const now = new Date().toISOString();
  const multiPatient = apt.patients.length > 1;

  const renderPatientForms = (patientId: string, consultationTypeIds: string[]) => {
    const status = getFormsStatusForPatient(patientId, consultationTypeIds);
    const session = tabletSessions.find(s => s.appointmentId === appointmentId && s.patientId === patientId && s.active);

    const generateCode = () => {
      const patient = patients.find(p => p.id === patientId);
      const code = patient?.cnp ? patient.cnp.slice(-4) : String(Math.floor(1000 + Math.random() * 9000));
      addTabletSession({ accessCode: code, appointmentId, patientId, active: true, createdAt: new Date().toISOString() });
      toast({ title: `Cod generat: ${code}` });
    };

    const regenerateCode = () => {
      if (session) removeTabletSession(session.accessCode);
      generateCode();
    };

    const handleViewForm = (formId: string) => {
      setSecondaryPanel({ type: 'formViewer', formId, patientId });
    };

    return (
      <div className="space-y-3">
        {status.requiredTemplateIds.map(tid => {
          const template = formTemplates.find(t => t.id === tid);
          if (!template) return null;

          const latestForm = completedForms
            .filter(f => f.patientId === patientId && f.formTemplateId === tid)
            .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

          const isValid = latestForm && latestForm.expiresAt > now;
          const isExpired = latestForm && latestForm.expiresAt <= now;

          return (
            <div
              key={tid}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md bg-accent/30 border border-border",
                latestForm && "cursor-pointer hover:bg-accent/60 transition-colors"
              )}
              onClick={() => latestForm && handleViewForm(latestForm.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium">{template.title}</p>
                  {latestForm && <Eye className="h-3 w-3 text-muted-foreground" />}
                </div>
                {isValid && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Semnat pe {new Date(latestForm.completedAt).toLocaleDateString('ro-RO')}, expiră {new Date(latestForm.expiresAt).toLocaleDateString('ro-RO')}
                  </p>
                )}
                {isExpired && <p className="text-[10px] text-destructive mt-0.5">Expirat</p>}
                {!latestForm && <p className="text-[10px] text-muted-foreground mt-0.5">Nesemnat</p>}
              </div>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                isValid && 'bg-emerald-500/20 text-emerald-700',
                isExpired && 'bg-red-500/20 text-red-700',
                !latestForm && 'bg-amber-500/20 text-amber-700',
              )}>
                {isValid ? 'Valid' : isExpired ? 'Expirat' : 'Pending'}
              </span>
            </div>
          );
        })}

        {status.total === 0 && (
          <p className="text-xs text-muted-foreground">Niciun formular necesar.</p>
        )}

      </div>
    );
  };

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
              {renderPatientForms(ap.patientId, ap.consultations.map(c => c.consultationTypeId))}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        renderPatientForms(
          apt.patients[0]?.patientId,
          apt.patients[0]?.consultations.map(c => c.consultationTypeId) || [],
        )
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
