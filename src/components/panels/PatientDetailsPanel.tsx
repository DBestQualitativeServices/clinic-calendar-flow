import React from 'react';
import {
  usePatientById,
  usePatientAppointments,
  useCompletedForms,
  useFormTemplates,
  useConsultationTypes,
  useDoctors,
} from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Phone, Calendar, Mail, MapPin, CreditCard, AlertTriangle,
  FileText, CheckSquare, Clock, Eye, ClipboardList, Pencil,
} from 'lucide-react';
import { consultFormRequirements } from '@/data/mock';
import type { Appointment, CompletedForm } from '@/types';

const statusLabels: Record<string, { label: string; cls: string }> = {
  programat: { label: 'Programat', cls: 'bg-[hsl(var(--status-programat))] text-white' },
  sosit: { label: 'Sosit', cls: 'bg-[hsl(var(--status-sosit))] text-white' },
  in_consult: { label: 'În consult', cls: 'bg-[hsl(var(--status-in-consult))] text-white' },
  finalizat: { label: 'Finalizat', cls: 'bg-[hsl(var(--status-finalizat))] text-foreground' },
  anulat: { label: 'Anulat', cls: 'bg-[hsl(var(--status-anulat))] text-foreground' },
  no_show: { label: 'No-show', cls: 'bg-[hsl(var(--status-no-show))] text-white' },
};

function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientDetailsPanel({ patientId }: { patientId: string }) {
  const { data: patient } = usePatientById(patientId);
  const { data: appointments } = usePatientAppointments(patientId);
  const { data: completedForms } = useCompletedForms(patientId);
  const { data: formTemplates } = useFormTemplates();
  const { data: consultationTypes } = useConsultationTypes();
  const { data: doctors } = useDoctors();
  const { setActivePanel, setSecondaryPanel } = useUIState();

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  if (!patient) return <p className="text-sm text-muted-foreground">Pacientul nu a fost găsit.</p>;

  // Split appointments
  const upcomingApts = appointments.filter(a => a.date >= today && a.status !== 'anulat' && a.status !== 'finalizat');
  const pastApts = appointments.filter(a => a.date < today || a.status === 'finalizat' || a.status === 'anulat');

  // Compute required forms for upcoming appointments
  const requiredFormIds = new Set<string>();
  for (const apt of upcomingApts) {
    for (const ap of apt.patients) {
      if (ap.patientId !== patientId) continue;
      for (const c of ap.consultations) {
        const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
        if (ct) {
          const reqs = consultFormRequirements[ct.name] || [];
          reqs.forEach(id => requiredFormIds.add(id));
        }
      }
    }
  }

  const validFormTemplateIds = new Set(
    completedForms.filter(f => f.expiresAt > now).map(f => f.formTemplateId)
  );

  // Split forms: necompletate (required but missing/expired) vs completate (valid)
  const incompleteForms = [...requiredFormIds]
    .filter(id => !validFormTemplateIds.has(id))
    .map(id => formTemplates.find(t => t.id === id))
    .filter(Boolean);

  const completedValidForms = completedForms.filter(f => f.expiresAt > now);
  const completedExpiredForms = completedForms.filter(f => f.expiresAt <= now);

  return (
    <div className="space-y-5">
      {/* Patient Info */}
      <div className="p-3 rounded-md bg-accent/50 border border-border space-y-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {patient.lastName[0]}{patient.firstName[0]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{patient.lastName} {patient.firstName}</p>
            {patient.isIncomplete && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive">
                <AlertTriangle className="h-3 w-3" /> Date incomplete
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setSecondaryPanel({ type: 'patientForm', patientId, onComplete: () => setSecondaryPanel({ type: 'none' }) })}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {patient.phone}</div>
          <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(patient.dateOfBirth).toLocaleDateString('ro-RO')} ({getAge(patient.dateOfBirth)} ani)</div>
          {patient.cnp && <div className="flex items-center gap-2"><CreditCard className="h-3 w-3" /> CNP: {patient.cnp}</div>}
          {patient.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {patient.email}</div>}
          {patient.address && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {patient.address}</div>}
        </div>
      </div>

      {/* Formulare necompletate */}
      {incompleteForms.length > 0 && (
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
            Formulare necompletate ({incompleteForms.length})
          </p>
          <div className="space-y-1.5">
            {incompleteForms.map(tpl => (
              <div key={tpl!.id} className="flex items-center justify-between p-2 rounded-md border border-destructive/30 bg-destructive/5 text-xs">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5 text-destructive" />
                  <span className="font-medium">{tpl!.title}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                  Lipsă
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulare completate */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
          Formulare completate ({completedForms.length})
        </p>
        {completedForms.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Niciun formular completat.</p>
        ) : (
          <div className="space-y-1.5">
            {[...completedValidForms, ...completedExpiredForms].map(f => {
              const tpl = formTemplates.find(t => t.id === f.formTemplateId);
              const isValid = f.expiresAt > now;
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 rounded-md border border-border text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setActivePanel({ type: 'formViewer', formId: f.id, patientId })}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <span className="font-medium">{tpl?.title || f.formTemplateId}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(f.completedAt).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      isValid ? 'bg-emerald-500/20 text-emerald-700' : 'bg-muted text-muted-foreground',
                    )}>
                      {isValid ? 'Valid' : 'Expirat'}
                    </span>
                    <Eye className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Programări active */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
          Programări active ({upcomingApts.length})
        </p>
        {upcomingApts.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Nicio programare activă.</p>
        ) : (
          <div className="space-y-2">
            {upcomingApts.map(apt => {
              const doctor = doctors.find(d => d.id === apt.doctorId);
              const badge = statusLabels[apt.status];
              const patientConsults = apt.patients.find(p => p.patientId === patientId)?.consultations || [];
              return (
                <div
                  key={apt.id}
                  className="p-2.5 rounded-md border border-border bg-muted/20 space-y-1.5 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setActivePanel({ type: 'details', appointmentId: apt.id })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{apt.date}</span>
                      {apt.startTime && <span className="text-muted-foreground">· {apt.startTime}</span>}
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', badge?.cls)}>
                      {badge?.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{doctor?.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {patientConsults.map((c, i) => {
                      const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
                      return (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {ct?.name || c.consultationTypeId} · {c.durationMinutes}min
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Istoric programări */}
      {pastApts.length > 0 && (
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
            Istoric programări ({pastApts.length})
          </p>
          <div className="space-y-1.5">
            {pastApts.slice(0, 5).map(apt => {
              const doctor = doctors.find(d => d.id === apt.doctorId);
              const badge = statusLabels[apt.status];
              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-2 rounded-md border border-border text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setActivePanel({ type: 'details', appointmentId: apt.id })}
                >
                  <div>
                    <span className="font-medium">{apt.date}</span>
                    {apt.startTime && <span className="text-muted-foreground ml-1">· {apt.startTime}</span>}
                    <p className="text-[10px] text-muted-foreground">{doctor?.name}</p>
                  </div>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', badge?.cls)}>
                    {badge?.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
