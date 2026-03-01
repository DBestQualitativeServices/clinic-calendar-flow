import React, { useState, useMemo } from 'react';
import { useAppState } from '@/store/appStore';
import { getPatientName } from '@/lib/calendar-utils';
import { doctors } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertTriangle, ChevronDown, ChevronUp, X, RotateCcw, CheckCircle } from 'lucide-react';

export default function NoShowBanner() {
  const { appointments, updateAppointment, setActivePanel } = useAppState();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Find previous-day unresolved appointments (programat/sosit that weren't finalized/cancelled)
  const unresolvedApts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00');
      return aptDate < today && (apt.status === 'programat' || apt.status === 'sosit' || apt.status === 'in_consult');
    });
  }, [appointments]);

  if (unresolvedApts.length === 0 || dismissed) return null;

  const now = new Date().toISOString();

  const handleNoShow = (id: string) => {
    const apt = appointments.find(a => a.id === id)!;
    updateAppointment(id, {
      status: 'no_show',
      timeline: [...apt.timeline, { timestamp: now, action: 'Marcat no-show', actor: 'Recepție' }],
    });
    toast({ title: 'Marcat ca no-show' });
  };

  const handleWasPresent = (id: string) => {
    const apt = appointments.find(a => a.id === id)!;
    updateAppointment(id, {
      status: 'finalizat',
      timeline: [...apt.timeline, { timestamp: now, action: 'Finalizat (retroactiv)', actor: 'Recepție' }],
    });
    toast({ title: 'Marcat ca prezent' });
  };

  const handleReschedule = (id: string) => {
    const apt = appointments.find(a => a.id === id)!;
    updateAppointment(id, {
      status: 'no_show',
      timeline: [...apt.timeline, { timestamp: now, action: 'No-show → Reprogramare', actor: 'Recepție' }],
    });
    setActivePanel({ type: 'booking', prefill: { appointment: apt } });
  };

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
          {unresolvedApts.map(apt => {
            const doctor = doctors.find(d => d.id === apt.doctorId);
            return (
              <div key={apt.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border text-xs">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold">{getPatientName(apt.patients[0]?.patientId)}</span>
                  <span className="text-muted-foreground ml-1.5">{apt.date} · {apt.startTime || 'Walk-in'} · {doctor?.name}</span>
                </div>
                <Button variant="destructive" size="sm" className="h-6 text-[11px] gap-1" onClick={() => handleNoShow(apt.id)}>
                  No-show
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-[11px] gap-1" onClick={() => handleWasPresent(apt.id)}>
                  <CheckCircle className="h-3 w-3" /> Prezent
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-[11px] gap-1" onClick={() => handleReschedule(apt.id)}>
                  <RotateCcw className="h-3 w-3" /> Reprogramează
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
