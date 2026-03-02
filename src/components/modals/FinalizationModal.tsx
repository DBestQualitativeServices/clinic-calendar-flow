import React, { useState } from 'react';
import { useAppointmentById, useDoctors, usePatientById, useConsultationTypes, useFormsStatus, useFormTemplates, useCompleteAppointment } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Printer, CalendarPlus, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatPatientName, formatDuration, getConsultationsSummary } from '@/lib/calendar-utils';

interface FinalizationModalProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FinalizationModal({ appointmentId, open, onOpenChange }: FinalizationModalProps) {
  const { data: apt } = useAppointmentById(appointmentId);
  const { data: doctors } = useDoctors();
  const { data: consultationTypes } = useConsultationTypes();
  const { data: formsStatus } = useFormsStatus(appointmentId);
  const { data: formTemplates } = useFormTemplates();
  const { mutate: completeAppointment } = useCompleteAppointment();
  const { setActivePanel } = useUIState();

  const [paymentDone, setPaymentDone] = useState(false);
  const [documentsPrinted, setDocumentsPrinted] = useState(false);
  const [nextAppointment, setNextAppointment] = useState(false);

  if (!apt) return null;

  const doctor = doctors.find(d => d.id === apt.doctorId);
  const allConsultations = apt.patients.flatMap(p => p.consultations);
  const consultsSummary = getConsultationsSummary(allConsultations, consultationTypes);

  const handleFinalize = () => {
    completeAppointment({ appointmentId: apt.id });
    toast({ title: 'Programare finalizată cu succes!' });
    onOpenChange(false);
  };

  const handleNewAppointment = () => {
    setNextAppointment(true);
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
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Checklist (opțional)</p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="payment" checked={paymentDone} onCheckedChange={(v) => setPaymentDone(!!v)} />
              <Label htmlFor="payment" className="text-sm cursor-pointer">Plată efectuată</Label>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setPaymentDone(true)}>
              <CreditCard className="h-3.5 w-3.5" /> Încasează
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="documents" checked={documentsPrinted} onCheckedChange={(v) => setDocumentsPrinted(!!v)} />
              <Label htmlFor="documents" className="text-sm cursor-pointer">Documente printate</Label>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setDocumentsPrinted(true)}>
              <Printer className="h-3.5 w-3.5" /> Printează
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="next-apt" checked={nextAppointment} onCheckedChange={(v) => setNextAppointment(!!v)} />
              <Label htmlFor="next-apt" className="text-sm cursor-pointer">Programare următoare creată</Label>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={handleNewAppointment}>
              <CalendarPlus className="h-3.5 w-3.5" /> Programează
            </Button>
          </div>

          {formsStatus.total > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className={cn(
                  "h-4 w-4",
                  formsStatus.completed === formsStatus.total ? "text-emerald-600" : "text-amber-500"
                )} />
                <span className="text-sm">
                  Formulare completate: {formsStatus.completed}/{formsStatus.total}
                  {formsStatus.completed === formsStatus.total ? ' ✓' : ' ⚠️'}
                </span>
              </div>
              {formsStatus.missingTemplateIds.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 ml-6">
                    <ChevronDown className="h-3 w-3" />
                    {formsStatus.missingTemplateIds.length} formulare nesemnate
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-6 mt-1 space-y-0.5">
                    {formsStatus.missingTemplateIds.map(id => {
                      const tid = id.includes(':') ? id.split(':')[1] : id;
                      const template = formTemplates.find(t => t.id === tid);
                      return (
                        <p key={id} className="text-xs text-muted-foreground">• {template?.title || tid}</p>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
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
