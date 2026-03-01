import React, { useState } from 'react';
import { useAppState } from '@/store/appStore';
import { formTemplates } from '@/data/mock';
import { getConsultationName } from '@/lib/calendar-utils';
import { patients as allPatients } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Copy, RefreshCw, Tablet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormsStatusPanelProps {
  appointmentId: string;
}

export default function FormsStatusPanel({ appointmentId }: FormsStatusPanelProps) {
  const { appointments, completedForms, tabletSessions, addTabletSession, removeTabletSession, getFormsStatusForPatient } = useAppState();
  const apt = appointments.find(a => a.id === appointmentId);
  if (!apt) return null;

  const now = new Date().toISOString();
  const multiPatient = apt.patients.length > 1;

  const renderPatientForms = (patientId: string, consultationTypeIds: string[]) => {
    const status = getFormsStatusForPatient(patientId, consultationTypeIds);
    const session = tabletSessions.find(s => s.appointmentId === appointmentId && s.patientId === patientId && s.active);

    const generateCode = () => {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      addTabletSession({ accessCode: code, appointmentId, patientId, active: true, createdAt: new Date().toISOString() });
      toast({ title: `Cod generat: ${code}` });
    };

    const regenerateCode = () => {
      if (session) removeTabletSession(session.accessCode);
      generateCode();
    };

    const copyCode = () => {
      if (session) {
        navigator.clipboard.writeText(session.accessCode);
        toast({ title: 'Cod copiat!' });
      }
    };

    return (
      <div className="space-y-3">
        {/* Form list */}
        {status.requiredTemplateIds.map(tid => {
          const template = formTemplates.find(t => t.id === tid);
          if (!template) return null;

          const latestForm = completedForms
            .filter(f => f.patientId === patientId && f.formTemplateId === tid)
            .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

          const isValid = latestForm && latestForm.expiresAt > now;
          const isExpired = latestForm && latestForm.expiresAt <= now;

          return (
            <div key={tid} className="flex items-center justify-between px-3 py-2 rounded-md bg-accent/30 border border-border">
              <div>
                <p className="text-xs font-medium">{template.title}</p>
                {isValid && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Semnat pe {new Date(latestForm.completedAt).toLocaleDateString('ro-RO')}, expiră {new Date(latestForm.expiresAt).toLocaleDateString('ro-RO')}
                  </p>
                )}
                {isExpired && <p className="text-[10px] text-destructive mt-0.5">Expirat</p>}
                {!latestForm && <p className="text-[10px] text-muted-foreground mt-0.5">Nesemnat</p>}
              </div>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
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

        {/* Tablet access code */}
        <div className="pt-2 border-t border-border">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/30">
                <Tablet className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold tracking-widest text-primary">{session.accessCode}</span>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={copyCode}>
                <Copy className="h-3 w-3" /> Copiază
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={regenerateCode}>
                <RefreshCw className="h-3 w-3" /> Regenerează
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={generateCode}>
              <Tablet className="h-3.5 w-3.5" /> Generează cod tabletă
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Formulare medicale</p>
      {multiPatient ? (
        <Tabs defaultValue={apt.patients[0].patientId}>
          <TabsList className="h-8">
            {apt.patients.map(ap => {
              const pat = allPatients.find(p => p.id === ap.patientId);
              return (
                <TabsTrigger key={ap.patientId} value={ap.patientId} className="text-xs">
                  {pat ? `${pat.lastName} ${pat.firstName}` : ap.patientId}
                </TabsTrigger>
              );
            })}
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
