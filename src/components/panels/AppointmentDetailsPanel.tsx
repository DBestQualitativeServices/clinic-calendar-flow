import React, { useState } from 'react';
import { useAppState } from '@/store/appStore';
import { getPatientName, getConsultationName, formatDuration } from '@/lib/calendar-utils';
import { doctors, patients } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LogIn, Play, CheckCircle, RotateCcw, X } from 'lucide-react';
import type { AppointmentStatus } from '@/types';
import FinalizationModal from '@/components/modals/FinalizationModal';
import FormsStatusPanel from '@/components/forms/FormsStatusPanel';

const statusBadge: Record<string, { label: string; cls: string }> = {
  programat: { label: 'Programat', cls: 'bg-status-programat text-white' },
  sosit: { label: 'Sosit', cls: 'bg-status-sosit text-white' },
  in_consult: { label: 'În consult', cls: 'bg-status-in-consult text-white' },
  finalizat: { label: 'Finalizat', cls: 'bg-status-finalizat text-foreground' },
  anulat: { label: 'Anulat', cls: 'bg-status-anulat text-foreground' },
  no_show: { label: 'No-show', cls: 'bg-status-no-show text-white' },
};

export default function AppointmentDetailsPanel({ appointmentId }: { appointmentId: string }) {
  const { appointments, updateAppointment, setActivePanel } = useAppState();
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const apt = appointments.find(a => a.id === appointmentId);
  if (!apt) return <p className="text-sm text-muted-foreground p-4">Programarea nu a fost găsită.</p>;

  const doctor = doctors.find(d => d.id === apt.doctorId);
  const badge = statusBadge[apt.status];
  const now = new Date().toISOString();

  const transition = (status: AppointmentStatus, action: string) => {
    updateAppointment(apt.id, {
      status,
      timeline: [...apt.timeline, { timestamp: now, action, actor: 'Recepție' }],
    });
    toast({ title: `Status schimbat: ${statusBadge[status].label}` });
  };

  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className={cn('text-xs px-3 py-1 rounded-full font-semibold', badge.cls)}>{badge.label}</span>
        <span className="text-xs text-muted-foreground">{apt.date} · {apt.startTime || 'Walk-in'}</span>
      </div>

      {/* Doctor */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Doctor</p>
        <p className="text-sm font-semibold">{doctor?.name}</p>
      </div>

      {/* Patients & consultations */}
      {apt.patients.map((ap, idx) => {
        const pat = patients.find(p => p.id === ap.patientId);
        return (
          <div key={idx} className="p-3 rounded-md bg-accent/50 border border-border space-y-1.5">
            <p className="text-sm font-bold">{pat ? `${pat.lastName} ${pat.firstName}` : ap.patientId}</p>
            <p className="text-xs text-muted-foreground">{pat?.phone} · {pat?.dateOfBirth}</p>
            {ap.consultations.map((c, ci) => (
              <div key={ci} className="flex items-center justify-between text-xs">
                <span>{getConsultationName(c.consultationTypeId)}</span>
                <span className="text-muted-foreground">{formatDuration(c.durationMinutes)}</span>
              </div>
            ))}
          </div>
        );
      })}

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Durată totală</span>
        <span className="font-bold text-primary">{formatDuration(apt.totalDurationMinutes)}</span>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Istoric</p>
        <div className="space-y-1.5">
          {apt.timeline.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{t.action}</span>
                {t.actor && <span className="text-muted-foreground ml-1">— {t.actor}</span>}
                <p className="text-[10px] text-muted-foreground">{new Date(t.timestamp).toLocaleString('ro-RO')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forms */}
      <FormsStatusPanel appointmentId={apt.id} />

      {/* Notes */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Note</p>
        <Textarea
          className="text-xs min-h-[60px]"
          placeholder="Adaugă observații..."
          value={apt.notes || ''}
          onChange={e => updateAppointment(apt.id, { notes: e.target.value })}
        />
      </div>

      {/* Primary action */}
      <div className="space-y-2 pt-2 border-t border-border">
        {apt.status === 'programat' && (
          <Button className="w-full gap-2" onClick={() => transition('sosit', 'Check-in')}>
            <LogIn className="h-4 w-4" /> Check-in
          </Button>
        )}
        {apt.status === 'sosit' && (
          <Button className="w-full gap-2" onClick={() => transition('in_consult', 'In consult (manual)')}>
            <Play className="h-4 w-4" /> Forțează "În consult"
          </Button>
        )}
        {apt.status === 'in_consult' && (
          <Button className="w-full gap-2" onClick={() => setFinalizeModalOpen(true)}>
            <CheckCircle className="h-4 w-4" /> Finalizează
          </Button>
        )}
        <FinalizationModal appointmentId={apt.id} open={finalizeModalOpen} onOpenChange={setFinalizeModalOpen} />

        {(apt.status === 'programat' || apt.status === 'no_show') && (
          <Button variant="outline" className="w-full gap-2 text-xs" onClick={() => setActivePanel({ type: 'booking', prefill: { appointment: apt } })}>
            <RotateCcw className="h-3.5 w-3.5" /> Reprogramează
          </Button>
        )}
        {(apt.status === 'programat' || apt.status === 'sosit') && (
          <Button variant="ghost" className="w-full gap-2 text-xs text-destructive" onClick={() => {
            transition('anulat', 'Anulat');
          }}>
            <X className="h-3.5 w-3.5" /> Anulează
          </Button>
        )}
      </div>
    </div>
  );
}
