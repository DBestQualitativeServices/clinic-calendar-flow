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
import { getAge } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';
import PatientAvatar from '@/components/ui/patient-avatar';
import SectionHeader from '@/components/ui/section-header';
import ValidityBadge from '@/components/ui/validity-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Phone, Calendar, Mail, MapPin, CreditCard, AlertTriangle,
  FileText, Clock, Eye, ClipboardList, Pencil,
} from 'lucide-react';
import { consultFormRequirements } from '@/data/mock';
import type { Appointment, CompletedForm } from '@/types';

/* ─── Sub-components ─── */

function PatientInfoCard({ patientId }: { patientId: string }) {
  const { data: patient } = usePatientById(patientId);
  const { setSecondaryPanel } = useUIState();

  if (!patient) return null;

  return (
    <div className="p-3 rounded-md bg-accent/50 border border-border space-y-2">
      <div className="flex items-center gap-2 flex-1">
        <PatientAvatar firstName={patient.firstName} lastName={patient.lastName} />
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
  );
}

function IncompleteFormsList({ formTemplateIds, formTemplates }: { formTemplateIds: string[]; formTemplates: { id: string; title: string }[] }) {
  if (formTemplateIds.length === 0) return null;
  return (
    <div>
      <SectionHeader count={formTemplateIds.length}>Formulare necompletate</SectionHeader>
      <div className="space-y-1.5">
        {formTemplateIds.map(id => {
          const tpl = formTemplates.find(t => t.id === id);
          return (
            <div key={id} className="flex items-center justify-between p-2 rounded-md border border-destructive/30 bg-destructive/5 text-xs">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-3.5 w-3.5 text-destructive" />
                <span className="font-medium">{tpl?.title || id}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Lipsă</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletedFormsList({ forms, formTemplates, patientId }: { forms: CompletedForm[]; formTemplates: { id: string; title: string }[]; patientId: string }) {
  const { setSecondaryPanel } = useUIState();
  const now = new Date().toISOString();

  return (
    <div>
      <SectionHeader count={forms.length}>Formulare completate</SectionHeader>
      {forms.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Niciun formular completat.</p>
      ) : (
        <div className="space-y-1.5">
          {forms.map(f => {
            const tpl = formTemplates.find(t => t.id === f.formTemplateId);
            const isValid = f.expiresAt > now;
            return (
              <div
                key={f.id}
                className="flex items-center justify-between p-2 rounded-md border border-border text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setSecondaryPanel({ type: 'formViewer', formId: f.id, patientId })}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <div>
                    <span className="font-medium">{tpl?.title || f.formTemplateId}</span>
                    <p className="text-[10px] text-muted-foreground">{new Date(f.completedAt).toLocaleDateString('ro-RO')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ValidityBadge valid={isValid} />
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AppointmentsList({ title, appointments, patientId }: { title: string; appointments: Appointment[]; patientId: string }) {
  const { data: consultationTypes } = useConsultationTypes();
  const { data: doctors } = useDoctors();
  const { setSecondaryPanel } = useUIState();

  if (appointments.length === 0 && title.startsWith('Istoric')) return null;

  const isHistory = title.startsWith('Istoric');

  return (
    <div>
      <SectionHeader count={appointments.length}>{title}</SectionHeader>
      {appointments.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Nicio programare activă.</p>
      ) : (
        <div className="space-y-1.5">
          {(isHistory ? appointments.slice(0, 5) : appointments).map(apt => {
            const doctor = doctors.find(d => d.id === apt.doctorId);
            const badge = STATUS_CONFIG[apt.status];
            const patientConsults = apt.patients.find(p => p.patientId === patientId)?.consultations || [];

            return (
              <div
                key={apt.id}
                className={cn(
                  'rounded-md border border-border cursor-pointer hover:bg-muted/40 transition-colors',
                  isHistory ? 'flex items-center justify-between p-2 text-xs' : 'p-2.5 bg-muted/20 space-y-1.5',
                )}
                onClick={() => setSecondaryPanel({ type: 'details', appointmentId: apt.id })}
              >
                {isHistory ? (
                  <>
                    <div>
                      <span className="font-medium">{apt.date}</span>
                      {apt.startTime && <span className="text-muted-foreground ml-1">· {apt.startTime}</span>}
                      <p className="text-[10px] text-muted-foreground">{doctor?.name}</p>
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', badge.cls)}>{badge.label}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{apt.date}</span>
                        {apt.startTime && <span className="text-muted-foreground">· {apt.startTime}</span>}
                      </div>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', badge.cls)}>{badge.label}</span>
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
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */

export default function PatientDetailsPanel({ patientId }: { patientId: string }) {
  const { data: patient } = usePatientById(patientId);
  const { data: appointments } = usePatientAppointments(patientId);
  const { data: completedForms } = useCompletedForms(patientId);
  const { data: formTemplates } = useFormTemplates();
  const { data: consultationTypes } = useConsultationTypes();

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

  const incompleteFormIds = [...requiredFormIds].filter(id => !validFormTemplateIds.has(id));

  // Sort completed forms: valid first, then expired
  const sortedForms = [
    ...completedForms.filter(f => f.expiresAt > now),
    ...completedForms.filter(f => f.expiresAt <= now),
  ];

  return (
    <div className="space-y-5">
      <PatientInfoCard patientId={patientId} />
      <IncompleteFormsList formTemplateIds={incompleteFormIds} formTemplates={formTemplates} />
      <CompletedFormsList forms={sortedForms} formTemplates={formTemplates} patientId={patientId} />
      <AppointmentsList title="Programări active" appointments={upcomingApts} patientId={patientId} />
      <AppointmentsList title="Istoric programări" appointments={pastApts} patientId={patientId} />
    </div>
  );
}
