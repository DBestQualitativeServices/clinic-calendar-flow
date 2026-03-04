import React, { useState, useMemo } from 'react';
import { useUnresolvedAppointments, useDoctors, usePatientById, useMarkNoShow, useUpdateAppointmentStatus, useCompleteAppointment } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { formatPatientName } from '@/lib/calendar-utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, ChevronDown, ChevronUp, X, RotateCcw, CheckCircle } from 'lucide-react';

function NoShowRow({ apt }: { apt: import('@/types').Appointment }) {
  const { data: doctors } = useDoctors();
  const { data: patient } = usePatientById(apt.patients[0]?.patientId);
  const { mutate: markNoShow } = useMarkNoShow();
  const { mutate: complete } = useCompleteAppointment();
  const { setActivePanel } = useUIState();

  const doctor = doctors.find(d => d.id === apt.doctorId);
  const patientName = patient ? formatPatientName(patient) : 'Necunoscut';

  const handleNoShow = () => {
    markNoShow({ appointmentId: apt.id });
    toast({ title: 'Marcat ca no-show' });
  };

  const handleWasPresent = () => {
    complete({ appointmentId: apt.id });
    toast({ title: 'Marcat ca prezent' });
  };

  const handleReschedule = () => {
    markNoShow({ appointmentId: apt.id });
    setActivePanel({ type: 'booking', prefill: { appointment: apt } });
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border text-xs">
      <div className="flex-1 min-w-0">
        <span className="font-semibold">{patientName}</span>
        <span className="text-muted-foreground ml-1.5">{apt.date} · {apt.startTime || 'Walk-in'} · {doctor?.name}</span>
      </div>
      <Button variant="destructive" size="sm" className="h-6 text-[11px] gap-1" onClick={handleNoShow}>
        No-show
      </Button>
      <Button variant="outline" size="sm" className="h-6 text-[11px] gap-1" onClick={handleWasPresent}>
        <CheckCircle className="h-3 w-3" /> Prezent
      </Button>
      <Button variant="outline" size="sm" className="h-6 text-[11px] gap-1" onClick={handleReschedule}>
        <RotateCcw className="h-3 w-3" /> Reprogramează
      </Button>
    </div>
  );
}

export default function NoShowBanner() {
  const { data: unresolvedApts } = useUnresolvedAppointments();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!unresolvedApts?.length || dismissed) return null;

  return (
    <div className="bg-destructive/10 border-b border-destructive/20">
      <div className="flex items-center gap-2 px-4 py-2">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-sm font-medium text-destructive flex-1">
          {unresolvedApts.length} programăr{unresolvedApts.length === 1 ? 'e' : 'i'} nerezolvat{unresolvedApts.length === 1 ? 'ă' : 'e'} din zilele anterioare
        </span>
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? 'Ascunde' : 'Detalii'}
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {unresolvedApts.map(apt => (
            <NoShowRow key={apt.id} apt={apt} />
          ))}
        </div>
      )}
    </div>
  );
}
