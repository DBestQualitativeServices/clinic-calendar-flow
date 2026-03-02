import React, { useState } from 'react';
import { useAppointmentById, useDoctors, usePatientById, useConsultationTypes, useFormsStatus, useFormTemplates, useCompleteAppointment } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Printer, CalendarPlus, Info } from 'lucide-react';
import { formatPatientName, formatDuration } from '@/lib/calendar-utils';

interface FinalizationModalProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FinalizationModal({ appointmentId, open, onOpenChange }: FinalizationModalProps) {
  const { data: apt } = useAppointmentById(appointmentId);
  const { data: doctors } = useDoctors();
  const { data: consultationTypes } = useConsultationTypes();
  const { mutate: completeAppointment } = useCompleteAppointment();
  const { setActivePanel } = useUIState();

  const [documentsPrinted, setDocumentsPrinted] = useState(false);

  if (!apt) return null;

  const doctor = doctors.find(d => d.id === apt.doctorId);
  const allConsultations = apt.patients.flatMap(p => p.consultations);

  const handleFinalize = () => {
    completeAppointment({ appointmentId: apt.id });
    toast({ title: 'Programare finalizată cu succes!' });
    onOpenChange(false);
  };

  const handlePrint = () => {
    setDocumentsPrinted(true);
    toast({ title: 'Scrisoare medicală generată', description: 'Fișierul PDF a fost trimis la printare.' });
  };

  const handleNewAppointment = () => {
    onOpenChange(false);
    setActivePanel({ type: 'booking', prefill: { doctorId: apt.doctorId } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Finalizare programare
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-accent/50 border border-border p-3 space-y-1.5">
          <FinalizationPatientName patientId={apt.patients[0]?.patientId} />
          <p className="text-xs text-muted-foreground">{doctor?.name}</p>
          <p className="text-xs text-muted-foreground">{apt.date} · {apt.startTime || 'Walk-in'} · {formatDuration(apt.totalDurationMinutes)}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {allConsultations.map((c, i) => {
              const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
              return (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium">
                  {ct?.name || c.consultationTypeId}
                </span>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Printer className={`h-4 w-4 ${documentsPrinted ? 'text-primary' : 'text-muted-foreground'}`} />
              <Label className="text-sm">Printare scrisoare medicală</Label>
            </div>
            <Button
              variant={documentsPrinted ? 'secondary' : 'outline'}
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handlePrint}
            >
              <Printer className="h-3.5 w-3.5" />
              {documentsPrinted ? 'Printat ✓' : 'Printează PDF'}
            </Button>
          </div>

          <div className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Programare următoare</Label>
            </div>
            <div className="rounded bg-muted/50 p-2.5 space-y-1">
              <FinalizationPatientNameSmall patientId={apt.patients[0]?.patientId} />
              <p className="text-xs text-muted-foreground">Doctor: {doctor?.name}</p>
            </div>
            <div className="flex items-start gap-2 p-2 rounded bg-accent/30 border border-border">
              <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Verificați disponibilitatea în calendar și creați o programare nouă direct de acolo.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={handleNewAppointment}>
              <CalendarPlus className="h-3.5 w-3.5" /> Deschide formularul de programare
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Înapoi</Button>
          <Button onClick={handleFinalize} className="gap-2">
            <CheckCircle className="h-4 w-4" /> Finalizează și închide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FinalizationPatientName({ patientId }: { patientId: string }) {
  const { data: patient } = usePatientById(patientId);
  return <p className="text-sm font-bold">{patient ? formatPatientName(patient) : 'Necunoscut'}</p>;
}

function FinalizationPatientNameSmall({ patientId }: { patientId: string }) {
  const { data: patient } = usePatientById(patientId);
  return <p className="text-xs font-medium">Pacient: {patient ? formatPatientName(patient) : 'Necunoscut'}</p>;
}
